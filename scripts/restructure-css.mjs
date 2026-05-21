import fs from "fs"
import path from "path"

const root = path.resolve(import.meta.dirname, "..")

const componentMoves = {
  "components/footer.tsx": "components/layout/footer.tsx",
  "components/premium-navbar.tsx": "components/layout/premium-navbar.tsx",
  "components/navbar.tsx": "components/layout/navbar.tsx",
  "components/providers.tsx": "components/layout/providers.tsx",
  "components/theme-provider.tsx": "components/layout/theme-provider.tsx",
  "components/auth-modal.tsx": "components/auth/auth-modal.tsx",
  "components/profile-settings-modal.tsx": "components/auth/profile-settings-modal.tsx",
  "lib/auth-context.tsx": "components/auth/auth-context.tsx",
  "components/media-card.tsx": "components/media/media-card.tsx",
  "components/media-row.tsx": "components/media/media-row.tsx",
  "components/hero-banner.tsx": "components/media/hero-banner.tsx",
  "components/top-10.tsx": "components/media/top-10.tsx",
  "components/movies-client.tsx": "components/media/movies-client.tsx",
  "components/series-client.tsx": "components/media/series-client.tsx",
  "components/player-modal.tsx": "components/player/player-modal.tsx",
  "components/sport-player-modal.tsx": "components/player/sport-player-modal.tsx",
  "components/vidfast-player.tsx": "components/player/vidfast-player.tsx",
  "components/robust-iframe-player.tsx": "components/player/robust-iframe-player.tsx",
  "components/smartlink-popup.tsx": "components/player/smartlink-popup.tsx",
  "components/search-results-dropdown.tsx": "components/search/search-results-dropdown.tsx",
  "components/turnstile-captcha.tsx": "components/captcha/turnstile-captcha.tsx",
}

const importReplacements = [
  ['@/components/footer', '@/components/layout/footer'],
  ['@/components/premium-navbar', '@/components/layout/premium-navbar'],
  ['@/components/navbar', '@/components/layout/navbar'],
  ['@/components/providers', '@/components/layout/providers'],
  ['@/components/theme-provider', '@/components/layout/theme-provider'],
  ['@/components/auth-modal', '@/components/auth/auth-modal'],
  ['@/components/profile-settings-modal', '@/components/auth/profile-settings-modal'],
  ['@/lib/auth-context', '@/components/auth/auth-context'],
  ['@/components/media-card', '@/components/media/media-card'],
  ['@/components/media-row', '@/components/media/media-row'],
  ['@/components/hero-banner', '@/components/media/hero-banner'],
  ['@/components/top-10', '@/components/media/top-10'],
  ['@/components/movies-client', '@/components/media/movies-client'],
  ['@/components/series-client', '@/components/media/series-client'],
  ['@/components/player-modal', '@/components/player/player-modal'],
  ['@/components/sport-player-modal', '@/components/player/sport-player-modal'],
  ['@/components/smartlink-popup', '@/components/player/smartlink-popup'],
  ['@/components/search-results-dropdown', '@/components/search/search-results-dropdown'],
  ['@/components/turnstile-captcha', '@/components/captcha/turnstile-captcha'],
  ['@/components/vidfast-player', '@/components/player/vidfast-player'],
  ['@/components/robust-iframe-player', '@/components/player/robust-iframe-player'],
  ['from "./turnstile-captcha"', 'from "@/components/captcha/turnstile-captcha"'],
  ['from "./robust-iframe-player"', 'from "./robust-iframe-player"'],
  ['import("./vidfast-player")', 'import("./vidfast-player")'],
  ['from "./media-card"', 'from "./media-card"'],
]

