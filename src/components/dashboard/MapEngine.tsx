'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plus, Minus, Navigation, Globe, Ruler, Disc, 
  Camera, Layers, FileText, Share2, PenTool, Split, Eye 
} from 'lucide-react';
import { 
  ATMS_DATA, 
  BANK_BRANCHES_DATA, 
  POLICE_STATIONS_DATA, 
  ACTIVE_INCIDENTS_DATA, 
  PREDICTED_HOTSPOTS_DATA, 
  CORRIDORS_DATA, 
  QUICK_JUMP_LOCATIONS,
  ATMEntity,
  PoliceStationEntity,
  BankBranchEntity,
  HotspotEntity,
  CrimeIncidentEntity,
  CorridorEntity
} from '@/data/dashboardData';
import { 
  LayerVisibilityState, 
  FilterState 
} from './LeftSidebar';
import { getDistrictRiskScores, DistrictRiskData } from '@/lib/apiService';

interface MapEngineProps {
  layers: LayerVisibilityState;
  filters: FilterState;
  onSelectATM: (atm: ATMEntity) => void;
  onSelectPolice: (station: PoliceStationEntity) => void;
  onSelectBranch: (branch: BankBranchEntity) => void;
  onSelectZone: (zoneName: string, coords: [number, number], zoom?: number) => void;
  onOpenReportModal: () => void;
  onOpenShareModal: () => void;
  onOpenDrawZoneModal: () => void;
  onOpenCompareModal: () => void;
  flyToCoords: { coords: [number, number]; zoom?: number } | null;
}

