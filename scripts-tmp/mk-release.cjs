const fs = require('fs')
fs.writeFileSync('release.json', JSON.stringify({
  tag_name: 'v2.0.5',
  name: '猫仙音乐 v2.0.5',
  body: fs.readFileSync('doc/release-notes-v2.0.5.md', 'utf8'),
  draft: false,
  prerelease: false
}), 'utf8')
console.log('release.json written')
