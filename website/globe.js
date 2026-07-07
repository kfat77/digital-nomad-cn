/**
 * ============================================================================
 * DigitalGlobe — Premium 3D Interactive Particle Earth
 * ============================================================================
 * GitHub-Style Globe with Custom Shaders
 * Features:
 *   • ~4,000 instanced particle dots with breathing animation
 *   • Fresnel atmospheric glow (custom vertex/fragment shaders)
 *   • Animated arc connections with flowing light pulses
 *   • Starfield background with twinkling
 *   • Raycast hover/click interaction with HTML tooltips
 *   • Inertial orbit controls with auto-rotation
 *   • Mobile-optimized vertex counts
 *
 * Dependencies: THREE.js (global namespace)
 * ============================================================================
 */

(function (global) {
  'use strict';

  /* ========================================================================
     1. CONFIGURATION
     ======================================================================== */

  const isMobile = window.innerWidth < 768;

  const CONFIG = {
    radius: 100,
    dotCount: isMobile ? 1800 : 4000,
    starCount: isMobile ? 600 : 1800,
    arcSegments: isMobile ? 60 : 120,
    colors: {
      ocean: 0xE8ECF2,
      oceanEmissive: 0xF5F7FA,
      dotBase: new THREE.Color(0x002F6C),
      dotHover: new THREE.Color(0xFE0000),
      atmosphereInner: new THREE.Color(0xE6EEF8),
      atmosphereOuter: new THREE.Color(0x002F6C),
      arc: new THREE.Color(0x002F6C),
      star: new THREE.Color(0x8899AA)
    }
  };

  /* ========================================================================
     2. CITY DATABASE (lat, lng → 3D positions on sphere)
     ======================================================================== */

  const CITIES = [
    // === Asia ===
    { name: 'Singapore',       lat: 1.3521,  lng: 103.8198, size: 1.6, country: 'Singapore' },
    { name: 'Bangkok',         lat: 13.7563, lng: 100.5018, size: 1.3, country: 'Thailand' },
    { name: 'Tokyo',           lat: 35.6762, lng: 139.6503, size: 1.8, country: 'Japan' },
    { name: 'Seoul',           lat: 37.5665, lng: 126.9780, size: 1.4, country: 'South Korea' },
    { name: 'Taipei',          lat: 25.0330, lng: 121.5654, size: 1.3, country: 'Taiwan' },
    { name: 'Hong Kong',       lat: 22.3193, lng: 114.1694, size: 1.5, country: 'Hong Kong' },
    { name: 'Kuala Lumpur',    lat: 3.1390,  lng: 101.6869, size: 1.3, country: 'Malaysia' },
    { name: 'Jakarta',         lat: -6.2088, lng: 106.8456, size: 1.4, country: 'Indonesia' },
    { name: 'Manila',          lat: 14.5995, lng: 120.9842, size: 1.2, country: 'Philippines' },
    { name: 'Hanoi',           lat: 21.0278, lng: 105.8342, size: 1.0, country: 'Vietnam' },
    { name: 'Ho Chi Minh City',lat: 10.8231, lng: 106.6297, size: 1.2, country: 'Vietnam' },
    { name: 'Phnom Penh',      lat: 11.5564, lng: 104.9282, size: 0.9, country: 'Cambodia' },
    { name: 'Bali',            lat: -8.3405, lng: 115.0920, size: 1.0, country: 'Indonesia' },
    { name: 'Chiang Mai',      lat: 18.7883, lng: 98.9853,  size: 1.1, country: 'Thailand' },
    { name: 'Dubai',           lat: 25.2048, lng: 55.2708,  size: 1.4, country: 'United Arab Emirates' },
    { name: 'Istanbul',        lat: 41.0082, lng: 28.9784,  size: 1.5, country: 'Turkey' },
    { name: 'Mumbai',          lat: 19.0760, lng: 72.8777,  size: 1.5, country: 'India' },
    { name: 'Delhi',           lat: 28.6139, lng: 77.2090,  size: 1.4, country: 'India' },
    { name: 'Bangalore',       lat: 12.9716, lng: 77.5946,  size: 1.3, country: 'India' },
    { name: 'Shanghai',        lat: 31.2304, lng: 121.4737, size: 1.7, country: 'China' },
    { name: 'Beijing',         lat: 39.9042, lng: 116.4074, size: 1.6, country: 'China' },
    { name: 'Shenzhen',        lat: 22.5431, lng: 114.0579, size: 1.4, country: 'China' },
    { name: 'Chengdu',         lat: 30.5728, lng: 104.0668, size: 1.2, country: 'China' },
    { name: 'Hangzhou',        lat: 30.2741, lng: 120.1551, size: 1.2, country: 'China' },
    { name: 'Osaka',           lat: 34.6937, lng: 135.5023, size: 1.3, country: 'Japan' },
    { name: 'Kyoto',           lat: 35.0116, lng: 135.7681, size: 1.1, country: 'Japan' },
    { name: 'Busan',           lat: 35.1796, lng: 129.0756, size: 1.1, country: 'South Korea' },
    { name: 'Kaohsiung',       lat: 22.6273, lng: 120.3014, size: 1.0, country: 'Taiwan' },
    { name: 'Penang',          lat: 5.4141,  lng: 100.3288, size: 0.9, country: 'Malaysia' },
    { name: 'Yogyakarta',      lat: -7.7971, lng: 110.3688, size: 0.9, country: 'Indonesia' },
    { name: 'Cebu',            lat: 10.3157, lng: 123.8854, size: 0.9, country: 'Philippines' },
    { name: 'Da Nang',         lat: 16.0544, lng: 108.2022, size: 0.9, country: 'Vietnam' },
    { name: 'Tel Aviv',        lat: 32.0853, lng: 34.7818,  size: 1.2, country: 'Israel' },
    { name: 'Doha',            lat: 25.2854, lng: 51.5310,  size: 1.1, country: 'Qatar' },
    { name: 'Tbilisi',         lat: 41.7151, lng: 44.8271,  size: 1.0, country: 'Georgia' },
    { name: 'Astana',          lat: 51.1605, lng: 71.4704,  size: 0.9, country: 'Kazakhstan' },
    { name: 'Colombo',         lat: 6.9271,  lng: 79.8612,  size: 1.0, country: 'Sri Lanka' },
    { name: 'Kathmandu',       lat: 27.7172, lng: 85.3240,  size: 0.9, country: 'Nepal' },

    // === Europe ===
    { name: 'Lisbon',          lat: 38.7223, lng: -9.1393,  size: 1.3, country: 'Portugal' },
    { name: 'Barcelona',       lat: 41.3851, lng: 2.1734,   size: 1.3, country: 'Spain' },
    { name: 'Madrid',          lat: 40.4168, lng: -3.7038,  size: 1.3, country: 'Spain' },
    { name: 'Paris',           lat: 48.8566, lng: 2.3522,   size: 1.5, country: 'France' },
    { name: 'Berlin',          lat: 52.5200, lng: 13.4050,  size: 1.4, country: 'Germany' },
    { name: 'Amsterdam',       lat: 52.3676, lng: 4.9041,   size: 1.3, country: 'Netherlands' },
    { name: 'London',          lat: 51.5074, lng: -0.1278,  size: 1.6, country: 'United Kingdom' },
    { name: 'Dublin',          lat: 53.3498, lng: -6.2603,  size: 1.1, country: 'Ireland' },
    { name: 'Prague',          lat: 50.0755, lng: 14.4378,  size: 1.1, country: 'Czech Republic' },
    { name: 'Vienna',          lat: 48.2082, lng: 16.3738,  size: 1.2, country: 'Austria' },
    { name: 'Budapest',        lat: 47.4979, lng: 19.0402,  size: 1.1, country: 'Hungary' },
    { name: 'Warsaw',          lat: 52.2297, lng: 21.0122,  size: 1.2, country: 'Poland' },
    { name: 'Rome',            lat: 41.9028, lng: 12.4964,  size: 1.3, country: 'Italy' },
    { name: 'Milan',           lat: 45.4642, lng: 9.1900,   size: 1.2, country: 'Italy' },
    { name: 'Zurich',          lat: 47.3769, lng: 8.5417,   size: 1.1, country: 'Switzerland' },
    { name: 'Copenhagen',      lat: 55.6761, lng: 12.5683,  size: 1.1, country: 'Denmark' },
    { name: 'Stockholm',       lat: 59.3293, lng: 18.0686,  size: 1.1, country: 'Sweden' },
    { name: 'Helsinki',        lat: 60.1699, lng: 24.9384,  size: 1.0, country: 'Finland' },
    { name: 'Oslo',            lat: 59.9139, lng: 10.7522,  size: 1.0, country: 'Norway' },
    { name: 'Reykjavik',       lat: 64.1466, lng: -21.9426, size: 0.9, country: 'Iceland' },
    { name: 'Athens',          lat: 37.9838, lng: 23.7275,  size: 1.1, country: 'Greece' },
    { name: 'Tallinn',         lat: 59.4370, lng: 24.7536,  size: 1.0, country: 'Estonia' },
    { name: 'Riga',            lat: 56.9496, lng: 24.1052,  size: 0.9, country: 'Latvia' },
    { name: 'Vilnius',         lat: 54.6872, lng: 25.2797,  size: 0.9, country: 'Lithuania' },
    { name: 'Brussels',        lat: 50.8503, lng: 4.3517,   size: 1.2, country: 'Belgium' },
    { name: 'Edinburgh',       lat: 55.9533, lng: -3.1883,  size: 1.0, country: 'United Kingdom' },
    { name: 'Lyon',            lat: 45.7640, lng: 4.8357,   size: 1.0, country: 'France' },
    { name: 'Munich',          lat: 48.1351, lng: 11.5820,  size: 1.2, country: 'Germany' },
    { name: 'Hamburg',         lat: 53.5511, lng: 9.9937,   size: 1.1, country: 'Germany' },
    { name: 'Lisbon',          lat: 38.7223, lng: -9.1393,  size: 1.2, country: 'Portugal' },
    { name: 'Porto',           lat: 41.1579, lng: -8.6291,  size: 1.0, country: 'Portugal' },
    { name: 'Valencia',        lat: 39.4699, lng: -0.3763,  size: 1.0, country: 'Spain' },
    { name: 'Seville',         lat: 37.3891, lng: -5.9845,  size: 1.0, country: 'Spain' },
    { name: 'Florence',        lat: 43.7696, lng: 11.2558,  size: 1.0, country: 'Italy' },
    { name: 'Naples',          lat: 40.8518, lng: 14.2681,  size: 1.0, country: 'Italy' },
    { name: 'Krakow',          lat: 50.0647, lng: 19.9450,  size: 0.9, country: 'Poland' },
    { name: 'Belgrade',        lat: 44.7866, lng: 20.4489,  size: 0.9, country: 'Serbia' },
    { name: 'Sofia',           lat: 42.6977, lng: 23.3219,  size: 0.9, country: 'Bulgaria' },
    { name: 'Bucharest',       lat: 44.4268, lng: 26.1025,  size: 0.9, country: 'Romania' },
    { name: 'Zagreb',          lat: 45.8150, lng: 15.9819,  size: 0.9, country: 'Croatia' },
    { name: 'Ljubljana',       lat: 46.0569, lng: 14.5058,  size: 0.8, country: 'Slovenia' },
    { name: 'Bratislava',      lat: 48.1486, lng: 17.1077,  size: 0.8, country: 'Slovakia' },
    { name: 'Nicosia',         lat: 35.1856, lng: 33.3823,  size: 0.9, country: 'Cyprus' },

    // === Americas ===
    { name: 'Mexico City',     lat: 19.4326, lng: -99.1332, size: 1.4, country: 'Mexico' },
    { name: 'New York',        lat: 40.7128, lng: -74.0060, size: 1.7, country: 'United States of America' },
    { name: 'San Francisco',   lat: 37.7749, lng: -122.4194,size: 1.4, country: 'United States of America' },
    { name: 'Los Angeles',     lat: 34.0522, lng: -118.2437,size: 1.5, country: 'United States of America' },
    { name: 'Miami',           lat: 25.7617, lng: -80.1918, size: 1.2, country: 'United States of America' },
    { name: 'Chicago',         lat: 41.8781, lng: -87.6298, size: 1.3, country: 'United States of America' },
    { name: 'Seattle',         lat: 47.6062, lng: -122.3321,size: 1.2, country: 'United States of America' },
    { name: 'Vancouver',       lat: 49.2827, lng: -123.1207,size: 1.1, country: 'Canada' },
    { name: 'Toronto',         lat: 43.6532, lng: -79.3832, size: 1.3, country: 'Canada' },
    { name: 'Montreal',        lat: 45.5017, lng: -73.5673, size: 1.1, country: 'Canada' },
    { name: 'Buenos Aires',    lat: -34.6037,lng: -58.3816, size: 1.2, country: 'Argentina' },
    { name: 'São Paulo',       lat: -23.5505,lng: -46.6333, size: 1.4, country: 'Brazil' },
    { name: 'Rio de Janeiro',  lat: -22.9068,lng: -43.1729, size: 1.2, country: 'Brazil' },
    { name: 'Bogotá',          lat: 4.7110,  lng: -74.0721, size: 1.1, country: 'Colombia' },
    { name: 'Lima',            lat: -12.0464,lng: -77.0428, size: 1.1, country: 'Peru' },
    { name: 'Santiago',        lat: -33.4489,lng: -70.6693, size: 1.1, country: 'Chile' },
    { name: 'Medellín',        lat: 6.2476,  lng: -75.5658, size: 1.0, country: 'Colombia' },
    { name: 'Guadalajara',     lat: 20.6597, lng: -103.3496,size: 1.0, country: 'Mexico' },
    { name: 'Austin',          lat: 30.2672, lng: -97.7431, size: 1.1, country: 'United States of America' },
    { name: 'Boston',          lat: 42.3601, lng: -71.0589, size: 1.1, country: 'United States of America' },
    { name: 'Denver',          lat: 39.7392, lng: -104.9903,size: 1.0, country: 'United States of America' },

    // === Oceania ===
    { name: 'Sydney',          lat: -33.8688,lng: 151.2093, size: 1.3, country: 'Australia' },
    { name: 'Melbourne',       lat: -37.8136,lng: 144.9631, size: 1.2, country: 'Australia' },
    { name: 'Brisbane',        lat: -27.4698,lng: 153.0251, size: 1.0, country: 'Australia' },
    { name: 'Perth',           lat: -31.9505,lng: 115.8605, size: 1.0, country: 'Australia' },
    { name: 'Auckland',        lat: -36.8485,lng: 174.7633, size: 1.0, country: 'New Zealand' },
    { name: 'Wellington',      lat: -41.2865,lng: 174.7762, size: 0.9, country: 'New Zealand' },

    // === Africa & Middle East ===
    { name: 'Cape Town',       lat: -33.9249,lng: 18.4241,  size: 1.1, country: 'South Africa' },
    { name: 'Johannesburg',    lat: -26.2041,lng: 28.0473,  size: 1.2, country: 'South Africa' },
    { name: 'Cairo',           lat: 30.0444, lng: 31.2357,  size: 1.3, country: 'Egypt' },
    { name: 'Nairobi',         lat: -1.2921, lng: 36.8219,  size: 1.0, country: 'Kenya' },
    { name: 'Casablanca',      lat: 33.5731, lng: -7.5898,  size: 1.0, country: 'Morocco' },
    { name: 'Marrakech',       lat: 31.6295, lng: -7.9811,  size: 0.9, country: 'Morocco' },
    { name: 'Lagos',           lat: 6.5244,  lng: 3.3792,   size: 1.1, country: 'Nigeria' },
    { name: 'Accra',           lat: 5.6037,  lng: -0.1870,  size: 0.9, country: 'Ghana' },
    { name: 'Riyadh',          lat: 24.7136, lng: 46.6753,  size: 1.1, country: 'Saudi Arabia' },
    { name: 'Amman',           lat: 31.9454, lng: 35.9284,  size: 0.9, country: 'Jordan' },
    { name: 'Kuwait City',     lat: 29.3759, lng: 47.9774,  size: 0.9, country: 'Kuwait' },
    { name: 'Muscat',          lat: 23.5859, lng: 58.4059,  size: 0.9, country: 'Oman' }
  ];

  /* ========================================================================
     3. ARC CONNECTIONS (Digital Nomad Hub Routes)
     ======================================================================== */

  const ARCS = [
    { from: 'Singapore',     to: 'Tokyo' },
    { from: 'Singapore',     to: 'Bangkok' },
    { from: 'Singapore',     to: 'Dubai' },
    { from: 'Singapore',     to: 'Sydney' },
    { from: 'Singapore',     to: 'London' },
    { from: 'Singapore',     to: 'San Francisco' },
    { from: 'London',        to: 'New York' },
    { from: 'London',        to: 'Lisbon' },
    { from: 'London',        to: 'Berlin' },
    { from: 'London',        to: 'Dubai' },
    { from: 'New York',      to: 'San Francisco' },
    { from: 'New York',      to: 'Mexico City' },
    { from: 'New York',      to: 'São Paulo' },
    { from: 'New York',      to: 'London' },
    { from: 'San Francisco', to: 'Tokyo' },
    { from: 'San Francisco', to: 'Singapore' },
    { from: 'San Francisco', to: 'Sydney' },
    { from: 'Tokyo',         to: 'Seoul' },
    { from: 'Tokyo',         to: 'Sydney' },
    { from: 'Dubai',         to: 'Istanbul' },
    { from: 'Dubai',         to: 'London' },
    { from: 'Dubai',         to: 'Singapore' },
    { from: 'Barcelona',     to: 'Lisbon' },
    { from: 'Barcelona',     to: 'Paris' },
    { from: 'Paris',         to: 'Berlin' },
    { from: 'Berlin',        to: 'Warsaw' },
    { from: 'Berlin',        to: 'London' },
    { from: 'Lisbon',        to: 'New York' },
    { from: 'Bangkok',       to: 'Hong Kong' },
    { from: 'Hong Kong',     to: 'Shanghai' },
    { from: 'Shanghai',      to: 'Tokyo' },
    { from: 'Shanghai',      to: 'Singapore' },
    { from: 'Seoul',         to: 'Shanghai' },
    { from: 'Sydney',        to: 'Melbourne' },
    { from: 'Cape Town',     to: 'Dubai' },
    { from: 'Cairo',         to: 'Istanbul' }
  ];

  /* ========================================================================
     4. COUNTRY ROUTE MAPPING (for click navigation)
     ======================================================================== */

  const COUNTRY_ROUTES = {
    'Thailand': 'country/thailand/index.html',
    'Japan': 'country/japan/index.html',
    'Singapore': 'country/singapore/index.html',
    'Indonesia': 'country/indonesia/index.html',
    'Vietnam': 'country/vietnam/index.html',
    'Malaysia': 'country/malaysia/index.html',
    'Philippines': 'country/philippines/index.html',
    'South Korea': 'country/southkorea/index.html',
    'Georgia': 'country/georgia/index.html',
    'Kazakhstan': 'country/kazakhstan/index.html',
    'Nepal': 'country/nepal/index.html',
    'Sri Lanka': 'country/srilanka/index.html',
    'Mongolia': 'country/mongolia/index.html',
    'Portugal': 'country/portugal/index.html',
    'Spain': 'country/spain/index.html',
    'Germany': 'country/germany/index.html',
    'France': 'country/france/index.html',
    'Netherlands': 'country/netherlands/index.html',
    'United Kingdom': 'country/uk/index.html',
    'Switzerland': 'country/switzerland/index.html',
    'Austria': 'country/austria/index.html',
    'Greece': 'country/greece/index.html',
    'Croatia': 'country/croatia/index.html',
    'Estonia': 'country/estonia/index.html',
    'Cyprus': 'country/cyprus/index.html',
    'Iceland': 'country/iceland/index.html',
    'Norway': 'country/norway/index.html',
    'Denmark': 'country/denmark/index.html',
    'Ireland': 'country/ireland/index.html',
    'Turkey': 'country/turkey/index.html',
    'United Arab Emirates': 'country/uae/index.html',
    'Qatar': 'country/qatar/index.html',
    'Morocco': 'country/morocco/index.html',
    'United States of America': 'country/usa/index.html',
    'Canada': 'country/canada/index.html',
    'Mexico': 'country/mexico/index.html',
    'Brazil': 'country/brazil/index.html',
    'Chile': 'country/chile/index.html',
    'Argentina': 'country/argentina/index.html',
    'Australia': 'country/australia/index.html',
    'New Zealand': 'country/newzealand/index.html',
    'Hong Kong': 'country/hongkong/index.html',
    'India': 'country/india/index.html',
    'Russia': 'country/russia/index.html',
    'Poland': 'country/poland/index.html',
    'Czech Republic': 'country/czech/index.html',
    'Hungary': 'country/hungary/index.html',
    'Italy': 'country/italy/index.html',
    'Sweden': 'country/sweden/index.html',
    'Finland': 'country/finland/index.html',
    'Belgium': 'country/belgium/index.html',
    'Ukraine': 'country/ukraine/index.html',
    'Romania': 'country/romania/index.html',
    'Bulgaria': 'country/bulgaria/index.html',
    'Serbia': 'country/serbia/index.html',
    'Slovenia': 'country/slovenia/index.html',
    'Slovakia': 'country/slovakia/index.html',
    'Lithuania': 'country/lithuania/index.html',
    'Latvia': 'country/latvia/index.html',
    'Belarus': 'country/belarus/index.html',
    'Moldova': 'country/moldova/index.html',
    'Bosnia and Herzegovina': 'country/bosnia/index.html',
    'North Macedonia': 'country/macedonia/index.html',
    'Albania': 'country/albania/index.html',
    'Montenegro': 'country/montenegro/index.html',
    'Egypt': 'country/egypt/index.html',
    'South Africa': 'country/southafrica/index.html',
    'Kenya': 'country/kenya/index.html',
    'Nigeria': 'country/nigeria/index.html',
    'Ghana': 'country/ghana/index.html',
    'Israel': 'country/israel/index.html',
    'Jordan': 'country/jordan/index.html',
    'Saudi Arabia': 'country/saudiarabia/index.html',
    'Kuwait': 'country/kuwait/index.html',
    'Bahrain': 'country/bahrain/index.html',
    'Oman': 'country/oman/index.html',
    'Iraq': 'country/iraq/index.html',
    'Iran': 'country/iran/index.html',
    'Syria': 'country/syria/index.html',
    'Yemen': 'country/yemen/index.html',
    'Afghanistan': 'country/afghanistan/index.html',
    'Uzbekistan': 'country/uzbekistan/index.html',
    'Kyrgyzstan': 'country/kyrgyzstan/index.html',
    'Tajikistan': 'country/tajikistan/index.html',
    'Turkmenistan': 'country/turkmenistan/index.html',
    'Azerbaijan': 'country/azerbaijan/index.html',
    'Armenia': 'country/armenia/index.html',
    'Colombia': 'country/colombia/index.html',
    'Peru': 'country/peru/index.html',
    'Ecuador': 'country/ecuador/index.html',
    'Uruguay': 'country/uruguay/index.html',
    'Paraguay': 'country/paraguay/index.html',
    'Bolivia': 'country/bolivia/index.html',
    'Venezuela': 'country/venezuela/index.html',
    'Guyana': 'country/guyana/index.html',
    'Suriname': 'country/suriname/index.html',
    'Cuba': 'country/cuba/index.html',
    'Jamaica': 'country/jamaica/index.html',
    'Haiti': 'country/haiti/index.html',
    'Dominican Republic': 'country/dominican/index.html',
    'Puerto Rico': 'country/puertorico/index.html',
    'Guatemala': 'country/guatemala/index.html',
    'Belize': 'country/belize/index.html',
    'El Salvador': 'country/elsalvador/index.html',
    'Honduras': 'country/honduras/index.html',
    'Nicaragua': 'country/nicaragua/index.html',
    'Costa Rica': 'country/costarica/index.html',
    'Panama': 'country/panama/index.html',
    'Grenada': 'country/grenada/index.html',
    'Trinidad and Tobago': 'country/trinidad/index.html',
    'Barbados': 'country/barbados/index.html',
    'Saint Lucia': 'country/saintlucia/index.html',
    'Saint Vincent and the Grenadines': 'country/saintvincent/index.html',
    'Dominica': 'country/dominica/index.html',
    'Antigua and Barbuda': 'country/antigua/index.html',
    'Saint Kitts and Nevis': 'country/saintkitts/index.html',
    'Bahamas': 'country/bahamas/index.html',
    'Fiji': 'country/fiji/index.html',
    'Papua New Guinea': 'country/papua/index.html',
    'Solomon Islands': 'country/solomon/index.html',
    'Vanuatu': 'country/vanuatu/index.html',
    'Samoa': 'country/samoa/index.html',
    'Tonga': 'country/tonga/index.html',
    'Kiribati': 'country/kiribati/index.html',
    'Tuvalu': 'country/tuvalu/index.html',
    'Nauru': 'country/nauru/index.html',
    'Palau': 'country/palau/index.html',
    'Marshall Islands': 'country/marshall/index.html',
    'Micronesia': 'country/micronesia/index.html',
    'Guam': 'country/guam/index.html',
    'Northern Mariana Islands': 'country/mariana/index.html',
    'American Samoa': 'country/americansamoa/index.html',
    'Cook Islands': 'country/cook/index.html',
    'Niue': 'country/niue/index.html',
    'Tokelau': 'country/tokelau/index.html',
    'Pitcairn Islands': 'country/pitcairn/index.html',
    'Wallis and Futuna': 'country/wallis/index.html',
    'French Polynesia': 'country/frenchpolynesia/index.html',
    'New Caledonia': 'country/newcaledonia/index.html',
    'Norfolk Island': 'country/norfolk/index.html',
    'Christmas Island': 'country/christmas/index.html',
    'Cocos (Keeling) Islands': 'country/cocos/index.html',
    'Heard Island and McDonald Islands': 'country/heard/index.html',
    'Antarctica': 'country/antarctica/index.html',
    'Greenland': 'country/greenland/index.html',
    'Faroe Islands': 'country/faroe/index.html',
    'Svalbard': 'country/svalbard/index.html',
    'Jan Mayen': 'country/janmayen/index.html',
    'Bouvet Island': 'country/bouvet/index.html',
    'South Georgia and the South Sandwich Islands': 'country/southgeorgia/index.html'
  };

  /* ========================================================================
     5. UTILITY FUNCTIONS
     ======================================================================== */

  function latLngToVector3(lat, lng, radius) {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
       (radius * Math.cos(phi)),
       (radius * Math.sin(phi) * Math.sin(theta))
    );
  }

  /* ========================================================================
     6. CUSTOM SHADERS
     ======================================================================== */

  // --- Dot / Particle Shader ---
  const DOT_VERTEX_SHADER = `
    attribute float aSize;
    attribute float aPhase;
    attribute vec3  aColor;

    varying vec3  vColor;
    varying float vAlpha;

    uniform float uTime;
    uniform float uPixelRatio;
    uniform vec3  uHoverColor;
    uniform float uHoverIndex;

    void main() {
      vColor = aColor;

      // Breathing pulse animation
      float breath = sin(uTime * 2.0 + aPhase * 6.28318) * 0.18 + 1.0;

      // Hover highlight
      float isHovered = step(abs(float(gl_VertexID) - uHoverIndex) - 0.5, 0.0);
      vColor = mix(vColor, uHoverColor, isHovered);

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Size with distance attenuation
      float pointSize = aSize * breath * uPixelRatio * 7.0;
      pointSize *= (300.0 / -mvPosition.z);
      pointSize *= (1.0 + isHovered * 2.5);
      gl_PointSize = max(pointSize, 2.0);

      vAlpha = 0.65 + breath * 0.25 + isHovered * 0.35;
    }
  `;

  const DOT_FRAGMENT_SHADER = `
    varying vec3  vColor;
    varying float vAlpha;

    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist  = length(center);
      if (dist > 0.5) discard;

      // Soft radial falloff
      float glow = 1.0 - smoothstep(0.0, 0.5, dist);

      // Bright core
      float core = 1.0 - smoothstep(0.0, 0.15, dist);

      // Light theme: darker, more opaque dots
      vec3 finalColor = vColor * (0.8 + core * 1.2);
      float finalAlpha = vAlpha * glow * 1.0;

      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  // --- Atmosphere Fresnel Shader ---
  const ATMOSPHERE_VERTEX_SHADER = `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal   = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const ATMOSPHERE_FRAGMENT_SHADER = `
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform vec3 uColorInner;
    uniform vec3 uColorOuter;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

      vec3 color = mix(uColorInner, uColorOuter, fresnel);
      // Light theme: very subtle atmosphere
      float alpha = fresnel * 0.25;

      gl_FragColor = vec4(color, alpha);
    }
  `;

  // --- Arc / Flyline Shader ---
  const ARC_VERTEX_SHADER = `
    attribute float aProgress;
    varying   float vProgress;

    void main() {
      vProgress = aProgress;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const ARC_FRAGMENT_SHADER = `
    varying float vProgress;

    uniform float uTime;
    uniform vec3  uColor;

    void main() {
      // Animated flowing light pulse
      float speed = 0.35;
      float flow = fract(vProgress - uTime * speed);
      float intensity = smoothstep(0.0, 0.04, flow) * smoothstep(0.12, 0.04, flow);

      // Fade at both ends
      float endFade = smoothstep(0.0, 0.03, vProgress) * smoothstep(1.0, 0.97, vProgress);

      vec3 finalColor = uColor * (1.0 + intensity * 0.5);
      float alpha = intensity * endFade * 0.7;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  // --- Starfield Shader ---
  const STAR_VERTEX_SHADER = `
    attribute float aSize;
    attribute float aPhase;

    varying float vAlpha;

    uniform float uTime;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Twinkle animation
      float twinkle = sin(uTime * 0.4 + aPhase * 6.28318) * 0.25 + 0.75;
      vAlpha = twinkle;

      gl_PointSize = aSize * twinkle;
    }
  `;

  const STAR_FRAGMENT_SHADER = `
    varying float vAlpha;

    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist  = length(center);
      if (dist > 0.5) discard;

      float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha;
      // Light theme: dark gray stars visible on white
      gl_FragColor = vec4(0.45, 0.50, 0.58, alpha * 0.6);
    }
  `;

  /* ========================================================================
     7. DIGITAL GLOBE CLASS
     ======================================================================== */

  class DigitalGlobe {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        console.error('DigitalGlobe: container not found:', containerId);
        return;
      }

      this.width  = this.container.clientWidth;
      this.height = this.container.clientHeight;

      // Core Three.js objects
      this.scene     = null;
      this.camera    = null;
      this.renderer  = null;
      this.raycaster = new THREE.Raycaster();
      this.mouse     = new THREE.Vector2(-9999, -9999);
      this.clock     = new THREE.Clock();

      // Scene objects
      this.globeGroup   = null;
      this.dots         = null;
      this.stars        = null;
      this.atmosphere   = null;
      this.arcs         = [];
      this.oceanSphere  = null;

      // Interaction state
      this.hoveredIndex = -1;
      this.isDragging   = false;
      this.autoRotate   = true;
      this.rotationY    = 0;
      this.targetRotationY = 0;
      this.rotationVelocity = 0;

      // Tooltip
      this.tooltip = null;

      this.init();
    }

    /* ------------------------------------------------------------------ */
    init() {
      this.setupRenderer();
      this.setupScene();
      this.setupCamera();
      this.setupLights();
      this.createTooltip();
      this.createStars();
      this.createGlobeBase(); this.oceanSphere.visible = false;
      this.createDots();
      this.createArcs();
      this.createAtmosphere();
      this.setupEvents();
      this.animate();
    }

    /* ------------------------------------------------------------------ */
    setupRenderer() {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setClearColor(0x000000, 0);
      this.container.appendChild(this.renderer.domElement);
      this.renderer.domElement.style.display = 'block';
      this.renderer.domElement.style.width   = '100%';
      this.renderer.domElement.style.height  = '100%';
    }

    /* ------------------------------------------------------------------ */
    setupScene() {
      this.scene = new THREE.Scene();
      this.globeGroup = new THREE.Group();
      this.scene.add(this.globeGroup);
    }

    /* ------------------------------------------------------------------ */
    setupCamera() {
      const aspect = this.width / this.height;
      this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 2000);
      // Position camera to see the globe at a nice angle
      this.camera.position.set(0, 40, 280);
      this.camera.lookAt(0, 0, 0);
    }

    /* ------------------------------------------------------------------ */
    setupLights() {
      // Ambient: dark blue/purple base — eliminates dead black
      const ambient = new THREE.AmbientLight(0x1a1a4a, 1.8);
      this.scene.add(ambient);

      // Directional: cool white from top-left — creates terminator line
      const mainLight = new THREE.DirectionalLight(0xc8e0ff, 2.5);
      mainLight.position.set(-120, 100, 80);
      this.scene.add(mainLight);

      // Fill light: soft blue from opposite side
      const fillLight = new THREE.DirectionalLight(0x2244aa, 0.6);
      fillLight.position.set(100, -40, -80);
      this.scene.add(fillLight);

      // Subtle point light for rim glow
      const rimLight = new THREE.PointLight(0x00aaff, 1.0, 400);
      rimLight.position.set(0, 0, 180);
      this.scene.add(rimLight);
    }

    /* ------------------------------------------------------------------ */
    createTooltip() {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'globe-city-tooltip';
      this.tooltip.style.cssText = `
        position:absolute;
        top:0;left:0;
        background:#FFFFFF;
        color:#002F6C;
        padding:10px 16px;
        border-radius:8px;
        font-size:13px;
        font-weight:600;
        font-family:'Inter','Noto Sans SC',sans-serif;
        pointer-events:none;
        opacity:0;
        transition:opacity 0.2s ease;
        border:1px solid rgba(0,47,108,0.12);
        box-shadow:0 4px 20px rgba(0,0,0,0.12);
        z-index:1000;
        white-space:nowrap;
        transform:translate(-50%,-130%);
      `;
      this.container.appendChild(this.tooltip);
    }

    /* ------------------------------------------------------------------ */
    createStars() {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(CONFIG.starCount * 3);
      const sizes     = new Float32Array(CONFIG.starCount);
      const phases    = new Float32Array(CONFIG.starCount);

      const spread = 600;
      for (let i = 0; i < CONFIG.starCount; i++) {
        const i3 = i * 3;
        positions[i3]     = (Math.random() - 0.5) * spread * 2;
        positions[i3 + 1] = (Math.random() - 0.5) * spread * 2;
        positions[i3 + 2] = (Math.random() - 0.5) * spread * 2;
        sizes[i]  = 0.5 + Math.random() * 2.0;
        phases[i] = Math.random();
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 }
        },
        vertexShader:   STAR_VERTEX_SHADER,
        fragmentShader: STAR_FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false
      });

      this.stars = new THREE.Points(geometry, material);
      this.scene.add(this.stars);
    }

    /* ------------------------------------------------------------------ */
    createGlobeBase() {
      // Dark ocean sphere — NOT pure black
      const geometry = new THREE.SphereGeometry(CONFIG.radius - 0.5, 64, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0xE8ECF2,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      this.oceanSphere = new THREE.Mesh(geometry, material);
      this.globeGroup.add(this.oceanSphere);
    }

    /* ------------------------------------------------------------------ */
    createDots() {
      // Build dot data: cities + procedural clusters around them
      const dotData = [];

      CITIES.forEach(city => {
        const pos = latLngToVector3(city.lat, city.lng, CONFIG.radius);

        // Main city dot
        dotData.push({
          position: pos,
          size: city.size,
          color: CONFIG.colors.dotBase.clone(),
          phase: Math.random(),
          country: city.country,
          cityName: city.name
        });

        // Cluster dots around city to simulate land mass
        const clusterCount = Math.floor(city.size * 5) + 3;
        const spread = city.size * 2.5;

        for (let i = 0; i < clusterCount; i++) {
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
          );
          const clusterPos = pos.clone().add(offset).normalize().multiplyScalar(CONFIG.radius);

          // Slight color variation
          const hueShift = (Math.random() - 0.5) * 0.08;
          const color = CONFIG.colors.dotBase.clone();
          color.offsetHSL(hueShift, 0, 0);

          dotData.push({
            position: clusterPos,
            size: 0.6 + Math.random() * 1.2,
            color: color,
            phase: Math.random(),
            country: city.country,
            cityName: null  // cluster dots don't show tooltips
          });
        }
      });

      // Fill remaining budget with random decorative dots
      while (dotData.length < CONFIG.dotCount) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const pos = new THREE.Vector3(
          CONFIG.radius * Math.sin(phi) * Math.cos(theta),
          CONFIG.radius * Math.cos(phi),
          CONFIG.radius * Math.sin(phi) * Math.sin(theta)
        );

        dotData.push({
          position: pos,
          size: 0.4 + Math.random() * 0.8,
          color: CONFIG.colors.dotBase.clone().multiplyScalar(0.5 + Math.random() * 0.5),
          phase: Math.random(),
          country: null,
          cityName: null
        });
      }

      // Build BufferGeometry
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(dotData.length * 3);
      const colors    = new Float32Array(dotData.length * 3);
      const sizes     = new Float32Array(dotData.length);
      const phases    = new Float32Array(dotData.length);

      this.dotData = dotData; // Keep for raycasting lookup

      for (let i = 0; i < dotData.length; i++) {
        const d = dotData[i];
        const i3 = i * 3;
        positions[i3]     = d.position.x;
        positions[i3 + 1] = d.position.y;
        positions[i3 + 2] = d.position.z;
        colors[i3]     = d.color.r;
        colors[i3 + 1] = d.color.g;
        colors[i3 + 2] = d.color.b;
        sizes[i]  = d.size;
        phases[i] = d.phase;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime:       { value: 0 },
          uPixelRatio: { value: this.renderer.getPixelRatio() },
          uHoverColor: { value: CONFIG.colors.dotHover },
          uHoverIndex: { value: -1.0 }
        },
        vertexShader:   DOT_VERTEX_SHADER,
        fragmentShader: DOT_FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false
      });

      this.dots = new THREE.Points(geometry, material);
      this.globeGroup.add(this.dots);
    }

    /* ------------------------------------------------------------------ */
    createArcs() {
      this.arcs = [];

      ARCS.forEach((arcDef, arcIndex) => {
        const fromCity = CITIES.find(c => c.name === arcDef.from);
        const toCity   = CITIES.find(c => c.name === arcDef.to);
        if (!fromCity || !toCity) return;

        const start = latLngToVector3(fromCity.lat, fromCity.lng, CONFIG.radius);
        const end   = latLngToVector3(toCity.lat,   toCity.lng,   CONFIG.radius);

        // Create elevated mid-point for arch
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distRatio = start.distanceTo(end) / (CONFIG.radius * 2);
        const archHeight = 20 + distRatio * 60;
        mid.normalize().multiplyScalar(CONFIG.radius + archHeight);

        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const points = curve.getPoints(CONFIG.arcSegments);

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);
        const progress  = new Float32Array(points.length);

        for (let i = 0; i < points.length; i++) {
          const i3 = i * 3;
          positions[i3]     = points[i].x;
          positions[i3 + 1] = points[i].y;
          positions[i3 + 2] = points[i].z;
          progress[i] = i / (points.length - 1);
        }

        geometry.setAttribute('position',  new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: CONFIG.colors.arc }
          },
          vertexShader:   ARC_VERTEX_SHADER,
          fragmentShader: ARC_FRAGMENT_SHADER,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        // Stagger animation phases per arc
        material.uniforms.uTime.value = arcIndex * 0.7;

        const line = new THREE.Line(geometry, material);
        this.globeGroup.add(line);
        this.arcs.push(line);
      });
    }

    /* ------------------------------------------------------------------ */
    createAtmosphere() {
      const geometry = new THREE.SphereGeometry(CONFIG.radius + 8, 64, 64);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uColorInner: { value: CONFIG.colors.atmosphereInner },
          uColorOuter: { value: CONFIG.colors.atmosphereOuter }
        },
        vertexShader:   ATMOSPHERE_VERTEX_SHADER,
        fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.NormalBlending,
        side: THREE.BackSide,
        depthWrite: false
      });

      this.atmosphere = new THREE.Mesh(geometry, material);
      this.globeGroup.add(this.atmosphere);

      // Second, tighter glow layer for extra bloom
      const glowGeo = new THREE.SphereGeometry(CONFIG.radius + 2, 64, 64);
      const glowMat = new THREE.ShaderMaterial({
        uniforms: {
          uColorInner: { value: new THREE.Color(0xE6EEF8) },
          uColorOuter: { value: new THREE.Color(0x002F6C) }
        },
        vertexShader:   ATMOSPHERE_VERTEX_SHADER,
        fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.NormalBlending,
        side: THREE.BackSide,
        depthWrite: false
      });
      this.globeGroup.add(new THREE.Mesh(glowGeo, glowMat));
    }

    /* ------------------------------------------------------------------ */
    setupEvents() {
      const canvas = this.renderer.domElement;

      // Mouse move (hover detection)
      canvas.addEventListener('mousemove', (e) => {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / this.width)  * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top)  / this.height) * 2 + 1;
      });

      // Mouse down / up (drag detection)
      canvas.addEventListener('mousedown', () => {
        this.isDragging = true;
        this.autoRotate = false;
      });
      canvas.addEventListener('mouseup', () => {
        this.isDragging = false;
        // Resume auto-rotation after a delay
        clearTimeout(this._resumeTimer);
        this._resumeTimer = setTimeout(() => { this.autoRotate = true; }, 3000);
      });

      // Touch events
      canvas.addEventListener('touchstart', (e) => {
        this.isDragging = true;
        this.autoRotate = false;
        const touch = e.touches[0];
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / this.width)  * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top)  / this.height) * 2 + 1;
      }, { passive: true });

      canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / this.width)  * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top)  / this.height) * 2 + 1;
      }, { passive: true });

      canvas.addEventListener('touchend', () => {
        this.isDragging = false;
        clearTimeout(this._resumeTimer);
        this._resumeTimer = setTimeout(() => { this.autoRotate = true; }, 3000);
      });

      // Click to navigate
      canvas.addEventListener('click', (e) => {
        if (this.hoveredIndex >= 0) {
          const dot = this.dotData[this.hoveredIndex];
          if (dot && dot.country) {
            const route = COUNTRY_ROUTES[dot.country];
            if (route) {
              window.location.href = route;
            } else {
              this.showToast(dot.country + '：该国家指南正在撰写中...');
            }
          }
        }
      });

      // Window resize
      window.addEventListener('resize', () => this.onResize());
    }

    /* ------------------------------------------------------------------ */
    onResize() {
      this.width  = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }

    /* ------------------------------------------------------------------ */
    showToast(message) {
      const existing = document.getElementById('globe-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'globe-toast';
      toast.style.cssText = `
        position:fixed;
        bottom:32px;
        left:50%;
        transform:translateX(-50%) translateY(20px);
        background:#FE0000;
        color:#FFFFFF;
        padding:12px 24px;
        border-radius:8px;
        font-size:14px;
        font-weight:700;
        box-shadow:0 4px 20px rgba(254,0,0,0.25);
        z-index:10000;
        opacity:0;
        transition:all 0.3s ease;
        pointer-events:none;
        white-space:nowrap;
        font-family:'Inter','Noto Sans SC',sans-serif;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }

    /* ------------------------------------------------------------------ */
    updateHover() {
      // Raycast against dot points
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Points raycasting returns intersections with the bounding sphere
      const intersections = this.raycaster.intersectObject(this.dots);

      let newIndex = -1;
      if (intersections.length > 0) {
        // Find the closest point index
        const intersection = intersections[0];
        if (intersection.index !== undefined) {
          newIndex = intersection.index;
        }
      }

      if (newIndex !== this.hoveredIndex) {
        this.hoveredIndex = newIndex;
        this.dots.material.uniforms.uHoverIndex.value = this.hoveredIndex;

        // Update tooltip
        if (this.hoveredIndex >= 0) {
          const dot = this.dotData[this.hoveredIndex];
          if (dot && dot.cityName) {
            this.tooltip.innerHTML = `
              <div style="color:#5A6A7A;font-size:12px;margin-bottom:2px;">${dot.country || ''}</div>
              <div style="color:#002F6C;font-size:14px;font-weight:700;">${dot.cityName}</div>
            `;
            this.tooltip.style.opacity = '1';
          } else {
            this.tooltip.style.opacity = '0';
          }
        } else {
          this.tooltip.style.opacity = '0';
        }
      }

      // Position tooltip near mouse
      if (this.hoveredIndex >= 0) {
        const rect = this.container.getBoundingClientRect();
        // Convert NDC mouse to pixel coordinates
        const px = ((this.mouse.x + 1) / 2) * this.width;
        const py = ((-this.mouse.y + 1) / 2) * this.height;
        this.tooltip.style.left = px + 'px';
        this.tooltip.style.top  = py + 'px';
      }
    }

    /* ------------------------------------------------------------------ */
    updateRotation() {
      if (this.autoRotate && !this.isDragging) {
        this.targetRotationY -= 0.0015;
      }

      // Inertial damping
      this.rotationY += (this.targetRotationY - this.rotationY) * 0.05;
      this.globeGroup.rotation.y = this.rotationY;

      // Slow starfield counter-rotation for parallax depth
      if (this.stars) {
        this.stars.rotation.y = this.rotationY * 0.15;
        this.stars.rotation.x = Math.sin(this.clock.getElapsedTime() * 0.02) * 0.05;
      }
    }

    /* ------------------------------------------------------------------ */
    animate() {
      requestAnimationFrame(() => this.animate());

      const elapsed = this.clock.getElapsedTime();

      // Update shader uniforms
      if (this.dots)       this.dots.material.uniforms.uTime.value       = elapsed;
      if (this.stars)      this.stars.material.uniforms.uTime.value      = elapsed;
      if (this.atmosphere) this.atmosphere.material.uniforms.uTime      = elapsed;

      this.arcs.forEach(arc => {
        arc.material.uniforms.uTime.value = elapsed;
      });

      this.updateRotation();
      this.updateHover();
      this.renderer.render(this.scene, this.camera);
    }

    /* ------------------------------------------------------------------ */
    dispose() {
      if (this.renderer) {
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
      }
      if (this.tooltip && this.tooltip.parentNode) {
        this.tooltip.parentNode.removeChild(this.tooltip);
      }
    }
  }

  /* ========================================================================
     8. INITIALIZATION
     ======================================================================== */

  function initWhenReady() {
    if (typeof THREE === 'undefined') {
      setTimeout(initWhenReady, 100);
      return;
    }
    try {
      global.digitalGlobe = new DigitalGlobe('globe-viz');
    } catch (err) {
      console.error('DigitalGlobe initialization failed:', err);
      const container = document.getElementById('globe-viz');
      if (container) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#5A6A7A;font-family:sans-serif;"><p>3D Globe loading...</p></div>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }

})(window);