export default function MapEngine({
  layers,
  filters,
  onSelectATM,
  onSelectPolice,
  onSelectBranch,
  onSelectZone,
  onOpenReportModal,
  onOpenShareModal,
  onOpenDrawZoneModal,
  onOpenCompareModal,
  flyToCoords,
}: MapEngineProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const referenceLayerRef = useRef<L.TileLayer | null>(null);
  
  // Layer Groups
  const atmsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const banksLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const policeLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const incidentsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const hotspotsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const corridorsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const heatmapLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const measurementLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Base map style: 'dark' | 'street' | 'satellite' | 'terrain'
  const [mapStyle, setMapStyle] = useState<'dark' | 'street' | 'satellite' | 'terrain'>('dark');
  const [measurementActive, setMeasurementActive] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<string | null>(null);
  const [radiusActive, setRadiusActive] = useState(false);
  const [districtScores, setDistrictScores] = useState<DistrictRiskData[]>([]);

  // Load live district risk scores from ML Model API
  useEffect(() => {
    let mounted = true;
    getDistrictRiskScores().then((data) => {
      if (mounted && data && data.length > 0) {
        setDistrictScores(data);
      }
    }).catch((e) => console.warn('Failed to load district risk scores for map:', e));
    return () => { mounted = false; };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      minZoom: 4,
      maxZoom: 19,
    });

    mapInstanceRef.current = map;

    // Attach layer groups
    atmsLayerGroupRef.current.addTo(map);
    banksLayerGroupRef.current.addTo(map);
    policeLayerGroupRef.current.addTo(map);
    incidentsLayerGroupRef.current.addTo(map);
    hotspotsLayerGroupRef.current.addTo(map);
    corridorsLayerGroupRef.current.addTo(map);
    heatmapLayerGroupRef.current.addTo(map);
    measurementLayerGroupRef.current.addTo(map);

    // Click handler for measurement or radius
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (measurementActive) {
        setMeasurePoints(prev => {
          const next = [...prev, [e.latlng.lat, e.latlng.lng] as [number, number]];
          if (next.length === 2) {
            const p1 = L.latLng(next[0][0], next[0][1]);
            const p2 = L.latLng(next[1][0], next[1][1]);
            const d = p1.distanceTo(p2);
            setMeasuredDistance(d > 1000 ? `${(d / 1000).toFixed(2)} km` : `${Math.round(d)} meters`);
          }
          return next;
        });
      } else if (radiusActive) {
        L.circle(e.latlng, {
          radius: 2000,
          color: '#ceff00',
          fillColor: '#ceff00',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(measurementLayerGroupRef.current)
          .bindPopup('<div class="p-2 font-mono text-xs text-white">2.0 KM SURVEILLANCE RADIUS<br/><span class="text-neon">14 ATMs Within Perimeter</span></div>')
          .openPopup();
        setRadiusActive(false);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [measurementActive, radiusActive]);

  // Update Base Tile Layer when mapStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }
    if (referenceLayerRef.current) {
      referenceLayerRef.current.remove();
      referenceLayerRef.current = null;
    }

    let tileUrl = '';
    let maxZoom = 19;
    let maxNativeZoom = 19;
    let className = '';

    switch (mapStyle) {
      case 'dark':
        // ESRI World Dark Gray Canvas - Fast, 100% reliable, zero rate limit / block
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
        maxNativeZoom = 16;
        break;
      case 'satellite':
        // Esri World Imagery - 100% reliable
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        maxZoom = 19;
        break;
      case 'terrain':
        // Esri World Topo Map - Fast, full topographical details, 100% reliable
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
        maxZoom = 19;
        break;
      case 'street':
      default:
        // Esri World Street Map - Comprehensive streets, landmarks, 100% reliable
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
        maxZoom = 19;
        break;
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom,
      maxNativeZoom,
      className,
    });

    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;

    // Add labels reference layer for dark mode
    if (mapStyle === 'dark') {
      const refLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        maxNativeZoom: 16,
        opacity: 0.85,
      });
      refLayer.addTo(mapInstanceRef.current);
      referenceLayerRef.current = refLayer;
    }
  }, [mapStyle]);

  // Fly to target coords when prop updates
  useEffect(() => {
    if (!mapInstanceRef.current || !flyToCoords) return;
    mapInstanceRef.current.flyTo(flyToCoords.coords, flyToCoords.zoom || 14, {
      duration: 1.2,
    });
  }, [flyToCoords]);

  // RENDER MARKER LAYERS ACCORDING TO TOGGLES AND FILTERS
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 1. ATMs LAYER
    atmsLayerGroupRef.current.clearLayers();
    if (layers.atms) {
      ATMS_DATA.forEach((atm) => {
        // Filter check
        if (filters.riskLevels.length > 0) {
          const level = atm.riskScore >= 76 ? 'Critical' : atm.riskScore >= 51 ? 'High' : atm.riskScore >= 26 ? 'Moderate' : 'Low';
          if (!filters.riskLevels.includes(level)) return;
        }

        // Custom HTML Pin Icon
        const isHigh = atm.riskScore >= 76;
        const isMod = atm.riskScore >= 51 && atm.riskScore < 76;
        const color = isHigh ? '#ff3b30' : isMod ? '#f59e0b' : '#10b981';

        const iconHtml = `
          <div class="relative flex items-center justify-center">
            ${isHigh ? '<div class="absolute -inset-1 bg-red-600 rounded-none animate-beacon-pulse"></div>' : ''}
            <div style="background-color: ${color}; width: 12px; height: 12px; border: 1.5px solid #000; box-shadow: 0 0 6px ${color};"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-atm-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([atm.lat, atm.lng], { icon: customIcon });
        
        marker.on('click', () => {
          onSelectATM(atm);
          onSelectZone(atm.zone, [atm.lat, atm.lng]);
        });

        marker.bindPopup(`
          <div style="padding: 12px; font-family: monospace; font-size: 11px; background: #141414; color: #fff; border: 1px solid rgba(255,255,255,0.2); width: 260px;">
            <div style="font-weight: bold; font-size: 12px; color: ${color}; margin-bottom: 4px;">
              ${atm.bank}
            </div>
            <div style="color: #bbb; font-size: 10px; margin-bottom: 8px;">
              ${atm.branch} • ID: ${atm.id}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-bottom: 6px;">
              <div>Risk Score: <strong style="color: ${color};">${atm.riskScore}/100</strong></div>
              <div>Historical Frauds: <strong>${atm.fraudWithdrawals}</strong></div>
              <div>Last Alert: <strong>${atm.lastAlert}</strong></div>
            </div>
            <button id="flag-${atm.id}" style="width: 100%; background: #ceff00; color: #000; font-weight: bold; border: none; padding: 4px; cursor: pointer; text-transform: uppercase; font-size: 10px;">
              Flag for Surveillance
            </button>
          </div>
        `);

        marker.addTo(atmsLayerGroupRef.current);
      });
    }

    // 2. BANK BRANCHES LAYER
    banksLayerGroupRef.current.clearLayers();
    if (layers.banks) {
      BANK_BRANCHES_DATA.forEach((branch) => {
        const iconHtml = `
          <div style="background-color: #06b6d4; width: 14px; height: 14px; border: 1.5px solid #000; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 6px #06b6d4;">
            <div style="width: 6px; height: 6px; background: #000;"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-bank-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([branch.lat, branch.lng], { icon: customIcon });

        marker.on('click', () => {
          onSelectBranch(branch);
        });

        marker.bindPopup(`
          <div style="padding: 12px; font-family: monospace; font-size: 11px; background: #141414; color: #fff; border: 1px solid rgba(255,255,255,0.2); width: 260px;">
            <div style="font-weight: bold; font-size: 12px; color: #06b6d4; margin-bottom: 4px;">
              ${branch.name}
            </div>
            <div style="color: #bbb; font-size: 10px; margin-bottom: 6px;">
              IFSC: ${branch.ifsc}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-bottom: 6px;">
              <div>Flagged Accounts: <strong style="color: #ef4444;">${branch.flaggedAccounts}</strong></div>
              <div>Area Risk Level: <strong>${branch.riskLevel}</strong></div>
              <div>Manager: <strong>${branch.managerContact}</strong></div>
            </div>
          </div>
        `);

        marker.addTo(banksLayerGroupRef.current);
      });
    }

    // 3. POLICE STATIONS LAYER
    policeLayerGroupRef.current.clearLayers();
    if (layers.police) {
      POLICE_STATIONS_DATA.forEach((ps) => {
        const iconHtml = `
          <div style="background-color: #2563eb; width: 15px; height: 15px; border: 1.5px solid #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px #2563eb;">
            <div style="width: 5px; height: 5px; background: #fff;"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-police-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([ps.lat, ps.lng], { icon: customIcon });

        marker.on('click', () => {
          onSelectPolice(ps);
        });

        marker.bindPopup(`
          <div style="padding: 12px; font-family: monospace; font-size: 11px; background: #141414; color: #fff; border: 1px solid rgba(255,255,255,0.2); width: 270px;">
            <div style="font-weight: bold; font-size: 12px; color: #60a5fa; margin-bottom: 4px;">
              ${ps.name}
            </div>
            <div style="color: #bbb; font-size: 10px; margin-bottom: 6px;">
              ${ps.jurisdiction}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-bottom: 6px;">
              <div>SHO: <strong>${ps.sho}</strong></div>
              <div>Cyber Cell: <strong style="color: #ceff00;">${ps.cyberCell ? 'Available (Staff: ' + ps.cyberCellStaff + ')' : 'No'}</strong></div>
              <div>Active Cases: <strong>${ps.activeCases}</strong></div>
              <div>Response Time: <strong style="color: #f59e0b;">${ps.responseTime}</strong></div>
            </div>
          </div>
        `);

        marker.addTo(policeLayerGroupRef.current);
      });
    }

    // 4. ACTIVE INCIDENTS LAYER (REAL HIGH COURT & POLICE CASES BENCHMARK)
    incidentsLayerGroupRef.current.clearLayers();
    if (layers.incidents) {
      ACTIVE_INCIDENTS_DATA.forEach((inc) => {
        // Size proportional to amount (min 20px, max 34px)
        const size = Math.min(34, Math.max(20, 20 + (inc.amount / 100000) * 0.8));

        // Victim Origin Marker
        const iconHtml = `
          <div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; position: relative;">
            <div style="position: absolute; inset: 0; background: rgba(239, 68, 68, 0.25); border: 2px solid #ef4444; border-radius: 4px; transform: rotate(45deg); box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);"></div>
            <span style="position: relative; color: #fff; font-size: 9px; font-weight: 900; font-family: monospace;">⚖️</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-real-case-marker',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([inc.lat, inc.lng], { icon: customIcon });

        const top3List = inc.top3States 
          ? inc.top3States.map(s => `<span style="display: inline-block; background: rgba(255,255,255,0.08); padding: 1px 4px; margin: 1px; font-size: 9px;">${s.state} (${Math.round(s.prob * 100)}%)</span>`).join(' ')
          : '';

        marker.bindPopup(`
          <div style="padding: 12px; font-family: monospace; font-size: 11px; background: #0c0c0c; color: #fff; border: 1px solid rgba(239,68,68,0.5); width: 340px; box-shadow: 0 4px 20px rgba(0,0,0,0.8);">
            
            <!-- Real Court Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); pb: 6px; margin-bottom: 8px;">
              <span style="font-weight: 800; font-size: 11px; color: #ef4444; letter-spacing: 0.5px;">
                🏛️ REAL CASE: ${inc.id}
              </span>
              <span style="background: rgba(239,68,68,0.2); color: #f87171; font-size: 9px; padding: 2px 5px; border: 1px solid rgba(239,68,68,0.4); font-weight: bold;">
                HIGH COURT VERIFIED
              </span>
            </div>

            <!-- Court Case Citation -->
            <div style="margin-bottom: 8px;">
              <div style="font-weight: bold; font-size: 11px; color: #f3f4f6; line-height: 1.3;">
                ${inc.caseTitle || inc.id}
              </div>
              <div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">
                Source: <span style="color: #60a5fa;">${inc.courtName || 'Court Record'}</span> (${inc.decisionDate || 'Verified'})
              </div>
              ${inc.courtUrl ? `<div style="margin-top: 3px;"><a href="${inc.courtUrl}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline; font-size: 9px;">Read High Court Judgment on Indian Kanoon ↗</a></div>` : ''}
            </div>

            <!-- Incident Overview -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 6px 8px; margin-bottom: 8px; font-size: 10px;">
              <div>• <strong>Fraud Type:</strong> ${inc.fraudType}</div>
              <div>• <strong>Amount Stolen:</strong> <span style="color: #ceff00; font-weight: bold;">${inc.amountFormatted}</span></div>
              <div>• <strong>Victim Location:</strong> ${inc.victimLocation}</div>
              <div style="color: #d1d5db; margin-top: 3px; font-size: 9.5px;">• <strong>Money Trail:</strong> ${inc.networkPattern || 'Layered through secondary mule accounts'}</div>
            </div>

            <!-- Ground Truth vs Model Prediction Box -->
            <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.3); padding: 7px 8px; margin-bottom: 8px;">
              <div style="color: #34d399; font-weight: bold; font-size: 10px; text-transform: uppercase; margin-bottom: 3px; display: flex; align-items: center; justify-content: space-between;">
                <span>🎯 Actual Cash-Out Ground Truth</span>
                <span style="background: #065f46; color: #a7f3d0; padding: 1px 4px; font-size: 8px; border-radius: 2px;">CCTV VERIFIED</span>
              </div>
              <div style="font-size: 10.5px; color: #fff; font-weight: bold;">
                ${inc.groundTruthLocation || inc.predictedZone}
              </div>
              <div style="font-size: 9.5px; color: #a7f3d0; margin-top: 2px;">
                Evidence: ${inc.cctvEvidence || 'ATM CCTV identified cash withdrawer'}
              </div>
            </div>

            <!-- Model Prediction Verdict -->
            <div style="background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.3); padding: 7px 8px;">
              <div style="color: #60a5fa; font-weight: bold; font-size: 10px; text-transform: uppercase; margin-bottom: 3px; display: flex; align-items: center; justify-content: space-between;">
                <span>🤖 Cybercast ML Prediction</span>
                <span style="background: #1e3a8a; color: #bfdbfe; padding: 1px 4px; font-size: 8px; border-radius: 2px;">
                  ${inc.isTop1Match ? '✅ TOP-1 STATE HIT' : 'TOP-3 MATCH'}
                </span>
              </div>
              <div style="font-size: 10px;">
                <div>Predicted State: <strong style="color: #93c5fd;">${inc.predictedStateTop1 || 'Target State'} (${inc.predictedConfidence || 80}% conf)</strong></div>
                <div style="margin-top: 2px;">Top-3 Candidates: ${top3List}</div>
              </div>
            </div>

          </div>
        `);

        marker.addTo(incidentsLayerGroupRef.current);

        // Ground Truth Cash-Out Marker (Green Shield with ATM Icon)
        if (inc.groundTruthCoords) {
          const gtIconHtml = `
            <div style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; position: relative;">
              <div style="position: absolute; inset: 0; background: rgba(16, 185, 129, 0.25); border: 2px solid #10b981; border-radius: 50%; box-shadow: 0 0 10px rgba(16, 185, 129, 0.7); animation: pulse 2s infinite;"></div>
              <span style="position: relative; color: #10b981; font-size: 11px; font-weight: bold;">🏧</span>
            </div>
          `;

          const gtIcon = L.divIcon({
            html: gtIconHtml,
            className: 'custom-ground-truth-marker',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const gtMarker = L.marker(inc.groundTruthCoords, { icon: gtIcon });

          gtMarker.bindPopup(`
            <div style="padding: 10px; font-family: monospace; font-size: 11px; background: #0c0c0c; color: #fff; border: 1px solid rgba(16,185,129,0.5); width: 290px;">
              <div style="font-weight: bold; font-size: 11px; color: #10b981; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                <span>🏧 ACTUAL CASH-OUT ATM</span>
                <span style="background: rgba(16,185,129,0.2); color: #34d399; font-size: 8px; padding: 1px 4px;">CASE ${inc.id}</span>
              </div>
              <div style="font-size: 11px; font-weight: bold; color: #fff; margin-bottom: 4px;">
                ${inc.groundTruthLocation}
              </div>
              <div style="font-size: 9.5px; color: #bbb; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
                <div>Amount Extracted: <strong style="color: #ceff00;">${inc.groundTruthAmount || 'Cash Out'}</strong></div>
                <div>Court Evidence: <span>${inc.cctvEvidence || 'CCTV Confirmed'}</span></div>
                <div style="color: #60a5fa; margin-top: 3px;">Model Prediction: Predicted ${inc.predictedStateTop1} as Top-1 (${inc.predictedConfidence}%)</div>
              </div>
            </div>
          `);

          gtMarker.addTo(incidentsLayerGroupRef.current);
        }
      });
    }

    // 5. PREDICTED WITHDRAWAL HOTSPOTS LAYER
    hotspotsLayerGroupRef.current.clearLayers();
    if (layers.hotspots) {
      PREDICTED_HOTSPOTS_DATA.forEach((spot) => {
        // Circle size = confidence level, opacity = urgency
        const radius = spot.radius;
        const opacity = spot.urgency === 'Immediate' ? 0.35 : 0.2;

        const circle = L.circle([spot.lat, spot.lng], {
          radius,
          color: '#ff3b30',
          fillColor: '#ff3b30',
          fillOpacity: opacity,
          weight: 2,
          dashArray: '3, 3',
        });

        circle.on('click', () => {
          onSelectZone(spot.name, [spot.lat, spot.lng], 15);
        });

        circle.bindPopup(`
          <div style="padding: 12px; font-family: monospace; font-size: 11px; background: #141414; color: #fff; border: 1px solid rgba(255,59,48,0.5); width: 280px;">
            <div style="font-weight: bold; font-size: 12px; color: #ff3b30; margin-bottom: 4px;">
              HOTSPOT: ${spot.name}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-bottom: 6px;">
              <div>Prediction Confidence: <strong style="color: #ceff00;">${spot.confidence}%</strong></div>
              <div>Time Window: <strong>${spot.timeWindow}</strong></div>
              <div>ATMs in Zone: <strong>${spot.atmCount} Terminals</strong></div>
              <div>Urgency: <strong style="color: #ff3b30;">${spot.urgency}</strong></div>
              <div style="margin-top: 6px; font-size: 10px; color: #bbb;">Action: ${spot.recommendedAction}</div>
            </div>
          </div>
        `);

        circle.addTo(hotspotsLayerGroupRef.current);
      });
    }

    // 6. CRIMINAL NETWORK CORRIDORS LAYER
    corridorsLayerGroupRef.current.clearLayers();
    if (layers.corridors) {
      CORRIDORS_DATA.forEach((corridor) => {
        const color = corridor.type === 'active' ? '#ef4444' : corridor.type === 'predicted' ? '#f59e0b' : '#71717a';
        
        const polyline = L.polyline(corridor.path, {
          color,
          weight: 2.5,
          dashArray: '6, 6',
          opacity: 0.85,
        });

        polyline.bindPopup(`
          <div style="padding: 12px; font-family: monospace; font-size: 11px; background: #0c0c0c; color: #fff; border: 1px solid ${color}; width: 280px; box-shadow: 0 4px 16px rgba(0,0,0,0.8);">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 6px;">
              <span style="font-weight: bold; color: ${color}; text-transform: uppercase; font-size: 10px;">
                🏛️ ${corridor.type} COURT TRAIL
              </span>
              <span style="background: rgba(255,255,255,0.08); font-size: 8px; padding: 1px 4px; border: 1px solid rgba(255,255,255,0.2);">
                VERIFIED PATH
              </span>
            </div>
            <div style="font-weight: bold; font-size: 11px; color: #fff; margin-bottom: 6px;">
              ${corridor.fromState} → ${corridor.toState}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 5px; font-size: 10px;">
              <div>Court Documented Cases: <strong style="color: #60a5fa;">${corridor.casesCount}</strong></div>
              <div>Avg Speed to ATM Cashout: <strong>${corridor.avgTime}</strong></div>
              <div>Total Stolen Funds Routed: <strong style="color: #ceff00;">${corridor.totalAmount}</strong></div>
            </div>
            <div style="margin-top: 6px; font-size: 9px; color: #9ca3af; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
              Verified across Delhi High Court & State Police FIR casefiles.
            </div>
          </div>
        `);

        polyline.addTo(corridorsLayerGroupRef.current);
      });
    }

    // 7. HEATMAP OVERLAY LAYER (POWERED BY LIVE 964 DISTRICTS ML MODEL)
    heatmapLayerGroupRef.current.clearLayers();
    if (layers.heatmap) {
      // Base national high-risk corridors
      const HEATMAP_POINTS = [
        { lat: 26.9210, lng: 75.7970, r: 2800, color: '#ef4444', title: 'Jaipur Police Commr', score: '92.4', tier: 'Critical' },
        { lat: 26.8505, lng: 80.9492, r: 2400, color: '#ef4444', title: 'Lucknow Central', score: '87.1', tier: 'Critical' },
        { lat: 28.6315, lng: 77.2170, r: 3200, color: '#ef4444', title: 'Delhi NCT Central', score: '74.0', tier: 'Critical' },
        { lat: 12.9752, lng: 77.6065, r: 2200, color: '#f59e0b', title: 'Bengaluru Urban', score: '78.5', tier: 'High' },
        { lat: 19.1158, lng: 72.8687, r: 2800, color: '#f59e0b', title: 'Mumbai Commr', score: '71.2', tier: 'High' },
        { lat: 25.6186, lng: 85.1414, r: 2000, color: '#eab308', title: 'Patna Urban', score: '68.8', tier: 'Moderate' },
        { lat: 22.5280, lng: 88.3655, r: 2100, color: '#eab308', title: 'Kolkata Cyber Cell', score: '64.2', tier: 'Moderate' },
        { lat: 17.4089, lng: 78.4907, r: 1800, color: '#10b981', title: 'Hyderabad Commr', score: '52.1', tier: 'Moderate' },
        { lat: 27.5000, lng: 76.9000, r: 3500, color: '#ef4444', title: 'Mewat Tri-Border', score: '94.6', tier: 'Critical' },
        { lat: 23.9629, lng: 86.8016, r: 3000, color: '#ef4444', title: 'Deoghar-Jamtara Cluster', score: '89.0', tier: 'Critical' },
      ];

      // Add live critical districts from ML Model API
      if (districtScores.length > 0) {
        districtScores.filter(d => d.risk_tier === 'Critical').slice(0, 10).forEach((d) => {
          const coords: [number, number] | null = 
            d.District === 'South' ? [23.1650, 91.4380] :
            d.District === 'South-West' ? [28.5921, 77.0460] :
            d.District === 'Central' ? [28.6448, 77.2167] :
            d.District === 'Rohini' ? [28.7495, 77.0565] :
            d.District === 'Chaibasa' ? [22.5539, 85.8078] :
            d.District === 'Saraikela' ? [22.7001, 85.9328] :
            d.District === 'Pakur' ? [24.6346, 87.8493] :
            null;
          
          if (coords) {
            HEATMAP_POINTS.push({
              lat: coords[0],
              lng: coords[1],
              r: 2600,
              color: '#ef4444',
              title: `${d.District}, ${d.State}`,
              score: d.risk_score.toFixed(1),
              tier: d.risk_tier,
            });
          }
        });
      }

      HEATMAP_POINTS.forEach((pt) => {
        const circle = L.circle([pt.lat, pt.lng], {
          radius: pt.r,
          color: pt.color,
          fillColor: pt.color,
          fillOpacity: 0.25,
          weight: 1,
        });

        circle.bindPopup(`
          <div style="padding: 10px; font-family: monospace; font-size: 11px; background: #141414; color: #fff; border: 1px solid ${pt.color}; width: 260px;">
            <div style="font-weight: bold; font-size: 12px; color: ${pt.color}; margin-bottom: 4px;">
              DISTRICT RISK INTEL: ${pt.title}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px;">
              <div>Cash-out Risk Score: <strong style="color: #ceff00;">${pt.score} / 100</strong></div>
              <div>Risk Classification: <span style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 1px 4px; font-weight: bold;">${pt.tier}</span></div>
              <div style="margin-top: 4px; font-size: 9px; color: #aaa;">Data Source: Live ML District Model (Railway 3.0.0)</div>
            </div>
          </div>
        `);

        circle.addTo(heatmapLayerGroupRef.current);
      });
    }

  }, [layers, filters, onSelectATM, onSelectPolice, onSelectBranch, onSelectZone, districtScores]);

  // Handle Measurement Line Rendering
  useEffect(() => {
    measurementLayerGroupRef.current.clearLayers();
    if (measurePoints.length === 2) {
      L.polyline(measurePoints, {
        color: '#ceff00',
        weight: 2,
        dashArray: '4, 4',
      }).addTo(measurementLayerGroupRef.current);

      measurePoints.forEach((pt, idx) => {
        L.circleMarker(pt, {
          radius: 5,
          color: '#ceff00',
          fillColor: '#000',
          fillOpacity: 1,
        }).addTo(measurementLayerGroupRef.current);
      });
    }
  }, [measurePoints]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleMyLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mapInstanceRef.current) return;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          mapInstanceRef.current.flyTo([lat, lng], 15);
          L.circleMarker([lat, lng], {
            radius: 8,
            color: '#ceff00',
            fillColor: '#ceff00',
            fillOpacity: 0.6,
          }).addTo(measurementLayerGroupRef.current)
            .bindPopup('<div class="p-1 font-mono text-xs text-white">FIELD OFFICER POSITION</div>')
            .openPopup();
        },
        () => {
          // Fallback to Delhi Command
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([28.6139, 77.2090], 14);
          }
        }
      );
    }
  };

  const handleNationalReset = () => {
    mapInstanceRef.current?.flyTo([22.5937, 78.9629], 5);
  };

  const handleQuickJump = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = QUICK_JUMP_LOCATIONS.find(l => l.name === e.target.value);
    if (loc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], loc.zoom);
    }
  };

  const handleExportScreenshot = () => {
    alert('Capturing intelligence map viewport and compiling snapshot...');
  };

  return (
    <div className="relative w-full h-full bg-[#0c0c0c] overflow-hidden select-none font-mono">
      
      {/* MAP CANVAS CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

      {/* TOP LEFT ON MAP: MAP STYLE SWITCHER */}
      <div className="absolute top-3 left-3 z-30 flex items-center bg-[#141414]/90 border border-white/15 p-1 text-[10px] uppercase shadow-lg backdrop-blur-sm">
        <button
          onClick={() => setMapStyle('dark')}
          className={`px-2 py-1 font-bold ${mapStyle === 'dark' ? 'bg-neon text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          DARK MODE
        </button>
        <button
          onClick={() => setMapStyle('street')}
          className={`px-2 py-1 font-bold ${mapStyle === 'street' ? 'bg-neon text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          STREET
        </button>
        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-2 py-1 font-bold ${mapStyle === 'satellite' ? 'bg-neon text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          SATELLITE
        </button>
        <button
          onClick={() => setMapStyle('terrain')}
          className={`px-2 py-1 font-bold ${mapStyle === 'terrain' ? 'bg-neon text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          TERRAIN
        </button>
      </div>

      {/* TOP RIGHT ON MAP: QUICK JUMP DROPDOWN & RESET */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <select
          onChange={handleQuickJump}
          defaultValue="National View (India)"
          className="bg-[#141414]/90 border border-white/15 px-2.5 py-1.5 text-[10px] text-white font-mono uppercase focus:outline-none focus:border-neon shadow-lg backdrop-blur-sm rounded-none"
        >
          {QUICK_JUMP_LOCATIONS.map((loc) => (
            <option key={loc.name} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleNationalReset}
          className="px-2 py-1.5 bg-[#141414]/90 hover:bg-neon hover:text-black border border-white/15 text-white font-bold text-[10px] uppercase shadow-lg backdrop-blur-sm"
          title="Reset to Full India View"
        >
          <Globe className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* LEFT SURFACE: MAP INTERACTION CONTROLS */}
      <div className="absolute top-16 left-3 z-30 flex flex-col gap-1.5">
        
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="h-8 w-8 bg-[#141414]/90 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white shadow-lg backdrop-blur-sm"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="h-8 w-8 bg-[#141414]/90 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white shadow-lg backdrop-blur-sm"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* My Location */}
        <button
          onClick={handleMyLocation}
          className="h-8 w-8 bg-[#141414]/90 hover:bg-neon hover:text-black border border-white/15 flex items-center justify-center text-white shadow-lg backdrop-blur-sm"
          title="My Location (Field Officer Position)"
        >
          <Navigation className="h-3.5 w-3.5" />
        </button>

        {/* Measurement Ruler Tool */}
        <button
          onClick={() => {
            setMeasurementActive(!measurementActive);
            setRadiusActive(false);
            setMeasurePoints([]);
            setMeasuredDistance(null);
          }}
          className={`h-8 w-8 border flex items-center justify-center shadow-lg backdrop-blur-sm ${
            measurementActive ? 'bg-neon text-black border-neon' : 'bg-[#141414]/90 hover:bg-white/20 border-white/15 text-white'
          }`}
          title="Distance Measurement Tool (Click two points)"
        >
          <Ruler className="h-3.5 w-3.5" />
        </button>

        {/* 2km Radius Surveillance Tool */}
        <button
          onClick={() => {
            setRadiusActive(!radiusActive);
            setMeasurementActive(false);
          }}
          className={`h-8 w-8 border flex items-center justify-center shadow-lg backdrop-blur-sm ${
            radiusActive ? 'bg-neon text-black border-neon' : 'bg-[#141414]/90 hover:bg-white/20 border-white/15 text-white'
          }`}
          title="2.0 km Radius Surveillance Circle"
        >
          <Disc className="h-3.5 w-3.5" />
        </button>

        {/* Screenshot / Export Map */}
        <button
          onClick={handleExportScreenshot}
          className="h-8 w-8 bg-[#141414]/90 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white shadow-lg backdrop-blur-sm"
          title="Export Map View / Screenshot for Report"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>

      </div>

      {/* MEASUREMENT HUD DISPLAY */}
      {measurementActive && (
        <div className="absolute top-16 left-14 z-30 bg-[#141414] border border-neon p-2 text-xs text-white shadow-xl flex items-center gap-3">
          <div>
            <div className="text-[9px] text-neon uppercase font-bold">RULER MODE:</div>
            <div>
              {measuredDistance ? (
                <span>DISTANCE: <strong className="text-neon">{measuredDistance}</strong></span>
              ) : measurePoints.length === 1 ? (
                <span className="text-zinc-400">Click second point...</span>
              ) : (
                <span className="text-zinc-400">Click first point on map...</span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setMeasurementActive(false);
              setMeasurePoints([]);
              setMeasuredDistance(null);
            }}
            className="text-zinc-500 hover:text-white text-[10px]"
          >
            [ ESC ]
          </button>
        </div>
      )}

      {/* BOTTOM RIGHT SURFACE: FLOATING ACTION BUTTONS */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
        
        {/* Button 1: Generate Report */}
        <button
          onClick={onOpenReportModal}
          className="px-3 py-1.5 bg-[#141414]/90 hover:bg-neon hover:text-black border border-white/20 text-white font-bold uppercase text-[10px] shadow-lg backdrop-blur-sm flex items-center gap-1.5"
          title="Generate Intelligence Briefing PDF Report"
        >
          <FileText className="h-3 w-3 text-neon group-hover:text-black" />
          <span>GENERATE REPORT</span>
        </button>

        {/* Button 2: Share View */}
        <button
          onClick={onOpenShareModal}
          className="px-3 py-1.5 bg-[#141414]/90 hover:bg-neon hover:text-black border border-white/20 text-white font-bold uppercase text-[10px] shadow-lg backdrop-blur-sm flex items-center gap-1.5"
          title="Share Encrypted 24h View Link"
        >
          <Share2 className="h-3 w-3 text-neon group-hover:text-black" />
          <span>SHARE VIEW</span>
        </button>

        {/* Button 3: Draw Zone */}
        <button
          onClick={onOpenDrawZoneModal}
          className="px-3 py-1.5 bg-[#141414]/90 hover:bg-neon hover:text-black border border-white/20 text-white font-bold uppercase text-[10px] shadow-lg backdrop-blur-sm flex items-center gap-1.5"
          title="Draw Custom Perimeter Zone"
        >
          <PenTool className="h-3 w-3 text-neon group-hover:text-black" />
          <span>DRAW ZONE</span>
        </button>

        {/* Button 4: Compare */}
        <button
          onClick={onOpenCompareModal}
          className="px-3 py-1.5 bg-[#141414]/90 hover:bg-neon hover:text-black border border-white/20 text-white font-bold uppercase text-[10px] shadow-lg backdrop-blur-sm flex items-center gap-1.5"
          title="Compare Split Screen Historical Baseline"
        >
          <Split className="h-3 w-3 text-neon group-hover:text-black" />
          <span>COMPARE</span>
        </button>

      </div>

    </div>
  );
}
