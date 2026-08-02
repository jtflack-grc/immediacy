// Utility to calculate predicted metric changes from a delta

import { Delta, State } from '../engine/scenarioTypes'

export interface ImpactPreview {
  measured: Array<{ metric: string; change: number; direction: 'up' | 'down' | 'neutral' }>
  unmeasured: Array<{ metric: string; change: number; direction: 'up' | 'down' | 'neutral' }>
  summary: string
}

export function calculateImpactPreview(_state: State, delta: Delta): ImpactPreview {
  const measured: ImpactPreview['measured'] = []
  const unmeasured: ImpactPreview['unmeasured'] = []

  if (delta.metrics?.measured) {
    Object.entries(delta.metrics.measured).forEach(([key, value]) => {
      if (value !== undefined && value !== 0) {
        const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'
        measured.push({
          metric: key,
          change: Math.abs(value),
          direction
        })
      }
    })
  }

  if (delta.metrics?.unmeasured) {
    Object.entries(delta.metrics.unmeasured).forEach(([key, value]) => {
      if (value !== undefined && value !== 0) {
        // For unmeasured metrics, most increases are bad (except negative changes)
        const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'
        unmeasured.push({
          metric: key,
          change: Math.abs(value),
          direction
        })
      }
    })
  }

  // Generate summary
  const measuredChanges = measured.map(m => {
    const sign = m.direction === 'up' ? '+' : '-'
    const metricName = m.metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    return `${sign}${(m.change * 100).toFixed(0)}% ${metricName}`
  })

  const unmeasuredChanges = unmeasured.map(m => {
    const sign = m.direction === 'up' ? '+' : '-'
    const metricName = m.metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    return `${sign}${(m.change * 100).toFixed(0)}% ${metricName}`
  })

  const summary = [...measuredChanges, ...unmeasuredChanges].join(', ') || 'No significant changes'

  return { measured, unmeasured, summary }
}