const cssOverrides = {
  "components/media/media-row.module.css": `.scrollTrack {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollTrack::-webkit-scrollbar {
  display: none;
}
`,
  "components/media/top-10.module.css": `.scrollTrack {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollTrack::-webkit-scrollbar {
  display: none;
}

.rankNumber {
  font-size: 140px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.6);
}
`,
  "components/captcha/turnstile-captcha.module.css": `.container {
  min-height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
}
`,
  "components/player/player-modal.module.css": `/* Surcharges Plyr scoped au modal */
.root :global(.plyr) {
  width: 100%;
  height: 100%;
}
`,
  "app/layout.module.css": `.body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
`,
  "app/page.module.css": `.main {
  min-height: 100vh;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-bottom: 5rem;
  padding-top: 1rem;
}
`,
}

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkDir(full, files)
    else if (/\.(tsx|ts|mjs|jsx|js)$/.test(entry.name)) files.push(full)
  }
  return files
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function moveComponents() {
  for (const [from, to] of Object.entries(componentMoves)) {
    const fromPath = path.join(root, from)
    const toPath = path.join(root, to)
    if (!fs.existsSync(fromPath)) continue
    ensureDir(toPath)
    fs.renameSync(fromPath, toPath)
    console.log(`Moved ${from} -> ${to}`)
  }
}

function replaceImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8")
  let changed = false
  for (const [from, to] of importReplacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to)
      changed = true
    }
  }
  if (changed) fs.writeFileSync(filePath, content)
}

function replaceImportsEverywhere() {
  const files = walkDir(root).filter((f) => !f.includes("scripts\\restructure-css.mjs"))
  for (const file of files) replaceImportsInFile(file)
}

function defaultCssContent(relativePath) {
  if (cssOverrides[relativePath.replace(/\\/g, "/")]) {
    return `.root {}\n\n${cssOverrides[relativePath.replace(/\\/g, "/")]}`
  }
  return ".root {}\n"
}

function createCssModuleForTsx(tsxPath) {
  const dir = path.dirname(tsxPath)
  const base = path.basename(tsxPath, path.extname(tsxPath))
  const cssPath = path.join(dir, `${base}.module.css`)
  const relative = path.relative(root, cssPath).replace(/\\/g, "/")

  if (!fs.existsSync(cssPath)) {
    fs.writeFileSync(cssPath, defaultCssContent(relative))
  }

  let content = fs.readFileSync(tsxPath, "utf8")
  const importLine = `import styles from "./${base}.module.css"\n`

  if (content.includes(".module.css")) return

  const useClientMatch = content.match(/^"use client"\s*\n/m)
  const lastImportIndex = [...content.matchAll(/^import .+$/gm)].pop()?.index

  if (lastImportIndex !== undefined) {
    const insertAt = content.indexOf("\n", lastImportIndex) + 1
    content = content.slice(0, insertAt) + importLine + content.slice(insertAt)
  } else if (useClientMatch) {
    content = content.replace(/^"use client"\s*\n/m, `$&${importLine}`)
  } else {
    content = importLine + content
  }

  fs.writeFileSync(tsxPath, content)
}

function processAllTsx() {
  const files = walkDir(root).filter((f) => f.endsWith(".tsx") && !f.includes("node_modules"))
  for (const file of files) createCssModuleForTsx(file)
}

function cleanupGlobals() {
  const globalsPath = path.join(root, "app", "globals.css")
  let globals = fs.readFileSync(globalsPath, "utf8")

  globals = globals.replace(/\n@layer utilities \{[\s\S]*?\}\n?/, "\n")
  globals = globals.replace(
    "@theme inline {",
    `@theme inline {
  --font-sans: var(--font-inter), 'Inter Fallback', system-ui, sans-serif;
  --font-display: var(--font-space-grotesk), 'Space Grotesk Fallback', system-ui, sans-serif;`
  )
  globals = globals.replace(
    "  --font-sans: 'Inter', 'Inter Fallback', system-ui, sans-serif;\n  --font-display: 'Space Grotesk', 'Space Grotesk Fallback', system-ui, sans-serif;\n",
    ""
  )

  fs.writeFileSync(globalsPath, globals)

  const orphanGlobals = path.join(root, "styles", "globals.css")
  if (fs.existsSync(orphanGlobals)) {
    fs.unlinkSync(orphanGlobals)
    console.log("Removed duplicate styles/globals.css")
  }

  const stylesDir = path.join(root, "styles")
  if (fs.existsSync(stylesDir) && fs.readdirSync(stylesDir).length === 0) {
    fs.rmdirSync(stylesDir)
  }
}

moveComponents()
replaceImportsEverywhere()
processAllTsx()
cleanupGlobals()
console.log("Restructure complete.")
