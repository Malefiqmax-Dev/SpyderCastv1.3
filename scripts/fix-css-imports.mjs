import fs from "fs"
import path from "path"

const root = path.resolve(import.meta.dirname, "..")

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkDir(full, files)
    else if (entry.name.endsWith(".tsx")) files.push(full)
  }
  return files
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8")
  const styleImportMatch = content.match(/^import styles from "\.\/[^"]+\.module\.css"\n/gm)
  if (!styleImportMatch) return false

  const styleImports = [...new Set(styleImportMatch.map((line) => line.trim()))]
  let cleaned = content.replace(/^import styles from "\.\/[^"]+\.module\.css"\n/gm, "")

  const isUi = filePath.includes(`${path.sep}components${path.sep}ui${path.sep}`)
  if (isUi) {
    fs.writeFileSync(filePath, cleaned)
    return true
  }

  const cssPath = path.join(
    path.dirname(filePath),
    `${path.basename(filePath, ".tsx")}.module.css`
  )
  const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : ""
  const hasCustomCss = cssContent.replace(/\.root\s*\{\s*\}/, "").trim().length > 0

  if (!hasCustomCss) {
    fs.writeFileSync(filePath, cleaned)
    return true
  }

  const styleImport = styleImports[0] + "\n"
  const useClient = cleaned.match(/^"use client";\?\n|^"use client"\n/)
  const importBlockEnd = [...cleaned.matchAll(/^import .+$/gm)].pop()

  if (importBlockEnd) {
    const insertAt = cleaned.indexOf("\n", importBlockEnd.index) + 1
    cleaned = cleaned.slice(0, insertAt) + styleImport + cleaned.slice(insertAt)
  } else if (cleaned.startsWith('"use client"')) {
    cleaned = cleaned.replace(/^("use client";?\n)/, `$1${styleImport}`)
  } else {
    cleaned = styleImport + cleaned
  }

  fs.writeFileSync(filePath, cleaned)
  return true
}

let fixed = 0
for (const file of walkDir(root)) {
  if (fixFile(file)) fixed++
}
console.log(`Fixed ${fixed} files.`)
