const fs = require('fs');
const earcut = require('earcut');

// Load GeoJSON
const geojson = JSON.parse(fs.readFileSync('./world-geo-raw.json', 'utf8'));

// Name mapping from our COUNTRY_DATA to GeoJSON NAME
const nameMapping = {
    'United States': 'United States of America',
    'Czech Republic': 'Czechia',
};

// Countries we want (from countries-data.js nameEn)
const targetCountries = [
    'Denmark','Croatia','Iceland','Canada','Indonesia','Kazakhstan','Turkey',
    'Cyprus','Mexico','Austria','Nepal','Brazil','Greece','Germany','Norway',
    'Morocco','Sri Lanka','Singapore','New Zealand','Japan','Chile','Georgia',
    'France','Thailand','Australia','Ireland','Estonia','Switzerland',
    'United States','United Kingdom','Netherlands','Philippines','Portugal',
    'Mongolia','Spain','Vietnam','Argentina','United Arab Emirates',
    'South Korea','Hong Kong','Malaysia','Armenia','Azerbaijan','Bulgaria',
    'Colombia','Czech Republic','Egypt','Ghana','Hungary','India','Israel',
    'Kenya','Peru','Poland','Qatar','Romania','South Africa','Sweden','Uzbekistan',
    'Macao'
];

// URL key mapping from nameEn
const urlKeyMap = {
    'Denmark':'denmark','Croatia':'croatia','Iceland':'iceland','Canada':'canada',
    'Indonesia':'indonesia','Kazakhstan':'kazakhstan','Turkey':'turkey',
    'Cyprus':'cyprus','Mexico':'mexico','Austria':'austria','Nepal':'nepal',
    'Brazil':'brazil','Greece':'greece','Germany':'germany','Norway':'norway',
    'Morocco':'morocco','Sri Lanka':'srilanka','Singapore':'singapore',
    'New Zealand':'newzealand','Japan':'japan','Chile':'chile','Georgia':'georgia',
    'France':'france','Thailand':'thailand','Australia':'australia',
    'Ireland':'ireland','Estonia':'estonia','Switzerland':'switzerland',
    'United States':'usa','United Kingdom':'uk','Netherlands':'netherlands',
    'Philippines':'philippines','Portugal':'portugal','Mongolia':'mongolia',
    'Spain':'spain','Vietnam':'vietnam','Argentina':'argentina',
    'United Arab Emirates':'uae','South Korea':'southkorea','Hong Kong':'hongkong',
    'Malaysia':'malaysia','Armenia':'armenia','Azerbaijan':'azerbaijan',
    'Bulgaria':'bulgaria','Colombia':'colombia','Czech Republic':'czech',
    'Egypt':'egypt','Ghana':'ghana','Hungary':'hungary','India':'india',
    'Israel':'israel','Kenya':'kenya','Peru':'peru','Poland':'poland',
    'Qatar':'qatar','Romania':'romania','South Africa':'south_africa',
    'Sweden':'sweden','Uzbekistan':'uzbekistan','Macao':'macao'
};

const nameZhMap = {
    'Denmark':'丹麦','Croatia':'克罗地亚','Iceland':'冰岛','Canada':'加拿大',
    'Indonesia':'印度尼西亚','Kazakhstan':'哈萨克斯坦','Turkey':'土耳其',
    'Cyprus':'塞浦路斯','Mexico':'墨西哥','Austria':'奥地利','Nepal':'尼泊尔',
    'Brazil':'巴西','Greece':'希腊','Germany':'德国','Norway':'挪威',
    'Morocco':'摩洛哥','Sri Lanka':'斯里兰卡','Singapore':'新加坡',
    'New Zealand':'新西兰','Japan':'日本','Chile':'智利','Georgia':'格鲁吉亚',
    'France':'法国','Thailand':'泰国','Australia':'澳大利亚',
    'Ireland':'爱尔兰','Estonia':'爱沙尼亚','Switzerland':'瑞士',
    'United States':'美国','United Kingdom':'英国','Netherlands':'荷兰',
    'Philippines':'菲律宾','Portugal':'葡萄牙','Mongolia':'蒙古',
    'Spain':'西班牙','Vietnam':'越南','Argentina':'阿根廷',
    'United Arab Emirates':'阿联酋','South Korea':'韩国','Hong Kong':'香港',
    'Malaysia':'马来西亚','Armenia':'亚美尼亚','Azerbaijan':'阿塞拜疆',
    'Bulgaria':'保加利亚','Colombia':'哥伦比亚','Czech Republic':'捷克',
    'Egypt':'埃及','Ghana':'加纳','Hungary':'匈牙利','India':'印度',
    'Israel':'以色列','Kenya':'肯尼亚','Peru':'秘鲁','Poland':'波兰',
    'Qatar':'卡塔尔','Romania':'罗马尼亚','South Africa':'南非',
    'Sweden':'瑞典','Uzbekistan':'乌兹别克斯坦','Macao':'澳门'
};

