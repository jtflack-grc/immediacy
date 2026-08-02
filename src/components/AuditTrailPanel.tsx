import { useState } from 'react'
import { AuditRecord } from '../engine/scenarioTypes'

interface AuditTrailPanelProps {
  auditTrail: AuditRecord[]
}

export default function AuditTrailPanel({ auditTrail }: AuditTrailPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (record: AuditRecord) => {
    const id = `${record.turn}_${record.nodeId}`
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#000000',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
        Audit Trail
      </h3>
      
      {auditTrail.length === 0 ? (
        <div style={{ color: '#888', fontSize: '13px', fontStyle: 'italic' }}>
          No decisions recorded yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {auditTrail.map((record, idx) => {
            const id = `${record.turn}_${record.nodeId}`
            const isExpanded = expandedId === id
            
            return (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  backgroundColor: '#111111',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => toggleExpand(record)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                      Turn {record.turn}: {record.nodeTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {record.chosenLabel}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginLeft: '12px' }}>
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>
                
                {isExpanded && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                      <strong>Owner:</strong> {record.ownerRole}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                      <strong>Rationale:</strong> {record.rationale}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                      <strong>Assumptions:</strong> {record.assumptions}
                    </div>
                    <div style={{ fontSize: '11px', color: '#fb923c', marginTop: '8px', padding: '8px', backgroundColor: '#1a1d29', borderRadius: '4px' }}>
                      <strong>Unmeasured Impact:</strong> {record.unmeasuredImpact}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
