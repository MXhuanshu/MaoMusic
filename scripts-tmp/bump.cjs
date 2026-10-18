const fs = require('fs')
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'))
p.version = '2.0.3'
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n', 'utf8')
let t = fs.readFileSync('README.md', 'utf8')
t = t.replace(/2\.0\.2/g, '2.0.3')
fs.writeFileSync('README.md', t, 'utf8')
fs.writeFileSync('publish/version.json', JSON.stringify({
  version: '2.0.3',
  desc: '猫仙音乐 2.0.3：修复升级后视觉档位仍为 lite 导致看不到 Folia 舞台，首次启动自动升级为 full。',
  history: []
}, null, 2) + '\n', 'utf8')
console.log('2.0.3')
