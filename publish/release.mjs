// 用 GitHub API 创建 Release 并上传构建产物。
//
// 用法（PowerShell）：
//   $env:GITHUB_TOKEN = "ghp_xxx"
//   node publish/release.mjs
//
// 可选环境变量：
//   TAG= v1.0.0（默认读 package.json 的 version）
//   REPO= MXhuanshu/MaoMusic
//   NOTES= doc/release-notes-v1.0.0.md

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = path.resolve(import.meta.dirname, '..')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

const token = process.env.GITHUB_TOKEN
const repo = process.env.REPO ?? 'MXhuanshu/MaoMusic'
const tag = process.env.TAG ?? `v${pkg.version}`
const notesPath = path.resolve(root, process.env.NOTES ?? `doc/release-notes-${tag}.md`)

if (!token) {
  console.error('缺少 GITHUB_TOKEN。请先设置：$env:GITHUB_TOKEN = "ghp_xxx"')
  process.exit(1)
}

if (!fs.existsSync(notesPath)) {
  console.error(`找不到发行说明：${notesPath}`)
  process.exit(1)
}

const body = fs.readFileSync(notesPath, 'utf8')

const assets = [
  `MaoMusic-${pkg.version}-x64-setup.exe`,
  `MaoMusic-${pkg.version}-x64-setup.exe.blockmap`,
  'latest.yml',
].map(name => path.join(root, 'build', name))

for (const file of assets) {
  if (!fs.existsSync(file)) {
    console.error(`缺少构建产物：${file}`)
    process.exit(1)
  }
}

const api = (url, options = {}) => fetch(`https://api.github.com${url}`, {
  ...options,
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'maomusic-release',
    ...options.headers,
  },
})

const createRelease = async () => {
  const resp = await api(`/repos/${repo}/releases`, {
    method: 'POST',
    body: JSON.stringify({
      tag_name: tag,
      target_commitish: 'main',
      name: `猫仙音乐 ${tag}`,
      body,
      draft: false,
      prerelease: false,
    }),
  })

  if (resp.ok) return await resp.json()

  const error = await resp.text()
  // 已存在同名 release 时直接复用
  if (resp.status === 422) {
    const existing = await api(`/repos/${repo}/releases/tags/${tag}`)
    if (existing.ok) return await existing.json()
  }
  throw new Error(`创建 Release 失败（${resp.status}）：${error}`)
}

const uploadAsset = async (release, file) => {
  const name = path.basename(file)
  const data = fs.readFileSync(file)
  const uploadUrl = release.upload_url.replace(/\{.*$/, '')

  // 先删掉同名资产，保证重复执行也能成功
  const old = (release.assets ?? []).find(asset => asset.name === name)
  if (old) await api(`/repos/${repo}/releases/assets/${old.id}`, { method: 'DELETE' })

  const resp = await fetch(`${uploadUrl}?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(data.length),
      'User-Agent': 'maomusic-release',
    },
    body: data,
  })

  if (!resp.ok) throw new Error(`上传 ${name} 失败（${resp.status}）：${await resp.text()}`)
  console.log(`已上传 ${name}`)
}

const release = await createRelease()
console.log(`Release 就绪：${release.html_url}`)
for (const file of assets) await uploadAsset(release, file)
console.log('全部完成。')
