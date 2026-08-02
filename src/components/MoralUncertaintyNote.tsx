// Component to surface moral uncertainty in decisions

interface MoralUncertaintyNoteProps {
  uncertainties: string[]
}

export default function MoralUncertaintyNote({ uncertainties }: MoralUncertaintyNoteProps) {
  if (uncertainties.length === 0) return null

  return (
    <div style={{
      marginTop: '16px',
      padding: '14px',
      backgroundColor: 'rgba(168, 85, 247, 0.08)',
      borderLeft: '3px solid #a855f7',
      borderRadius: '6px'
    }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#a855f7',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        ⚠️ Moral Uncertainties
      </div>
      <div style={{
        fontSize: '12px',
        color: '#ddd',
        lineHeight: '1.6'
      }}>
        {uncertainties.map((uncertainty, idx) => (
          <div key={idx} style={{ marginBottom: idx < uncertainties.length - 1 ? '6px' : '0' }}>
            • {uncertainty}
          </div>
        ))}
      </div>
    </div>
  )
}
