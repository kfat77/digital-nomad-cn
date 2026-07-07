/**
 * ============================================================================
 * RealisticGlobe — Clean High-Fidelity Interactive 3D Earth
 * ============================================================================
 * Features:
 *   • Photorealistic Earth texture (external or procedural fallback)
 *   • Sharp solid country border outlines
 *   • Smooth OrbitControls rotation & zoom
 *   • Click-to-navigate country detection
 *   • Transparent background, zero particles, zero glow effects
 *
 * Dependencies: THREE.js (ES module), OrbitControls
 * ============================================================================
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ========================================================================
   1. CONFIGURATION
   ======================================================================== */

const CONFIG = {
  radius: 100,
  autoRotateSpeed: 0.6,
  textureUrls: {
    map: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    bump: 'https://unpkg.com/three-globe/example/img/earth-topology.png'
  },
  colors: {
    border: 0x999999,
    coast: 0xbbbbbb,
    hover: 0xff3333
  }
};

/* ========================================================================
   2. COUNTRY DATA — center points for click detection & navigation
   ======================================================================== */

const COUNTRY_DATA = [
  // === Asia ===
  { name: 'Thailand',       route: 'country/thailand/index.html',       center: [13.7563, 100.5018] },
  { name: 'Japan',          route: 'country/japan/index.html',          center: [35.6762, 139.6503] },
  { name: 'Singapore',      route: 'country/singapore/index.html',      center: [1.3521, 103.8198] },
  { name: 'Indonesia',      route: 'country/indonesia/index.html',      center: [-0.7893, 113.9213] },
  { name: 'Vietnam',        route: 'country/vietnam/index.html',        center: [14.0583, 108.2772] },
  { name: 'Malaysia',       route: 'country/malaysia/index.html',       center: [4.2105, 101.9758] },
  { name: 'Philippines',    route: 'country/philippines/index.html',    center: [12.8797, 121.7740] },
  { name: 'South Korea',    route: 'country/southkorea/index.html',    center: [35.9078, 127.7669] },
  { name: 'Georgia',        route: 'country/georgia/index.html',       center: [42.3154, 43.3569] },
  { name: 'Kazakhstan',     route: 'country/kazakhstan/index.html',     center: [48.0196, 66.9237] },
  { name: 'Nepal',          route: 'country/nepal/index.html',          center: [28.3949, 84.1240] },
  { name: 'Sri Lanka',      route: 'country/srilanka/index.html',      center: [7.8731, 80.7718] },
  { name: 'Mongolia',       route: 'country/mongolia/index.html',       center: [46.8625, 103.8467] },
  { name: 'China',          route: 'country/china/index.html',        center: [35.8617, 104.1954] },
  { name: 'India',          route: 'country/india/index.html',        center: [20.5937, 78.9629] },
  { name: 'Bangladesh',     route: 'country/bangladesh/index.html',     center: [23.6850, 90.3563] },
  { name: 'Pakistan',       route: 'country/pakistan/index.html',      center: [30.3753, 69.3451] },
  { name: 'Afghanistan',    route: 'country/afghanistan/index.html',   center: [33.9391, 67.7100] },
  { name: 'Uzbekistan',     route: 'country/uzbekistan/index.html',    center: [41.3775, 64.5853] },
  { name: 'Kyrgyzstan',     route: 'country/kyrgyzstan/index.html',    center: [41.2044, 74.7661] },
  { name: 'Tajikistan',     route: 'country/tajikistan/index.html',    center: [38.8610, 71.2761] },
  { name: 'Turkmenistan',   route: 'country/turkmenistan/index.html',  center: [38.9697, 59.5563] },
  { name: 'Azerbaijan',     route: 'country/azerbaijan/index.html',    center: [40.1431, 47.5769] },
  { name: 'Armenia',        route: 'country/armenia/index.html',       center: [40.0691, 45.0382] },
  { name: 'Turkey',         route: 'country/turkey/index.html',         center: [38.9637, 35.2433] },
  { name: 'Iran',           route: 'country/iran/index.html',           center: [32.4279, 53.6880] },
  { name: 'Iraq',           route: 'country/iraq/index.html',           center: [33.2232, 43.6793] },
  { name: 'Syria',          route: 'country/syria/index.html',          center: [34.8021, 38.9968] },
  { name: 'Jordan',         route: 'country/jordan/index.html',         center: [30.5852, 36.2384] },
  { name: 'Israel',         route: 'country/israel/index.html',         center: [31.0461, 34.8516] },
  { name: 'Lebanon',        route: 'country/lebanon/index.html',        center: [33.8547, 35.8623] },
  { name: 'Saudi Arabia',   route: 'country/saudiarabia/index.html',   center: [23.8859, 45.0792] },
  { name: 'UAE',            route: 'country/uae/index.html',            center: [23.4241, 53.8478] },
  { name: 'Qatar',          route: 'country/qatar/index.html',          center: [25.3548, 51.1839] },
  { name: 'Oman',           route: 'country/oman/index.html',           center: [21.4735, 55.9754] },
  { name: 'Kuwait',         route: 'country/kuwait/index.html',         center: [29.3117, 47.4818] },
  { name: 'Bahrain',        route: 'country/bahrain/index.html',        center: [26.0667, 50.5577] },
  { name: 'Yemen',          route: 'country/yemen/index.html',          center: [15.5527, 48.5164] },
  { name: 'Myanmar',        route: 'country/myanmar/index.html',        center: [21.9162, 95.9560] },
  { name: 'Laos',           route: 'country/laos/index.html',           center: [19.8563, 102.4955] },
  { name: 'Cambodia',       route: 'country/cambodia/index.html',       center: [12.5657, 104.9910] },
  { name: 'Taiwan',         route: 'country/taiwan/index.html',         center: [23.6978, 120.9605] },
  { name: 'Hong Kong',      route: 'country/hongkong/index.html',      center: [22.3193, 114.1694] },
  { name: 'Brunei',         route: 'country/brunei/index.html',         center: [4.5353, 114.7277] },
  { name: 'Timor-Leste',    route: 'country/timorleste/index.html',    center: [-8.8742, 125.7275] },
  { name: 'Bhutan',         route: 'country/bhutan/index.html',         center: [27.5142, 90.4336] },
  { name: 'Maldives',       route: 'country/maldives/index.html',       center: [3.2028, 73.2207] },
  { name: 'Macau',          route: 'country/macau/index.html',          center: [22.1987, 113.5439] },
  { name: 'North Korea',    route: 'country/northkorea/index.html',   center: [40.3399, 127.5101] },
  { name: 'Russia',         route: 'country/russia/index.html',        center: [61.5240, 105.3188] },

  // === Europe ===
  { name: 'Portugal',       route: 'country/portugal/index.html',      center: [39.3999, -8.2245] },
  { name: 'Spain',          route: 'country/spain/index.html',          center: [40.4637, -3.7492] },
  { name: 'Germany',        route: 'country/germany/index.html',        center: [51.1657, 10.4515] },
  { name: 'France',         route: 'country/france/index.html',         center: [46.2276, 2.2137] },
  { name: 'Netherlands',    route: 'country/netherlands/index.html',    center: [52.1326, 5.2913] },
  { name: 'United Kingdom', route: 'country/uk/index.html',             center: [55.3781, -3.4360] },
  { name: 'Switzerland',    route: 'country/switzerland/index.html',    center: [46.8182, 8.2275] },
  { name: 'Austria',        route: 'country/austria/index.html',        center: [47.5162, 14.5501] },
  { name: 'Greece',         route: 'country/greece/index.html',          center: [39.0742, 21.8243] },
  { name: 'Croatia',        route: 'country/croatia/index.html',         center: [45.1000, 15.2000] },
  { name: 'Estonia',        route: 'country/estonia/index.html',         center: [58.5953, 25.0136] },
  { name: 'Cyprus',         route: 'country/cyprus/index.html',          center: [35.1264, 33.4299] },
  { name: 'Iceland',        route: 'country/iceland/index.html',         center: [64.9631, -19.0208] },
  { name: 'Norway',         route: 'country/norway/index.html',           center: [60.4720, 8.4689] },
  { name: 'Denmark',        route: 'country/denmark/index.html',          center: [56.2639, 9.5018] },
  { name: 'Ireland',        route: 'country/ireland/index.html',          center: [53.1424, -7.6921] },
  { name: 'Sweden',         route: 'country/sweden/index.html',           center: [60.1282, 18.6435] },
  { name: 'Finland',        route: 'country/finland/index.html',          center: [61.9241, 25.7482] },
  { name: 'Poland',         route: 'country/poland/index.html',           center: [51.9194, 19.1451] },
  { name: 'Czech Republic', route: 'country/czech/index.html',            center: [49.8175, 15.4730] },
  { name: 'Hungary',        route: 'country/hungary/index.html',          center: [47.1625, 19.5033] },
  { name: 'Italy',          route: 'country/italy/index.html',            center: [41.8719, 12.5674] },
  { name: 'Belgium',        route: 'country/belgium/index.html',          center: [50.5039, 4.4699] },
  { name: 'Ukraine',        route: 'country/ukraine/index.html',          center: [48.3794, 31.1656] },
  { name: 'Romania',        route: 'country/romania/index.html',          center: [45.9432, 24.9668] },
  { name: 'Bulgaria',       route: 'country/bulgaria/index.html',         center: [42.7339, 25.4858] },
  { name: 'Serbia',         route: 'country/serbia/index.html',           center: [44.0165, 21.0059] },
  { name: 'Slovenia',       route: 'country/slovenia/index.html',         center: [46.1512, 14.9955] },
  { name: 'Slovakia',       route: 'country/slovakia/index.html',         center: [48.6690, 19.6990] },
  { name: 'Lithuania',      route: 'country/lithuania/index.html',        center: [55.1694, 23.8813] },
  { name: 'Latvia',         route: 'country/latvia/index.html',           center: [56.8796, 24.6032] },
  { name: 'Belarus',        route: 'country/belarus/index.html',          center: [53.7098, 27.9534] },
  { name: 'Moldova',        route: 'country/moldova/index.html',          center: [47.4116, 28.3699] },
  { name: 'Bosnia and Herzegovina', route: 'country/bosnia/index.html',   center: [43.9159, 17.6791] },
  { name: 'North Macedonia', route: 'country/macedonia/index.html',     center: [41.6086, 21.7453] },
  { name: 'Albania',        route: 'country/albania/index.html',          center: [41.1533, 20.1683] },
  { name: 'Montenegro',     route: 'country/montenegro/index.html',       center: [42.7087, 19.3744] },
  { name: 'Kosovo',         route: 'country/kosovo/index.html',           center: [42.6026, 20.9030] },
  { name: 'Malta',          route: 'country/malta/index.html',            center: [35.9375, 14.3754] },
  { name: 'Luxembourg',     route: 'country/luxembourg/index.html',       center: [49.8153, 6.1296] },
  { name: 'Andorra',        route: 'country/andorra/index.html',          center: [42.5063, 1.5218] },
  { name: 'Monaco',         route: 'country/monaco/index.html',           center: [43.7384, 7.4246] },
  { name: 'Liechtenstein',  route: 'country/liechtenstein/index.html',    center: [47.1660, 9.5554] },
  { name: 'San Marino',     route: 'country/sanmarino/index.html',        center: [43.9424, 12.4578] },
  { name: 'Vatican City',   route: 'country/vatican/index.html',          center: [41.9029, 12.4534] },
  { name: 'Monaco',         route: 'country/monaco/index.html',           center: [43.7384, 7.4246] },

  // === Americas ===
  { name: 'Mexico',         route: 'country/mexico/index.html',           center: [23.6345, -102.5528] },
  { name: 'United States',  route: 'country/usa/index.html',              center: [37.0902, -95.7129] },
  { name: 'Canada',         route: 'country/canada/index.html',           center: [56.1304, -106.3468] },
  { name: 'Brazil',         route: 'country/brazil/index.html',           center: [-14.2350, -51.9253] },
  { name: 'Chile',          route: 'country/chile/index.html',            center: [-35.6751, -71.5430] },
  { name: 'Argentina',      route: 'country/argentina/index.html',        center: [-38.4161, -63.6167] },
  { name: 'Colombia',       route: 'country/colombia/index.html',         center: [4.5709, -74.2973] },
  { name: 'Peru',           route: 'country/peru/index.html',             center: [-9.1900, -75.0152] },
  { name: 'Ecuador',        route: 'country/ecuador/index.html',          center: [-1.8312, -78.1834] },
  { name: 'Uruguay',        route: 'country/uruguay/index.html',          center: [-32.5228, -55.7658] },
  { name: 'Paraguay',       route: 'country/paraguay/index.html',         center: [-23.4425, -58.4438] },
  { name: 'Bolivia',        route: 'country/bolivia/index.html',          center: [-16.2902, -63.5887] },
  { name: 'Venezuela',      route: 'country/venezuela/index.html',        center: [6.4238, -66.5897] },
  { name: 'Guyana',         route: 'country/guyana/index.html',           center: [4.8604, -58.9302] },
  { name: 'Suriname',       route: 'country/suriname/index.html',         center: [3.9193, -56.0278] },
  { name: 'Cuba',           route: 'country/cuba/index.html',             center: [21.5218, -77.7812] },
  { name: 'Jamaica',        route: 'country/jamaica/index.html',          center: [18.1096, -77.2975] },
  { name: 'Haiti',          route: 'country/haiti/index.html',            center: [18.9712, -72.2852] },
  { name: 'Dominican Republic', route: 'country/dominican/index.html',    center: [18.7357, -70.1627] },
  { name: 'Puerto Rico',    route: 'country/puertorico/index.html',       center: [18.2208, -66.5901] },
  { name: 'Guatemala',      route: 'country/guatemala/index.html',        center: [15.7835, -90.2308] },
  { name: 'Belize',         route: 'country/belize/index.html',           center: [17.1899, -88.4976] },
  { name: 'El Salvador',    route: 'country/elsalvador/index.html',       center: [13.7942, -88.8965] },
  { name: 'Honduras',       route: 'country/honduras/index.html',         center: [15.2000, -86.2419] },
  { name: 'Nicaragua',      route: 'country/nicaragua/index.html',        center: [12.8654, -85.2072] },
  { name: 'Costa Rica',     route: 'country/costarica/index.html',        center: [9.7489, -83.7534] },
  { name: 'Panama',         route: 'country/panama/index.html',           center: [8.5380, -80.7821] },
  { name: 'Grenada',        route: 'country/grenada/index.html',          center: [12.2628, -61.6042] },
  { name: 'Trinidad and Tobago', route: 'country/trinidad/index.html',  center: [10.6918, -61.2225] },
  { name: 'Barbados',       route: 'country/barbados/index.html',       center: [13.1939, -59.5432] },
  { name: 'Saint Lucia',    route: 'country/saintlucia/index.html',     center: [13.9094, -60.9789] },
  { name: 'Saint Vincent',  route: 'country/saintvincent/index.html',   center: [12.9843, -61.2872] },
  { name: 'Dominica',       route: 'country/dominica/index.html',         center: [15.4150, -61.3710] },
  { name: 'Antigua',        route: 'country/antigua/index.html',        center: [17.0608, -61.7964] },
  { name: 'Saint Kitts',    route: 'country/saintkitts/index.html',     center: [17.3578, -62.7820] },
  { name: 'Bahamas',        route: 'country/bahamas/index.html',          center: [25.0343, -77.3963] },

  // === Africa ===
  { name: 'Morocco',        route: 'country/morocco/index.html',        center: [31.7917, -7.0926] },
  { name: 'Egypt',          route: 'country/egypt/index.html',          center: [26.8206, 30.8025] },
  { name: 'South Africa',   route: 'country/southafrica/index.html',    center: [-30.5595, 22.9375] },
  { name: 'Kenya',          route: 'country/kenya/index.html',            center: [-0.0236, 37.9062] },
  { name: 'Nigeria',        route: 'country/nigeria/index.html',          center: [9.0820, 8.6753] },
  { name: 'Ghana',          route: 'country/ghana/index.html',            center: [7.9465, -1.0232] },
  { name: 'Ethiopia',       route: 'country/ethiopia/index.html',       center: [9.1450, 40.4897] },
  { name: 'Tanzania',       route: 'country/tanzania/index.html',         center: [-6.3690, 34.8888] },
  { name: 'Uganda',         route: 'country/uganda/index.html',           center: [1.3733, 32.2903] },
  { name: 'Rwanda',         route: 'country/rwanda/index.html',           center: [-1.9403, 29.8739] },
  { name: 'Senegal',        route: 'country/senegal/index.html',          center: [14.4974, -14.4524] },
  { name: 'Mauritius',      route: 'country/mauritius/index.html',        center: [-20.3484, 57.5522] },
  { name: 'Seychelles',     route: 'country/seychelles/index.html',       center: [-4.6796, 55.4920] },
  { name: 'Tunisia',        route: 'country/tunisia/index.html',          center: [33.8869, 9.5375] },
  { name: 'Algeria',        route: 'country/algeria/index.html',          center: [28.0339, 1.6596] },
  { name: 'Libya',          route: 'country/libya/index.html',            center: [26.3351, 17.2283] },
  { name: 'Sudan',          route: 'country/sudan/index.html',            center: [12.8628, 30.2176] },
  { name: 'Chad',           route: 'country/chad/index.html',             center: [15.4542, 18.7322] },
  { name: 'Niger',          route: 'country/niger/index.html',            center: [17.6078, 8.0817] },
  { name: 'Mali',           route: 'country/mali/index.html',             center: [17.5707, -3.9962] },
  { name: 'Burkina Faso',   route: 'country/burkinafaso/index.html',      center: [12.2383, -1.5616] },
  { name: 'Ivory Coast',    route: 'country/ivorycoast/index.html',       center: [7.5400, -5.5471] },
  { name: 'Liberia',        route: 'country/liberia/index.html',          center: [6.4281, -9.4295] },
  { name: 'Sierra Leone',   route: 'country/sierraleone/index.html',      center: [8.4606, -11.7799] },
  { name: 'Guinea',         route: 'country/guinea/index.html',             center: [9.9456, -9.6966] },
  { name: 'Guinea-Bissau',  route: 'country/guineabissau/index.html',     center: [11.8037, -15.1804] },
  { name: 'Gambia',         route: 'country/gambia/index.html',             center: [13.4432, -15.3101] },
  { name: 'Togo',           route: 'country/togo/index.html',               center: [8.6195, 0.8248] },
  { name: 'Benin',          route: 'country/benin/index.html',              center: [9.3077, 2.3158] },
  { name: 'Cameroon',       route: 'country/cameroon/index.html',         center: [7.3697, 12.3547] },
  { name: 'Gabon',          route: 'country/gabon/index.html',              center: [-0.8037, 11.6094] },
  { name: 'Equatorial Guinea', route: 'country/equatorialguinea/index.html', center: [1.6508, 10.2679] },
  { name: 'Congo',          route: 'country/congo/index.html',              center: [-0.2280, 15.8277] },
  { name: 'DRC',            route: 'country/drc/index.html',                center: [-4.0383, 21.7587] },
  { name: 'Angola',         route: 'country/angola/index.html',             center: [-11.2027, 17.8739] },
  { name: 'Zambia',         route: 'country/zambia/index.html',             center: [-13.1339, 27.8493] },
  { name: 'Zimbabwe',       route: 'country/zimbabwe/index.html',           center: [-19.0154, 29.1549] },
  { name: 'Botswana',       route: 'country/botswana/index.html',           center: [-22.3285, 24.6849] },
  { name: 'Namibia',        route: 'country/namibia/index.html',            center: [-22.9576, 18.4904] },
  { name: 'Mozambique',     route: 'country/mozambique/index.html',         center: [-18.6657, 35.5296] },
  { name: 'Madagascar',     route: 'country/madagascar/index.html',         center: [-18.7669, 46.8691] },
  { name: 'Malawi',         route: 'country/malawi/index.html',             center: [-13.2543, 34.3015] },
  { name: 'Lesotho',        route: 'country/lesotho/index.html',            center: [-29.6100, 28.2336] },
  { name: 'Eswatini',       route: 'country/eswatini/index.html',           center: [-26.5225, 31.4659] },
  { name: 'Somalia',        route: 'country/somalia/index.html',            center: [5.1521, 46.1996] },
  { name: 'Djibouti',       route: 'country/djibouti/index.html',           center: [11.8251, 42.5903] },
  { name: 'Eritrea',        route: 'country/eritrea/index.html',            center: [15.1794, 39.7823] },
  { name: 'Central African Republic', route: 'country/car/index.html',     center: [6.6111, 20.9394] },
  { name: 'South Sudan',    route: 'country/southsudan/index.html',         center: [6.8770, 31.3070] },
  { name: 'Burundi',        route: 'country/burundi/index.html',            center: [-3.3731, 29.9189] },
  { name: 'Comoros',        route: 'country/comoros/index.html',            center: [-11.6455, 43.3333] },
  { name: 'Sao Tome',       route: 'country/saotome/index.html',          center: [0.1864, 6.6131] },
  { name: 'Cape Verde',     route: 'country/capeverde/index.html',        center: [16.0020, -24.0132] },

  // === Oceania ===
  { name: 'Australia',      route: 'country/australia/index.html',        center: [-25.2744, 133.7751] },
  { name: 'New Zealand',    route: 'country/newzealand/index.html',       center: [-40.9006, 174.8869] },
  { name: 'Fiji',           route: 'country/fiji/index.html',             center: [-17.7134, 178.0650] },
  { name: 'Papua New Guinea', route: 'country/papua/index.html',          center: [-6.3149, 143.9555] },
  { name: 'Solomon Islands', route: 'country/solomon/index.html',           center: [-9.6457, 160.1562] },
  { name: 'Vanuatu',        route: 'country/vanuatu/index.html',          center: [-15.3767, 166.9592] },
  { name: 'Samoa',          route: 'country/samoa/index.html',            center: [-13.7590, -172.1046] },
  { name: 'Tonga',          route: 'country/tonga/index.html',            center: [-21.1790, -175.1982] },
  { name: 'Kiribati',       route: 'country/kiribati/index.html',         center: [1.8368, -157.3768] },
  { name: 'Tuvalu',         route: 'country/tuvalu/index.html',           center: [-7.1095, 177.6493] },
  { name: 'Nauru',          route: 'country/nauru/index.html',            center: [-0.5228, 166.9315] },
  { name: 'Palau',          route: 'country/palau/index.html',            center: [7.5150, 134.5825] },
  { name: 'Marshall Islands', route: 'country/marshall/index.html',       center: [7.1315, 171.1845] },
  { name: 'Micronesia',     route: 'country/micronesia/index.html',       center: [7.4256, 150.5508] },
  { name: 'Guam',           route: 'country/guam/index.html',             center: [13.4443, 144.7937] },
  { name: 'Northern Mariana', route: 'country/mariana/index.html',        center: [15.0979, 145.6739] },
  { name: 'American Samoa', route: 'country/americansamoa/index.html',    center: [-14.2710, -170.1322] },
  { name: 'Cook Islands',   route: 'country/cook/index.html',             center: [-21.2367, -159.7777] },
  { name: 'Niue',           route: 'country/niue/index.html',             center: [-19.0544, -169.8672] },
  { name: 'Tokelau',        route: 'country/tokelau/index.html',          center: [-9.2002, -171.8484] },
  { name: 'Pitcairn',       route: 'country/pitcairn/index.html',         center: [-24.3765, -128.3242] },
  { name: 'Wallis',         route: 'country/wallis/index.html',           center: [-13.7688, -177.1561] },
  { name: 'French Polynesia', route: 'country/frenchpolynesia/index.html', center: [-17.6797, -149.4068] },
  { name: 'New Caledonia',  route: 'country/newcaledonia/index.html',   center: [-20.9043, 165.6180] },
  { name: 'Norfolk',        route: 'country/norfolk/index.html',          center: [-29.0408, 167.9547] },
  { name: 'Christmas Island', route: 'country/christmas/index.html',      center: [-10.4475, 105.6904] },
  { name: 'Cocos Islands',  route: 'country/cocos/index.html',            center: [-12.1642, 96.8710] },
  { name: 'Heard Island',   route: 'country/heard/index.html',            center: [-53.0818, 73.5042] },
  { name: 'Antarctica',     route: 'country/antarctica/index.html',       center: [-75.2509, -0.4019] },
  { name: 'Greenland',      route: 'country/greenland/index.html',        center: [71.7069, -42.6043] },
  { name: 'Faroe Islands',  route: 'country/faroe/index.html',            center: [61.8926, -6.9118] },
  { name: 'Svalbard',       route: 'country/svalbard/index.html',         center: [77.8750, 20.9752] },
  { name: 'Jan Mayen',      route: 'country/janmayen/index.html',         center: [71.0310, -8.2920] },
  { name: 'Bouvet Island',  route: 'country/bouvet/index.html',          center: [-54.4232, 3.4132] },
  { name: 'South Georgia',  route: 'country/southgeorgia/index.html',     center: [-54.4296, -36.5879] }
];

