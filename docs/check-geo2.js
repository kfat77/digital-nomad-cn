const d = require('./world-geo-raw.json');
const sg = d.features.filter(f =>
    (f.properties.NAME && f.properties.NAME.includes('Sin')) ||
    (f.properties.ADMIN && f.properties.ADMIN.includes('Sin')) ||
    (f.properties.SOVEREIGNT && f.properties.SOVEREIGNT.includes('Sin'))
);
console.log('Singapore matches:', sg.map(f => f.properties.NAME + ' / ' + f.properties.ADMIN + ' / ' + f.properties.SOVEREIGNT));

const hk = d.features.filter(f =>
    (f.properties.NAME && f.properties.NAME.includes('Kong')) ||
    (f.properties.ADMIN && f.properties.ADMIN.includes('Kong'))
);
console.log('HK matches:', hk.map(f => f.properties.NAME + ' / ' + f.properties.ADMIN));

const mo = d.features.filter(f =>
    (f.properties.NAME && f.properties.NAME.includes('Mac')) ||
    (f.properties.ADMIN && f.properties.ADMIN.includes('Mac'))
);
console.log('Macao matches:', mo.map(f => f.properties.NAME + ' / ' + f.properties.ADMIN));