// Convert lat/lon to 3D vector on sphere
function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return [x, y, z];
}

// Simplify polygon using Douglas-Peucker-like algorithm (simple version: keep every Nth point)
function simplifyRing(ring, factor) {
    if (ring.length <= 10) return ring;
    const result = [ring[0]];
    for (let i = factor; i < ring.length - 1; i += factor) {
        result.push(ring[i]);
    }
    result.push(ring[ring.length - 1]);
    // Ensure closed
    if (result[0][0] !== result[result.length - 1][0] || result[0][1] !== result[result.length - 1][1]) {
        result.push(result[0]);
    }
    return result;
}

// Process a polygon (GeoJSON Polygon or first ring of MultiPolygon)
function processPolygon(rings, radius, urlKey, nameEn) {
    // rings[0] is outer ring, rings[1+] are holes
    const outerRing = simplifyRing(rings[0], 3); // keep every 3rd point
    
    // Build flat array for earcut: [x0,y0,x1,y1,...]
    const flat = [];
    const holes = [];
    
    for (const coord of outerRing) {
        flat.push(coord[0], coord[1]); // lon, lat
    }
    
    for (let i = 1; i < rings.length; i++) {
        holes.push(flat.length / 2);
        const hole = simplifyRing(rings[i], 3);
        for (const coord of hole) {
            flat.push(coord[0], coord[1]);
        }
    }
    
    // Triangulate
    const indices = earcut(flat, holes);
    
    // Build triangles (3D vertices)
    const triangles = [];
    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i];
        const i1 = indices[i + 1];
        const i2 = indices[i + 2];
        const v0 = latLonToVector3(flat[i0 * 2 + 1], flat[i0 * 2], radius);
        const v1 = latLonToVector3(flat[i1 * 2 + 1], flat[i1 * 2], radius);
        const v2 = latLonToVector3(flat[i2 * 2 + 1], flat[i2 * 2], radius);
        triangles.push(...v0, ...v1, ...v2);
    }
    
    // Build outline lines
    const lines = [];
    for (const coord of outerRing) {
        const v = latLonToVector3(coord[1], coord[0], radius * 1.002);
        lines.push(v[0], v[1], v[2]);
    }
    
    return { triangles, lines };
}

const result = {};

for (const nameEn of targetCountries) {
    const geoName = nameMapping[nameEn] || nameEn;
    const urlKey = urlKeyMap[nameEn];
    
    // Special handling for Singapore, Hong Kong, Macao (not in 110m GeoJSON)
    if (nameEn === 'Singapore') {
        // Small rectangle around Singapore
        const coords = [[[103.6,1.15],[104.1,1.15],[104.1,1.5],[103.6,1.5],[103.6,1.15]]];
        const data = processPolygon(coords, 1.01, urlKey, nameEn);
        result[urlKey] = { name: nameEn, nameZh: nameZhMap[nameEn], ...data };
        continue;
    }
    if (nameEn === 'Hong Kong') {
        const coords = [[[113.8,22.1],[114.5,22.1],[114.5,22.6],[113.8,22.6],[113.8,22.1]]];
        const data = processPolygon(coords, 1.01, urlKey, nameEn);
        result[urlKey] = { name: nameEn, nameZh: nameZhMap[nameEn], ...data };
        continue;
    }
    if (nameEn === 'Macao') {
        const coords = [[[113.5,22.1],[113.6,22.1],[113.6,22.2],[113.5,22.2],[113.5,22.1]]];
        const data = processPolygon(coords, 1.01, urlKey, nameEn);
        result[urlKey] = { name: nameEn, nameZh: nameZhMap[nameEn], ...data };
        continue;
    }
    
    const feature = geojson.features.find(f => f.properties.NAME === geoName || f.properties.ADMIN === geoName);
    if (!feature) {
        console.log('NOT FOUND:', nameEn, '(mapped to', geoName + ')');
        continue;
    }
    
    const geom = feature.geometry;
    let allTriangles = [];
    let allLines = [];
    
    if (geom.type === 'Polygon') {
        const data = processPolygon(geom.coordinates, 1.01, urlKey, nameEn);
        allTriangles = data.triangles;
        allLines = data.lines;
    } else if (geom.type === 'MultiPolygon') {
        for (const polygon of geom.coordinates) {
            const data = processPolygon(polygon, 1.01, urlKey, nameEn);
            allTriangles.push(...data.triangles);
            allLines.push(...data.lines);
        }
    }
    
    result[urlKey] = {
        name: nameEn,
        nameZh: nameZhMap[nameEn] || nameEn,
        triangles: allTriangles,
        lines: allLines
    };
    
    console.log('Processed:', nameEn, urlKey, 'triangles:', allTriangles.length / 9, 'line points:', allLines.length / 3);
}

fs.writeFileSync('./world-geo.json', JSON.stringify(result));
console.log('Done! Output:', Object.keys(result).length, 'countries');
console.log('File size:', fs.statSync('./world-geo.json').size, 'bytes');
