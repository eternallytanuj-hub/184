export interface ATMEntity {
  id: string;
  bank: string;
  branch: string;
  address: string;
  lat: number;
  lng: number;
  riskScore: number;
  status: 'normal' | 'moderate' | 'high';
  fraudWithdrawals: number;
  lastAlert: string;
  zone: string;
}

export interface BankBranchEntity {
  id: string;
  name: string;
  ifsc: string;
  address: string;
  lat: number;
  lng: number;
  flaggedAccounts: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  managerContact: string;
  zone: string;
}

export interface PoliceStationEntity {
  id: string;
  name: string;
  jurisdiction: string;
  sho: string;
  contact: string;
  lat: number;
  lng: number;
  cyberCell: boolean;
  cyberCellStaff: number;
  activeCases: number;
  responseTime: string;
  teamsDeployed: number;
  casesResolved: number;
  fundsRecovered: string;
}

export interface CrimeIncidentEntity {
  id: string;
  fraudType: 'KYC Fraud' | 'OTP Fraud' | 'Investment Fraud' | 'Job/Employment Fraud' | 'Loan Fraud' | 'Sextortion' | 'UPI Fraud' | 'Other';
  amount: number;
  amountFormatted: string;
  complaintTime: string;
  victimLocation: string;
  predictedZone: string;
  status: 'Pending' | 'Under Investigation' | 'Resolved';
  lat: number;
  lng: number;
}

export interface HotspotEntity {
  id: string;
  name: string;
  confidence: number;
  timeWindow: string;
  atmCount: number;
  linkedCases: string[];
  recommendedAction: string;
  riskScore: number;
  urgency: 'Immediate' | 'Within 2h' | 'Within 4h' | 'Evening';
  lat: number;
  lng: number;
  radius: number;
}

export interface CorridorEntity {
  id: string;
  fromState: string;
  toState: string;
  path: [number, number][];
  type: 'active' | 'predicted' | 'historical';
  casesCount: number;
  avgTime: string;
  totalAmount: string;
}

export interface LiveAlertItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timeAgo: string;
  location: string;
  fraudType: string;
  amount: string;
  confidence: number;
  predictedWindow: string;
  lat: number;
  lng: number;
  acknowledged: boolean;
}

export interface RiskZoneRank {
  rank: number;
  name: string;
  score: number;
  trend: 'up' | 'down';
  state: string;
  lat: number;
  lng: number;
  atmDensity: string;
  historicalFraud: string;
  activeAlerts: string;
  policeCoverage: string;
}

// QUICK STATS
export const DASHBOARD_STATS = {
  activeAlerts: { value: 147, change: '+12% from yesterday', trend: 'up' },
  predictionsGenerated: { value: 89, subtext: 'High confidence: 34' },
  underSurveillance: { value: 23, subtext: 'Across 8 states' },
  fundsFlagged: { value: '₹2.4 Cr', subtext: 'In 156 accounts' },
};

// QUICK JUMP LOCATIONS
export const QUICK_JUMP_LOCATIONS = [
  { name: 'National View (India)', lat: 22.5937, lng: 78.9629, zoom: 5 },
  { name: 'Jaipur - Sindhi Camp (Alert)', lat: 26.9209, lng: 75.7973, zoom: 14 },
  { name: 'Delhi NCR - Connaught Place', lat: 28.6315, lng: 77.2167, zoom: 14 },
  { name: 'Lucknow - Hazratganj', lat: 26.8500, lng: 80.9499, zoom: 14 },
  { name: 'Bengaluru - MG Road', lat: 12.9756, lng: 77.6066, zoom: 14 },
  { name: 'Mumbai - Andheri East', lat: 19.1158, lng: 72.8687, zoom: 14 },
  { name: 'Patna - Gandhi Maidan', lat: 25.6186, lng: 85.1414, zoom: 14 },
  { name: 'Kolkata - Ballygunge', lat: 22.5280, lng: 88.3655, zoom: 14 },
  { name: 'Hyderabad - Ashok Nagar', lat: 17.4089, lng: 78.4907, zoom: 14 },
  { name: 'Chandigarh - Sector 17', lat: 30.7398, lng: 76.7827, zoom: 14 },
  { name: 'Pune - MG Road', lat: 18.5167, lng: 73.8767, zoom: 14 },
];

