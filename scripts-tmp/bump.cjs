const fs = require('fs')
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'))
p.version = '2.0.5'
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n', 'utf8')
let t = fs.readFileSync('README.md', 'utf8')
t = t.replace(/2\.0\.4/g, '2.0.5')
fs.writeFileSync('README.md', t, 'utf8')
fs.writeFileSync('publish/version.json', JSON.stringify({
  version: '2.0.5',
  desc: '猫仙音乐 2.0.5：修复磁贴墙歌曲无封面、修复升级后 Folia 舞台不挂载、模式渲染器改为静态导入、新增舞台内歌词模式切换。',
  history: []
}, null, 2) + '\n', 'utf8')
console.log('2.0.5')
