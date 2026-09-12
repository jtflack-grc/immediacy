interface CreditsModalProps {
  onClose: () => void
}

export default function CreditsModal({ onClose }: CreditsModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        zIndex: 10000,
        display: 'grid',
        placeItems: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Method and credits"
        style={{
          width: 'min(720px, 100%)',
          maxHeight: '82vh',
          overflowY: 'auto',
          backgroundColor: '#0d1115',
          border: '1px solid #303841',
          borderRadius: '7px',
          padding: '24px',
          color: '#c9d1d9',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #20262d' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#f2f5f7' }}>Method & credits</h2>
            <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#8b949e' }}>
              IMMEDIACY · short-horizon disclosure war game
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 0, color: '#aeb7c0', fontSize: '22px', cursor: 'pointer', padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        <div style={{ paddingTop: '16px', fontSize: '13px', lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}>
            IMMEDIACY is an educational incident-disclosure simulator built to make incomplete facts, regulatory clocks, operational pressure, and disclosure debt visible at the same time. It is not legal advice, an incident-response playbook, or a prediction engine.
          </p>

          <section style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #20262d' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#f2f5f7' }}>Built by</h3>
            <div style={{ color: '#dfe5ea' }}>John Flack · Application builder & author</div>
            <div style={{ marginTop: '3px', fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', color: '#8b949e' }}>Version 0.1.0</div>
          </section>

          <section style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #20262d' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#f2f5f7' }}>Rendering & application stack</h3>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#aeb7c0' }}>
              <li>React + TypeScript + Vite</li>
              <li>CesiumJS for the interactive 3D Earth and geospatial overlays</li>
              <li>ArcGIS World Imagery and World Elevation services for terrain context</li>
              <li>Local GeoJSON and scenario data for jurisdiction, flow, hub, and event layers</li>
            </ul>
          </section>

          <section style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #20262d' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#f2f5f7' }}>Teaching basis</h3>
            <p style={{ margin: 0, color: '#aeb7c0' }}>
              Scenario framing draws on public incident disclosures, CISA and regulator guidance, SEC and breach-notice concepts, OWASP material, and FAIR-style quantitative risk thinking. Jurisdiction cards are teaching aids and should be verified against current primary law and counsel in real work.
            </p>
          </section>

          <section style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #20262d' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#f2f5f7' }}>Map semantics</h3>
            <p style={{ margin: 0, color: '#aeb7c0' }}>
              The globe is part of the simulation state. Country color reflects the selected posture/debt/enforcement view; arcs represent active cross-border or organizational flows; hubs represent operational nodes; rings mark time-bounded events. Clicking a jurisdiction with history opens its trajectory rather than a decorative map popup.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