// 40+ ATMS SPREAD ACROSS INDIA WITH EMPHASIS ON CRITICAL HUBS
export const ATMS_DATA: ATMEntity[] = [
  // Jaipur Sindhi Camp Cluster (CRITICAL)
  {
    id: 'SBI-RJ-4421',
    bank: 'State Bank of India',
    branch: 'Sindhi Camp Branch',
    address: 'Near Railway Station, Sindhi Camp, Jaipur',
    lat: 26.9215,
    lng: 75.7968,
    riskScore: 82,
    status: 'high',
    fraudWithdrawals: 12,
    lastAlert: 'Today, 1:45 PM',
    zone: 'Sindhi Camp, Jaipur',
  },
  {
    id: 'HDFC-RJ-1092',
    bank: 'HDFC Bank',
    branch: 'MI Road Branch',
    address: 'Shop 14, Station Road, Sindhi Camp, Jaipur',
    lat: 26.9202,
    lng: 75.7981,
    riskScore: 65,
    status: 'moderate',
    fraudWithdrawals: 7,
    lastAlert: 'Yesterday, 6:10 PM',
    zone: 'Sindhi Camp, Jaipur',
  },
  {
    id: 'PNB-RJ-8812',
    bank: 'Punjab National Bank',
    branch: 'Bus Stand Branch',
    address: 'Central Bus Terminal, Sindhi Camp, Jaipur',
    lat: 26.9228,
    lng: 75.7955,
    riskScore: 91,
    status: 'high',
    fraudWithdrawals: 16,
    lastAlert: 'Today, 2:15 PM',
    zone: 'Sindhi Camp, Jaipur',
  },
  {
    id: 'ICICI-RJ-3011',
    bank: 'ICICI Bank',
    branch: 'Vansthali Marg ATM',
    address: 'Near Polo Victory Cinema, Sindhi Camp, Jaipur',
    lat: 26.9195,
    lng: 75.7990,
    riskScore: 74,
    status: 'high',
    fraudWithdrawals: 9,
    lastAlert: 'Today, 11:20 AM',
    zone: 'Sindhi Camp, Jaipur',
  },
  {
    id: 'BOB-RJ-6601',
    bank: 'Bank of Baroda',
    branch: 'Kanti Nagar ATM',
    address: 'Station Circular Road, Sindhi Camp, Jaipur',
    lat: 26.9235,
    lng: 75.7942,
    riskScore: 38,
    status: 'moderate',
    fraudWithdrawals: 3,
    lastAlert: '3 days ago',
    zone: 'Sindhi Camp, Jaipur',
  },
  {
    id: 'AXIS-RJ-2209',
    bank: 'Axis Bank',
    branch: 'Railway Terminal Kiosk',
    address: 'Platform Exit Gate 2, Jaipur Junction',
    lat: 26.9242,
    lng: 75.7928,
    riskScore: 18,
    status: 'normal',
    fraudWithdrawals: 0,
    lastAlert: 'None',
    zone: 'Sindhi Camp, Jaipur',
  },

  // Delhi NCR Connaught Place Cluster
  {
    id: 'SBI-DL-1102',
    bank: 'State Bank of India',
    branch: 'Parliament Street Main',
    address: '11 Parliament Street, Connaught Place, New Delhi',
    lat: 28.6289,
    lng: 77.2145,
    riskScore: 78,
    status: 'high',
    fraudWithdrawals: 14,
    lastAlert: 'Today, 12:30 PM',
    zone: 'Connaught Place, Delhi',
  },
  {
    id: 'HDFC-DL-4401',
    bank: 'HDFC Bank',
    branch: 'Inner Circle Block B',
    address: 'B-24 Inner Circle, Connaught Place, New Delhi',
    lat: 28.6322,
    lng: 77.2185,
    riskScore: 74,
    status: 'high',
    fraudWithdrawals: 11,
    lastAlert: 'Today, 10:15 AM',
    zone: 'Connaught Place, Delhi',
  },
  {
    id: 'PNB-DL-0091',
    bank: 'Punjab National Bank',
    branch: 'Radial Road 4 Kiosk',
    address: 'Radial Road 4, Janpath Crossing, New Delhi',
    lat: 28.6298,
    lng: 77.2198,
    riskScore: 42,
    status: 'moderate',
    fraudWithdrawals: 4,
    lastAlert: 'Yesterday, 8:40 PM',
    zone: 'Connaught Place, Delhi',
  },
  {
    id: 'CAN-DL-5520',
    bank: 'Canara Bank',
    branch: 'Barakhamba Branch',
    address: 'Statesman House, Barakhamba Road, New Delhi',
    lat: 28.6310,
    lng: 77.2250,
    riskScore: 21,
    status: 'normal',
    fraudWithdrawals: 1,
    lastAlert: '5 days ago',
    zone: 'Connaught Place, Delhi',
  },

  // Lucknow Hazratganj Cluster
  {
    id: 'SBI-UP-3310',
    bank: 'State Bank of India',
    branch: 'Hazratganj Main',
    address: 'Mayfair Building, Hazratganj, Lucknow',
    lat: 26.8512,
    lng: 80.9485,
    riskScore: 88,
    status: 'high',
    fraudWithdrawals: 15,
    lastAlert: 'Today, 2:50 PM',
    zone: 'Hazratganj, Lucknow',
  },
  {
    id: 'UBI-UP-7721',
    bank: 'Union Bank of India',
    branch: 'Ashok Marg Corner',
    address: 'Near GPO, Hazratganj, Lucknow',
    lat: 26.8488,
    lng: 80.9472,
    riskScore: 71,
    status: 'high',
    fraudWithdrawals: 8,
    lastAlert: 'Today, 1:15 PM',
    zone: 'Hazratganj, Lucknow',
  },
  {
    id: 'ICICI-UP-9902',
    bank: 'ICICI Bank',
    branch: 'Habibullah Estate Kiosk',
    address: 'Mahatma Gandhi Marg, Hazratganj, Lucknow',
    lat: 26.8525,
    lng: 80.9515,
    riskScore: 49,
    status: 'moderate',
    fraudWithdrawals: 5,
    lastAlert: 'Yesterday, 4:00 PM',
    zone: 'Hazratganj, Lucknow',
  },

  // Bengaluru MG Road Cluster
  {
    id: 'SBI-KA-8819',
    bank: 'State Bank of India',
    branch: 'MG Road Metro Hub',
    address: 'Brigade Road Junction, MG Road, Bengaluru',
    lat: 12.9750,
    lng: 77.6078,
    riskScore: 79,
    status: 'high',
    fraudWithdrawals: 13,
    lastAlert: 'Today, 11:40 AM',
    zone: 'MG Road, Bengaluru',
  },
  {
    id: 'HDFC-KA-3321',
    bank: 'HDFC Bank',
    branch: 'Residency Road Branch',
    address: 'Opp Symphony Theatre, MG Road, Bengaluru',
    lat: 12.9735,
    lng: 77.6045,
    riskScore: 68,
    status: 'moderate',
    fraudWithdrawals: 7,
    lastAlert: 'Yesterday, 9:20 PM',
    zone: 'MG Road, Bengaluru',
  },
  {
    id: 'KOTAK-KA-1109',
    bank: 'Kotak Mahindra Bank',
    branch: 'Church Street Kiosk',
    address: 'Church Street, Off MG Road, Bengaluru',
    lat: 12.9745,
    lng: 77.6092,
    riskScore: 24,
    status: 'normal',
    fraudWithdrawals: 1,
    lastAlert: 'None',
    zone: 'MG Road, Bengaluru',
  },

  // Mumbai Andheri East Cluster
  {
    id: 'SBI-MH-7740',
    bank: 'State Bank of India',
    branch: 'Chakala Metro Node',
    address: 'Andheri-Kurla Road, Andheri East, Mumbai',
    lat: 19.1145,
    lng: 72.8672,
    riskScore: 84,
    status: 'high',
    fraudWithdrawals: 14,
    lastAlert: 'Today, 1:20 PM',
    zone: 'Andheri East, Mumbai',
  },
  {
    id: 'AXIS-MH-3388',
    bank: 'Axis Bank',
    branch: 'JB Nagar Kiosk',
    address: 'Near JB Nagar Metro Station, Andheri East, Mumbai',
    lat: 19.1168,
    lng: 72.8710,
    riskScore: 62,
    status: 'moderate',
    fraudWithdrawals: 6,
    lastAlert: 'Yesterday, 7:50 PM',
    zone: 'Andheri East, Mumbai',
  },
  {
    id: 'BOI-MH-0012',
    bank: 'Bank of India',
    branch: 'Marol Naka Branch',
    address: 'Marol Maroshi Road, Andheri East, Mumbai',
    lat: 19.1180,
    lng: 72.8765,
    riskScore: 19,
    status: 'normal',
    fraudWithdrawals: 0,
    lastAlert: 'None',
    zone: 'Andheri East, Mumbai',
  },

  // Patna Gandhi Maidan Cluster
  {
    id: 'SBI-BR-5501',
    bank: 'State Bank of India',
    branch: 'Gandhi Maidan Main',
    address: 'Exhibition Road Corner, Gandhi Maidan, Patna',
    lat: 25.6195,
    lng: 85.1425,
    riskScore: 76,
    status: 'high',
    fraudWithdrawals: 10,
    lastAlert: 'Today, 12:10 PM',
    zone: 'Gandhi Maidan, Patna',
  },
  {
    id: 'PNB-BR-2299',
    bank: 'Punjab National Bank',
    branch: 'Frazer Road Branch',
    address: 'Frazer Road, Near Gandhi Maidan, Patna',
    lat: 25.6165,
    lng: 85.1390,
    riskScore: 45,
    status: 'moderate',
    fraudWithdrawals: 4,
    lastAlert: 'Yesterday, 3:30 PM',
    zone: 'Gandhi Maidan, Patna',
  },

  // Kolkata Ballygunge Cluster
  {
    id: 'SBI-WB-9011',
    bank: 'State Bank of India',
    branch: 'Gariahat Market Node',
    address: 'Ballygunge Circular Road, Kolkata',
    lat: 22.5295,
    lng: 88.3668,
    riskScore: 64,
    status: 'moderate',
    fraudWithdrawals: 6,
    lastAlert: 'Today, 9:50 AM',
    zone: 'Ballygunge, Kolkata',
  },
  {
    id: 'UCO-WB-4412',
    bank: 'UCO Bank',
    branch: 'Hazra Crossing Branch',
    address: 'Near Ballygunge Phari, Kolkata',
    lat: 22.5265,
    lng: 88.3630,
    riskScore: 22,
    status: 'normal',
    fraudWithdrawals: 1,
    lastAlert: '4 days ago',
    zone: 'Ballygunge, Kolkata',
  },

  // Hyderabad Ashok Nagar Cluster
  {
    id: 'SBI-TG-6623',
    bank: 'State Bank of India',
    branch: 'Chikkadpally Main',
    address: 'Ashok Nagar Cross Roads, Hyderabad',
    lat: 17.4095,
    lng: 78.4915,
    riskScore: 58,
    status: 'moderate',
    fraudWithdrawals: 5,
    lastAlert: 'Today, 10:45 AM',
    zone: 'Ashok Nagar, Hyderabad',
  },
  {
    id: 'ANDHRA-TG-1188',
    bank: 'Union Bank of India (e-Andhra)',
    branch: 'Indira Park Kiosk',
    address: 'Beside NTR Stadium, Ashok Nagar, Hyderabad',
    lat: 17.4075,
    lng: 78.4890,
    riskScore: 20,
    status: 'normal',
    fraudWithdrawals: 0,
    lastAlert: 'None',
    zone: 'Ashok Nagar, Hyderabad',
  },
];

