/**
 * Bulk rename non-inverted metric keys across src/.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = join(process.cwd(), 'src')

const pairs = [
  ['productionEfficiency', 'operationalControl'],
  ['costPerUnit', 'financialBurn'],
  ['welfareIncidentRate', 'serviceDisruption'],
  ['welfareStandardAdoption', 'disclosurePosture'],
  ['welfareDebt', 'disclosureDebt'],
  ['enforcementGap', 'regulatoryExposure'],
  ['systemIrreversibility', 'commitmentLock'],
  ['welfare_collapse', 'containment_collapse'],
  ["mode === 'enforcement'", "mode === 'regulatoryExposure'"],
  ["mode === 'welfareStandards'", "mode === 'disclosurePosture'"],
  ["mode === 'welfareDebt'", "mode === 'disclosureDebt'"],
  ["'welfareStandards'", "'disclosurePosture'"],
  ["'welfareDebt'", "'disclosureDebt'"],
  ["'enforcement'", "'regulatoryExposure'"],
]

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, files)
    else if (/\.(ts|tsx)$/.test(name)) files.push(p)
  }
  return files
}

let changed = 0
for (const file of walk(root)) {
  // Skip scenarioTypes — already rewritten
  if (file.endsWith('scenarioTypes.ts')) continue
  let text = readFileSync(file, 'utf8')
  const orig = text
  for (const [from, to] of pairs) {
    text = text.split(from).join(to)
  }
  if (text !== orig) {
    writeFileSync(file, text)
    changed++
    console.log('updated', file.replace(process.cwd(), ''))
  }
}
console.log('files changed:', changed)