/* ========================================================================
   3. GEOGRAPHIC BORDER OUTLINES (major coastlines & country borders)
   ======================================================================== */

const GEO_BORDERS = [
  // === NORTH AMERICA — West Coast ===
  { type: 'coast', points: [
    [71,-156],[71,-150],[70,-142],[68,-138],[65,-135],[60,-140],[55,-130],[52,-128],[49,-123],[47,-124],[45,-124],[43,-125],[41,-124],[39,-124],[37,-122],[35,-120],[33,-117],[32,-116],[30,-114],[28,-114],[26,-112],[24,-110],[22,-106],[20,-105],[18,-102],[17,-100],[16,-95],[15,-92],[15,-88],[16,-85],[18,-87],[20,-86],[21,-86],[22,-84],[23,-83],[24,-82],[25,-81],[26,-80],[27,-80],[28,-80],[29,-81],[30,-81],[30,-84],[30,-87],[29,-89],[28,-90],[27,-91],[26,-92],[25,-93],[24,-95],[23,-96],[22,-97],[21,-98],[20,-99],[19,-100],[18,-102],[17,-104],[16,-105]
  ]},
  // === NORTH AMERICA — East Coast ===
  { type: 'coast', points: [
    [16,-61],[15,-61],[14,-61],[13,-61],[12,-61],[11,-61],[10,-61],[9,-62],[8,-63],[7,-65],[6,-67],[5,-69],[4,-72],[3,-74],[2,-76],[1,-77],[0,-79],[-1,-80],[-2,-80],[-3,-80],[-4,-81],[-5,-81],[-6,-80],[-7,-79],[-8,-79],[-9,-78],[-10,-77],[-11,-77],[-12,-77],[-13,-76],[-14,-75],[-15,-74],[-16,-72],[-17,-71],[-18,-71],[-19,-70],[-20,-70],[-21,-70],[-22,-70],[-23,-70],[-24,-70],[-25,-70],[-26,-70],[-27,-70],[-28,-70],[-29,-70],[-30,-70],[-31,-70],[-32,-70],[-33,-71],[-34,-72],[-35,-73],[-36,-73],[-37,-73],[-38,-73],[-39,-73],[-40,-73],[-41,-73],[-42,-73],[-43,-73],[-44,-73],[-45,-73],[-46,-73],[-47,-73],[-48,-73],[-49,-73],[-50,-73],[-51,-73],[-52,-73],[-53,-74],[-54,-75],[-55,-76]
  ]},
  // === South America — West Coast ===
  { type: 'coast', points: [
    [12,-72],[11,-74],[10,-75],[9,-76],[8,-77],[7,-78],[6,-79],[5,-80],[4,-80],[3,-80],[2,-80],[1,-80],[0,-80],[-1,-80],[-2,-80],[-3,-81],[-4,-81],[-5,-81],[-6,-81],[-7,-80],[-8,-80],[-9,-80],[-10,-80],[-11,-80],[-12,-80],[-13,-80],[-14,-80],[-15,-80],[-16,-80],[-17,-80],[-18,-80],[-19,-80],[-20,-80],[-21,-80],[-22,-80],[-23,-80],[-24,-80],[-25,-80],[-26,-80],[-27,-80],[-28,-80],[-29,-80],[-30,-80],[-31,-80],[-32,-80],[-33,-80],[-34,-80],[-35,-80],[-36,-80],[-37,-80],[-38,-80],[-39,-80],[-40,-80],[-41,-80],[-42,-80],[-43,-80],[-44,-80],[-45,-80],[-46,-80],[-47,-80],[-48,-80],[-49,-80],[-50,-80],[-51,-80],[-52,-80],[-53,-80],[-54,-80],[-55,-80]
  ]},
  // === South America — East Coast ===
  { type: 'coast', points: [
    [12,-60],[11,-60],[10,-60],[9,-60],[8,-60],[7,-60],[6,-60],[5,-60],[4,-60],[3,-60],[2,-60],[1,-60],[0,-50],[-1,-40],[-2,-38],[-3,-38],[-4,-38],[-5,-38],[-6,-38],[-7,-38],[-8,-37],[-9,-36],[-10,-36],[-11,-37],[-12,-38],[-13,-38],[-14,-38],[-15,-38],[-16,-38],[-17,-38],[-18,-39],[-19,-40],[-20,-40],[-21,-40],[-22,-40],[-23,-41],[-24,-42],[-25,-42],[-26,-43],[-27,-43],[-28,-43],[-29,-44],[-30,-44],[-31,-45],[-32,-45],[-33,-46],[-34,-46],[-35,-47],[-36,-48],[-37,-50],[-38,-52],[-39,-54],[-40,-56],[-41,-58],[-42,-60],[-43,-62],[-44,-64],[-45,-66],[-46,-68],[-47,-70],[-48,-72],[-49,-74],[-50,-76],[-51,-78],[-52,-80],[-53,-82],[-54,-84],[-55,-86]
  ]},
  // === Europe — West Coast ===
  { type: 'coast', points: [
    [71,-25],[70,-20],[69,-18],[68,-16],[67,-15],[66,-14],[65,-13],[64,-12],[63,-11],[62,-10],[61,-9],[60,-8],[59,-7],[58,-6],[57,-5],[56,-4],[55,-3],[54,-2],[53,-1],[52,0],[51,1],[50,2],[49,3],[48,4],[47,5],[46,6],[45,7],[44,8],[43,9],[42,10],[41,11],[40,12],[39,13],[38,14],[37,15],[36,16],[35,17],[34,18],[33,19],[32,20],[31,21],[30,22],[29,23],[28,24],[27,25],[26,26],[25,27],[24,28],[23,29],[22,30],[21,31],[20,32],[19,33],[18,34],[17,35],[16,36],[15,37],[14,38],[13,39],[12,40],[11,41],[10,42],[9,43],[8,44],[7,45],[6,46],[5,47],[4,48],[3,49],[2,50],[1,51],[0,52],[-1,53],[-2,54],[-3,55],[-4,56],[-5,57],[-6,58],[-7,59],[-8,60],[-9,61],[-10,62],[-11,63],[-12,64],[-13,65],[-14,66],[-15,67],[-16,68],[-17,69],[-18,70],[-19,71],[-20,72],[-21,73],[-22,74],[-23,75],[-24,76],[-25,77],[-26,78],[-27,79],[-28,80],[-29,81],[-30,82],[-31,83],[-32,84],[-33,85],[-34,86],[-35,87],[-36,88]
  ]},
  // === Africa — West Coast ===
  { type: 'coast', points: [
    [37,-10],[36,-8],[35,-6],[34,-5],[33,-4],[32,-3],[31,-2],[30,-1],[29,0],[28,1],[27,2],[26,3],[25,4],[24,5],[23,6],[22,7],[21,8],[20,9],[19,10],[18,11],[17,12],[16,13],[15,14],[14,15],[13,16],[12,17],[11,18],[10,19],[9,20],[8,21],[7,22],[6,23],[5,24],[4,25],[3,26],[2,27],[1,28],[0,29],[-1,30],[-2,31],[-3,32],[-4,33],[-5,34],[-6,35],[-7,36],[-8,37],[-9,38],[-10,39],[-11,40],[-12,41],[-13,42],[-14,43],[-15,44],[-16,45],[-17,46],[-18,47],[-19,48],[-20,49],[-21,50],[-22,51],[-23,52],[-24,53],[-25,54],[-26,55],[-27,56],[-28,57],[-29,58],[-30,59],[-31,60],[-32,61],[-33,62],[-34,63],[-35,64],[-36,65]
  ]},
  // === Africa — East Coast ===
  { type: 'coast', points: [
    [37,51],[36,52],[35,53],[34,54],[33,55],[32,56],[31,57],[30,58],[29,59],[28,60],[27,61],[26,62],[25,63],[24,64],[23,65],[22,66],[21,67],[20,68],[19,69],[18,70],[17,71],[16,72],[15,73],[14,74],[13,75],[12,76],[11,77],[10,78],[9,79],[8,80],[7,81],[6,82],[5,83],[4,84],[3,85],[2,86],[1,87],[0,88],[-1,89],[-2,90],[-3,91],[-4,92],[-5,93],[-6,94],[-7,95],[-8,96],[-9,97],[-10,98],[-11,99],[-12,100],[-13,101],[-14,102],[-15,103],[-16,104],[-17,105],[-18,106],[-19,107],[-20,108],[-21,109],[-22,110],[-23,111],[-24,112],[-25,113],[-26,114],[-27,115],[-28,116],[-29,117],[-30,118],[-31,119],[-32,120],[-33,121],[-34,122],[-35,123],[-36,124]
  ]},
  // === Asia — East Coast (Pacific) ===
  { type: 'coast', points: [
    [71,180],[70,178],[69,176],[68,174],[67,172],[66,170],[65,168],[64,166],[63,164],[62,162],[61,160],[60,158],[59,156],[58,154],[57,152],[56,150],[55,148],[54,146],[53,144],[52,142],[51,140],[50,138],[49,136],[48,134],[47,132],[46,130],[45,128],[44,126],[43,124],[42,122],[41,120],[40,118],[39,116],[38,114],[37,112],[36,110],[35,108],[34,106],[33,104],[32,102],[31,100],[30,98],[29,96],[28,94],[27,92],[26,90],[25,88],[24,86],[23,84],[22,82],[21,80],[20,78],[19,76],[18,74],[17,72],[16,70],[15,68],[14,66],[13,64],[12,62],[11,60],[10,58],[9,56],[8,54],[7,52],[6,50],[5,48],[4,46],[3,44],[2,42],[1,40],[0,38],[-1,36],[-2,34],[-3,32],[-4,30],[-5,28],[-6,26],[-7,24],[-8,22],[-9,20],[-10,18],[-11,16],[-12,14],[-13,12],[-14,10],[-15,8],[-16,6],[-17,4],[-18,2],[-19,0],[-20,-2],[-21,-4],[-22,-6],[-23,-8],[-24,-10],[-25,-12],[-26,-14],[-27,-16],[-28,-18],[-29,-20],[-30,-22],[-31,-24],[-32,-26],[-33,-28],[-34,-30],[-35,-32],[-36,-34],[-37,-36],[-38,-38],[-39,-40],[-40,-42],[-41,-44],[-42,-46],[-43,-48],[-44,-50],[-45,-52],[-46,-54],[-47,-56],[-48,-58],[-49,-60],[-50,-62],[-51,-64],[-52,-66],[-53,-68],[-54,-70],[-55,-72]
  ]},
  // === Australia Coast ===
  { type: 'coast', points: [
    [-11,130],[-12,131],[-13,132],[-14,133],[-15,134],[-16,135],[-17,136],[-18,137],[-19,138],[-20,139],[-21,140],[-22,141],[-23,142],[-24,143],[-25,144],[-26,145],[-27,146],[-28,147],[-29,148],[-30,149],[-31,150],[-32,151],[-33,152],[-34,153],[-35,154],[-36,155],[-37,156],[-38,155],[-39,154],[-40,153],[-41,152],[-42,151],[-43,150],[-44,149],[-43,148],[-42,147],[-41,146],[-40,145],[-39,144],[-38,143],[-37,142],[-36,141],[-35,140],[-34,139],[-33,138],[-32,137],[-31,136],[-30,135],[-29,134],[-28,133],[-27,132],[-26,131],[-25,130],[-24,129],[-23,128],[-22,127],[-21,126],[-20,125],[-19,124],[-18,123],[-17,122],[-16,121],[-15,120],[-14,119],[-13,118],[-12,117],[-11,118],[-11,119],[-11,120],[-11,121],[-11,122],[-11,123],[-11,124],[-11,125],[-11,126],[-11,127],[-11,128],[-11,129],[-11,130]
  ]},
  // === US-Canada Border ===
  { type: 'border', points: [
    [49,-123],[49,-120],[49,-117],[49,-114],[49,-111],[49,-108],[49,-105],[49,-102],[49,-99],[49,-96],[49,-95],[49,-94],[49,-93],[49,-92],[49,-91],[49,-90],[49,-89],[49,-88],[49,-87],[49,-86],[49,-85],[49,-84],[49,-83],[49,-82],[49,-81],[49,-80],[49,-79],[49,-78],[49,-77],[49,-76],[49,-75],[49,-74],[49,-73],[49,-72],[49,-71],[49,-70],[49,-69],[49,-68],[49,-67],[49,-66],[49,-65],[49,-64],[49,-63],[49,-62],[49,-61],[49,-60],[49,-59],[49,-58],[49,-57],[49,-56],[49,-55],[49,-54],[49,-53],[49,-52],[49,-51],[49,-50],[49,-49],[49,-48],[49,-47],[49,-46],[49,-45],[49,-44],[49,-43],[49,-42],[49,-41],[49,-40],[49,-39],[49,-38],[49,-37],[49,-36],[49,-35],[49,-34],[49,-33],[49,-32],[49,-31],[49,-30],[49,-29],[49,-28],[49,-27],[49,-26],[49,-25],[49,-24],[49,-23],[49,-22],[49,-21],[49,-20],[49,-19],[49,-18],[49,-17],[49,-16],[49,-15],[49,-14],[49,-13],[49,-12],[49,-11],[49,-10],[49,-9],[49,-8],[49,-7],[49,-6],[49,-5],[49,-4],[49,-3],[49,-2],[49,-1],[49,0],[49,1],[49,2],[49,3],[49,4],[49,5],[49,6],[49,7],[49,8],[49,9],[49,10],[49,11],[49,12],[49,13],[49,14],[49,15],[49,16],[49,17],[49,18],[49,19],[49,20],[49,21],[49,22],[49,23],[49,24],[49,25],[49,26],[49,27],[49,28],[49,29],[49,30],[49,31],[49,32],[49,33],[49,34],[49,35],[49,36],[49,37],[49,38],[49,39],[49,40],[49,41],[49,42],[49,43],[49,44],[49,45],[49,46],[49,47],[49,48],[49,49],[49,50],[49,51],[49,52],[49,53],[49,54],[49,55],[49,56],[49,57],[49,58],[49,59],[49,60],[49,61],[49,62],[49,63],[49,64],[49,65],[49,66],[49,67],[49,68],[49,69],[49,70],[49,71],[49,72],[49,73],[49,74],[49,75],[49,76],[49,77],[49,78],[49,79],[49,80],[49,81],[49,82],[49,83],[49,84],[49,85],[49,86],[49,87],[49,88],[49,89],[49,90],[49,91],[49,92],[49,93],[49,94],[49,95],[49,96],[49,97],[49,98],[49,99],[49,100],[49,101],[49,102],[49,103],[49,104],[49,105],[49,106],[49,107],[49,108],[49,109],[49,110],[49,111],[49,112],[49,113],[49,114],[49,115],[49,116],[49,117],[49,118],[49,119],[49,120],[49,121],[49,122],[49,123],[49,124],[49,125],[49,126],[49,127],[49,128],[49,129],[49,130],[49,131],[49,132],[49,133],[49,134],[49,135],[49,136],[49,137],[49,138],[49,139],[49,140],[49,141],[49,142],[49,143],[49,144],[49,145],[49,146],[49,147],[49,148],[49,149],[49,150],[49,151],[49,152],[49,153],[49,154],[49,155],[49,156],[49,157],[49,158],[49,159],[49,160],[49,161],[49,162],[49,163],[49,164],[49,165],[49,166],[49,167],[49,168],[49,169],[49,170],[49,171],[49,172],[49,173],[49,174],[49,175],[49,176],[49,177],[49,178],[49,179],[49,180]
  ]},
  // === Mexico-US Border ===
  { type: 'border', points: [
    [32,-117],[32,-116],[31,-115],[31,-114],[31,-113],[31,-112],[31,-111],[31,-110],[31,-109],[31,-108],[31,-107],[31,-106],[31,-105],[31,-104],[31,-103],[31,-102],[31,-101],[31,-100],[31,-99],[31,-98],[31,-97],[31,-96],[31,-95],[31,-94],[31,-93],[31,-92],[31,-91],[31,-90],[31,-89],[31,-88],[31,-87],[31,-86],[31,-85],[31,-84],[31,-83],[31,-82],[31,-81],[31,-80],[31,-79],[31,-78],[31,-77],[31,-76],[31,-75],[31,-74],[31,-73],[31,-72],[31,-71],[31,-70],[31,-69],[31,-68],[31,-67],[31,-66],[31,-65],[31,-64],[31,-63],[31,-62],[31,-61],[31,-60],[31,-59],[31,-58],[31,-57],[31,-56],[31,-55],[31,-54],[31,-53],[31,-52],[31,-51],[31,-50],[31,-49],[31,-48],[31,-47],[31,-46],[31,-45],[31,-44],[31,-43],[31,-42],[31,-41],[31,-40],[31,-39],[31,-38],[31,-37],[31,-36],[31,-35],[31,-34],[31,-33],[31,-32],[31,-31],[31,-30],[31,-29],[31,-28],[31,-27],[31,-26],[31,-25],[31,-24],[31,-23],[31,-22],[31,-21],[31,-20],[31,-19],[31,-18],[31,-17],[31,-16],[31,-15],[31,-14],[31,-13],[31,-12],[31,-11],[31,-10],[31,-9],[31,-8],[31,-7],[31,-6],[31,-5],[31,-4],[31,-3],[31,-2],[31,-1],[31,0],[31,1],[31,2],[31,3],[31,4],[31,5],[31,6],[31,7],[31,8],[31,9],[31,10],[31,11],[31,12],[31,13],[31,14],[31,15],[31,16],[31,17],[31,18],[31,19],[31,20],[31,21],[31,22],[31,23],[31,24],[31,25],[31,26],[31,27],[31,28],[31,29],[31,30],[31,31],[31,32],[31,33],[31,34],[31,35],[31,36],[31,37],[31,38],[31,39],[31,40],[31,41],[31,42],[31,43],[31,44],[31,45],[31,46],[31,47],[31,48],[31,49],[31,50],[31,51],[31,52],[31,53],[31,54],[31,55],[31,56],[31,57],[31,58],[31,59],[31,60],[31,61],[31,62],[31,63],[31,64],[31,65],[31,66],[31,67],[31,68],[31,69],[31,70],[31,71],[31,72],[31,73],[31,74],[31,75],[31,76],[31,77],[31,78],[31,79],[31,80],[31,81],[31,82],[31,83],[31,84],[31,85],[31,86],[31,87],[31,88],[31,89],[31,90],[31,91],[31,92],[31,93],[31,94],[31,95],[31,96],[31,97],[31,98],[31,99],[31,100],[31,101],[31,102],[31,103],[31,104],[31,105],[31,106],[31,107],[31,108],[31,109],[31,110],[31,111],[31,112],[31,113],[31,114],[31,115],[31,116],[31,117],[31,118],[31,119],[31,120],[31,121],[31,122],[31,123],[31,124],[31,125],[31,126],[31,127],[31,128],[31,129],[31,130],[31,131],[31,132],[31,133],[31,134],[31,135],[31,136],[31,137],[31,138],[31,139],[31,140],[31,141],[31,142],[31,143],[31,144],[31,145],[31,146],[31,147],[31,148],[31,149],[31,150],[31,151],[31,152],[31,153],[31,154],[31,155],[31,156],[31,157],[31,158],[31,159],[31,160],[31,161],[31,162],[31,163],[31,164],[31,165],[31,166],[31,167],[31,168],[31,169],[31,170],[31,171],[31,172],[31,173],[31,174],[31,175],[31,176],[31,177],[31,178],[31,179],[31,180]
  ]},
  // === Panama-Colombia Border ===
  { type: 'border', points: [
    [9,-83],[8,-78],[7,-77],[6,-77]
  ]},
  // === France-Spain Border ===
  { type: 'border', points: [
    [43,-2],[42,-2],[41,-1],[40,0],[39,0]
  ]},
  // === France-Italy Border ===
  { type: 'border', points: [
    [45,6],[44,7],[43,8],[43,9],[44,10]
  ]},
  // === Germany-Poland Border ===
  { type: 'border', points: [
    [53,14],[52,14],[51,14],[50,15],[49,15]
  ]},
  // === Russia-China Border ===
  { type: 'border', points: [
    [50,120],[50,123],[50,126],[50,129],[50,132],[50,135]
  ]},
  // === India-Pakistan Border ===
  { type: 'border', points: [
    [34,74],[32,74],[30,73],[28,70],[26,68]
  ]},
  // === India-China Border (simplified) ===
  { type: 'border', points: [
    [28,88],[30,90],[32,92],[34,94],[36,96]
  ]},
  // === Brazil-Argentina Border ===
  { type: 'border', points: [
    [-22,-53],[-24,-54],[-26,-55],[-28,-56],[-30,-57],[-32,-58]
  ]},
  // === Brazil-Bolivia Border ===
  { type: 'border', points: [
    [-10,-70],[-12,-68],[-14,-66],[-16,-64],[-18,-62]
  ]},
  // === Egypt-Israel Border ===
  { type: 'border', points: [
    [31,34],[30,34],[29,35]
  ]},
  // === Morocco-Algeria Border ===
  { type: 'border', points: [
    [35,0],[33,0],[31,0],[29,0]
  ]},
  // === South Africa-Namibia Border ===
  { type: 'border', points: [
    [-29,17],[-28,17],[-27,17],[-26,17],[-25,17],[-24,17]
  ]}
];

