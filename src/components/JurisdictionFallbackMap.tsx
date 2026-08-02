import { State, MapMode } from '../engine/scenarioTypes'
import { getCountryData, getWelfareGrade, getGradeColor } from '../utils/countryWelfareData'
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

  const worseIsHigh = mapMode === 'disclosureDebt' || mapMode === 'regulatoryExposure'

  const colorForValue = (value: number): string => {
    const v = worseIsHigh ? 1 - value : value
    if (v < 0.33) return '#ef4444'
    if (v < 0.66) return '#fbbf24'
    return '#4ade80'
  }

  const jurisdictions = Object.entries(regionValues)
    .map(([iso3, value]) => {
      const countryData = getCountryData(iso3, iso3)
      const baseScore = countryData?.baselineScore ?? 0.3
      const currentScore = Math.min(1, Math.max(0, baseScore + value * 0.5))
      const grade = getWelfareGrade(currentScore)
      return {
        iso3,
        name: countryData?.name || iso3,
        value,
        grade,
        gradeColor: getGradeColor(grade),
      }
    })
    .sort((a, b) => (worseIsHigh ? b.value - a.value : b.value - a.value))

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
        {worseIsHigh ? (
          <>
            <span style={{ color: '#4ade80' }}>🟢 Low (0-33%)</span>
            <span style={{ color: '#fbbf24' }}>🟡 Medium (34-66%)</span>
            <span style={{ color: '#ef4444' }}>🔴 High (67-100%)</span>
          </>
        ) : (
          <>
            <span style={{ color: '#ef4444' }}>🔴 Low (0-33%)</span>
            <span style={{ color: '#fbbf24' }}>🟡 Medium (34-66%)</span>
            <span style={{ color: '#4ade80' }}>🟢 High (67-100%)</span>
          </>
        )}
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
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
              border: `1px solid ${colorForValue(j.value)}55`,
              borderLeft: `4px solid ${colorForValue(j.value)}`,
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{j.name}</div>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>{j.iso3}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: colorForValue(j.value) }}>
                {(j.value * 100).toFixed(0)}%
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: j.gradeColor }}>{j.grade}</span>
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
