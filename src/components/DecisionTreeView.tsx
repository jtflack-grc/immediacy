import { State, Scenario, Node, Phase } from '../engine/scenarioTypes'
import { getNodeById, getPhaseByNodeId } from '../engine/scenarioLoader'

interface DecisionTreeViewProps {
  scenario: Scenario
  state: State
  onClose: () => void
}

interface TreeNode {
  id: string
  title: string
  phaseId: string
  phaseTitle: string
  x: number
  y: number
  visited: boolean
  current: boolean
  children: TreeNode[]
}

export default function DecisionTreeView({ scenario, state, onClose }: DecisionTreeViewProps) {
  // Build tree structure from scenario
  const buildTree = (): TreeNode[] => {
    const nodes: Map<string, TreeNode> = new Map()
    const visitedNodes = new Set(state.auditTrail.map(r => r.nodeId))
    visitedNodes.add(state.currentNodeId)

    // First pass: create all nodes
    scenario.phases.forEach((phase: Phase) => {
      phase.nodes?.forEach((node: Node) => {
        const phaseId = getPhaseByNodeId(scenario, node.id) || phase.id
        const phaseTitle = scenario.phases.find(p => p.id === phaseId)?.title || phase.title
        
        nodes.set(node.id, {
          id: node.id,
          title: node.title,
          phaseId: phaseId,
          phaseTitle: phaseTitle,
          x: 0,
          y: 0,
          visited: visitedNodes.has(node.id),
          current: node.id === state.currentNodeId,
          children: []
        })
      })
    })

    // Second pass: build connections
    scenario.phases.forEach((phase: Phase) => {
      phase.nodes?.forEach((node: Node) => {
        const treeNode = nodes.get(node.id)
        if (!treeNode) return

        // Find all nodes that this node can lead to
        const nextNodeIds = new Set<string>()
        node.choices?.forEach(choice => {
          if (choice.nextNodeId && choice.nextNodeId !== node.id) {
            nextNodeIds.add(choice.nextNodeId)
          }
        })

        nextNodeIds.forEach(nextId => {
          const childNode = nodes.get(nextId)
          if (childNode && !treeNode.children.find(c => c.id === nextId)) {
            treeNode.children.push(childNode)
          }
        })
      })
    })

    // Layout: organize by phase, then by order within phase
    const processed = new Set<string>()
    
    // Group nodes by phase
    const nodesByPhase = new Map<string, TreeNode[]>()
    nodes.forEach(node => {
      if (!nodesByPhase.has(node.phaseId)) {
        nodesByPhase.set(node.phaseId, [])
      }
      nodesByPhase.get(node.phaseId)!.push(node)
    })

    // Sort nodes within each phase by their order in the scenario
    nodesByPhase.forEach((phaseNodes, phaseId) => {
      const phase = scenario.phases.find(p => p.id === phaseId)
      if (phase && phase.nodes) {
        phaseNodes.sort((a, b) => {
          const aIndex = phase.nodes!.findIndex(n => n.id === a.id)
          const bIndex = phase.nodes!.findIndex(n => n.id === b.id)
          return aIndex - bIndex
        })
      }
    })

    // Layout nodes: phases horizontally, nodes within phase vertically
    let phaseIndex = 0
    nodesByPhase.forEach((phaseNodes, phaseId) => {
      const x = phaseIndex * 280 + 150 // More horizontal spacing
      let yIndex = 0
      
      phaseNodes.forEach(node => {
        if (!processed.has(node.id)) {
          node.x = x
          node.y = yIndex * 120 + 150 // More vertical spacing (120px instead of 80px)
          processed.add(node.id)
          yIndex++
        }
      })
      
      phaseIndex++
    })

    // Ensure all nodes are laid out (handle any missed nodes)
    nodes.forEach(node => {
      if (!processed.has(node.id)) {
        const phaseIndex = scenario.phases.findIndex(p => p.id === node.phaseId)
        node.x = phaseIndex * 280 + 150
        node.y = 150
        processed.add(node.id)
      }
    })

    return Array.from(nodes.values())
  }

  const treeNodes = buildTree()
  const maxX = Math.max(...treeNodes.map(n => n.x), 1200)
  const maxY = Math.max(...treeNodes.map(n => n.y + 60), 800) // Add padding for text

  const getPhaseColor = (phaseId: string): string => {
    const phaseIndex = scenario.phases.findIndex(p => p.id === phaseId)
    const colors = [
      '#60a5fa', // Blue
      '#34d399', // Green
      '#fbbf24', // Yellow
      '#fb923c', // Orange
      '#a855f7', // Purple
      '#ef4444'  // Red
    ]
    return colors[phaseIndex % colors.length] || '#888'
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
      zIndex: 10000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '95vw',
        maxHeight: '95vh',
        width: '100%',
        overflow: 'auto',
        padding: '24px'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>
            Decision Tree View
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

        {/* Legend */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#111111',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#4ade80',
              border: '2px solid #000'
            }} />
            <span style={{ color: '#aaa' }}>Current Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#60a5fa',
              border: '2px solid #000'
            }} />
            <span style={{ color: '#aaa' }}>Visited</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#666',
              border: '2px solid #000'
            }} />
            <span style={{ color: '#aaa' }}>Not Visited</span>
          </div>
        </div>

        {/* SVG Tree Visualization */}
        <div style={{
          width: '100%',
          height: '700px',
          overflow: 'auto',
          backgroundColor: '#0a0a0a',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          <svg
            width={Math.max(maxX + 200, 1200)}
            height={Math.max(maxY + 100, 800)}
            style={{ display: 'block' }}
          >
            {/* Draw connections */}
            {treeNodes.map(node => {
              return node.children.map(child => {
                const childNode = treeNodes.find(n => n.id === child.id)
                if (!childNode) return null

                return (
                  <line
                    key={`${node.id}-${child.id}`}
                    x1={node.x}
                    y1={node.y}
                    x2={childNode.x}
                    y2={childNode.y}
                    stroke={node.visited ? '#60a5fa' : '#444'}
                    strokeWidth={2}
                    opacity={node.visited ? 0.6 : 0.3}
                    markerEnd="url(#arrowhead)"
                  />
                )
              })
            })}

            {/* Arrow marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill="#60a5fa"
                  opacity="0.6"
                />
              </marker>
            </defs>

            {/* Draw nodes */}
            {treeNodes.map(node => {
              const phaseColor = getPhaseColor(node.phaseId)
              const isCurrent = node.current
              const isVisited = node.visited

              let nodeColor = '#666'
              if (isCurrent) {
                nodeColor = '#4ade80'
              } else if (isVisited) {
                nodeColor = phaseColor
              }

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCurrent ? 20 : 16}
                    fill={nodeColor}
                    stroke={isCurrent ? '#fff' : '#000'}
                    strokeWidth={isCurrent ? 3 : 2}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Node title - split into multiple lines if needed */}
                  <text
                    x={node.x}
                    y={node.y + 40}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11px"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.title.length > 25 ? node.title.substring(0, 25) + '...' : node.title}
                  </text>
                  {/* Phase label */}
                  <text
                    x={node.x}
                    y={node.y + 55}
                    textAnchor="middle"
                    fill="#888"
                    fontSize="9px"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.phaseTitle.length > 20 ? node.phaseTitle.substring(0, 20) + '...' : node.phaseTitle}
                  </text>
                  {isCurrent && (
                    <text
                      x={node.x}
                      y={node.y - 35}
                      textAnchor="middle"
                      fill="#4ade80"
                      fontSize="12px"
                      fontWeight="600"
                    >
                      CURRENT
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Phase Legend */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#111111',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Phases:</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {scenario.phases.map((phase, idx) => {
              const colors = [
                '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#a855f7', '#ef4444'
              ]
              const color = colors[idx % colors.length] || '#888'
              
              return (
                <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color
                  }} />
                  <span style={{ fontSize: '11px', color: '#aaa' }}>{phase.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#111111',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          fontSize: '12px'
        }}>
          <div>
            <div style={{ color: '#888' }}>Total Nodes</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
              {treeNodes.length}
            </div>
          </div>
          <div>
            <div style={{ color: '#888' }}>Visited</div>
            <div style={{ color: '#60a5fa', fontWeight: 600, fontSize: '18px' }}>
              {treeNodes.filter(n => n.visited).length}
            </div>
          </div>
          <div>
            <div style={{ color: '#888' }}>Remaining</div>
            <div style={{ color: '#666', fontWeight: 600, fontSize: '18px' }}>
              {treeNodes.filter(n => !n.visited).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
