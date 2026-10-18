// 更新检查：直接读猫仙音乐自己的 GitHub Releases。
// 不再依赖任何 LX Music 的版本接口，避免把用户更新回旧项目。

import { httpGet } from './request'

const REPO = 'MXhuanshu/MaoMusic'
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=20`
// API 被限流或不可达时的兜底，文件随源码发布在 main 分支
const FALLBACK_URLS = [
  `https://raw.githubusercontent.com/${REPO}/main/publish/version.json`,
  `https://cdn.jsdelivr.net/gh/${REPO}@main/publish/version.json`,
]

export interface VersionHistory {
  version: string
  desc?: string
}

export interface VersionInfo {
  version: string
  desc: string
  history?: VersionHistory[]
}

const request = async(url: string, retryNum = 0): Promise<any> => {
  return await new Promise((resolve, reject) => {
    httpGet(url, {
      timeout: 10000,
      headers: {
        Accept: 'application/vnd.github+json',
      },
    }, (err: any, resp: any, body: any) => {
      if (err || resp.statusCode != 200) {
        if (++retryNum >= 3) reject(err ?? new Error(resp?.statusMessage ?? String(resp?.statusCode)))
        else void request(url, retryNum).then(resolve).catch(reject)
      } else resolve(body)
    })
  })
}

const stripVersionPrefix = (tag: string) => tag.replace(/^v/i, '').trim()

const fromGithubReleases = async(): Promise<VersionInfo> => {
  const releases = await request(RELEASES_API) as Array<{
    tag_name?: string
    body?: string
    draft?: boolean
    prerelease?: boolean
  }>

  const list = (Array.isArray(releases) ? releases : [])
    .filter(item => item.tag_name && !item.draft)
    .map(item => ({
      version: stripVersionPrefix(item.tag_name!),
      desc: item.body ?? '',
    }))
    .filter(item => /^\d+(\.\d+)*/.test(item.version))

  if (!list.length) throw new Error('empty release list')

  return {
    version: list[0].version,
    desc: list[0].desc,
    history: list,
  }
}

const fromFallbackFile = async(): Promise<VersionInfo> => {
  let lastError: unknown
  for (const url of FALLBACK_URLS) {
    try {
      const info = await request(url) as VersionInfo
      if (info?.version) return info
    } catch (err) {
      lastError = err
    }
  }
  throw lastError ?? new Error('failed')
}

export const getVersionInfo = async(): Promise<VersionInfo> => {
  return await fromGithubReleases().catch(async() => await fromFallbackFile())
}
