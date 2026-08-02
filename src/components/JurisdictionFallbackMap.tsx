import { State, MapMode } from '../engine/scenarioTypes'
import { IN_PLAY_ISO3 } from '../utils/jurisdictionData'
import {
  getJurisdictionStatus,
  JurisdictionStatus,
  notificationStatusColor,
  notificationStatusLabel,
  regulatoryPressureColor,
} from '../utils/jurisdictionStatus'
import { formatIncidentClock } from '../engine/incidentClock'

interface JurisdictionFallbackMapProps {
  regionValues: Record<string, number>
  state?: State
  mapMode?: MapMode
}

/**
 * Non-WebGL fallback for the globe view: a plain 2D list/grid of jurisdictions.
 * Used when WebGL isn't available on the device, or when the 3D globe throws
 * a runtime error (via GlobeErrorBoundary), so the sim stays playable.
 */
export default function JurisdictionFallbackMap({ regionValues, state, mapMode = 'disclosurePosture' }: JurisdictionFallbackMapProps) {
  const title =
    mapMode === 'disclosurePosture' ? 'Disclosure Posture' :
    mapMode === 'disclosureDebt' ? 'Disclosure Debt' : 'Regulatory Pressure'

  // Only jurisdictions actually "in play" for this incident get a status card.
  const jurisdictions = Object.entries(regionValues)
    .filter(([iso3]) => IN_PLAY_ISO3.has(iso3))
    .map(([iso3, value]) => getJurisdictionStatus(iso3, value, state))
    .filter((s): s is JurisdictionStatus => s !== null)
    .sort((a, b) => b.regulatoryPressure - a.regulatoryPressure)

  const deadlines = state?.deadlines || []
  const incidentTime = state?.incidentTime || 0

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#000000',
        color: '#fff',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: '4px', fontSize: '15px', fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>
        WebGL globe is unavailable on this device — showing jurisdiction list instead.
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '14px', fontSize: '11px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <span style={{ color: notificationStatusColor('not_started') }}>⚪ Not Started</span>
        <span style={{ color: notificationStatusColor('assessing') }}>🔵 Assessing</span>
        <span style={{ color: notificationStatusColor('notice_due') }}>🟡 Notice Due</span>
        <span style={{ color: notificationStatusColor('filed') }}>🟢 Filed</span>
        <span style={{ color: notificationStatusColor('overdue') }}>🔴 Overdue</span>
      </div>

      {/* Notice clocks */}
      {deadlines.length > 0 && (
        <div
          style={{
            marginBottom: '18px',
            padding: '12px',
            backgroundColor: '#111111',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#60a5fa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Notice Clocks
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {deadlines.map(d => {
              const remaining = d.dueAt - incidentTime
              const overdue = d.missed || remaining < 0
              return (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#ddd' }}>{d.label}</span>
                  <span style={{ color: overdue ? '#ef4444' : '#4ade80', fontWeight: 600 }}>
                    {overdue ? 'MISSED' : formatIncidentClock(Math.max(0, remaining))}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Jurisdiction grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px',
        }}
      >
        {jurisdictions.map(j => (
          <div
            key={j.iso3}
            style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#111111',
              border: `1px solid ${notificationStatusColor(j.notificationStatus)}55`,
              borderLeft: `4px solid ${notificationStatusColor(j.notificationStatus)}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{j.name}</div>
              <div style={{ fontSize: '10px', color: '#888' }}>{j.iso3}</div>
            </div>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: notificationStatusColor(j.notificationStatus),
              marginBottom: '6px',
            }}>
              {notificationStatusLabel(j.notificationStatus)}
            </div>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px', lineHeight: '1.4' }}>
              {j.clockHint}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Confidence</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#60a5fa' }}>{(j.confidence * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Pressure</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: regulatoryPressureColor(j.regulatoryPressure) }}>
                  {(j.regulatoryPressure * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jurisdictions.length === 0 && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
          No jurisdictions in play yet.
        </div>
      )}
    </div>
  )
}