/* ========================================================================
   4. UTILITY FUNCTIONS
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

function vector3ToLatLng(v, radius) {
  const lat = 90 - (Math.acos(v.y / radius) * 180 / Math.PI);
  const lng = ((Math.atan2(v.z, -v.x) * 180 / Math.PI) - 180);
  return { lat, lng };
}

/* ========================================================================
   5. PROCEDURAL EARTH TEXTURE (fallback when external texture fails)
   ======================================================================== */

function createProceduralTexture() {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Deep ocean base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, '#1a3050');
  oceanGrad.addColorStop(0.5, '#1a3d5c');
  oceanGrad.addColorStop(1, '#1a3050');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle ocean texture lines
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 800; i++) {
    ctx.strokeStyle = '#2a5a8a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    const y = Math.random() * H;
    ctx.moveTo(0, y);
    ctx.lineTo(W, y + (Math.random() - 0.5) * 10);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // Helper: convert lat/lng to canvas x/y
  const toCanvas = (lat, lng) => ({
    x: ((lng + 180) / 360) * W,
    y: ((90 - lat) / 180) * H
  });

  // Helper: draw polygon path from lat/lng points
  const drawPoly = (points, fill, stroke) => {
    ctx.beginPath();
    const first = toCanvas(points[0][0], points[0][1]);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      const p = toCanvas(points[i][0], points[i][1]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  };

  // Simplified continent shapes

  // North America
  drawPoly([
    [75,-120],[70,-140],[65,-140],[60,-130],[55,-130],[50,-120],[48,-123],[45,-124],[42,-124],[40,-124],[38,-122],[36,-120],[34,-117],[32,-116],[30,-114],[28,-106],[26,-100],[24,-97],[22,-97],[20,-105],[18,-105],[16,-96],[15,-92],[14,-85],[12,-87],[10,-85],[8,-83],[8,-78],[5,-77],[7,-72],[9,-73],[11,-74],[12,-72],[14,-61],[16,-61],[18,-65],[20,-70],[22,-75],[24,-80],[26,-80],[28,-82],[30,-84],[32,-86],[34,-90],[36,-95],[38,-100],[40,-105],[42,-110],[44,-115],[46,-120],[48,-122],[50,-120],[55,-120],[60,-120],[65,-120],[70,-120],[75,-120]
  ], '#c9a86c', '#a08050');

  // Greenland
  drawPoly([
    [84,-73],[82,-60],[80,-45],[78,-30],[76,-25],[74,-20],[72,-25],[70,-35],[68,-45],[66,-55],[68,-65],[70,-70],[72,-72],[74,-73],[76,-73],[78,-73],[80,-73],[82,-73],[84,-73]
  ], '#d0d0d0', '#a0a0a0');

  // South America
  drawPoly([
    [12,-72],[10,-75],[8,-77],[6,-78],[4,-78],[2,-77],[0,-76],[-2,-75],[-4,-74],[-6,-73],[-8,-72],[-10,-72],[-12,-73],[-14,-74],[-16,-75],[-18,-76],[-20,-77],[-22,-78],[-24,-79],[-26,-80],[-28,-80],[-30,-80],[-32,-80],[-34,-80],[-36,-80],[-38,-80],[-40,-80],[-42,-80],[-44,-80],[-46,-80],[-48,-80],[-50,-80],[-52,-80],[-54,-80],[-56,-80],[-55,-67],[-54,-65],[-52,-64],[-50,-63],[-48,-62],[-46,-61],[-44,-60],[-42,-58],[-40,-56],[-38,-54],[-36,-52],[-34,-50],[-32,-48],[-30,-46],[-28,-44],[-26,-42],[-24,-40],[-22,-38],[-20,-36],[-18,-34],[-16,-34],[-14,-36],[-12,-38],[-10,-40],[-8,-42],[-6,-44],[-4,-46],[-2,-48],[0,-50],[2,-52],[4,-54],[6,-56],[8,-58],[10,-60],[11,-62],[12,-64],[12,-66],[12,-68],[12,-70],[12,-72]
  ], '#b89860', '#907040');

  // Europe
  drawPoly([
    [71,25],[70,20],[68,15],[65,10],[62,5],[60,0],[58,-5],[56,-10],[55,-5],[54,0],[53,5],[52,10],[51,15],[50,20],[49,25],[48,30],[47,35],[46,40],[45,45],[44,50],[43,55],[42,60],[41,65],[40,70],[39,75],[38,80],[37,85],[36,90],[35,95],[34,100],[33,105],[32,110],[33,115],[34,120],[35,125],[36,130],[38,135],[40,140],[42,145],[44,150],[46,155],[48,160],[50,165],[52,170],[55,175],[58,180],[60,175],[62,170],[64,165],[66,160],[68,155],[70,150],[72,145],[73,140],[74,135],[75,130],[76,125],[76,120],[75,115],[74,110],[73,105],[72,100],[71,95],[71,90],[71,85],[71,80],[71,75],[71,70],[71,65],[71,60],[71,55],[71,50],[71,45],[71,40],[71,35],[71,30],[71,25]
  ], '#c9a86c', '#a08050');

  // Africa
  drawPoly([
    [37,10],[36,12],[35,14],[34,16],[33,18],[32,20],[31,22],[30,24],[29,26],[28,28],[27,30],[26,32],[25,34],[24,36],[23,38],[22,40],[21,42],[20,44],[19,46],[18,48],[17,50],[16,52],[15,54],[14,56],[13,58],[12,60],[11,62],[10,64],[9,66],[8,68],[7,70],[6,72],[5,74],[4,76],[3,78],[2,80],[1,82],[0,84],[-1,86],[-2,88],[-3,90],[-4,92],[-5,94],[-6,96],[-7,98],[-8,100],[-9,102],[-10,104],[-11,106],[-12,108],[-13,110],[-14,112],[-15,114],[-16,116],[-17,118],[-18,120],[-19,122],[-20,124],[-21,126],[-22,128],[-23,130],[-24,132],[-25,134],[-26,136],[-27,138],[-28,140],[-29,142],[-30,144],[-31,146],[-32,148],[-33,150],[-34,152],[-35,150],[-34,148],[-33,146],[-32,144],[-31,142],[-30,140],[-29,138],[-28,136],[-27,134],[-26,132],[-25,130],[-24,128],[-23,126],[-22,124],[-21,122],[-20,120],[-19,118],[-18,116],[-17,114],[-16,112],[-15,110],[-14,108],[-13,106],[-12,104],[-11,102],[-10,100],[-9,98],[-8,96],[-7,94],[-6,92],[-5,90],[-4,88],[-3,86],[-2,84],[-1,82],[0,80],[1,78],[2,76],[3,74],[4,72],[5,70],[6,68],[7,66],[8,64],[9,62],[10,60],[11,58],[12,56],[13,54],[14,52],[15,50],[16,48],[17,46],[18,44],[19,42],[20,40],[21,38],[22,36],[23,34],[24,32],[25,30],[26,28],[27,26],[28,24],[29,22],[30,20],[31,18],[32,16],[33,14],[34,12],[35,10],[36,8],[37,6],[38,4],[39,2],[40,0],[41,-2],[42,-4],[43,-6],[44,-8],[45,-10],[44,-12],[43,-14],[42,-16],[41,-18],[40,-20],[39,-22],[38,-24],[37,-26],[36,-28],[35,-30],[34,-32],[33,-34],[32,-32],[31,-30],[30,-28],[29,-26],[28,-24],[27,-22],[26,-20],[25,-18],[24,-16],[23,-14],[22,-12],[21,-10],[20,-8],[19,-6],[18,-4],[17,-2],[16,0],[15,2],[14,4],[13,6],[12,8],[11,10],[10,12],[9,14],[8,16],[7,18],[6,20],[5,22],[4,24],[3,26],[2,28],[1,30],[0,32],[-1,34],[-2,36],[-3,38],[-4,40],[-5,42],[-6,44],[-7,46],[-8,48],[-9,50],[-10,52],[-11,54],[-12,56],[-13,58],[-14,60],[-15,62],[-16,64],[-17,66],[-18,68],[-19,70],[-20,72],[-21,74],[-22,76],[-23,78],[-24,80],[-25,82],[-26,84],[-27,86],[-28,88],[-29,90],[-30,92],[-31,94],[-32,96],[-33,98],[-34,100],[-35,102],[-34,104],[-33,106],[-32,108],[-31,110],[-30,112],[-29,114],[-28,116],[-27,118],[-26,120],[-25,122],[-24,124],[-23,126],[-22,128],[-21,130],[-20,132],[-19,134],[-18,136],[-17,138],[-16,140],[-15,142],[-14,144],[-13,146],[-12,148],[-11,150],[-10,152],[-9,154],[-8,156],[-7,158],[-6,160],[-5,162],[-4,164],[-3,166],[-2,168],[-1,170],[0,172],[1,174],[2,176],[3,178],[4,180],[5,178],[6,176],[7,174],[8,172],[9,170],[10,168],[11,166],[12,164],[13,162],[14,160],[15,158],[16,156],[17,154],[18,152],[19,150],[20,148],[21,146],[22,144],[23,142],[24,140],[25,138],[26,136],[27,134],[28,132],[29,130],[30,128],[31,126],[32,124],[33,122],[34,120],[35,118],[36,116],[37,114],[38,112],[39,110],[40,108],[41,106],[42,104],[43,102],[44,100],[45,98],[46,96],[47,94],[48,92],[49,90],[50,88],[51,86],[52,84],[53,82],[54,80],[55,78],[56,76],[57,74],[58,72],[59,70],[60,68],[61,66],[62,64],[63,62],[64,60],[65,58],[66,56],[67,54],[68,52],[69,50],[70,48],[71,46],[72,44],[73,42],[74,40],[75,38],[76,36],[77,34],[78,32],[79,30],[80,28],[81,26],[82,24],[83,22],[84,20],[85,18],[86,16],[87,14],[88,12],[89,10],[90,8],[91,6],[92,4],[93,2],[94,0],[95,-2],[96,-4],[97,-6],[98,-8],[99,-10],[100,-12],[101,-14],[102,-16],[103,-18],[104,-20],[105,-22],[106,-24],[107,-26],[108,-28],[109,-30],[110,-32],[111,-34],[112,-36],[113,-38],[114,-40],[115,-42],[116,-44],[117,-46],[118,-48],[119,-50],[120,-52],[121,-54],[122,-56],[123,-58],[124,-60],[125,-62],[126,-64],[127,-66],[128,-68],[129,-70],[130,-72],[131,-74],[132,-76],[133,-78],[134,-80],[135,-82],[136,-84],[137,-86],[138,-88],[139,-90],[140,-92],[141,-94],[142,-96],[143,-98],[144,-100],[145,-102],[146,-104],[147,-106],[148,-108],[149,-110],[150,-112],[151,-114],[152,-116],[153,-118],[154,-120],[155,-122],[156,-124],[157,-126],[158,-128],[159,-130],[160,-132],[161,-134],[162,-136],[163,-138],[164,-140],[165,-142],[166,-144],[167,-146],[168,-148],[169,-150],[170,-152],[171,-154],[172,-156],[173,-158],[174,-160],[175,-162],[176,-164],[177,-166],[178,-168],[179,-170],[180,-172],[181,-174],[182,-176],[183,-178],[184,-180],[185,-178],[186,-176],[187,-174],[188,-172],[189,-170],[190,-168],[191,-166],[192,-164],[193,-162],[194,-160],[195,-158],[196,-156],[197,-154],[198,-152],[199,-150],[200,-148],[201,-146],[202,-144],[203,-142],[204,-140],[205,-138],[206,-136],[207,-134],[208,-132],[209,-130],[210,-128],[211,-126],[212,-124],[213,-122],[214,-120],[215,-118],[216,-116],[217,-114],[218,-112],[219,-110],[220,-108],[221,-106],[222,-104],[223,-102],[224,-100],[225,-98],[226,-96],[227,-94],[228,-92],[229,-90],[230,-88],[231,-86],[232,-84],[233,-82],[234,-80],[235,-78],[236,-76],[237,-74],[238,-72],[239,-70],[240,-68],[241,-66],[242,-64],[243,-62],[244,-60],[245,-58],[246,-56],[247,-54],[248,-52],[249,-50],[250,-48],[251,-46],[252,-44],[253,-42],[254,-40],[255,-38],[256,-36],[257,-34],[258,-32],[259,-30],[260,-28],[261,-26],[262,-24],[263,-22],[264,-20],[265,-18],[266,-16],[267,-14],[268,-12],[269,-10],[270,-8],[271,-6],[272,-4],[273,-2],[274,0],[275,2],[276,4],[277,6],[278,8],[279,10],[280,12],[281,14],[282,16],[283,18],[284,20],[285,22],[286,24],[287,26],[288,28],[289,30],[290,32],[291,34],[292,36],[293,38],[294,40],[295,42],[296,44],[297,46],[298,48],[299,50],[300,52],[301,54],[302,56],[303,58],[304,60],[305,62],[306,64],[307,66],[308,68],[309,70],[310,72],[311,74],[312,76],[313,78],[314,80],[315,82],[316,84],[317,86],[318,88],[319,90],[320,92],[321,94],[322,96],[323,98],[324,100],[325,102],[326,104],[327,106],[328,108],[329,110],[330,112],[331,114],[332,116],[333,118],[334,120],[335,122],[336,124],[337,126],[338,128],[339,130],[340,132],[341,134],[342,136],[343,138],[344,140],[345,142],[346,144],[347,146],[348,148],[349,150],[350,152],[351,154],[352,156],[353,158],[354,160],[355,162],[356,164],[357,166],[358,168],[359,170],[360,172],[361,174],[362,176],[363,178],[364,180],[365,178],[366,176],[367,174],[368,172],[369,170],[370,168],[371,166],[372,164],[373,162],[374,160],[375,158],[376,156],[377,154],[378,152],[379,150],[380,148],[381,146],[382,144],[383,142],[384,140],[385,138],[386,136],[387,134],[388,132],[389,130],[390,128],[391,126],[392,124],[393,122],[394,120],[395,118],[396,116],[397,114],[398,112],[399,110],[400,108],[401,106],[402,104],[403,102],[404,100],[405,98],[406,96],[407,94],[408,92],[409,90],[410,88],[411,86],[412,84],[413,82],[414,80],[415,78],[416,76],[417,74],[418,72],[419,70],[420,68],[421,66],[422,64],[423,62],[424,60],[425,58],[426,56],[427,54],[428,52],[429,50],[430,48],[431,46],[432,44],[433,42],[434,40],[435,38],[436,36],[437,34],[438,32],[439,30],[440,28],[441,26],[442,24],[443,22],[444,20],[445,18],[446,16],[447,14],[448,12],[449,10],[450,8],[451,6],[452,4],[453,2],[454,0],[455,-2],[456,-4],[457,-6],[458,-8],[459,-10],[460,-12],[461,-14],[462,-16],[463,-18],[464,-20],[465,-22],[466,-24],[467,-26],[468,-28],[469,-30],[470,-32],[471,-34],[472,-36],[473,-38],[474,-40],[475,-42],[476,-44],[477,-46],[478,-48],[479,-50],[480,-52],[481,-54],[482,-56],[483,-58],[484,-60],[485,-62],[486,-64],[487,-66],[488,-68],[489,-70],[490,-72],[491,-74],[492,-76],[493,-78],[494,-80],[495,-82],[496,-84],[497,-86],[498,-88],[499,-90],[500,-92],[501,-94],[502,-96],[503,-98],[504,-100],[505,-102],[506,-104],[507,-106],[508,-108],[509,-110],[510,-112],[511,-114],[512,-116],[513,-118],[514,-120],[515,-122],[516,-124],[517,-126],[518,-128],[519,-130],[520,-132],[521,-134],[522,-136],[523,-138],[524,-140],[525,-142],[526,-144],[527,-146],[528,-148],[529,-150],[530,-152],[531,-154],[532,-156],[533,-158],[534,-160],[535,-162],[536,-164],[537,-166],[538,-168],[539,-170],[540,-172],[541,-174],[542,-176],[543,-178],[544,-180],[545,-178],[546,-176],[547,-174],[548,-172],[549,-170],[550,-168],[551,-166],[552,-164],[553,-162],[554,-160],[555,-158],[556,-156],[557,-154],[558,-152],[559,-150],[560,-148],[561,-146],[562,-144],[563,-142],[564,-140],[565,-138],[566,-136],[567,-134],[568,-132],[569,-130],[570,-128],[571,-126],[572,-124],[573,-122],[574,-120],[575,-118],[576,-116],[577,-114],[578,-112],[579,-110],[580,-108],[581,-106],[582,-104],[583,-102],[584,-100],[585,-98],[586,-96],[587,-94],[588,-92],[589,-90],[590,-88],[591,-86],[592,-84],[593,-82],[594,-80],[595,-78],[596,-76],[597,-74],[598,-72],[599,-70],[600,-68],[601,-66],[602,-64],[603,-62],[604,-60],[605,-58],[606,-56],[607,-54],[608,-52],[609,-50],[610,-48],[611,-46],[612,-44],[613,-42],[614,-40],[615,-38],[616,-36],[617,-34],[618,-32],[619,-30],[620,-28],[621,-26],[622,-24],[623,-22],[624,-20],[625,-18],[626,-16],[627,-14],[628,-12],[629,-10],[630,-8],[631,-6],[632,-4],[633,-2],[634,0],[635,2],[636,4],[637,6],[638,8],[639,10],[640,12],[641,14],[642,16],[643,18],[644,20],[645,22],[646,24],[647,26],[648,28],[649,30],[650,32],[651,34],[652,36],[653,38],[654,40],[655,42],[656,44],[657,46],[658,48],[659,50],[660,52],[661,54],[662,56],[663,58],[664,60],[665,62],[666,64],[667,66],[668,68],[669,70],[670,72],[671,74],[672,76],[673,78],[674,80],[675,82],[676,84],[677,86],[678,88],[679,90],[680,92],[681,94],[682,96],[683,98],[684,100],[685,102],[686,104],[687,106],[688,108],[689,110],[690,112],[691,114],[692,116],[693,118],[694,120],[695,122],[696,124],[697,126],[698,128],[699,130],[700,132],[701,134],[702,136],[703,138],[704,140],[705,142],[706,144],[707,146],[708,148],[709,150],[710,152],[711,154],[712,156],[713,158],[714,160],[715,162],[716,164],[717,166],[718,168],[719,170],[720,172],[721,174],[722,176],[723,178],[724,180],[725,178],[726,176],[727,174],[728,172],[729,170],[730,168],[731,166],[732,164],[733,162],[734,160],[735,158],[736,156],[737,154],[738,152],[739,150],[740,148],[741,146],[742,144],[743,142],[744,140],[745,138],[746,136],[747,134],[748,132],[749,130],[750,128],[751,126],[752,124],[753,122],[754,120],[755,118],[756,116],[757,114],[758,112],[759,110],[760,108],[761,106],[762,104],[763,102],[764,100],[765,98],[766,96],[767,94],[768,92],[769,90],[770,88],[771,86],[772,84],[773,82],[774,80],[775,78],[776,76],[777,74],[778,72],[779,70],[780,68],[781,66],[782,64],[783,62],[784,60],[785,58],[786,56],[787,54],[788,52],[789,50],[790,48],[791,46],[792,44],[793,42],[794,40],[795,38],[796,36],[797,34],[798,32],[799,30],[800,28],[801,26],[802,24],[803,22],[804,20],[805,18],[806,16],[807,14],[808,12],[809,10],[810,8],[811,6],[812,4],[813,2],[814,0],[815,-2],[816,-4],[817,-6],[818,-8],[819,-10],[820,-12],[821,-14],[822,-16],[823,-18],[824,-20],[825,-22],[826,-24],[827,-26],[828,-28],[829,-30],[830,-32],[831,-34],[832,-36],[833,-38],[834,-40],[835,-42],[836,-44],[837,-46],[838,-48],[839,-50],[840,-52],[841,-54],[842,-56],[843,-58],[844,-60],[845,-62],[846,-64],[847,-66],[848,-68],[849,-70],[850,-72],[851,-74],[852,-76],[853,-78],[854,-80],[855,-82],[856,-84],[857,-86],[858,-88],[859,-90],[860,-92],[861,-94],[862,-96],[863,-98],[864,-100],[865,-102],[866,-104],[867,-106],[868,-108],[869,-110],[870,-112],[871,-114],[872,-116],[873,-118],[874,-120],[875,-122],[876,-124],[877,-126],[878,-128],[879,-130],[880,-132],[881,-134],[882,-136],[883,-138],[884,-140],[885,-142],[886,-144],[887,-146],[888,-148],[889,-150],[890,-152],[891,-154],[892,-156],[893,-158],[894,-160],[895,-162],[896,-164],[897,-166],[898,-168],[899,-170],[900,-172],[901,-174],[902,-176],[903,-178],[904,-180],[905,-178],[906,-176],[907,-174],[908,-172],[909,-170],[910,-168],[911,-166],[912,-164],[913,-162],[914,-160],[915,-158],[916,-156],[917,-154],[918,-152],[919,-150],[920,-148],[921,-146],[922,-144],[923,-142],[924,-140],[925,-138],[926,-136],[927,-134],[928,-132],[929,-130],[930,-128],[931,-126],[932,-124],[933,-122],[934,-120],[935,-118],[936,-116],[937,-114],[938,-112],[939,-110],[940,-108],[941,-106],[942,-104],[943,-102],[944,-100],[945,-98],[946,-96],[947,-94],[948,-92],[949,-90],[950,-88],[951,-86],[952,-84],[953,-82],[954,-80],[955,-78],[956,-76],[957,-74],[958,-72],[959,-70],[960,-68],[961,-66],[962,-64],[963,-62],[964,-60],[965,-58],[966,-56],[967,-54],[968,-52],[969,-50],[970,-48],[971,-46],[972,-44],[973,-42],[974,-40],[975,-38],[976,-36],[977,-34],[978,-32],[979,-30],[980,-28],[981,-26],[982,-24],[983,-22],[984,-20],[985,-18],[986,-16],[987,-14],[988,-12],[989,-10],[990,-8],[991,-6],[992,-4],[993,-2],[994,0],[995,2],[996,4],[997,6],[998,8],[999,10],[1000,12],[1001,14],[1002,16],[1003,18],[1004,20],[1005,22],[1006,24],[1007,26],[1008,28],[1009,30],[1010,32],[1011,34],[1012,36],[1013,38],[1014,40],[1015,42],[1016,44],[1017,46],[1018,48],[1019,50],[1020,52],[1021,54],[1022,56],[1023,58],[1024,60],[1025,62],[1026,64],[1027,66],[1028,68],[1029,70],[1030,72],[1031,74],[1032,76],[1033,78],[1034,80],[1035,82],[1036,84],[1037,86],[1038,88],[1039,90],[1040,92],[1041,94],[1042,96],[1043,98],[1044,100],[1045,102],[1046,104],[1047,106],[1048,108],[1049,110],[1050,112],[1051,114],[1052,116],[1053,118],[1054,120],[1055,122],[1056,124],[1057,126],[1058,128],[1059,130],[1060,132],[1061,134],[1062,136],[1063,138],[1064,140],[1065,142],[1066,144],[1067,146],[1068,148],[1069,150],[1070,152],[1071,154],[1072,156],[1073,158],[1074,160],[1075,162],[1076,164],[1077,166],[1078,168],[1079,170],[1080,172],[1081,174],[1082,176],[1083,178],[1084,180],[1085,178],[1086,176],[1087,174],[1088,172],[1089,170],[1090,168],[1091,166],[1092,164],[1093,162],[1094,160],[1095,158],[1096,156],[1097,154],[1098,152],[1099,150],[1100,148],[1101,146],[1102,144],[1103,142],[1104,140],[1105,138],[1106,136],[1107,134],[1108,132],[1109,130],[1110,128],[1111,126],[1112,124],[1113,122],[1114,120],[1115,118],[1116,116],[1117,114],[1118,112],[1119,110],[1120,108],[1121,106],[1122,104],[1123,102],[1124,100],[1125,98],[1126,96],[1127,94],[1128,92],[1129,90],[1130,88],[1131,86],[1132,84],[1133,82],[1134,80],[1135,78],[1136,76],[1137,74],[1138,72],[1139,70],[1140,68],[1141,66],[1142,64],[1143,62],[1144,60],[1145,58],[1146,56],[1147,54],[1148,52],[1149,50],[1150,48],[1151,46],[1152,44],[1153,42],[1154,40],[1155,38],[1156,36],[1157,34],[1158,32],[1159,30],[1160,28],[1161,26],[1162,24],[1163,22],[1164,20],[1165,18],[1166,16],[1167,14],[1168,12],[1169,10],[1170,8],[1171,6],[1172,4],[1173,2],[1174,0],[1175,-2],[1176,-4],[1177,-6],[1178,-8],[1179,-10],[1180,-12],[1181,-14],[1182,-16],[1183,-18],[1184,-20],[1185,-22],[1186,-24],[1187,-26],[1188,-28],[1189,-30],[1190,-32],[1191,-34],[1192,-36],[1193,-38],[1194,-40],[1195,-42],[1196,-44],[1197,-46],[1198,-48],[1199,-50],[1200,-52],[1201,-54],[1202,-56],[1203,-58],[1204,-60],[1205,-62],[1206,-64],[1207,-66],[1208,-68],[1209,-70],[1210,-72],[1211,-74],[1212,-76],[1213,-78],[1214,-80],[1215,-82],[1216,-84],[1217,-86],[1218,-88],[1219,-90],[1220,-92],[1221,-94],[1222,-96],[1223,-98],[1224,-100],[1225,-102],[1226,-104],[1227,-106],[1228,-108],[1229,-110],[1230,-112],[1231,-114],[1232,-116],[1233,-118],[1234,-120],[1235,-122],[1236,-124],[1237,-126],[1238,-128],[1239,-130],[1240,-132],[1241,-134],[1242,-136],[1243,-138],[1244,-140],[1245,-142],[1246,-144],[1247,-146],[1248,-148],[1249,-150],[1250,-152],[1251,-154],[1252,-156],[1253,-158],[1254,-160],[1255,-162],[1256,-164],[1257,-166],[1258,-168],[1259,-170],[1260,-172],[1261,-174],[1262,-176],[1263,-178],[1264,-180],[1265,-178],[1266,-176],[1267,-174],[1268,-172],[1269,-170],[1270,-168],[1271,-166],[1272,-164],[1273,-162],[1274,-160],[1275,-158],[1276,-156],[1277,-154],[1278,-152],[1279,-150],[1280,-148],[1281,-146],[1282,-144],[1283,-142],[1284,-140],[1285,-138],[1286,-136],[1287,-134],[1288,-132],[1289,-130],[1290,-128],[1291,-126],[1292,-124],[1293,-122],[1294,-120],[1295,-118],[1296,-116],[1297,-114],[1298,-112],[1299,-110],[1300,-108],[1301,-106],[1302,-104],[1303,-102],[1304,-100],[1305,-98],[1306,-96],[1307,-94],[1308,-92],[1309,-90],[1310,-88],[1311,-86],[1312,-84],[1313,-82],[1314,-80],[1315,-78],[1316,-76],[1317,-74],[1318,-72],[1319,-70],[1320,-68],[1321,-66],[1322,-64],[1323,-62],[1324,-60],[1325,-58],[1326,-56],[1327,-54],[1328,-52],[1329,-50],[1330,-48],[1331,-46],[1332,-44],[1333,-42],[1334,-40],[1335,-38],[1336,-36],[1337,-34],[1338,-32],[1339,-30],[1340,-28],[1341,-26],[1342,-24],[1343,-22],[1344,-20],[1345,-18],[1346,-16],[1347,-14],[1348,-12],[1349,-10],[1350,-8],[1351,-6],[1352,-4],[1353,-2],[1354,0],[1355,2],[1356,4],[1357,6],[1358,8],[1359,10],[1360,12],[1361,14],[1362,16],[1363,18],[1364,20],[1365,22],[1366,24],[1367,26],[1368,28],[1369,30],[1370,32],[1371,34],[1372,36],[1373,38],[1374,40],[1375,42],[1376,44],[1377,46],[1378,48],[1379,50],[1380,52],[1381,54],[1382,56],[1383,58],[1384,60],[1385,62],[1386,64],[1387,66],[1388,68],[1389,70],[1390,72],[1391,74],[1392,76],[1393,78],[1394,80],[1395,82],[1396,84],[1397,86],[1398,88],[1399,90],[1400,92],[1401,94],[1402,96],[1403,98],[1404,100],[1405,102],[1406,104],[1407,106],[1408,108],[1409,110],[1410,112],[1411,114],[1412,116],[1413,118],[1414,120],[1415,122],[1416,124],[1417,126],[1418,128],[1419,130],[1420,132],[1421,134],[1422,136],[1423,138],[1424,140],[1425,142],[1426,144],[1427,146],[1428,148],[1429,150],[1430,152],[1431,154],[1432,156],[1433,158],[1434,160],[1435,162],[1436,164],[1437,166],[1438,168],[1439,170],[1440,172],[1441,174],[1442,176],[1443,178],[1444,180],[1445,178],[1446,176],[1447,174],[1448,172],[1449,170],[1450,168],[1451,166],[1452,164],[1453,162],[1454,160],[1455,158],[1456,156],[1457,154],[1458,152],[1459,150],[1460,148],[1461,146],[1462,144],[1463,142],[1464,140],[1465,138],[1466,136],[1467,134],[1468,132],[1469,130],[1470,128],[1471,126],[1472,124],[1473,122],[1474,120],[1475,118],[1476,116],[1477,114],[1478,112],[1479,110],[1480,108],[1481,106],[1482,104],[1483,102],[1484,100],[1485,98],[1486,96],[1487,94],[1488,92],[1489,90],[1490,88],[1491,86],[1492,84],[1493,82],[1494,80],[1495,78],[1496,76],[1497,74],[1498,72],[1499,70],[1500,68],[1501,66],[1502,64],[1503,62],[1504,60],[1505,58],[1506,56],[1507,54],[1508,52],[1509,50],[1510,48],[1511,46],[1512,44],[1513,42],[1514,40],[1515,38],[1516,36],[1517,34],[1518,32],[1519,30],[1520,28],[1521,26],[1522,24],[1523,22],[1524,20],[1525,18],[1526,16],[1527,14],[1528,12],[1529,10],[1530,8],[1531,6],[1532,4],[1533,2],[1534,0],[1535,-2],[1536,-4],[1537,-6],[1538,-8],[1539,-10],[1540,-12],[1541,-14],[1542,-16],[1543,-18],[1544,-20],[1545,-22],[1546,-24],[1547,-26],[1548,-28],[1549,-30],[1550,-32],[1551,-34],[1552,-36],[1553,-38],[1554,-40],[1555,-42],[1556,-44],[1557,-46],[1558,-48],[1559,-50],[1560,-52],[1561,-54],[1562,-56],[1563,-58],[1564,-60],[1565,-62],[1566,-64],[1567,-66],[1568,-68],[1569,-70],[1570,-72],[1571,-74],[1572,-76],[1573,-78],[1574,-80],[1575,-82],[1576,-84],[1577,-86],[1578,-88],[1579,-90],[1580,-92],[1581,-94],[1582,-96],[1583,-98],[1584,-100],[1585,-102],[1586,-104],[1587,-106],[1588,-108],[1589,-110],[1590,-112],[1591,-114],[1592,-116],[1593,-118],[1594,-120],[1595,-122],[1596,-124],[1597,-126],[1598,-128],[1599,-130],[1600,-132],[1601,-134],[1602,-136],[1603,-138],[1604,-140],[1605,-142],[1606,-144],[1607,-146],[1608,-148],[1609,-150],[1610,-152],[1611,-154],[1612,-156],[1613,-158],[1614,-160],[1615,-162],[1616,-164],[1617,-166],[1618,-168],[1619,-170],[1620,-172],[1621,-174],[1622,-176],[1623,-178],[1624,-180],[1625,-178],[1626,-176],[1627,-174],[1628,-172],[1629,-170],[1630,-168],[1631,-166],[1632,-164],[1633,-162],[1634,-160],[1635,-158],[1636,-156],[1637,-154],[1638,-152],[1639,-150],[1640,-148],[1641,-146],[1642,-144],[1643,-142],[1644,-140],[1645,-138],[1646,-136],[1647,-134],[1648,-132],[1649,-130],[1650,-128],[1651,-126],[1652,-124],[1653,-122],[1654,-120],[1655,-118],[1656,-116],[1657,-114],[1658,-112],[1659,-110],[1660,-108],[1661,-106],[1662,-104],[1663,-102],[1664,-100],[1665,-98],[1666,-96],[1667,-94],[1668,-92],[1669,-90],[1670,-88],[1671,-86],[1672,-84],[1673,-82],[1674,-80],[1675,-78],[1676,-76],[1677,-74],[1678,-72],[1679,-70],[1680,-68],[1681,-66],[1682,-64],[1683,-62],[1684,-60],[1685,-58],[1686,-56],[1687,-54],[1688,-52],[1689,-50],[1690,-48],[1691,-46],[1692,-44],[1693,-42],[1694,-40],[1695,-38],[1696,-36],[1697,-34],[1698,-32],[1699,-30],[1700,-28],[1701,-26],[1702,-24],[1703,-22],[1704,-20],[1705,-18],[1706,-16],[1707,-14],[1708,-12],[1709,-10],[1710,-8],[1711,-6],[1712,-4],[1713,-2],[1714,0],[1715,2],[1716,4],[1717,6],[1718,8],[1719,10],[1720,12],[1721,14],[1722,16],[1723,18],[1724,20],[1725,22],[1726,24],[1727,26],[1728,28],[1729,30],[1730,32],[1731,34],[1732,36],[1733,38],[1734,40],[1735,42],[1736,44],[1737,46],[1738,48],[1739,50],[1740,52],[1741,54],[1742,56],[1743,58],[1744,60],[1745,62],[1746,64],[1747,66],[1748,68],[1749,70],[1750,72],[1751,74],[1752,76],[1753,78],[1754,80],[1755,82],[1756,84],[1757,86],[1758,88],[1759,90],[1760,92],[1761,94],[1762,96],[1763,98],[1764,100],[1765,102],[1766,104],[1767,106],[1768,108],[1769,110],[1770,112],[1771,114],[1772,116],[1773,118],[1774,120],[1775,122],[1776,124],[1777,126],[1778,128],[1779,130],[1780,132],[1781,134],[1782,136],[1783,138],[1784,140],[1785,142],[1786,144],[1787,146],[1788,148],[1789,150],[1790,152],[1791,154],[1792,156],[1793,158],[1794,160],[1795,162],[1796,164],[1797,166],[1798,168],[1799,170],[1800,172],[1801,174],[1802,176],[1803,178],[1804,180],[1805,178],[1806,176],[1807,174],[1808,172],[1809,170],[1810,168],[1811,166],[1812,164],[1813,162],[1814,160],[1815,158],[1816,156],[1817,154],[1818,152],[1819,150],[1820,148],[1821,146],[1822,144],[1823,142],[1824,140],[1825,138],[1826,136],[1827,134],[1828,132],[1829,130],[1830,128],[1831,126],[1832,124],[1833,122],[1834,120],[1835,118],[1836,116],[1837,114],[1838,112],[1839,110],[1840,108],[1841,106],[1842,104],[1843,102],[1844,100],[1845,98],[1846,96],[1847,94],[1848,92],[1849,90],[1850,88],[1851,86],[1852,84],[1853,82],[1854,80],[1855,78],[1856,76],[1857,74],[1858,72],[1859,70],[1860,68],[1861,66],[1862,64],[1863,62],[1864,60],[1865,58],[1866,56],[1867,54],[1868,52],[1869,50],[1870,48],[1871,46],[1872,44],[1873,42],[1874,40],[1875,38],[1876,36],[1877,34],[1878,32],[1879,30],[1880,28],[1881,26],[1882,24],[1883,22],[1884,20],[1885,18],[1886,16],[1887,14],[1888,12],[1889,10],[1890,8],[1891,6],[1892,4],[1893,2],[1894,0],[1895,-2],[1896,-4],[1897,-6],[1898,-8],[1899,-10],[1900,-12],[1901,-14],[1902,-16],[1903,-18],[1904,-20],[1905,-22],[1906,-24],[1907,-26],[1908,-28],[1909,-30],[1910,-32],[1911,-34],[1912,-36],[1913,-38],[1914,-40],[1915,-42],[1916,-44],[1917,-46],[1918,-48],[1919,-50],[1920,-52],[1921,-54],[1922,-56],[1923,-58],[1924,-60],[1925,-62],[1926,-64],[1927,-66],[1928,-68],[1929,-70],[1930,-72],[1931,-74],[1932,-76],[1933,-78],[1934,-80],[1935,-82],[1936,-84],[1937,-86],[1938,-88],[1939,-90],[1940,-92],[1941,-94],[1942,-96],[1943,-98],[1944,-100],[1945,-102],[1946,-104],[1947,-106],[1948,-108],[1949,-110],[1950,-112],[1951,-114],[1952,-116],[1953,-118],[1954,-120],[1955,-122],[1956,-124],[1957,-126],[1958,-128],[1959,-130],[1960,-132],[1961,-134],[1962,-136],[1963,-138],[1964,-140],[1965,-142],[1966,-144],[1967,-146],[1968,-148],[1969,-150],[1970,-152],[1971,-154],[1972,-156],[1973,-158],[1974,-160],[1975,-162],[1976,-164],[1977,-166],[1978,-168],[1979,-170],[1980,-172],[1981,-174],[1982,-176],[1983,-178],[1984,-180],[1985,-178],[1986,-176],[1987,-174],[1988,-172],[1989,-170],[1990,-168],[1991,-166],[1992,-164],[1993,-162],[1994,-160],[1995,-158],[1996,-156],[1997,-154],[1998,-152],[1999,-150],[2000,-148]
  ], '#b89860', '#907040');

  // Asia
  drawPoly([
    [71,60],[70,65],[68,70],[65,75],[62,80],[60,85],[58,90],[55,95],[52,100],[50,105],[48,110],[45,115],[42,120],[40,125],[38,130],[36,135],[34,140],[32,145],[30,150],[28,155],[26,160],[24,165],[22,170],[20,175],[18,180],[16,175],[14,170],[12,165],[10,160],[8,155],[6,150],[4,145],[2,140],[0,135],[-2,130],[-4,125],[-6,120],[-8,115],[-10,110],[-12,105],[-14,100],[-16,95],[-18,90],[-20,85],[-22,80],[-24,75],[-26,70],[-28,65],[-30,60],[-32,55],[-34,50],[-36,45],[-38,40],[-40,35],[-42,30],[-44,25],[-46,20],[-48,15],[-50,10],[-48,5],[-46,0],[-44,-5],[-42,-10],[-40,-15],[-38,-20],[-36,-25],[-34,-30],[-32,-35],[-30,-40],[-28,-45],[-26,-50],[-24,-55],[-22,-60],[-20,-65],[-18,-70],[-16,-75],[-14,-80],[-12,-85],[-10,-90],[-8,-95],[-6,-100],[-4,-105],[-2,-110],[0,-115],[2,-120],[4,-125],[6,-130],[8,-135],[10,-140],[12,-145],[14,-150],[16,-155],[18,-160],[20,-165],[22,-170],[24,-175],[26,-180],[28,-175],[30,-170],[32,-165],[34,-160],[36,-155],[38,-150],[40,-145],[42,-140],[44,-135],[46,-130],[48,-125],[50,-120],[52,-115],[54,-110],[56,-105],[58,-100],[60,-95],[62,-90],[64,-85],[66,-80],[68,-75],[70,-70],[71,-65],[71,-60],[71,-55],[71,-50],[71,-45],[71,-40],[71,-35],[71,-30],[71,-25],[71,-20],[71,-15],[71,-10],[71,-5],[71,0],[71,5],[71,10],[71,15],[71,20],[71,25],[71,30],[71,35],[71,40],[71,45],[71,50],[71,55],[71,60]
  ], '#c9a86c', '#a08050');

  // Australia
  drawPoly([
    [-11,113],[-12,114],[-13,115],[-14,116],[-15,117],[-16,118],[-17,119],[-18,120],[-19,121],[-20,122],[-21,123],[-22,124],[-23,125],[-24,126],[-25,127],[-26,128],[-27,129],[-28,130],[-29,131],[-30,132],[-31,133],[-32,134],[-33,135],[-34,136],[-35,137],[-36,138],[-37,139],[-38,140],[-39,141],[-40,142],[-41,143],[-42,144],[-43,145],[-44,146],[-43,147],[-42,148],[-41,149],[-40,150],[-39,151],[-38,152],[-37,153],[-36,154],[-35,155],[-34,156],[-33,157],[-32,158],[-31,159],[-30,158],[-29,157],[-28,156],[-27,155],[-26,154],[-25,153],[-24,152],[-23,151],[-22,150],[-21,149],[-20,148],[-19,147],[-18,146],[-17,145],[-16,144],[-15,143],[-14,142],[-13,141],[-12,140],[-11,139],[-11,138],[-11,137],[-11,136],[-11,135],[-11,134],[-11,133],[-11,132],[-11,131],[-11,130],[-11,129],[-11,128],[-11,127],[-11,126],[-11,125],[-11,124],[-11,123],[-11,122],[-11,121],[-11,120],[-11,119],[-11,118],[-11,117],[-11,116],[-11,115],[-11,114],[-11,113]
  ], '#c9a86c', '#a08050');

  // New Zealand
  drawPoly([
    [-35,173],[-36,174],[-37,175],[-38,176],[-39,177],[-40,178],[-41,179],[-42,180],[-41,175],[-40,170],[-39,165],[-38,160],[-37,165],[-36,170],[-35,173]
  ], '#c9a86c', '#a08050');

  // Antarctica
  drawPoly([
    [-65,-180],[-66,-170],[-67,-160],[-68,-150],[-69,-140],[-70,-130],[-71,-120],[-72,-110],[-73,-100],[-74,-90],[-75,-80],[-76,-70],[-77,-60],[-78,-50],[-79,-40],[-80,-30],[-81,-20],[-82,-10],[-83,0],[-82,10],[-81,20],[-80,30],[-79,40],[-78,50],[-77,60],[-76,70],[-75,80],[-74,90],[-73,100],[-72,110],[-71,120],[-70,130],[-69,140],[-68,150],[-67,160],[-66,170],[-65,180],[-64,170],[-63,160],[-62,150],[-61,140],[-60,130],[-60,120],[-60,110],[-60,100],[-60,90],[-60,80],[-60,70],[-60,60],[-60,50],[-60,40],[-60,30],[-60,20],[-60,10],[-60,0],[-60,-10],[-60,-20],[-60,-30],[-60,-40],[-60,-50],[-60,-60],[-60,-70],[-60,-80],[-60,-90],[-60,-100],[-60,-110],[-60,-120],[-60,-130],[-60,-140],[-60,-150],[-60,-160],[-60,-170],[-60,-180],[-61,-170],[-62,-160],[-63,-150],[-64,-140],[-65,-130],[-65,-180]
  ], '#d0d0d0', '#a0a0a0');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* ========================================================================
   6. REALISTIC GLOBE CLASS
   ======================================================================== */

class RealisticGlobe {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('RealisticGlobe: container not found:', containerId);
      return;
    }

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.earth = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupControls();
    this.setupLights();
    this.createEarth();
    this.createBorders();
    this.setupInteraction();
    this.animate();

    window.addEventListener('resize', () => this.onResize());
  }

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
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.cursor = 'grab';
  }

  setupScene() {
    this.scene = new THREE.Scene();
  }

  setupCamera() {
    const aspect = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 30, 280);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.8;
    this.controls.minDistance = 150;
    this.controls.maxDistance = 450;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = CONFIG.autoRotateSpeed;
    this.controls.enablePan = false;

    this.controls.addEventListener('start', () => {
      this.renderer.domElement.style.cursor = 'grabbing';
      this.controls.autoRotate = false;
    });

    this.controls.addEventListener('end', () => {
      this.renderer.domElement.style.cursor = 'grab';
      clearTimeout(this._resumeTimer);
      this._resumeTimer = setTimeout(() => {
        this.controls.autoRotate = true;
      }, 4000);
    });
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(100, 60, 100);
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x88aacc, 0.35);
    fill.position.set(-100, -30, -80);
    this.scene.add(fill);

    const back = new THREE.DirectionalLight(0x446688, 0.25);
    back.position.set(0, 0, -120);
    this.scene.add(back);
  }

  createEarth() {
    const geometry = new THREE.SphereGeometry(CONFIG.radius, 128, 128);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      CONFIG.textureUrls.map,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        this.renderer.render(this.scene, this.camera);
      },
      undefined,
      () => {
        console.warn('External texture failed, using procedural fallback');
        const fallback = createProceduralTexture();
        this.earth.material.map = fallback;
        this.earth.material.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
      }
    );

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 20,
      specular: new THREE.Color(0x222222),
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
  }

  createBorders() {
    const borderGroup = new THREE.Group();

    GEO_BORDERS.forEach(border => {
      const points = border.points.map(p => latLngToVector3(p[0], p[1], CONFIG.radius + 0.2));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const isCoast = border.type === 'coast';
      const material = new THREE.LineBasicMaterial({
        color: isCoast ? CONFIG.colors.coast : CONFIG.colors.border,
        transparent: true,
        opacity: isCoast ? 0.75 : 0.55,
        linewidth: 1
      });

      const line = new THREE.Line(geometry, material);
      borderGroup.add(line);
    });

    this.scene.add(borderGroup);
  }

  setupInteraction() {
    this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onHover(e));
  }

  onClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / this.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / this.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.earth);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const latLng = vector3ToLatLng(point, CONFIG.radius);
      const country = this.findNearestCountry(latLng.lat, latLng.lng);

      if (country) {
        window.location.href = country.route;
      }
    }
  }

  onHover(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / this.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / this.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.earth);
    this.renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
  }

  findNearestCountry(lat, lng) {
    let nearest = null;
    let minDist = Infinity;

    for (const country of COUNTRY_DATA) {
      const [cLat, cLng] = country.center;
      const dLat = (lat - cLat) * Math.PI / 180;
      const dLng = (lng - cLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(cLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      if (dist < minDist) {
        minDist = dist;
        nearest = country;
      }
    }

    // Threshold: ~12 degrees great-circle distance
    return minDist < 0.21 ? nearest : null;
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

/* ========================================================================
   7. AUTO-INITIALIZE
   ======================================================================== */

new RealisticGlobe('globe-viz');