// BANK BRANCHES
export const BANK_BRANCHES_DATA: BankBranchEntity[] = [
  {
    id: 'BRANCH-SBI-01',
    name: 'State Bank of India - Jaipur Main',
    ifsc: 'SBIN0000656',
    address: 'Station Road, Sindhi Camp, Jaipur, Rajasthan 302006',
    lat: 26.9218,
    lng: 75.7960,
    flaggedAccounts: 18,
    riskLevel: 'Critical',
    managerContact: '+91 94140 XXXXX',
    zone: 'Sindhi Camp, Jaipur',
  },
  {
    id: 'BRANCH-HDFC-02',
    name: 'HDFC Bank - MI Road',
    ifsc: 'HDFC0000054',
    address: 'MI Road, Near Panch Batti, Jaipur, Rajasthan 302001',
    lat: 26.9185,
    lng: 75.8010,
    flaggedAccounts: 9,
    riskLevel: 'High',
    managerContact: '+91 98290 XXXXX',
    zone: 'Sindhi Camp, Jaipur',
  },
  {
    id: 'BRANCH-SBI-03',
    name: 'State Bank of India - Parliament Street',
    ifsc: 'SBIN0000691',
    address: '11 Parliament Street, New Delhi 110001',
    lat: 28.6292,
    lng: 77.2140,
    flaggedAccounts: 14,
    riskLevel: 'High',
    managerContact: '+91 98110 XXXXX',
    zone: 'Connaught Place, Delhi',
  },
  {
    id: 'BRANCH-SBI-04',
    name: 'State Bank of India - Hazratganj',
    ifsc: 'SBIN0000125',
    address: 'Mayfair Building, Hazratganj, Lucknow 226001',
    lat: 26.8510,
    lng: 80.9480,
    flaggedAccounts: 16,
    riskLevel: 'Critical',
    managerContact: '+91 94150 XXXXX',
    zone: 'Hazratganj, Lucknow',
  },
  {
    id: 'BRANCH-HDFC-05',
    name: 'HDFC Bank - MG Road',
    ifsc: 'HDFC0000009',
    address: 'Mahatma Gandhi Road, Bengaluru, Karnataka 560001',
    lat: 12.9740,
    lng: 77.6050,
    flaggedAccounts: 11,
    riskLevel: 'High',
    managerContact: '+91 98450 XXXXX',
    zone: 'MG Road, Bengaluru',
  },
  {
    id: 'BRANCH-AXIS-06',
    name: 'Axis Bank - Andheri East',
    ifsc: 'UTIB0000028',
    address: 'Andheri-Kurla Road, Chakala, Mumbai 400093',
    lat: 19.1150,
    lng: 72.8690,
    flaggedAccounts: 15,
    riskLevel: 'High',
    managerContact: '+91 98200 XXXXX',
    zone: 'Andheri East, Mumbai',
  },
];

