import { useMemo } from 'react'
import { State } from '../engine/scenarioTypes'
import { estimateFairLoss, formatUsd } from '../utils/fairLoss'

interface FairLossPanelProps {
  state: State
}

const urgencyColor = {
  elevated: '#fbbf24',
  severe: '#fb923c',
  critical: '#ef4444',
} as const

function RangeRow({
  label,
  min,
  mode,
  max,
  accent,
  emphasize,
}: {
  label: string
  min: number
  mode: number
  max: number
  accent: string
  emphasize?: boolean
}) {
  return (
    <div style={{
      padding: emphasize ? '14px 12px' : '10px 12px',
      backgroundColor: emphasize ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      border: `1px solid ${accent}33`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '6px',
        gap: '8px',
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#aaa',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: emphasize ? '26px' : '18px',
          fontWeight: 700,
          color: accent,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatUsd(mode)}
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#777',
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span>Min {formatUsd(min)}</span>
        <span style={{ color: '#999' }}>likely</span>
        <span>Max {formatUsd(max)}</span>
      </div>
    </div>
  )
}

export default function FairLossPanel({ state }: FairLossPanelProps) {
  const estimate = useMemo(() => estimateFairLoss(state.metrics), [
    state.metrics.measured.operationalControl,
    state.metrics.measured.financialBurn,
    state.metrics.measured.serviceDisruption,
    state.metrics.measured.disclosurePosture,
    state.metrics.unmeasured.disclosureDebt,
    state.metrics.unmeasured.regulatoryExposure,
    state.metrics.unmeasured.narrativeIntegrity,
    state.metrics.unmeasured.factsConfidence,
    state.metrics.unmeasured.commitmentLock,
    state.turn,
  ])

  const accent = urgencyColor[estimate.urgency]

  return (
    <div style={{
      marginBottom: '24px',
      padding: '16px',
      background: 'linear-gradient(165deg, rgba(251, 191, 36, 0.08) 0%, rgba(0,0,0,0.9) 42%)',
      borderRadius: '10px',
      border: `2px solid ${accent}55`,
      boxShadow: `0 0 28px ${accent}18`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '14px',
      }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: accent,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '4px',
          }}>
            FAIR Loss Exposure
          </div>
          <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.4 }}>
            Northline-scale ranges · primary response vs secondary disclosure loss
          </div>
        </div>
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '4px 8px',
          borderRadius: '4px',
          border: `1px solid ${accent}66`,
          backgroundColor: `${accent}18`,
          whiteSpace: 'nowrap',
        }}>
          {estimate.urgency}
        </div>
      </div>

      <RangeRow
        label="Total loss (mode)"
        min={estimate.total.min}
        mode={estimate.total.mode}
        max={estimate.total.max}
        accent={accent}
        emphasize
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: '8px',
      }}>
        <RangeRow
          label="Primary"
          min={estimate.primary.min}
          mode={estimate.primary.mode}
          max={estimate.primary.max}
          accent="#fbbf24"
        />
        <RangeRow
          label="Secondary"
          min={estimate.secondary.min}
          mode={estimate.secondary.mode}
          max={estimate.secondary.max}
          accent="#fb923c"
        />
      </div>

      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: '#ccc',
        lineHeight: 1.5,
        fontStyle: 'italic',
      }}>
        {estimate.headline}
      </div>

      {estimate.drivers.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
          }}>
            Top dollar drivers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {estimate.drivers.map(d => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  fontSize: '11px',
                  color: '#bbb',
                  padding: '6px 8px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '5px',
                }}
              >
                <span style={{ lineHeight: 1.35 }}>
                  <span style={{
                    color: d.kind === 'primary' ? '#fbbf24' : '#fb923c',
                    fontWeight: 600,
                    marginRight: '6px',
                  }}>
                    {d.kind === 'primary' ? 'P' : 'S'}
                  </span>
                  {d.label}
                </span>
                <span style={{
                  color: '#fff',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}>
                  {formatUsd(d.dollars)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '12px',
        fontSize: '10px',
        color: '#666',
        lineHeight: 1.4,
      }}>
        Educational FAIR-style ranges from war-room metrics — not actuarial pricing.
      </div>
    </div>
  )
}
