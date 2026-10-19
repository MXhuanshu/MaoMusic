const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '../src/renderer/folia-src/components/visualizer')

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name)
  return e.isDirectory() ? walk(p) : [p]
})

const files = walk(base).filter(f => f.endsWith(path.join('entry.tsx')))
// `React.lazy(() => import('./X'))` —— 打包成 Electron 后 file:// 下异步 chunk 常常加载不到，
// Suspense 的 fallback 是 null，结果就是整个舞台什么都不显示。
const rxp = /const\s+(\w+)\s*=\s*React\.lazy\(\(\)\s*=>\s*import\((['"])([^'"]+)\2\)\);?/g

let changed = 0
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  let out = src
  let m
  rxp.lastIndex = 0
  while ((m = rxp.exec(src)) !== null) {
    const [, name, , spec] = m
    out = out.replace(m[0], `import ${name} from ${m[2]}${spec}${m[2]};`)
  }
  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8')
    changed++
    console.log('eager:', path.relative(base, file))
  }
}
console.log(`done, ${changed}/${files.length} entry files rewritten`)