// POLICE STATIONS
export const POLICE_STATIONS_DATA: PoliceStationEntity[] = [
  {
    id: 'PS-RJ-01',
    name: 'Sindhi Camp Police Station',
    jurisdiction: 'Sindhi Camp, Jaipur North District',
    sho: 'Inspector Rajesh Kumar, RPS',
    contact: '+91 141 237XXXX',
    lat: 26.9240,
    lng: 75.7985,
    cyberCell: true,
    cyberCellStaff: 4,
    activeCases: 14,
    responseTime: '~4 minutes to ATM cluster',
    teamsDeployed: 2,
    casesResolved: 8,
    fundsRecovered: '₹3.2L this month',
  },
  {
    id: 'PS-DL-02',
    name: 'Connaught Place Police Station',
    jurisdiction: 'New Delhi Police District',
    sho: 'Inspector Devendra Singh',
    contact: '+91 11 2334XXXX',
    lat: 28.6335,
    lng: 77.2195,
    cyberCell: true,
    cyberCellStaff: 6,
    activeCases: 19,
    responseTime: '~3 minutes to Outer Circle',
    teamsDeployed: 3,
    casesResolved: 12,
    fundsRecovered: '₹7.8L this month',
  },
  {
    id: 'PS-UP-03',
    name: 'Hazratganj Kotwali',
    jurisdiction: 'Lucknow Central Zone',
    sho: 'Inspector Alok Mani Tripathi',
    contact: '+91 522 262XXXX',
    lat: 26.8530,
    lng: 80.9460,
    cyberCell: true,
    cyberCellStaff: 3,
    activeCases: 16,
    responseTime: '~5 minutes to GPO cluster',
    teamsDeployed: 2,
    casesResolved: 9,
    fundsRecovered: '₹4.6L this month',
  },
  {
    id: 'PS-KA-04',
    name: 'Cubbon Park Police Station',
    jurisdiction: 'Bengaluru Central Sub-Division',
    sho: 'Inspector K. Venkatesh',
    contact: '+91 80 2294XXXX',
    lat: 12.9770,
    lng: 77.6015,
    cyberCell: true,
    cyberCellStaff: 5,
    activeCases: 15,
    responseTime: '~6 minutes to Brigade Road',
    teamsDeployed: 1,
    casesResolved: 11,
    fundsRecovered: '₹9.1L this month',
  },
  {
    id: 'PS-MH-05',
    name: 'Andheri Police Station',
    jurisdiction: 'Mumbai Police Zone X',
    sho: 'Sr. Inspector Sanjay Bhalerao',
    contact: '+91 22 2683XXXX',
    lat: 19.1170,
    lng: 72.8630,
    cyberCell: true,
    cyberCellStaff: 4,
    activeCases: 21,
    responseTime: '~5 minutes to Chakala Node',
    teamsDeployed: 2,
    casesResolved: 14,
    fundsRecovered: '₹11.5L this month',
  },
];

