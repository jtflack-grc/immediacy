import { useState } from 'react'
import { INCIDENT_CONDITIONS } from '../utils/scenarioVariations'

interface StartingConditionSelectorProps {
  initialConditions: string[]
  onApply: (conditions: string[]) => void
  onClose: () => void
}

export default function StartingConditionSelector({ initialConditions, onApply, onClose }: StartingConditionSelectorProps) {
  const [selected, setSelected] = useState<string[]>(initialConditions.length > 0 ? initialConditions : ['standard'])

  const toggleCondition = (id: string) => {
    setSelected(prev => {
      if (id === 'standard') return ['standard']
      const withoutStandard = prev.filter(c => c !== 'standard')
      if (withoutStandard.includes(id)) {
        const next = withoutStandard.filter(c => c !== id)
        return next.length > 0 ? next : ['standard']
      }
      return [...withoutStandard, id]
    })
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '28px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Scenario Conditions
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '22px',
              cursor: 'pointer',
              padding: 0,
              width: '28px',
              height: '28px',
              opacity: 0.7
            }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: '13px', color: '#999', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          Optional flags that adjust starting conditions to reflect a specific incident scenario. Applying will restart the run.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {INCIDENT_CONDITIONS.map((condition) => {
            const isSelected = selected.includes(condition.id)
            return (
              <label
                key={condition.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  backgroundColor: isSelected ? 'rgba(96, 165, 250, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? 'rgba(96, 165, 250, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCondition(condition.id)}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                    {condition.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', lineHeight: 1.4 }}>
                    {condition.description}
                  </div>
                </div>
              </label>
            )
          })}
        </div>

        <button
          onClick={() => onApply(selected)}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#60a5fa',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Apply &amp; Restart
        </button>
      </div>
    </div>
  )
}
