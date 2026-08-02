import { useState } from 'react'

export default function ValidationDisclaimer() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: isExpanded ? '16px' : '8px 12px',
      zIndex: 999,
      maxWidth: isExpanded ? '400px' : '200px',
      fontSize: '11px',
      color: '#aaa',
      transition: 'all 0.3s ease'
    }}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '11px',
            textDecoration: 'underline',
            padding: 0
          }}
        >
          About this simulator
        </button>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              Educational Model Disclaimer
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '16px',
                padding: 0,
                marginLeft: '12px'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.6', marginBottom: '8px' }}>
            This simulator is an <strong style={{ color: '#fff' }}>educational tool</strong> designed to illustrate how governance decisions can impact animal welfare outcomes. The model uses deterministic rules based on research-backed assumptions, but real-world outcomes are influenced by many factors not captured here.
          </div>
          <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.5', marginBottom: '8px' }}>
            <strong style={{ color: '#fff' }}>Key Assumptions:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              <li>Metrics are simplified representations</li>
              <li>Country impacts are modeled, not predicted</li>
              <li>Time horizons are compressed for simulation</li>
              <li>System dynamics are deterministic</li>
            </ul>
          </div>
          <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic', marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '8px' }}>
            This tool is for educational purposes only and should not be used as the sole basis for policy decisions. See the audit trail for full transparency of model assumptions.
          </div>
        </div>
      )}
    </div>
  )
}
