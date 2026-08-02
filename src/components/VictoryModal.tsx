import { VictoryCondition } from '../utils/victoryConditions'

interface VictoryModalProps {
  victory: VictoryCondition
  onClose: () => void
}

export default function VictoryModal({ victory, onClose }: VictoryModalProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.98)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '16px',
        border: `2px solid ${victory.color}`,
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '40px',
        boxShadow: `0 8px 32px ${victory.color}40`,
        textAlign: 'center'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          fontSize: '48px',
          fontWeight: 700,
          color: victory.color,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {victory.name}
        </div>
        
        <div style={{
          fontSize: '18px',
          color: '#ddd',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          {victory.description}
        </div>

        <div style={{
          padding: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '16px',
            color: '#fff',
            lineHeight: '1.8'
          }}>
            {victory.message}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: 600,
            backgroundColor: victory.color,
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Continue to Post-Mortem
        </button>
      </div>
    </div>
  )
}
