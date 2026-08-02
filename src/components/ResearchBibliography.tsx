import { useState, useMemo } from 'react'
import { Scenario } from '../engine/scenarioTypes'
import { METRIC_EXPLANATIONS } from '../utils/metricExplanations'
import advisorRecommendationsData from '../../public/advisorRecommendations.json'

interface ResearchBibliographyProps {
  scenario: Scenario
  onClose: () => void
}

interface BibliographyEntry {
  id: string
  title: string
  type: 'case-study' | 'metric' | 'advisor'
  category: 'Policy Documents' | 'Academic Papers' | 'NGO Reports' | 'Government Sources' | 'Industry Sources' | 'Other'
  url?: string
  doi?: string
  year?: string
  sourceType?: string
  description?: string
  nodeId?: string
  metricKey?: string
  lastVerified?: string
  archiveUrl?: string
}

export default function ResearchBibliography({ scenario, onClose }: ResearchBibliographyProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSourceType, setSelectedSourceType] = useState<string | null>(null)
  const [yearRange, setYearRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Extract all citations from scenario, metrics, and advisors
  const bibliographyEntries = useMemo(() => {
    const entries: BibliographyEntry[] = []

    // Extract from case studies
    scenario.phases.forEach(phase => {
      phase.nodes.forEach(node => {
        if (node.caseStudies) {
          node.caseStudies.forEach((study, idx) => {
            if (study.url) {
              const category = getCategoryFromSourceType(study.sourceType || inferSourceType(study.url))
              entries.push({
                id: `case-${node.id}-${idx}`,
                title: study.title,
                type: 'case-study',
                category,
                url: study.url,
                doi: study.doi,
                year: study.year,
                sourceType: study.sourceType || inferSourceType(study.url),
                description: study.description,
                nodeId: node.id,
                lastVerified: study.lastVerified,
                archiveUrl: study.archiveUrl
              })
            }
          })
        }
      })
    })

    // Extract from metric explanations
    Object.entries(METRIC_EXPLANATIONS).forEach(([key, metric]) => {
      if (metric.researchUrl) {
        const category = getCategoryFromSourceType(inferSourceType(metric.researchUrl))
        entries.push({
          id: `metric-${key}`,
          title: metric.researchCitation || metric.label,
          type: 'metric',
          category,
          url: metric.researchUrl,
          sourceType: inferSourceType(metric.researchUrl),
          description: metric.description,
          metricKey: key
        })
      }
    })

    // Extract from advisor recommendations
    Object.entries(advisorRecommendationsData).forEach(([nodeId, recommendations]) => {
      recommendations.forEach((rec: any, recIdx: number) => {
        if (rec.researchCitations) {
          rec.researchCitations.forEach((citation: any, citIdx: number) => {
            const citationObj = typeof citation === 'string' 
              ? { text: citation } 
              : citation
            
            if (citationObj.url || citationObj.doi) {
              const category = getCategoryFromSourceType(
                citationObj.sourceType || 
                (citationObj.doi ? 'peer-reviewed' : inferSourceType(citationObj.url || ''))
              )
              entries.push({
                id: `advisor-${nodeId}-${recIdx}-${citIdx}`,
                title: citationObj.text,
                type: 'advisor',
                category,
                url: citationObj.url,
                doi: citationObj.doi,
                year: citationObj.year?.toString(),
                sourceType: citationObj.sourceType || (citationObj.doi ? 'peer-reviewed' : inferSourceType(citationObj.url || '')),
                description: citationObj.abstract,
                nodeId,
                lastVerified: citationObj.lastVerified,
                archiveUrl: citationObj.archiveUrl
              })
            }
          })
        }
      })
    })

    return entries
  }, [scenario])

  // Filter entries by category, source type, year range, and search
  const filteredEntries = useMemo(() => {
    let filtered = bibliographyEntries

    if (selectedCategory) {
      filtered = filtered.filter(e => e.category === selectedCategory)
    }

    if (selectedSourceType) {
      filtered = filtered.filter(e => e.sourceType === selectedSourceType)
    }

    if (yearRange.min) {
      filtered = filtered.filter(e => {
        if (!e.year) return false
        const year = parseInt(e.year)
        return year >= parseInt(yearRange.min)
      })
    }

    if (yearRange.max) {
      filtered = filtered.filter(e => {
        if (!e.year) return false
        const year = parseInt(e.year)
        return year <= parseInt(yearRange.max)
      })
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.url?.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => {
      // Sort by category, then by year (newest first), then alphabetically
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      if (a.year && b.year && a.year !== b.year) {
        return parseInt(b.year) - parseInt(a.year)
      }
      return a.title.localeCompare(b.title)
    })
  }, [bibliographyEntries, selectedCategory, selectedSourceType, yearRange, searchQuery])

  const categories = useMemo(() => {
    const cats = new Set(bibliographyEntries.map(e => e.category))
    return Array.from(cats).sort()
  }, [bibliographyEntries])

  const sourceTypes = useMemo(() => {
    const types = new Set(bibliographyEntries.map(e => e.sourceType).filter(Boolean))
    return Array.from(types).sort()
  }, [bibliographyEntries])

  const yearRangeOptions = useMemo(() => {
    const years = bibliographyEntries
      .map(e => e.year ? parseInt(e.year) : null)
      .filter((y): y is number => y !== null)
    if (years.length === 0) return { min: 2000, max: 2026 }
    return { min: Math.min(...years), max: Math.max(...years) }
  }, [bibliographyEntries])

  // Export functions
  const exportBibTeX = () => {
    const bibtex = filteredEntries.map((entry, idx) => {
      const key = `entry${idx + 1}`
      const title = entry.title.replace(/[{}]/g, '')
      const author = entry.sourceType === 'government' ? 'Government' : 'Various'
      const year = entry.year || 'n.d.'
      const url = entry.url || ''
      const doi = entry.doi ? `doi = {${entry.doi}},\n` : ''
      
      return `@misc{${key},
  title = {${title}},
  author = {${author}},
  year = {${year}},
  ${doi}url = {${url}},
  note = {${entry.category}}
}`
    }).join('\n\n')
    
    const blob = new Blob([bibtex], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inheritance-bibliography.bib'
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportAPA = () => {
    const apa = filteredEntries.map(entry => {
      const title = entry.title.replace(/\.$/, '')
      const year = entry.year || '(n.d.)'
      const url = entry.url ? ` Retrieved from ${entry.url}` : ''
      const doi = entry.doi ? ` https://doi.org/${entry.doi}` : ''
      
      return `${title}. (${year}).${url}${doi}`
    }).join('\n\n')
    
    const blob = new Blob([apa], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inheritance-bibliography-apa.txt'
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportMLA = () => {
    const mla = filteredEntries.map(entry => {
      const title = entry.title.replace(/\.$/, '')
      const year = entry.year || 'n.d.'
      const url = entry.url || ''
      
      return `"${title}." ${entry.category}, ${year}. Web. ${new Date().getFullYear()}. <${url}>`
    }).join('.\n\n')
    
    const blob = new Blob([mla], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inheritance-bibliography-mla.txt'
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportMarkdown = () => {
    const markdown = filteredEntries.map(entry => {
      const title = entry.title
      const year = entry.year || 'n.d.'
      const url = entry.url ? `[${entry.url}](${entry.url})` : ''
      const doi = entry.doi ? ` • [DOI: ${entry.doi}](https://doi.org/${entry.doi})` : ''
      const verified = entry.lastVerified ? ` • ✓ Verified ${entry.lastVerified}` : ''
      const archive = entry.archiveUrl ? ` • [Archived](${entry.archiveUrl})` : ''
      const sourceType = entry.sourceType ? ` • _${entry.sourceType.replace('-', ' ')}_` : ''
      
      return `- **${title}** (${year})${sourceType}${url}${doi}${verified}${archive}`
    }).join('\n\n')
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inheritance-bibliography.md'
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#fff',
              margin: 0,
              marginBottom: '8px'
            }}>
              Research Bibliography
            </h2>
            <div style={{
              fontSize: '13px',
              color: '#888',
              marginTop: '4px'
            }}>
              {bibliographyEntries.length} sources • {categories.length} categories
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(96, 165, 250, 0.2)',
                  color: '#fff',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Export ↓
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px',
                  minWidth: '150px',
                  zIndex: 10001
                }}>
                  <button
                    onClick={exportBibTeX}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    BibTeX
                  </button>
                  <button
                    onClick={exportAPA}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    APA
                  </button>
                  <button
                    onClick={exportMLA}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    MLA
                  </button>
                  <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                    margin: '4px 0'
                  }} />
                  <button
                    onClick={exportMarkdown}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Markdown
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none'
            }}
          />

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => {
                setSelectedCategory(null)
                setSelectedSourceType(null)
                setYearRange({ min: '', max: '' })
              }}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: selectedCategory === null && selectedSourceType === null && !yearRange.min && !yearRange.max ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: selectedCategory === cat ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Source Type Filter */}
          {sourceTypes.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', color: '#888', marginRight: '4px' }}>Source Type:</span>
              {sourceTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedSourceType(type === selectedSourceType ? null : type)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: selectedSourceType === type ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Year Range Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Year:</span>
            <input
              type="number"
              placeholder="Min"
              value={yearRange.min}
              onChange={(e) => setYearRange({ ...yearRange, min: e.target.value })}
              min={yearRangeOptions.min}
              max={yearRangeOptions.max}
              style={{
                width: '80px',
                padding: '6px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '12px', color: '#888' }}>to</span>
            <input
              type="number"
              placeholder="Max"
              value={yearRange.max}
              onChange={(e) => setYearRange({ ...yearRange, max: e.target.value })}
              min={yearRangeOptions.min}
              max={yearRangeOptions.max}
              style={{
                width: '80px',
                padding: '6px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Bibliography List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px'
        }}>
          {filteredEntries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#888',
              fontSize: '14px'
            }}>
              No sources found matching your criteria.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredEntries.map((entry, idx) => {
                const prevCategory = idx > 0 ? filteredEntries[idx - 1].category : null
                const showCategoryHeader = prevCategory !== entry.category

                return (
                  <div key={entry.id}>
                    {showCategoryHeader && (
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#60a5fa',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginTop: idx > 0 ? '24px' : 0,
                        marginBottom: '12px'
                      }}>
                        {entry.category}
                      </div>
                    )}
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#fff',
                          margin: 0,
                          flex: 1
                        }}>
                          {entry.title}
                        </h3>
                        {entry.sourceType && (
                          <span style={{
                            fontSize: '10px',
                            padding: '4px 8px',
                            backgroundColor: getSourceTypeColor(entry.sourceType),
                            color: '#fff',
                            borderRadius: '4px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginLeft: '12px'
                          }}>
                            {entry.sourceType.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                      
                      {entry.description && (
                        <div style={{
                          fontSize: '13px',
                          color: '#aaa',
                          marginBottom: '10px',
                          lineHeight: '1.5'
                        }}>
                          {entry.description}
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#888'
                      }}>
                        {entry.year && (
                          <span>{entry.year}</span>
                        )}
                        {entry.url && (
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#60a5fa',
                              textDecoration: 'underline',
                              cursor: 'pointer'
                            }}
                          >
                            View Source →
                          </a>
                        )}
                        {entry.doi && (
                          <a
                            href={`https://doi.org/${entry.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#60a5fa',
                              textDecoration: 'underline',
                              cursor: 'pointer'
                            }}
                          >
                            DOI: {entry.doi} →
                          </a>
                        )}
                        {entry.lastVerified && (
                          <span style={{ fontSize: '11px', color: '#4ade80' }}>
                            ✓ Verified {entry.lastVerified}
                          </span>
                        )}
                        {entry.archiveUrl && (
                          <a
                            href={entry.archiveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#888',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            Archived →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions
function inferSourceType(url: string): string {
  if (url.includes('gov.uk') || url.includes('whitehouse.gov') || url.includes('ec.europa.eu') || 
      url.includes('legislation.gov') || url.includes('aphis.usda.gov') || url.includes('agriculture.gov.au')) {
    return 'government'
  }
  if (url.includes('nature.com') || url.includes('springer.com') || url.includes('cell.com') || 
      url.includes('mdpi.com') || url.includes('doi.org') || url.includes('.edu')) {
    return 'peer-reviewed'
  }
  if (url.includes('worldanimalprotection') || url.includes('humanesociety.org') || 
      url.includes('awionline.org') || url.includes('hsi.org')) {
    return 'ngo'
  }
  if (url.includes('.com') && !url.includes('nature.com') && !url.includes('springer.com')) {
    return 'industry'
  }
  return 'other'
}

function getCategoryFromSourceType(sourceType: string): BibliographyEntry['category'] {
  switch (sourceType) {
    case 'government':
      return 'Government Sources'
    case 'peer-reviewed':
    case 'academic':
      return 'Academic Papers'
    case 'ngo':
      return 'NGO Reports'
    case 'industry':
      return 'Industry Sources'
    default:
      return 'Other'
  }
}

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
