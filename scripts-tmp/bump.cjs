const fs = require('fs')
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'))
p.version = '2.0.6'
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n', 'utf8')
let t = fs.readFileSync('README.md', 'utf8')
t = t.replace(/2\.0\.5/g, '2.0.6')
fs.writeFileSync('README.md', t, 'utf8')
fs.writeFileSync('publish/version.json', JSON.stringify({
  version: '2.0.6',
  desc: '猫仙音乐 2.0.6：回退导致循环依赖的静态导入改动，恢复可启动状态；修正磁贴墙封面字段与视觉档位迁移时机；新增舞台内歌词模式切换。',
  history: []
}, null, 2) + '\n', 'utf8')
console.log('2.0.6')
