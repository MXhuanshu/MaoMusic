// One-off codemod: Vite globals -> webpack equivalents inside src/renderer/folia-src.
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '../src/renderer/folia-src')
const visualizerDir = path.join(root, 'components/visualizer')

const listDirs = (dir, filter) => fs.readdirSync(dir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(name => fs.existsSync(path.join(dir, name, filter)))
  .sort()

const camel = name => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())

// ---- lyrics visualizer registry ----
const modeDirs = listDirs(visualizerDir, 'entry.tsx')
const modeImports = modeDirs.map(name => `import ${camel(name)}Entry from './${name}/entry'`).join('\n')
const modeMap = modeDirs.map(name => `  './${name}/entry.tsx': { default: ${camel(name)}Entry },`).join('\n')
const registryPath = path.join(visualizerDir, 'registry.tsx')
let registry = fs.readFileSync(registryPath, 'utf8')
registry = registry.replace(
  /const visualizerEntryModules = import\.meta\.glob<VisualizerEntryModule>\([^)]*\);/,
  `${modeImports}\n\nconst visualizerEntryModules: Record<string, VisualizerEntryModule> = {\n${modeMap}\n};`,
)
fs.writeFileSync(registryPath, registry)

// ---- backgrounds registry ----
const bgDir = path.join(visualizerDir, 'backgrounds')
const bgDirs = listDirs(bgDir, 'entry.tsx')
const bgImports = bgDirs.map(name => `import ${camel(name)}Background from './${name}/entry'`).join('\n')
const bgMap = bgDirs.map(name => `  './${name}/entry.tsx': { default: ${camel(name)}Background },`).join('\n')
const bgRegistryPath = path.join(bgDir, 'registry.tsx')
let bgRegistry = fs.readFileSync(bgRegistryPath, 'utf8')
bgRegistry = bgRegistry.replace(
  /const backgroundEntryModules = import\.meta\.glob<VisualizerBackgroundEntryModule>\([^)]*\);/,
  `${bgImports}\n\nconst backgroundEntryModules: Record<string, VisualizerBackgroundEntryModule> = {\n${bgMap}\n};`,
)
fs.writeFileSync(bgRegistryPath, bgRegistry)

// ---- tuning registry ----
const tuningDirs = listDirs(visualizerDir, 'tuning.ts')
const tuningImports = tuningDirs.map(name => `import ${camel(name)}Tuning from './${name}/tuning'`).join('\n')
const tuningMap = tuningDirs.map(name => `  './${name}/tuning.ts': { default: ${camel(name)}Tuning },`).join('\n')

const bgTuningDirs = listDirs(bgDir, 'tuning.ts')
const bgTuningImports = bgTuningDirs.map(name => `import ${camel(name)}BgTuning from './backgrounds/${name}/tuning'`).join('\n')
const bgTuningMap = bgTuningDirs.map(name => `  './backgrounds/${name}/tuning.ts': { default: ${camel(name)}BgTuning },`).join('\n')

const tuningPath = path.join(visualizerDir, 'tuningRegistry.ts')
let tuning = fs.readFileSync(tuningPath, 'utf8')
tuning = tuning.replace(
  /const tuningModules = import\.meta\.glob<VisualizerTuningModule>\([^)]*\);/,
  `${tuningImports}\n\nconst tuningModules: Record<string, VisualizerTuningModule> = {\n${tuningMap}\n};`,
)
tuning = tuning.replace(
  /const backgroundTuningModules = import\.meta\.glob<\{ default: BackgroundTuningDefinition \}>\([^)]*\);/,
  `${bgTuningImports}\n\nconst backgroundTuningModules: Record<string, { default: BackgroundTuningDefinition }> = {\n${bgTuningMap}\n};`,
)
tuning = tuning.replace(
  /const backgroundSettingsModules = import\.meta\.glob<\{ default: BackgroundSettingsSlice \}>\([^)]*\);/,
  `import urlBgSettings from './backgrounds/url/settings'\n\nconst backgroundSettingsModules: Record<string, { default: BackgroundSettingsSlice }> = {\n  './backgrounds/url/settings.ts': { default: urlBgSettings },\n};`,
)
fs.writeFileSync(tuningPath, tuning)

// ---- cappella images ----
const avatarPath = path.join(visualizerDir, 'cappella/avatarImages.ts')
let avatar = fs.readFileSync(avatarPath, 'utf8')
avatar = avatar.replace(
  /const avatarModules = import\.meta\.glob<\{ default: string \}>\(\s*'\.\/avatar\/\{png,jpg,jpeg,gif,webp,svg\}',\s*\{ eager: true \},?\s*\);/,
  `const avatarContext = require.context('./avatar', false, /\\.(png|jpe?g|gif|webp|svg)$/)\nconst avatarModules: Record<string, { default: string }> = Object.fromEntries(\n    avatarContext.keys().map(key => [key, { default: avatarContext(key) as unknown as string }]),\n);`,
)
fs.writeFileSync(avatarPath, avatar)

const emoPath = path.join(visualizerDir, 'cappella/emoImages.ts')
let emo = fs.readFileSync(emoPath, 'utf8')
emo = emo.replace(
  /const emoModules = import\.meta\.glob<\{ default: string \}>\(\s*'\.\/emo\/\{png,jpg,jpeg,gif,webp,svg\}',\s*\{ eager: true \},?\s*\);/,
  `const emoContext = require.context('./emo', false, /\\.(png|jpe?g|gif|webp|svg)$/)\nconst emoModules: Record<string, { default: string }> = Object.fromEntries(\n    emoContext.keys().map(key => [key, { default: emoContext(key) as unknown as string }]),\n);`,
)
fs.writeFileSync(emoPath, emo)

// ---- import.meta.env ----
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      let text = fs.readFileSync(full, 'utf8')
      if (text.includes('import.meta.env')) {
        text = text.replace(/import\.meta\.env\.[A-Z_]+/g, 'false')
        fs.writeFileSync(full, text)
      }
    }
  }
}
walk(root)

console.log('modes', modeDirs.length, 'backgrounds', bgDirs.length, 'tunings', tuningDirs.length)