// ACTIVE CRIME INCIDENTS
export const ACTIVE_INCIDENTS_DATA: CrimeIncidentEntity[] = [
  {
    id: 'CY2026-RJ-44521',
    fraudType: 'KYC Fraud',
    amount: 450000,
    amountFormatted: '₹4.5 Lakhs',
    complaintTime: '12:45 PM (38m ago)',
    victimLocation: 'Udaipur, Rajasthan',
    predictedZone: 'Sindhi Camp, Jaipur',
    status: 'Under Investigation',
    lat: 26.9212,
    lng: 75.7965,
  },
  {
    id: 'CY2026-UP-88102',
    fraudType: 'OTP Fraud',
    amount: 120000,
    amountFormatted: '₹1.2 Lakhs',
    complaintTime: '1:15 PM (25m ago)',
    victimLocation: 'Kanpur, UP',
    predictedZone: 'Hazratganj, Lucknow',
    status: 'Under Investigation',
    lat: 26.8508,
    lng: 80.9490,
  },
  {
    id: 'CY2026-DL-99341',
    fraudType: 'Investment Fraud',
    amount: 1240000,
    amountFormatted: '₹12.4 Lakhs',
    complaintTime: '11:30 AM (1h 10m ago)',
    victimLocation: 'Noida Sector 62',
    predictedZone: 'Connaught Place, Delhi',
    status: 'Pending',
    lat: 28.6318,
    lng: 77.2175,
  },
  {
    id: 'CY2026-KA-22104',
    fraudType: 'Job/Employment Fraud',
    amount: 320000,
    amountFormatted: '₹3.2 Lakhs',
    complaintTime: '10:10 AM (2h 30m ago)',
    victimLocation: 'Mysuru, Karnataka',
    predictedZone: 'MG Road, Bengaluru',
    status: 'Under Investigation',
    lat: 12.9748,
    lng: 77.6060,
  },
  {
    id: 'CY2026-MH-77112',
    fraudType: 'UPI Fraud',
    amount: 95000,
    amountFormatted: '₹95,000',
    complaintTime: '1:40 PM (10m ago)',
    victimLocation: 'Thane, Maharashtra',
    predictedZone: 'Andheri East, Mumbai',
    status: 'Pending',
    lat: 19.1152,
    lng: 72.8680,
  },
  {
    id: 'CY2026-BR-33019',
    fraudType: 'Loan Fraud',
    amount: 870000,
    amountFormatted: '₹8.7 Lakhs',
    complaintTime: '12:05 PM (45m ago)',
    victimLocation: 'Gaya, Bihar',
    predictedZone: 'Gandhi Maidan, Patna',
    status: 'Under Investigation',
    lat: 25.6180,
    lng: 85.1410,
  },
];

