const fs = require('fs');
const path = require('path');

const cityDir = path.resolve(__dirname, '../website/city');
const enCityDir = path.resolve(__dirname, '../website/en/city');

for (const f of fs.readdirSync(cityDir).filter(x => x.endsWith('.html'))) {
  const p = path.join(cityDir, f);
  let c = fs.readFileSync(p, 'utf-8');
  // Fix broken format from previous sed
  c = c.replace(/<html lang=zh-CN> <head>/, '<html lang="zh-CN">\n<head>');
  fs.writeFileSync(p, c);
}

// Also fix en/city pages if needed
for (const f of fs.readdirSync(enCityDir).filter(x => x.endsWith('.html'))) {
  const p = path.join(enCityDir, f);
  let c = fs.readFileSync(p, 'utf-8');
  c = c.replace(/<html lang=en> <head>/, '<html lang="en">\n<head>');
  fs.writeFileSync(p, c);
}

console.log('Fixed city page formats');
