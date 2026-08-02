interface CreditsModalProps {
  onClose: () => void
}

export default function CreditsModal({ onClose }: CreditsModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
          padding: '32px',
          maxWidth: '700px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0 }}>
            Credits & Acknowledgments
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '28px',
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

        <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.8' }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              IMMEDIACY — Every Second Counts
            </h3>
            <p style={{ marginBottom: '8px' }}>
              A short-horizon disclosure war game: seat-of-the-pants decisions under time pressure, where silence is a choice.
            </p>
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p style={{ marginBottom: '8px', fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                Created and Developed By:
              </p>
              <p style={{ marginBottom: '4px', fontSize: '14px', color: '#60a5fa', fontWeight: 500 }}>
                John Flack
              </p>
              <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                Application Builder & Author
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', marginTop: '16px' }}>
              Version 1.0.0
            </p>
          </div>

          <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Technologies & Libraries
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
              <li><strong>React</strong> - UI framework</li>
              <li><strong>react-globe.gl</strong> - 3D globe visualization</li>
              <li><strong>Three.js</strong> - 3D graphics rendering</li>
              <li><strong>Vite</strong> - Build tool and dev server</li>
              <li><strong>TypeScript</strong> - Type-safe JavaScript</li>
            </ul>
          </div>

          <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Data Sources & Research
            </h3>
            <p style={{ marginBottom: '12px' }}>
              Shell mechanics ported from Inheritance. Disclosure framing draws on:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc', marginBottom: '12px' }}>
              <li>FAIR / quantitative risk framing for short-horizon impact</li>
              <li>Public incident disclosure case studies and near-misses</li>
              <li>OWASP and security teaching material for globe cards (in progress)</li>
              <li>SEC / regulatory disclosure norms as scenario pressure</li>
            </ul>
            <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
              Advisor and metric citations will be retargeted as the Immediacy scenario lands.
            </p>
          </div>

          <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Geographic Data
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
              <li>World GeoJSON data for country boundaries</li>
              <li>Jurisdiction / stakeholder overlays (being retargeted for disclosure pressure)</li>
            </ul>
          </div>

          <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Educational Purpose
            </h3>
            <p style={{ marginBottom: '8px' }}>
              This simulator is designed for educational purposes to help users understand:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
              <li>The complexity of animal welfare governance decisions</li>
              <li>Trade-offs between different policy approaches</li>
              <li>How decisions can have cascading effects on welfare outcomes</li>
              <li>The importance of enforcement, transparency, and evidence-based policy</li>
            </ul>
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
              This tool should not be used as the sole basis for policy decisions. Real-world outcomes are influenced by many factors not captured in this simplified model.
            </p>
          </div>

          <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Acknowledgments
            </h3>
            <p style={{ marginBottom: '8px' }}>
              Special thanks to the researchers, organizations, and advocates working to improve animal welfare worldwide. This tool aims to make their insights more accessible and actionable.
            </p>
            <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', marginTop: '16px' }}>
              For questions, feedback, or to report issues, please refer to the validation disclaimer in the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
