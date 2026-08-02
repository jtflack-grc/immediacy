import { useState, useEffect } from 'react'
import { State } from '../engine/scenarioTypes'
import { getSavedScenarios, saveScenario, loadScenario, deleteScenario, renameScenario, SavedScenario } from '../utils/saveManager'

interface SaveLoadModalProps {
  currentState: State
  scenarioVersion: string
  onLoad: (state: State) => void
  onClose: () => void
}

export default function SaveLoadModal({ currentState, scenarioVersion, onLoad, onClose }: SaveLoadModalProps) {
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'compare'>('save')
  const [saveName, setSaveName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSavedScenarios(getSavedScenarios())
  }, [])

  const handleSave = () => {
    if (!saveName.trim()) {
      alert('Please enter a name for this save')
      return
    }
    
    saveScenario(currentState, saveName.trim(), scenarioVersion)
    setSavedScenarios(getSavedScenarios())
    setSaveName('')
    alert('Scenario saved!')
  }

  const handleLoad = (id: string) => {
    const state = loadScenario(id)
    if (state) {
      onLoad(state)
      onClose()
    } else {
      alert('Failed to load scenario')
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this saved scenario?')) {
      deleteScenario(id)
      setSavedScenarios(getSavedScenarios())
      setSelectedForCompare(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameScenario(id, editName.trim())
      setSavedScenarios(getSavedScenarios())
      setEditingId(null)
      setEditName('')
    }
  }

  const toggleCompare = (id: string) => {
    setSelectedForCompare(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

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
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>
            Save & Load Scenarios
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {(['save', 'load', 'compare'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === tab ? '#111111' : 'transparent',
                color: '#fff',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 600 : 400,
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Save Tab */}
        {activeTab === 'save' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                Save Name
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., 'Conservative Approach' or 'Aggressive Welfare'"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#111111',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSave()
                  }
                }}
              />
            </div>
            <button
              onClick={handleSave}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Save Current Scenario
            </button>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
              Current turn: {currentState.turn} | Phase: {currentState.phaseId}
            </div>
          </div>
        )}

        {/* Load Tab */}
        {activeTab === 'load' && (
          <div>
            {savedScenarios.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No saved scenarios yet. Save your current progress to load it later.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedScenarios.map(scenario => (
                  <div
                    key={scenario.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#111111',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      {editingId === scenario.id ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '6px',
                              backgroundColor: '#000000',
                              color: '#fff',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleRename(scenario.id)
                              }
                            }}
                          />
                          <button
                            onClick={() => handleRename(scenario.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#1a1a1a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditName('')
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#1a1a1a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                            {scenario.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#888' }}>
                            Turn {scenario.state.turn} | Phase: {scenario.state.phaseId} | {formatDate(scenario.timestamp)}
                          </div>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleLoad(scenario.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#1a1a1a',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(scenario.id)
                          setEditName(scenario.name)
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          color: '#aaa',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(scenario.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div>
            {savedScenarios.length < 2 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Need at least 2 saved scenarios to compare.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px', fontSize: '12px', color: '#aaa' }}>
                  Select 2-3 scenarios to compare side-by-side:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {savedScenarios.map(scenario => (
                    <div
                      key={scenario.id}
                      onClick={() => {
                        if (selectedForCompare.has(scenario.id) || selectedForCompare.size < 3) {
                          toggleCompare(scenario.id)
                        }
                      }}
                      style={{
                        padding: '12px',
                        backgroundColor: selectedForCompare.has(scenario.id) ? '#111111' : '#000000',
                        borderRadius: '6px',
                        border: selectedForCompare.has(scenario.id) 
                          ? '2px solid #fff' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: selectedForCompare.size >= 3 && !selectedForCompare.has(scenario.id) 
                          ? 'not-allowed' 
                          : 'pointer',
                        opacity: selectedForCompare.size >= 3 && !selectedForCompare.has(scenario.id) ? 0.5 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedForCompare.has(scenario.id)}
                          onChange={() => {}}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                            {scenario.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#888' }}>
                            Turn {scenario.state.turn} | {formatDate(scenario.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedForCompare.size >= 2 && (
                  <ComparisonView 
                    scenarios={savedScenarios.filter(s => selectedForCompare.has(s.id))}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ComparisonView({ scenarios, onClose }: { scenarios: SavedScenario[], onClose: () => void }) {
  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      backgroundColor: '#111111',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
        Side-by-Side Comparison
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scenarios.length}, 1fr)`, gap: '16px', overflowX: 'auto' }}>
        {scenarios.map(scenario => (
          <div key={scenario.id} style={{ minWidth: '200px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              {scenario.name}
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
              Turn: {scenario.state.turn}
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
              Phase: {scenario.state.phaseId}
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '12px' }}>
              Decisions: {scenario.state.auditTrail.length}
            </div>
            <div style={{ 
              padding: '8px', 
              backgroundColor: '#000000', 
              borderRadius: '4px',
              fontSize: '10px',
              color: '#888'
            }}>
              <div>Measured Success: {((scenario.state.metrics.measured.productionEfficiency * 100).toFixed(0))}%</div>
              <div>Welfare Debt: {((scenario.state.metrics.unmeasured.welfareDebt * 100).toFixed(0))}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
