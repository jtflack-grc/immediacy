import { useState } from 'react'

interface IndexExplainerModalProps {
  type: 'success' | 'debt'
  onClose: () => void
}

export default function IndexExplainerModal({ type, onClose }: IndexExplainerModalProps) {
  const isSuccess = type === 'success'
  
  const title = isSuccess ? 'Measured Success Index' : 'Governance Debt Index'
  const description = isSuccess 
    ? 'The Measured Success Index represents how well you\'ve achieved explicit, quantifiable welfare outcomes. It combines production efficiency, welfare standard adoption, cost management, and incident reduction into a single score.'
    : 'The Governance Debt Index represents hidden costs and risks that accumulate from decisions. It tracks enforcement gaps, regulatory capture, knowledge gaps, system irreversibility, and welfare debt that may not be immediately visible but impact long-term outcomes.'
  
  const components = isSuccess
    ? [
        { name: 'Production Efficiency', desc: 'How efficiently animal products are produced while maintaining welfare standards' },
        { name: 'Welfare Standard Adoption', desc: 'The extent to which welfare standards are implemented across the system' },
        { name: 'Cost Per Unit', desc: 'Economic efficiency - lower costs mean more sustainable welfare improvements' },
        { name: 'Welfare Incident Rate', desc: 'Frequency of welfare violations - lower is better' }
      ]
    : [
        { name: 'Welfare Debt', desc: 'Accumulated negative impacts on animal welfare that haven\'t been addressed' },
        { name: 'Enforcement Gap', desc: 'Difference between standards set and standards actually enforced' },
        { name: 'Regulatory Capture', desc: 'Extent to which industry interests influence regulation over public welfare' },
        { name: 'Sentience Knowledge Gap', desc: 'Uncertainty about which animals are sentient and to what degree' },
        { name: 'System Irreversibility', desc: 'How difficult it becomes to change course once decisions are implemented' }
      ]
  
  const goal = isSuccess
    ? 'Your goal is to maximize the Measured Success Index by making decisions that improve welfare standards, reduce incidents, and maintain economic viability.'
    : 'Your goal is to minimize the Governance Debt Index by avoiding decisions that create hidden costs, enforcement problems, or lock you into unsustainable paths.'
  
  const interpretation = isSuccess
    ? 'A high Success Index (80%+) indicates strong welfare outcomes with good economic performance. A low index suggests either welfare standards aren\'t being met, costs are too high, or incidents are frequent.'
    : 'A low Debt Index (<20%) means you\'ve avoided hidden costs and maintained flexibility. A high index (>60%) suggests you\'ve accumulated significant unmeasured risks that could cause problems later.'

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
