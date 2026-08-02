import { useState } from 'react'
import { DifficultyLevel, StartingCondition, getDifficultyDescription, getStartingConditionDescription } from '../utils/scenarioVariations'

interface ScenarioVariationModalProps {
  onStart: (variation: { difficulty: DifficultyLevel; startingCondition: StartingCondition; timeLimit?: number }) => void
  onClose: () => void
}

export default function ScenarioVariationModal({ onStart, onClose }: ScenarioVariationModalProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [startingCondition, setStartingCondition] = useState<StartingCondition>('default')
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [timeLimit, setTimeLimit] = useState(30)

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
      zIndex: 3000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '600px',
        width: '100%',
        padding: '32px'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>
            Scenario Configuration
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

        {/* Difficulty Level */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
            Difficulty Level
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['very_easy', 'easy', 'medium', 'hard', 'very_hard'] as DifficultyLevel[]).map(level => (
              <label
                key={level}
                style={{
                  padding: '12px',
                  backgroundColor: difficulty === level ? '#111111' : '#000000',
                  border: `2px solid ${difficulty === level ? '#fff' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={() => setDifficulty(level)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
                    {level.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                    {getDifficultyDescription(level)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Starting Condition */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
            Starting Condition
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['default', 'optimistic', 'pessimistic', 'balanced'] as StartingCondition[]).map(condition => (
              <label
                key={condition}
                style={{
                  padding: '12px',
                  backgroundColor: startingCondition === condition ? '#111111' : '#000000',
                  border: `2px solid ${startingCondition === condition ? '#fff' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <input
                  type="radio"
                  name="startingCondition"
                  value={condition}
                  checked={startingCondition === condition}
                  onChange={() => setStartingCondition(condition)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
                    {condition}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                    {getStartingConditionDescription(condition)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Time Limit (Optional) */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
            <input
              type="checkbox"
              checked={timeLimitEnabled}
              onChange={(e) => setTimeLimitEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              Enable Time Limit (Optional)
            </span>
          </label>
          {timeLimitEnabled && (
            <div style={{ padding: '12px', backgroundColor: '#111111', borderRadius: '6px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Math.max(5, Math.min(120, parseInt(e.target.value) || 30)))}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#000000',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart({
            difficulty,
            startingCondition,
            timeLimit: timeLimitEnabled ? timeLimit : undefined
          })}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          Start Scenario
        </button>
      </div>
    </div>
  )
}
