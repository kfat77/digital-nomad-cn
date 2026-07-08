const d = require('./world-geo-raw.json');
console.log(d.features.length + ' countries');
const names = d.features.map(f => f.properties.NAME).sort();
console.log('First 30:', names.slice(0, 30).join(', '));
// Check for our target countries
const targets = ['Denmark','Croatia','Iceland','Canada','Indonesia','Kazakhstan','Turkey','Cyprus','Mexico','Austria','Nepal','Brazil','Greece','Germany','Norway','Morocco','Sri Lanka','Singapore','New Zealand','Japan','Chile','Georgia','France','Thailand','Australia','Ireland','Estonia','Switzerland','United States','United Kingdom','Netherlands','Philippines','Portugal','Mongolia','Spain','Vietnam','Argentina','United Arab Emirates','South Korea','Hong Kong','Malaysia','Armenia','Azerbaijan','Bulgaria','Colombia','Czech Republic','Egypt','Ghana','Hungary','India','Israel','Kenya','Peru','Poland','Qatar','Romania','South Africa','Sweden','Uzbekistan','Macao'];
for (const t of targets) {
    const found = d.features.find(f => f.properties.NAME === t || f.properties.ADMIN === t || f.properties.NAME_LONG === t);
    console.log(t + ' -> ' + (found ? found.properties.NAME : 'NOT FOUND'));
}
