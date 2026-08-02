import { useState } from 'react'

interface SocAlertBannerProps {
  onAcknowledge: (name?: string) => void
}

/**
 * Cold-open alert shown immediately after the title card, replacing the old
 * TEMPO name-quiz intro. Drops the player straight into the incident with a
 * single acknowledgement, matching the "every second counts" premise.
 */
export default function SocAlertBanner({ onAcknowledge }: SocAlertBannerProps) {
  const [name, setName] = useState('')
  const [showNameField, setShowNameField] = useState(false)

  const handleAcknowledge = () => {
    onAcknowledge(name.trim() || undefined)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        zIndex: 19000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          width: '100%',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '14px',
          backgroundColor: 'rgba(20, 8, 8, 0.6)',
          boxShadow: '0 0 60px rgba(239, 68, 68, 0.12), 0 20px 60px rgba(0,0,0,0.6)',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
              animation: 'socAlertPulse 1.4s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#f87171',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            02:13 UTC — SOC ALERT
          </span>
        </div>

        <p
          style={{
            fontSize: '22px',
            lineHeight: 1.5,
            color: '#ffffff',
            fontWeight: 500,
            margin: '0 0 16px 0',
          }}
        >
          Identity monitoring detects impossible travel across three privileged accounts.
        </p>
        <p
          style={{
            fontSize: '22px',
            lineHeight: 1.5,
            color: '#ffffff',
            fontWeight: 500,
            margin: '0 0 32px 0',
          }}
        >
          Customer telemetry is beginning to fail.
        </p>

        {!showNameField ? (
          <button
            onClick={() => setShowNameField(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '12px',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '20px',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Set incident lead name (optional)
          </button>
        ) : (
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Incident Lead"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAcknowledge()
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 14px',
              marginBottom: '20px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        )}

        <button
          onClick={handleAcknowledge}
          style={{
            width: '100%',
            padding: '16px 24px',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(239, 68, 68, 0.45)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.35)'
          }}
        >
          Enter War Room
        </button>
      </div>

      <style>{`
        @keyframes socAlertPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}
