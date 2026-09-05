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
import { LayerVisibilityState, FilterState } from './LeftSidebar';

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

    // 4. ACTIVE INCIDENTS LAYER
    incidentsLayerGroupRef.current.clearLayers();
    if (layers.incidents) {
      ACTIVE_INCIDENTS_DATA.forEach((inc) => {
        // Size proportional to amount (min 16px, max 32px)
        const size = Math.min(32, Math.max(16, 16 + (inc.amount / 100000) * 1.2));

        const iconHtml = `
          <div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; position: relative;">
            <div style="width: 0; height: 0; border-left: ${size / 2}px solid transparent; border-right: ${size / 2}px solid transparent; border-bottom: ${size}px solid #ef4444; filter: drop-shadow(0 0 4px #ef4444);"></div>
            <span style="position: absolute; color: #fff; font-size: 8px; font-weight: bold; top: 40%;">!</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-incident-marker',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([inc.lat, inc.lng], { icon: customIcon });

        marker.bindPopup(`
          <div style="padding: 12px; font-family: monospace; font-size: 11px; background: #141414; color: #fff; border: 1px solid rgba(239,68,68,0.4); width: 270px;">
            <div style="font-weight: bold; font-size: 12px; color: #ef4444; margin-bottom: 4px;">
              CASE: ${inc.id}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-bottom: 6px;">
              <div>Fraud Type: <strong>${inc.fraudType}</strong></div>
              <div>Amount Stolen: <strong style="color: #ceff00;">${inc.amountFormatted}</strong></div>
              <div>Victim Location: <strong>${inc.victimLocation}</strong></div>
              <div>Predicted Zone: <strong style="color: #f59e0b;">${inc.predictedZone}</strong></div>
              <div>Status: <span style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 1px 4px;">${inc.status}</span></div>
            </div>
          </div>
        `);

        marker.addTo(incidentsLayerGroupRef.current);
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
          <div style="padding: 10px; font-family: monospace; font-size: 11px; background: #141414; color: #fff; border: 1px solid ${color}; width: 250px;">
            <div style="font-weight: bold; color: ${color}; text-transform: uppercase;">
              ${corridor.type} Money Trail Corridor
            </div>
            <div style="margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
              <div>${corridor.fromState} → ${corridor.toState}</div>
              <div>Cases on Route: <strong>${corridor.casesCount}</strong></div>
              <div>Avg Speed of Cashout: <strong>${corridor.avgTime}</strong></div>
              <div>Total Funds Routed: <strong style="color: #ceff00;">${corridor.totalAmount}</strong></div>
            </div>
          </div>
        `);

        polyline.addTo(corridorsLayerGroupRef.current);
      });
    }

    // 7. HEATMAP OVERLAY LAYER
    heatmapLayerGroupRef.current.clearLayers();
    if (layers.heatmap) {
      // Risk clusters representing intensity zones across India
      const HEATMAP_POINTS = [
        { lat: 26.9210, lng: 75.7970, r: 2500, color: '#ef4444' }, // Jaipur Critical
        { lat: 26.8505, lng: 80.9492, r: 2200, color: '#ef4444' }, // Lucknow Critical
        { lat: 28.6315, lng: 77.2170, r: 3000, color: '#f59e0b' }, // Delhi High
        { lat: 12.9752, lng: 77.6065, r: 2200, color: '#f59e0b' }, // Bengaluru High
        { lat: 19.1158, lng: 72.8687, r: 2800, color: '#f59e0b' }, // Mumbai High
        { lat: 25.6186, lng: 85.1414, r: 2000, color: '#eab308' }, // Patna Moderate
        { lat: 22.5280, lng: 88.3655, r: 2100, color: '#eab308' }, // Kolkata Moderate
        { lat: 17.4089, lng: 78.4907, r: 1800, color: '#10b981' }, // Hyderabad Low-Mod
        { lat: 27.5000, lng: 76.9000, r: 3500, color: '#ef4444' }, // Mewat Cluster
        { lat: 23.9629, lng: 86.8016, r: 3000, color: '#ef4444' }, // Jamtara Cluster
      ];

      HEATMAP_POINTS.forEach((pt) => {
        L.circle([pt.lat, pt.lng], {
          radius: pt.r,
          color: pt.color,
          fillColor: pt.color,
          fillOpacity: 0.22,
          weight: 0,
        }).addTo(heatmapLayerGroupRef.current);
      });
    }

  }, [layers, filters, onSelectATM, onSelectPolice, onSelectBranch, onSelectZone]);

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
