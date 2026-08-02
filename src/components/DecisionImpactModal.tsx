import { useEffect } from 'react'
import { Delta, State } from '../engine/scenarioTypes'

interface DecisionImpactModalProps {
  isOpen: boolean
  onClose: () => void
  choiceLabel: string
  nodeTitle: string
  delta: Delta
  previousState: State
  currentState: State
  citations?: string[]
}

export default function DecisionImpactModal({
  isOpen,
  onClose,
  choiceLabel,
  nodeTitle,
  delta,
  previousState,
  currentState,
  citations = []
}: DecisionImpactModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 8000) // Auto-close after 8 seconds
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    // Ensure modal is completely removed from DOM
    return null
  }

  // Calculate metric changes
  const metricChanges: Array<{ name: string; before: number; after: number; delta: number }> = []
  
  if (delta.metrics?.measured) {
    Object.entries(delta.metrics.measured).forEach(([key, value]) => {
      const before = previousState.metrics.measured[key as keyof typeof previousState.metrics.measured] || 0
      const after = currentState.metrics.measured[key as keyof typeof currentState.metrics.measured] || 0
      metricChanges.push({
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        before,
        after,
        delta: after - before
      })
    })
  }

  if (delta.metrics?.unmeasured) {
    Object.entries(delta.metrics.unmeasured).forEach(([key, value]) => {
      const before = previousState.metrics.unmeasured[key as keyof typeof previousState.metrics.unmeasured] || 0
      const after = currentState.metrics.unmeasured[key as keyof typeof currentState.metrics.unmeasured] || 0
      metricChanges.push({
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        before,
        after,
        delta: after - before
      })
    })
  }

  // Calculate country changes
  const countryChanges: Array<{ iso3: string; name: string; before: number; after: number; delta: number }> = []
  if (delta.map?.regionValues) {
    Object.entries(delta.map.regionValues).forEach(([iso3, adjustment]) => {
      const before = previousState.map.regionValues[iso3] || 0
      const after = currentState.map.regionValues[iso3] || 0
      // Get country name (simplified - you might want to import a mapping)
      const countryNames: Record<string, string> = {
        'USA': 'United States',
        'GBR': 'United Kingdom',
        'FRA': 'France',
        'DEU': 'Germany',
        'CHN': 'China',
        'IND': 'India',
        'BRA': 'Brazil',
        'ZAF': 'South Africa',
        'AUS': 'Australia',
        'CAN': 'Canada',
        'MEX': 'Mexico'
      }
      countryChanges.push({
        iso3,
        name: countryNames[iso3] || iso3,
        before,
        after,
        delta: adjustment
      })
    })
  }

  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`
  const formatDelta = (delta: number) => {
    const sign = delta >= 0 ? '+' : ''
    return `${sign}${(delta * 100).toFixed(1)}%`
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#000000',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              Decision Impact: {choiceLabel}
            </h3>
            <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
              {nodeTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#111111', borderRadius: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
            Because you chose "{choiceLabel}", the following changes were applied:
          </div>

          {metricChanges.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                Metrics
              </div>
              {metricChanges.map((change, idx) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '12px', color: '#ccc' }}>
                  <span style={{ fontWeight: 500 }}>{change.name}:</span>{' '}
                  <span style={{ color: '#888' }}>{formatPercent(change.before)}</span>
                  {' → '}
                  <span style={{ color: change.delta >= 0 ? '#4ade80' : '#ef4444', fontWeight: 500 }}>
                    {formatPercent(change.after)}
                  </span>
                  {' '}
                  <span style={{ color: change.delta >= 0 ? '#4ade80' : '#ef4444' }}>
                    ({formatDelta(change.delta)})
                  </span>
                </div>
              ))}
            </div>
          )}

          {countryChanges.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                Regional Impact
              </div>
              {countryChanges.map((change, idx) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '12px', color: '#ccc' }}>
                  <span style={{ fontWeight: 500 }}>{change.name}:</span>{' '}
                  <span style={{ color: '#888' }}>{formatPercent(change.before)}</span>
                  {' → '}
                  <span style={{ color: change.delta >= 0 ? '#4ade80' : '#ef4444', fontWeight: 500 }}>
                    {formatPercent(change.after)}
                  </span>
                  {' '}
                  <span style={{ color: change.delta >= 0 ? '#4ade80' : '#ef4444' }}>
                    ({formatDelta(change.delta)})
                  </span>
                </div>
              ))}
            </div>
          )}

          {(delta.map?.activateArcs?.length || delta.map?.spawnRings?.length) > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                Global Events Triggered
              </div>
              {delta.map?.activateArcs?.length > 0 && (
                <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '4px' }}>
                  • {delta.map.activateArcs.length} supply chain flow(s) activated
                </div>
              )}
              {delta.map?.spawnRings?.length > 0 && (
                <div style={{ fontSize: '12px', color: '#ccc' }}>
                  • {delta.map.spawnRings.length} event(s) spawned on globe
                </div>
              )}
            </div>
          )}
        </div>

        {citations.length > 0 && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#111111', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px' }}>
              Research References:
            </div>
            {citations.map((citation, idx) => (
              <div key={idx} style={{ fontSize: '11px', color: '#60a5fa', marginBottom: '4px' }}>
                <a href={citation} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                  {citation}
                </a>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '16px', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
          This impact breakdown is based on the scenario's deterministic model. See the audit trail for full details.
        </div>
      </div>
    </div>
  )
}
