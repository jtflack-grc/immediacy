import { useState } from 'react'
import { longtermismAngles } from '../utils/longtermismResearch'

export default function LongtermismPanel() {
  const [expandedAngle, setExpandedAngle] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div style={{
      marginTop: '32px',
      padding: '16px',
      backgroundColor: '#111111',
      borderRadius: '8px',
      border: '1px solid rgba(100, 150, 255, 0.2)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: isCollapsed ? '0' : '12px',
        cursor: 'pointer'
      }} onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          color: '#60a5fa', 
          margin: 0
        }}>
          Longtermism Research Library
        </h3>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {isCollapsed ? '▼' : '▲'}
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          <p style={{ 
            fontSize: '11px', 
            color: '#888', 
            lineHeight: '1.5',
            marginBottom: '12px',
            fontStyle: 'italic'
          }}>
            Deep questions that appear contextually in decisions. Explore all angles here.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {longtermismAngles.map(angle => (
          <div 
            key={angle.id}
            style={{
              padding: '12px',
              backgroundColor: expandedAngle === angle.id ? '#1a1a1a' : '#000000',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setExpandedAngle(expandedAngle === angle.id ? null : angle.id)}
          >
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: '#fff',
              marginBottom: '4px'
            }}>
              {angle.title}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#888',
              marginBottom: '6px'
            }}>
              {angle.timeHorizon} • {angle.category}
            </div>
            {expandedAngle === angle.id && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.6', marginBottom: '12px' }}>
                  {angle.description}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', fontWeight: 600 }}>
                    Key Questions:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#aaa', lineHeight: '1.6' }}>
                    {angle.keyQuestions.slice(0, 2).map((q, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                  {angle.relevance}
                </div>
              </div>
            )}
          </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
