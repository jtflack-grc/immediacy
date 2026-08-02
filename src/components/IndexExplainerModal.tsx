import { useState } from 'react'

interface IndexExplainerModalProps {
  type: 'success' | 'debt'
  onClose: () => void
}

export default function IndexExplainerModal({ type, onClose }: IndexExplainerModalProps) {
  const isSuccess = type === 'success'
  
  const title = isSuccess ? 'Measured Control Index' : 'Disclosure Debt Index'
  const description = isSuccess 
    ? 'The Measured Control Index combines operational control, disclosure posture, response burn, and exposure severity into a single war-room score.'
    : 'The Disclosure Debt Index tracks hidden costs: regulatory clock lag, narrative capture, facts gap, commitment lock, and disclosure debt that compound under time pressure.'
  
  const components = isSuccess
    ? [
        { name: 'Operational Control', desc: 'Containment strength — segmentation, identity lock-down, evidence integrity' },
        { name: 'Disclosure Posture', desc: 'Maturity of timed notice, fairness, and facts packages' },
        { name: 'Response Burn', desc: 'Cash and attention cost of IR, counsel, downtime, monitoring' },
        { name: 'Exposure Severity', desc: 'How bad the underlying event looks — lower is better' }
      ]
    : [
        { name: 'Disclosure Debt', desc: 'Accumulated cost of silence, drip truth, or spin' },
        { name: 'Regulatory Clock Lag', desc: 'Distance between awareness and actual notice' },
        { name: 'Narrative Capture', desc: 'How far messaging has drifted from operational truth' },
        { name: 'Facts Gap', desc: 'What you still do not know about blast radius and data types' },
        { name: 'Commitment Lock', desc: 'How hard statements, payments, or attributions are to unwind' }
      ]
  
  const goal = isSuccess
    ? 'Maximize control and honest posture without burning the company for theater metrics.'
    : 'Minimize disclosure debt — silence and spin compound faster than most technical loss.'
  
  const interpretation = isSuccess
    ? 'A high Control Index means containment and disclosure process are both holding. A low index means you are losing the room, the clock, or both.'
    : 'A low Debt Index means your story can survive a screenshot. A high index means adversary-driven disclosure is about to write your narrative.'

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
        padding: '32px'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {title}
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
              height: '32px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '16px', color: '#fff', lineHeight: '1.6', marginBottom: '16px' }}>
            {description}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
            Components:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {components.map((comp, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#111111',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {comp.name}
                </div>
                <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.5' }}>
                  {comp.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: `1px solid ${isSuccess ? 'rgba(74, 222, 128, 0.3)' : 'rgba(251, 146, 60, 0.3)'}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
            Your Goal:
          </h3>
          <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
            {goal}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
            How to Interpret:
          </h3>
          <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
            {interpretation}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '24px',
            padding: '12px',
            backgroundColor: '#111111',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
