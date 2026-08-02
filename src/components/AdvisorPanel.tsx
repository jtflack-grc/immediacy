import { useEffect, useState } from 'react'
import { Advisor, AdvisorRecommendation, Node } from '../engine/scenarioTypes'
import { getAdvisorRecommendations } from '../engine/advisorEngine'

// Helper function for source type colors
function getSourceTypeColor(sourceType: string): string {
  switch (sourceType) {
    case 'government':
      return 'rgba(59, 130, 246, 0.3)'
    case 'peer-reviewed':
    case 'academic':
      return 'rgba(139, 92, 246, 0.3)'
    case 'ngo':
      return 'rgba(34, 197, 94, 0.3)'
    case 'industry':
      return 'rgba(251, 146, 60, 0.3)'
    default:
      return 'rgba(107, 114, 128, 0.3)'
  }
}

interface AdvisorPanelProps {
  node: Node | null
  compact?: boolean
}

interface RecommendationWithAdvisor extends AdvisorRecommendation {
  advisor: Advisor
}

export default function AdvisorPanel({ node, compact = false }: AdvisorPanelProps) {
  const [recommendations, setRecommendations] = useState<RecommendationWithAdvisor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecommendations() {
      if (!node) {
        setLoading(false)
        return
      }

      try {
        const { recommendations: recs } = await getAdvisorRecommendations(node.id)
        // Recommendations already have advisors attached from advisorEngine
        setRecommendations(recs as RecommendationWithAdvisor[])
      } catch (error) {
        console.error('Failed to load advisor recommendations:', error)
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [node])

  if (!node || loading) {
    return null
  }

  if (recommendations.length === 0) {
    return null
  }

  // Group recommendations by choice
  const recommendationsByChoice = new Map<number, RecommendationWithAdvisor[]>()
  recommendations.forEach(rec => {
    if (!recommendationsByChoice.has(rec.choiceIndex)) {
      recommendationsByChoice.set(rec.choiceIndex, [])
    }
    recommendationsByChoice.get(rec.choiceIndex)!.push(rec)
  })

  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      backgroundColor: '#0f1117',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#fff',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        Advisor Recommendations
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '10px' : '12px' }}>
        {Array.from(recommendationsByChoice.entries()).map(([choiceIndex, recs]) => (
          <div key={choiceIndex} style={{
            padding: compact ? '10px' : '12px',
            backgroundColor: '#111111',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#888',
              marginBottom: compact ? '12px' : '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 600
            }}>
              Recommended for Choice {choiceIndex + 1}
            </div>

            {recs.map((rec, idx) => (
                <div key={idx} style={{
                  marginBottom: idx < recs.length - 1 ? (compact ? '10px' : '12px') : 0,
                  paddingBottom: idx < recs.length - 1 ? (compact ? '10px' : '12px') : 0,
                  borderBottom: idx < recs.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                }}>
                  <div style={{ display: 'flex', gap: compact ? '8px' : '10px', marginBottom: compact ? '8px' : '10px' }}>
                    {/* Advisor Avatar */}
                    <div style={{
                      width: compact ? '40px' : '50px',
                      height: compact ? '40px' : '50px',
                      borderRadius: '50%',
                      backgroundColor: '#111111',
                      border: `2px solid ${rec.advisor.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      boxShadow: `0 2px 8px ${rec.advisor.color}40`,
                      position: 'relative'
                    }}>
                      {rec.advisor.imageUrl ? (
                        <img 
                          src={rec.advisor.imageUrl} 
                          alt={rec.advisor.name}
                          loading="lazy"
                          decoding="async"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '50%',
                            filter: 'brightness(1.05) contrast(1.1)'
                          }}
                          onError={(e) => {
                            // Fallback to initials if image fails
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              const initials = rec.advisor.name.split(' ').map(n => n[0]).join('')
                              parent.innerHTML = `<div style="color: ${rec.advisor.color}; font-weight: 600; font-size: 18px; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${initials}</div>`
                            }
                          }}
                        />
                      ) : (
                        <div style={{ 
                          color: rec.advisor.color, 
                          fontWeight: 600, 
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%'
                        }}>
                          {rec.advisor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>

                    {/* Advisor Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: compact ? '15px' : '16px',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '4px'
                      }}>
                        {rec.advisor.name}
                      </div>
                      <div style={{
                        fontSize: compact ? '12px' : '13px',
                        color: rec.advisor.color,
                        marginBottom: compact ? '6px' : '8px'
                      }}>
                        {rec.advisor.title}
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div style={{
                    fontSize: compact ? '14px' : '15px',
                    color: '#bbb',
                    lineHeight: '1.6',
                    marginBottom: compact ? '12px' : '14px',
                    fontStyle: 'italic'
                  }}>
                    "{rec.reasoning}"
                  </div>

                  {/* Benefits & Concerns - Compact inline */}
                  {(rec.benefits || rec.concerns) && !compact && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {rec.benefits && rec.benefits.length > 0 && (
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <div style={{
                            fontSize: '13px',
                            color: '#4ade80',
                            marginBottom: '6px',
                            fontWeight: 600
                          }}>
                            Benefits:
                          </div>
                          <ul style={{
                            margin: 0,
                            paddingLeft: '20px',
                            fontSize: '13px',
                            color: '#aaa',
                            lineHeight: '1.6'
                          }}>
                            {rec.benefits.slice(0, 2).map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                            {rec.benefits.length > 2 && <li style={{ color: '#666' }}>+{rec.benefits.length - 2} more</li>}
                          </ul>
                        </div>
                      )}
                      {rec.concerns && rec.concerns.length > 0 && (
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <div style={{
                            fontSize: '13px',
                            color: '#f87171',
                            marginBottom: '6px',
                            fontWeight: 600
                          }}>
                            Concerns:
                          </div>
                          <ul style={{
                            margin: 0,
                            paddingLeft: '20px',
                            fontSize: '13px',
                            color: '#aaa',
                            lineHeight: '1.6'
                          }}>
                            {rec.concerns.slice(0, 2).map((concern, i) => (
                              <li key={i}>{concern}</li>
                            ))}
                            {rec.concerns.length > 2 && <li style={{ color: '#666' }}>+{rec.concerns.length - 2} more</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Research Citations - Compact */}
                  {rec.researchCitations && rec.researchCitations.length > 0 && !compact && (
                    <div style={{
                      marginTop: '8px',
                      padding: '6px',
                      backgroundColor: '#111111',
                      borderRadius: '3px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        color: '#ffffff',
                        marginBottom: '6px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        Research:
                      </div>
                      {/* Citation count badge */}
                      {rec.researchCitations.length > 0 && (
                        <div style={{
                          fontSize: '10px',
                          color: '#60a5fa',
                          fontWeight: 600,
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>{rec.researchCitations.length} research citation{rec.researchCitations.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div style={{
                        fontSize: '13px',
                        color: '#aaa',
                        lineHeight: '1.6'
                      }}>
                        {rec.researchCitations.slice(0, 2).map((citation, i) => {
                          const citationObj = typeof citation === 'string' 
                            ? { text: citation } 
                            : citation
                          const displayText = citationObj.text.length > 80 
                            ? citationObj.text.substring(0, 80) + '...' 
                            : citationObj.text
                          
                          return (
                            <div key={i} style={{ marginBottom: i < Math.min(2, rec.researchCitations.length - 1) ? '4px' : 0 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <span>•</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span>{displayText}</span>
                                    {citationObj.sourceType && (
                                      <span style={{
                                        fontSize: '9px',
                                        padding: '2px 6px',
                                        backgroundColor: getSourceTypeColor(citationObj.sourceType),
                                        borderRadius: '4px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontWeight: 600
                                      }}>
                                        {citationObj.sourceType.replace('-', ' ')}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {citationObj.url && (
                                      <a
                                        href={citationObj.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: '#60a5fa',
                                          textDecoration: 'underline',
                                          fontSize: '11px'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        Read →
                                      </a>
                                    )}
                                    {citationObj.doi && (
                                      <a
                                        href={`https://doi.org/${citationObj.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: '#ffffff',
                                          marginLeft: '6px',
                                          textDecoration: 'underline',
                                          textDecorationColor: 'rgba(255, 255, 255, 0.4)',
                                          fontSize: '9px'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        DOI →
                                      </a>
                                    )}
                                    {citationObj.lastVerified && (
                                      <span style={{
                                        fontSize: '9px',
                                        color: '#4ade80',
                                        marginLeft: '6px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        <span>✓</span>
                                        <span>Verified {citationObj.lastVerified}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {rec.researchCitations.length > 2 && (
                          <div style={{ color: '#666', fontSize: '8px', marginTop: '3px' }}>
                            +{rec.researchCitations.length - 2} more citations
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
