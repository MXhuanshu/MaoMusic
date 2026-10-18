const fs = require('fs')
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'))
p.version = '2.0.4'
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n', 'utf8')
let t = fs.readFileSync('README.md', 'utf8')
t = t.replace(/2\.0\.3/g, '2.0.4')
fs.writeFileSync('README.md', t, 'utf8')
fs.writeFileSync('publish/version.json', JSON.stringify({
  version: '2.0.4',
  desc: '猫仙音乐 2.0.4：修复磁贴墙歌曲无封面（封面字段取错）、修复升级后 Folia 舞台不挂载（迁移时机错误）、恢复可拖拽进度条。',
  history: []
}, null, 2) + '\n', 'utf8')
console.log('2.0.4')
