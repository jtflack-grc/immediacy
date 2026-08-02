import { State } from '../engine/scenarioTypes'
import { GreatPerson as GreatPersonData } from '../utils/greatPeople'

interface GreatPersonModalProps {
  person: GreatPersonData
  state: State
  onClose: () => void
}

export default function GreatPersonModal({ person, state, onClose }: GreatPersonModalProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0 }}>
            Great Person Unlocked
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start'
        }}>
          {person.icon && (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
            }}>
              <img 
                src={person.icon} 
                alt={person.title}
                loading="lazy"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  filter: 'brightness(1.05) contrast(1.1)'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: '0 0 12px 0' }}>
              {person.title}
            </h3>
            {person.quote && (
              <div style={{
                fontSize: '14px',
                color: '#aaa',
                fontStyle: 'italic',
                marginBottom: '16px',
                paddingLeft: '16px',
                borderLeft: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                "{person.quote}"
              </div>
            )}
            <div style={{ fontSize: '16px', color: '#ddd', lineHeight: '1.6' }}>
              {person.description}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '0 0 12px 0' }}>
            Effect Applied:
          </h4>
          <div style={{ fontSize: '14px', color: '#bbb', lineHeight: '1.6' }}>
            {person.effect.metrics?.measured && (
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#fff' }}>Measured Metrics:</strong>
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  {Object.entries(person.effect.metrics.measured).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '4px' }}>
                      {key}: {value > 0 ? '+' : ''}{value.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {person.effect.metrics?.unmeasured && (
              <div>
                <strong style={{ color: '#fff' }}>Unmeasured Metrics:</strong>
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  {Object.entries(person.effect.metrics.unmeasured).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '4px' }}>
                      {key}: {value > 0 ? '+' : ''}{value.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 600,
            backgroundColor: '#111111',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111111'}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
