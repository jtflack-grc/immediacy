/**
 * One-shot migrate scenario.v1.json metric keys → incident-native v2 keys.
 * Inverts polarity for factsConfidence / narrativeIntegrity.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = join(__dirname, '..', 'public', 'scenario.v1.json')

const MEASURED = {
  productionEfficiency: 'operationalControl',
  costPerUnit: 'financialBurn',
  welfareIncidentRate: 'serviceDisruption',
  welfareStandardAdoption: 'disclosurePosture',
}

const UNMEASURED_SAME = {
  welfareDebt: 'disclosureDebt',
  enforcementGap: 'regulatoryExposure',
  systemIrreversibility: 'commitmentLock',
}

/** Old higher-worse → new higher-better: invert delta signs and absolute values */
const UNMEASURED_INVERT = {
  sentienceKnowledgeGap: 'factsConfidence',
  regulatoryCapture: 'narrativeIntegrity',
}

function migrateMetricsBlock(metrics) {
  if (!metrics) return metrics
  const out = { measured: {}, unmeasured: {} }

  if (metrics.measured) {
    for (const [k, v] of Object.entries(metrics.measured)) {
      const nk = MEASURED[k] || k
      out.measured[nk] = v
    }
  }
  if (metrics.unmeasured) {
    for (const [k, v] of Object.entries(metrics.unmeasured)) {
      if (UNMEASURED_INVERT[k]) {
        out.unmeasured[UNMEASURED_INVERT[k]] = typeof v === 'number' ? -v : v
      } else {
        const nk = UNMEASURED_SAME[k] || k
        out.unmeasured[nk] = v
      }
    }
  }
  return out
}

function walk(obj) {
  if (Array.isArray(obj)) return obj.map(walk)
  if (obj && typeof obj === 'object') {
    const next = {}
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'metrics' && v && (v.measured || v.unmeasured)) {
        next[k] = migrateMetricsBlock(v)
      } else if (k === 'quality') {
        // drop grading
        continue
      } else {
        next[k] = walk(v)
      }
    }
    return next
  }
  return obj
}

const raw = JSON.parse(readFileSync(path, 'utf8'))
const migrated = walk(raw)
migrated.version = '2.0.0'
writeFileSync(path, JSON.stringify(migrated, null, 2) + '\n')
console.log('Migrated', path, '→ version', migrated.version)
