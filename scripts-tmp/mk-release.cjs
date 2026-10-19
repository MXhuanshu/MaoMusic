const fs = require('fs')
fs.writeFileSync('release.json', JSON.stringify({
  tag_name: 'v2.0.6',
  name: '猫仙音乐 v2.0.6',
  body: fs.readFileSync('doc/release-notes-v2.0.6.md', 'utf8'),
  draft: false,
  prerelease: false
}), 'utf8')
console.log('written')