// PREDICTED WITHDRAWAL HOTSPOTS
export const PREDICTED_HOTSPOTS_DATA: HotspotEntity[] = [
  {
    id: 'HOTSPOT-01',
    name: 'Sindhi Camp ATM Cluster, Jaipur',
    confidence: 92,
    timeWindow: '2:00 PM - 4:30 PM Today',
    atmCount: 14,
    linkedCases: ['CY2026-RJ-44521', 'CY2026-RJ-44509', 'CY2026-RJ-44488'],
    recommendedAction: 'Deploy 2 officers to SBI and PNB ATMs; issue freeze flag to SBI branch manager',
    riskScore: 92,
    urgency: 'Immediate',
    lat: 26.9210,
    lng: 75.7970,
    radius: 750,
  },
  {
    id: 'HOTSPOT-02',
    name: 'Hazratganj Financial Node, Lucknow',
    confidence: 87,
    timeWindow: '3:00 PM - 5:30 PM Today',
    atmCount: 11,
    linkedCases: ['CY2026-UP-88102', 'CY2026-UP-88090'],
    recommendedAction: 'Surveillance alert to Kotwali squad; monitor Mayfair SBI ATM',
    riskScore: 87,
    urgency: 'Within 2h',
    lat: 26.8505,
    lng: 80.9492,
    radius: 650,
  },
  {
    id: 'HOTSPOT-03',
    name: 'Connaught Place Radial Cluster, Delhi',
    confidence: 84,
    timeWindow: '2:30 PM - 5:00 PM Today',
    atmCount: 19,
    linkedCases: ['CY2026-DL-99341'],
    recommendedAction: 'Notify New Delhi Cyber Cell; monitor Outer Circle kiosks',
    riskScore: 74,
    urgency: 'Within 2h',
    lat: 28.6315,
    lng: 77.2170,
    radius: 800,
  },
  {
    id: 'HOTSPOT-04',
    name: 'MG Road Metro Cluster, Bengaluru',
    confidence: 78,
    timeWindow: '4:00 PM - 7:00 PM Today',
    atmCount: 16,
    linkedCases: ['CY2026-KA-22104'],
    recommendedAction: 'Station beat patrol around Brigade Road junction',
    riskScore: 78,
    urgency: 'Within 4h',
    lat: 12.9752,
    lng: 77.6065,
    radius: 600,
  },
  {
    id: 'HOTSPOT-05',
    name: 'Chakala & Andheri East Hub, Mumbai',
    confidence: 71,
    timeWindow: '3:30 PM - 6:00 PM Today',
    atmCount: 18,
    linkedCases: ['CY2026-MH-77112'],
    recommendedAction: 'Coordinate with Andheri PS; verify CCTV feeds at Chakala metro',
    riskScore: 71,
    urgency: 'Within 2h',
    lat: 19.1155,
    lng: 72.8685,
    radius: 700,
  },
];

