import { useState } from 'react'
import { DifficultyLevel, StartingCondition, getDifficultyDescription, getStartingConditionDescription } from '../utils/scenarioVariations'

interface StartingConditionSelectorProps {
  onSelect: (difficulty: DifficultyLevel, startingCondition: StartingCondition) => void
}

export default function StartingConditionSelector({ onSelect }: StartingConditionSelectorProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [startingCondition, setStartingCondition] = useState<StartingCondition>('default')

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#111111',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 8px 0',
          textAlign: 'center'
        }}>
          Configure Your Scenario
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#aaa',
          margin: '0 0 32px 0',
          textAlign: 'center'
        }}>
          Choose your difficulty level and starting conditions to customize your governance challenge
        </p>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '12px'
          }}>
            Difficulty Level
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['very_easy', 'easy', 'medium', 'hard', 'very_hard'] as DifficultyLevel[]).map((level) => (
              <label
                key={level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: difficulty === level ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${difficulty === level ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', textTransform: 'capitalize', marginBottom: '4px' }}>
                    {level.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {getDifficultyDescription(level)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Starting Condition Selection */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '12px'
          }}>
            Starting Condition
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['default', 'optimistic', 'pessimistic', 'balanced', 'crisis', 'transition', 'innovation'] as StartingCondition[]).map((condition) => (
              <label
                key={condition}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: startingCondition === condition ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${startingCondition === condition ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="radio"
                  name="startingCondition"
                  value={condition}
                  checked={startingCondition === condition}
                  onChange={(e) => setStartingCondition(e.target.value as StartingCondition)}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', textTransform: 'capitalize', marginBottom: '4px' }}>
                    {condition}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {getStartingConditionDescription(condition)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onSelect(difficulty, startingCondition)}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#60a5fa',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#60a5fa'
          }}
        >
          Start Scenario
        </button>
      </div>
    </div>
  )
}