// CRIMINAL NETWORK CORRIDORS (MONEY TRAIL PATHS)
export const CORRIDORS_DATA: CorridorEntity[] = [
  {
    id: 'CORRIDOR-01',
    fromState: 'Udaipur, RJ',
    toState: 'Sindhi Camp, Jaipur',
    path: [
      [24.5854, 73.7125], // Udaipur
      [25.3463, 74.6399], // Bhilwara
      [26.4499, 74.6399], // Ajmer
      [26.9210, 75.7970], // Sindhi Camp Jaipur
    ],
    type: 'active',
    casesCount: 18,
    avgTime: '2 hrs 45 mins',
    totalAmount: '₹48.5 Lakhs',
  },
  {
    id: 'CORRIDOR-02',
    fromState: 'Kanpur, UP',
    toState: 'Hazratganj, Lucknow',
    path: [
      [26.4499, 80.3319], // Kanpur
      [26.6500, 80.6000], // Unnao
      [26.8505, 80.9492], // Lucknow
    ],
    type: 'active',
    casesCount: 14,
    avgTime: '1 hr 30 mins',
    totalAmount: '₹22.8 Lakhs',
  },
  {
    id: 'CORRIDOR-03',
    fromState: 'Jamtara, JH',
    toState: 'Ballygunge, Kolkata',
    path: [
      [23.9629, 86.8016], // Jamtara
      [23.6889, 86.9661], // Asansol
      [23.5204, 87.3119], // Durgapur
      [22.5280, 88.3655], // Kolkata
    ],
    type: 'predicted',
    casesCount: 34,
    avgTime: '4 hrs 15 mins',
    totalAmount: '₹94.2 Lakhs',
  },
  {
    id: 'CORRIDOR-04',
    fromState: 'Mewat / Bharatpur',
    toState: 'Connaught Place, Delhi',
    path: [
      [27.5000, 76.9000], // Mewat
      [28.4595, 77.0266], // Gurugram
      [28.6315, 77.2170], // CP Delhi
    ],
    type: 'historical',
    casesCount: 52,
    avgTime: '3 hrs 10 mins',
    totalAmount: '₹1.8 Cr',
  },
];

// LIVE ALERT FEED
export const LIVE_ALERTS_DATA: LiveAlertItem[] = [
  {
    id: 'ALERT-001',
    severity: 'CRITICAL',
    timeAgo: '2 min ago',
    location: 'Jaipur - Sindhi Camp ATM Cluster',
    fraudType: 'KYC Fraud',
    amount: '₹4.5L',
    confidence: 87,
    predictedWindow: '2PM - 4PM Today',
    lat: 26.9210,
    lng: 75.7970,
    acknowledged: false,
  },
  {
    id: 'ALERT-002',
    severity: 'HIGH',
    timeAgo: '15 min ago',
    location: 'Lucknow - Hazratganj Area',
    fraudType: 'OTP Fraud',
    amount: '₹1.2L',
    confidence: 72,
    predictedWindow: '3PM - 6PM Today',
    lat: 26.8505,
    lng: 80.9492,
    acknowledged: false,
  },
  {
    id: 'ALERT-003',
    severity: 'MEDIUM',
    timeAgo: '32 min ago',
    location: 'Patna - Gandhi Maidan Zone',
    fraudType: 'Investment Fraud',
    amount: '₹8.7L',
    confidence: 54,
    predictedWindow: '4PM - 7PM Today',
    lat: 25.6186,
    lng: 85.1414,
    acknowledged: false,
  },
  {
    id: 'ALERT-004',
    severity: 'CRITICAL',
    timeAgo: '48 min ago',
    location: 'Delhi - Connaught Place Outer Circle',
    fraudType: 'Vishing Surge',
    amount: '₹12.4L',
    confidence: 91,
    predictedWindow: '2:30PM - 4:30PM',
    lat: 28.6315,
    lng: 77.2170,
    acknowledged: true,
  },
  {
    id: 'ALERT-005',
    severity: 'HIGH',
    timeAgo: '1 hr ago',
    location: 'Mumbai - Andheri East Chakala Node',
    fraudType: 'UPI Fraud',
    amount: '₹95,000',
    confidence: 68,
    predictedWindow: '3PM - 5PM',
    lat: 19.1158,
    lng: 72.8687,
    acknowledged: true,
  },
];

// TOP 10 RISK ZONES
export const TOP_10_RISK_ZONES: RiskZoneRank[] = [
  {
    rank: 1,
    name: 'Sindhi Camp, Jaipur',
    score: 92,
    trend: 'up',
    state: 'Rajasthan',
    lat: 26.9210,
    lng: 75.7970,
    atmDensity: 'High (14 ATMs in 1km)',
    historicalFraud: 'Critical (38 cases / 30d)',
    activeAlerts: 'Critical (3 active predictions)',
    policeCoverage: 'Moderate (PS 800m away)',
  },
  {
    rank: 2,
    name: 'Hazratganj, Lucknow',
    score: 87,
    trend: 'up',
    state: 'Uttar Pradesh',
    lat: 26.8505,
    lng: 80.9492,
    atmDensity: 'High (11 ATMs in 1km)',
    historicalFraud: 'High (29 cases / 30d)',
    activeAlerts: 'High (2 active predictions)',
    policeCoverage: 'High (Kotwali 600m away)',
  },
  {
    rank: 3,
    name: 'MG Road, Bengaluru',
    score: 78,
    trend: 'up',
    state: 'Karnataka',
    lat: 12.9752,
    lng: 77.6065,
    atmDensity: 'Very High (16 ATMs in 1km)',
    historicalFraud: 'Moderate (21 cases / 30d)',
    activeAlerts: 'Moderate (1 active prediction)',
    policeCoverage: 'High (Cubbon Park PS 900m)',
  },
  {
    rank: 4,
    name: 'Connaught Place, Delhi',
    score: 74,
    trend: 'down',
    state: 'Delhi NCR',
    lat: 28.6315,
    lng: 77.2170,
    atmDensity: 'Very High (19 ATMs in 1km)',
    historicalFraud: 'High (26 cases / 30d)',
    activeAlerts: 'Critical (1 active prediction)',
    policeCoverage: 'Very High (CP PS 400m)',
  },
  {
    rank: 5,
    name: 'Andheri East, Mumbai',
    score: 71,
    trend: 'up',
    state: 'Maharashtra',
    lat: 19.1158,
    lng: 72.8687,
    atmDensity: 'High (18 ATMs in 1km)',
    historicalFraud: 'High (24 cases / 30d)',
    activeAlerts: 'Moderate (1 active prediction)',
    policeCoverage: 'Moderate (Andheri PS 1.2km)',
  },
  {
    rank: 6,
    name: 'Sector 17, Chandigarh',
    score: 65,
    trend: 'down',
    state: 'Chandigarh UT',
    lat: 30.7398,
    lng: 76.7827,
    atmDensity: 'Moderate (8 ATMs in 1km)',
    historicalFraud: 'Moderate (14 cases / 30d)',
    activeAlerts: 'Low (0 active predictions)',
    policeCoverage: 'High (Sector 17 PS 350m)',
  },
  {
    rank: 7,
    name: 'MG Road, Pune',
    score: 61,
    trend: 'down',
    state: 'Maharashtra',
    lat: 18.5167,
    lng: 73.8767,
    atmDensity: 'Moderate (9 ATMs in 1km)',
    historicalFraud: 'Moderate (16 cases / 30d)',
    activeAlerts: 'Low (0 active predictions)',
    policeCoverage: 'High (Cantonment PS 700m)',
  },
  {
    rank: 8,
    name: 'Ballygunge, Kolkata',
    score: 58,
    trend: 'up',
    state: 'West Bengal',
    lat: 22.5280,
    lng: 88.3655,
    atmDensity: 'Moderate (7 ATMs in 1km)',
    historicalFraud: 'Moderate (12 cases / 30d)',
    activeAlerts: 'Low (0 active predictions)',
    policeCoverage: 'Moderate (Ballygunge PS 1.1km)',
  },
  {
    rank: 9,
    name: 'Anna Nagar, Chennai',
    score: 54,
    trend: 'down',
    state: 'Tamil Nadu',
    lat: 13.0850,
    lng: 80.2100,
    atmDensity: 'High (12 ATMs in 1km)',
    historicalFraud: 'Low (9 cases / 30d)',
    activeAlerts: 'Low (0 active predictions)',
    policeCoverage: 'High (Anna Nagar PS 500m)',
  },
  {
    rank: 10,
    name: 'Ashok Nagar, Hyderabad',
    score: 51,
    trend: 'up',
    state: 'Telangana',
    lat: 17.4089,
    lng: 78.4907,
    atmDensity: 'Moderate (8 ATMs in 1km)',
    historicalFraud: 'Moderate (11 cases / 30d)',
    activeAlerts: 'Low (0 active predictions)',
    policeCoverage: 'Moderate (Chikkadpally PS 850m)',
  },
];

// REAL-TIME TICKER ITEMS (VERBATIM USER REQUIREMENTS)
export const TICKER_ITEMS = [
  "⚡ LIVE: 8,247 complaints received today",
  "🔴 NEW ALERT: High risk withdrawal predicted at Indore Railway Station ATM cluster",
  "✅ RESOLVED: Case CY-44102 - Funds recovered ₹2.1L at Ahmedabad",
  "📊 TREND: KYC fraud up 18% this week in Maharashtra",
  "🏦 BANK ALERT: SBI reports unusual bulk withdrawals in Mewat district",
  "⚡ LIVE: 14 active surveillance operations across 6 states",
  "🛡️ I4C NATIONAL GRID: 28 State Cyber Cells synchronized in real-time",
];

// 28 STATES & 8 UTS
export const INDIAN_STATES_AND_UTS = [
  'All India',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi NCR', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
