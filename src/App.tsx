import { useState, useEffect, useReducer, useCallback, useRef, useMemo } from 'react'
import GlobePanel from './components/GlobePanel'
import GlobeErrorBoundary from './components/GlobeErrorBoundary'
import JurisdictionFallbackMap from './components/JurisdictionFallbackMap'
import { isWebGLAvailable } from './utils/webgl'
import DecisionPanel from './components/DecisionPanel'
import SocAlertBanner from './components/SocAlertBanner'
import HeaderBar from './components/HeaderBar'
import MetricsPanel from './components/MetricsPanel'
import PostMortemModal from './components/PostMortemModal'
import TutorialModal from './components/TutorialModal'
import SaveLoadModal from './components/SaveLoadModal'
import PhaseSummaryModal from './components/PhaseSummaryModal'
import DecisionImpactModal from './components/DecisionImpactModal'
import ValidationDisclaimer from './components/ValidationDisclaimer'
import CreditsModal from './components/CreditsModal'
import ResearchBibliography from './components/ResearchBibliography'
import StartingConditionSelector from './components/StartingConditionSelector'
import NotificationBanner from './components/NotificationBanner'
import WelcomeModal from './components/WelcomeModal'
import ChoiceFeedbackPanel from './components/ChoiceFeedbackPanel'
import RunComparisonModal from './components/RunComparisonModal'
import PolicyComparisonModal from './components/PolicyComparisonModal'
import DebtTimelineModal from './components/DebtTimelineModal'
import MetaAnalysisModal from './components/MetaAnalysisModal'
import AssumptionTimeline from './components/AssumptionTimeline'
import DecisionTreeView from './components/DecisionTreeView'
import ToolsMenu from './components/ToolsMenu'
import TitleCard from './components/TitleCard'
import WarRoomStatusBar from './components/WarRoomStatusBar'
import EvidenceBoard from './components/EvidenceBoard'
import DecisionLogPanel from './components/DecisionLogPanel'
import DispatchFeed from './components/DispatchFeed'
import { DEFAULT_INCIDENT_CONDITIONS } from './utils/scenarioVariations'
import { getMetricChangeReason } from './utils/feedbackReasons'
import { checkAchievements } from './utils/achievements'
import './index.css'
import { reducer, Action } from './engine/reducer'
import { State } from './engine/scenarioTypes'
import { loadScenario, createInitialState, getNodeById, getPhaseByNodeId } from './engine/scenarioLoader'
import { reaffirmAssumption } from './engine/memoryDecay'
import { loadFromShareableURL } from './utils/exportUtils'
import { inferFlagsFromChoice } from './engine/dispatches'
import { advanceIncidentTime, getTimeCost } from './engine/incidentClock'
import { resolveNextNodeId } from './engine/resolveNext'

function getSavedScenarioConditions(): string[] {
  try {
    const saved = localStorage.getItem('scenarioConditions')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_INCIDENT_CONDITIONS
}

function App() {
  const [scenario, setScenario] = useState<any>(null)
  const [state, dispatch] = useReducer(reducer, null as any)
  const [isLoading, setIsLoading] = useState(true)
  const decisionPanelRef = useRef<HTMLDivElement>(null)
  const [showPostMortem, setShowPostMortem] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSaveLoad, setShowSaveLoad] = useState(false)
  // Cold open: title card only shows the first time this browser has ever seen it.
  const [showTitleCard, setShowTitleCard] = useState(() => !localStorage.getItem('hasSeenTitleCard'))
  // Welcome/tutorial are opt-in from the Help button — not shown on the default cold-open path.
  const [showWelcome, setShowWelcome] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showPolicyComparison, setShowPolicyComparison] = useState(false)
  const [showDebtTimeline, setShowDebtTimeline] = useState(false)
  const [showMetaAnalysis, setShowMetaAnalysis] = useState(false)
  const [showAssumptionTimeline, setShowAssumptionTimeline] = useState(false)
  const [showDecisionTree, setShowDecisionTree] = useState(false)
  const [choiceFeedback, setChoiceFeedback] = useState<{
    choiceLabel: string
    measuredChanges: { metric: string; change: number; direction: 'up' | 'down'; reason: string }[]
    unmeasuredChanges: { metric: string; change: number; direction: 'up' | 'down'; reason: string }[]
  } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined)
  const [showPhaseSummary, setShowPhaseSummary] = useState(false)
  const [completedPhaseId, setCompletedPhaseId] = useState<string | null>(null)
  const [previousPhaseId, setPreviousPhaseId] = useState<string | null>(null)
  const [showImpactModal, setShowImpactModal] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [showResearchBibliography, setShowResearchBibliography] = useState(false)
  // Scenario conditions selector — accessible from the header menu, never blocks cold open.
  const [showScenarioConditions, setShowScenarioConditions] = useState(false)
  const [scenarioConditions, setScenarioConditions] = useState<string[]>(() => getSavedScenarioConditions())
  const [notification, setNotification] = useState<{
    type: 'phase_transition'
    title: string
    description: string
  } | null>(null)
  const [learningSidebarCollapsed, setLearningSidebarCollapsed] = useState(false)
  const [lastChoiceData, setLastChoiceData] = useState<{
    choiceLabel: string
    nodeTitle: string
    delta: any
    previousState: State
    currentState: State
  } | null>(null)
  
  // Check if mobile / narrow desktop (with safety check) - MUST be before any conditional returns
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })
  const [isNarrowDesktop, setIsNarrowDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      return width >= 768 && width < 1280
    }
    return false
  })
  // WebGL support doesn't change during a session — detect once up front so we can
  // fall back to a plain jurisdiction list instead of a blank/broken globe.
  const hasWebGL = useMemo(() => isWebGLAvailable(), [])

  // Keep layout flags in sync with viewport size (handles rotation / resize)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      const width = window.innerWidth
      const nextIsMobile = width < 768
      const nextIsNarrowDesktop = width >= 768 && width < 1280
      setIsMobile(prev => (prev !== nextIsMobile ? nextIsMobile : prev))
      setIsNarrowDesktop(prev => (prev !== nextIsNarrowDesktop ? nextIsNarrowDesktop : prev))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load scenario and initialize state — cold open goes straight to the game:
  // no forced Welcome modal, no forced Tutorial, no forced starting-condition gate.
  useEffect(() => {
    async function init() {
      try {
        const loadedScenario = await loadScenario(true)
        setScenario(loadedScenario)

        // Cold open skips Welcome by default; mark it seen so Help-triggered
        // Welcome/Tutorial don't loop back into the gating flow.
        if (!localStorage.getItem('hasSeenWelcome')) {
          localStorage.setItem('hasSeenWelcome', 'true')
        }

        // Try to load from a shareable URL first
        const sharedState = loadFromShareableURL()
        if (sharedState) {
          dispatch({ type: 'INIT', payload: { initialState: sharedState } })
          setIsLoading(false)
          return
        }

        // Try to resume from localStorage
        const saved = localStorage.getItem('scenarioState')
        const savedVersion = localStorage.getItem('scenarioStateVersion')
        const currentVersion = loadedScenario.version || '2.0.0'

        if (saved && savedVersion === currentVersion) {
          try {
            const parsed = JSON.parse(saved)
            if (
              parsed.turn !== undefined &&
              parsed.metrics &&
              parsed.map &&
              parsed.metrics.measured &&
              parsed.metrics.unmeasured &&
              parsed.map.regionValues &&
              getNodeById(loadedScenario, parsed.currentNodeId)
            ) {
              dispatch({ type: 'INIT', payload: { initialState: parsed as State } })
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('Failed to parse saved state, starting fresh:', e)
          }
          // Saved state was invalid/incompatible — clear it and fall through to a fresh start
          localStorage.removeItem('scenarioState')
          localStorage.removeItem('scenarioStateVersion')
        } else if (saved && savedVersion !== currentVersion) {
          localStorage.removeItem('scenarioState')
          localStorage.removeItem('scenarioStateVersion')
        }

        // Fresh start — auto-init with the current incident condition flags
        // (default ['standard']) and go straight into the game.
        const conditions = getSavedScenarioConditions()
        setScenarioConditions(conditions)
        const initialState = createInitialState(loadedScenario, conditions)
        dispatch({ type: 'INIT', payload: { initialState } })
        setIsLoading(false)
      } catch (error) {
        console.error('Initialization error:', error)
        alert(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }

    init()
  }, [])

  // Apply new scenario conditions from the menu-accessible selector — restarts the run.
  const handleApplyScenarioConditions = useCallback((conditions: string[]) => {
    setScenarioConditions(conditions)
    localStorage.setItem('scenarioConditions', JSON.stringify(conditions))
    setShowScenarioConditions(false)

    if (!scenario) return
    const initialState = createInitialState(scenario, conditions)
    dispatch({ type: 'RESET', payload: { initialState } })
    localStorage.removeItem('scenarioState')
    localStorage.removeItem('scenarioStateVersion')
  }, [scenario])

  // Save to localStorage on state change
  useEffect(() => {
    if (state && scenario) {
      localStorage.setItem('scenarioState', JSON.stringify(state))
      localStorage.setItem('scenarioStateVersion', scenario.version || '2.0.0')
    }
  }, [state, scenario])

  const handleChoice = useCallback((choiceIndex: number, ownerRole: string, rationale: string, assumptions: string, preserveAssumptions: boolean) => {
    if (!scenario || !state) return
    
    // Force close all modals before processing choice to prevent black screen
    setShowImpactModal(false)
    setShowPhaseSummary(false)
    
    const currentNode = getNodeById(scenario, state.currentNodeId)
    if (!currentNode || !currentNode.choices[choiceIndex]) return
    
    const choice = currentNode.choices[choiceIndex]
    const phaseId = getPhaseByNodeId(scenario, state.currentNodeId) || state.phaseId
    
    // Generate unmeasured impact description
    const unmeasuredParts: string[] = []
    if (choice.delta.metrics?.unmeasured) {
      const um = choice.delta.metrics.unmeasured
      if (um.disclosureDebt) unmeasuredParts.push(um.disclosureDebt > 0 ? 'increased disclosure debt' : 'reduced disclosure debt')
      if (um.regulatoryExposure) unmeasuredParts.push(um.regulatoryExposure > 0 ? 'increased regulatory exposure' : 'reduced regulatory exposure')
      if (um.narrativeIntegrity) unmeasuredParts.push(um.narrativeIntegrity < 0 ? 'hurt narrative integrity' : 'improved narrative integrity')
      if (um.factsConfidence) unmeasuredParts.push(um.factsConfidence < 0 ? 'reduced facts confidence' : 'improved facts confidence')
      if (um.commitmentLock) unmeasuredParts.push(um.commitmentLock > 0 ? 'increased commitment lock' : 'reduced commitment lock')
    }
    const unmeasuredImpact = unmeasuredParts.length > 0 
      ? `This decision ${unmeasuredParts.join(', ')}.`
      : 'No significant unmeasured disclosure impacts detected.'

    // Other options on this node, for the decision log's "what else was considered" trail
    const alternativesConsidered = currentNode.choices
      .filter((_, idx) => idx !== choiceIndex)
      .map(c => c.label)

    // Evidence known at the moment this decision was made
    const factsAvailable = (state.evidence || []).map(f => f.text)

    // Apply the choice action
    const action: Action = {
      type: 'CHOOSE_OPTION',
      payload: {
        choiceId: `C${choiceIndex + 1}`,
        ownerRole,
        rationale,
        assumptions,
        delta: choice.delta,
        nodeTitle: currentNode.title,
        chosenLabel: choice.label,
        phaseId,
        unmeasuredImpact,
        alternativesConsidered,
        factsAvailable,
      },
    }
    
    // Store previous state for impact comparison
    const previousStateSnapshot = JSON.parse(JSON.stringify(state))
    
    // Get new state from reducer
    let newState = reducer(state, action)
    
    // If preserve assumptions is checked, reaffirm all existing assumptions
    if (preserveAssumptions && newState.memory.assumptionsBank.length > 0) {
      newState.memory.assumptionsBank.forEach(assumption => {
        newState = reaffirmAssumption(newState, assumption.text, newState.turn)
      })
    }

    // Infer incident flags from the choice text
    const inferred = inferFlagsFromChoice(choice.label, rationale)
    newState = {
      ...newState,
      flags: { ...newState.flags, ...inferred },
    }

    // Advance incident clock and deliver dispatches
    const dispatchLogLengthBefore = newState.dispatchLog.length
    const timeCost = getTimeCost(choice)
    newState = advanceIncidentTime(newState, timeCost)
    const dispatchDeliveredThisTurn = newState.dispatchLog.length > dispatchLogLengthBefore

    // Now that the clock has advanced, stamp the just-created audit record with the
    // incident time it actually landed at (rather than the pre-advance time).
    if (newState.auditTrail.length > 0) {
      const lastIdx = newState.auditTrail.length - 1
      const auditTrail = [...newState.auditTrail]
      auditTrail[lastIdx] = { ...auditTrail[lastIdx], incidentTime: newState.incidentTime }
      newState = { ...newState, auditTrail }
    }

    // Resolve next node (may diverge based on flags)
    const nextId = resolveNextNodeId(newState, choice, currentNode)
    
    // Update to next node
    const finalState: State = {
      ...newState,
      currentNodeId: nextId,
      phaseId: getPhaseByNodeId(scenario, nextId) || phaseId,
      flags: {
        ...newState.flags,
        isComplete: nextId === 'N16_COMPLETE' || nextId.includes('COMPLETE'),
      },
    }
    
    // Check for achievements
    const newAchievements = checkAchievements(finalState)
    newAchievements.forEach(achievementId => {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId } })
    })
    
    const finalStateWithAchievements = {
      ...finalState,
      achievements: [...(finalState.achievements || []), ...newAchievements],
    }

    dispatch({ type: 'INIT', payload: { initialState: finalStateWithAchievements } })
    
    // Scroll decision panel to top after choice is made and new turn starts
    // Use setTimeout to ensure state update and DOM render have completed
    setTimeout(() => {
      if (decisionPanelRef.current) {
        decisionPanelRef.current.scrollTop = 0
      }
    }, 300)
    
    // Generate feedback for this choice
    const measuredChanges: Array<{ metric: string; change: number; direction: 'up' | 'down'; reason: string }> = []
    const unmeasuredChanges: Array<{ metric: string; change: number; direction: 'up' | 'down'; reason: string }> = []
    
    if (choice.delta.metrics?.measured) {
      Object.entries(choice.delta.metrics.measured).forEach(([metric, change]) => {
        if (Math.abs(change) > 0.06) { // Only show larger swings — keep this panel subtle
          measuredChanges.push({
            metric,
            change,
            direction: change > 0 ? 'up' : 'down',
            reason: getMetricChangeReason(metric, change)
          })
        }
      })
    }
    
    if (choice.delta.metrics?.unmeasured) {
      Object.entries(choice.delta.metrics.unmeasured).forEach(([metric, change]) => {
        if (Math.abs(change) > 0.06) { // Only show larger swings — keep this panel subtle
          unmeasuredChanges.push({
            metric,
            change,
            direction: change > 0 ? 'up' : 'down',
            reason: getMetricChangeReason(metric, change)
          })
        }
      })
    }
    
    // Show feedback if there are significant changes
    if (measuredChanges.length > 0 || unmeasuredChanges.length > 0) {
      setChoiceFeedback({
        choiceLabel: choice.label,
        measuredChanges,
        unmeasuredChanges
      })
    }
    
    // Only interrupt with the full impact modal for genuinely notable turns — everything
    // else relies on the subtler ChoiceFeedbackPanel (or nothing at all).
    const newPhaseId = getPhaseByNodeId(scenario, finalState.currentNodeId) || phaseId
    const phaseChanged = phaseId !== newPhaseId

    const metricDeltaSum =
      Object.values(choice.delta.metrics?.measured || {}).reduce((sum, v) => sum + Math.abs(v as number), 0) +
      Object.values(choice.delta.metrics?.unmeasured || {}).reduce((sum, v) => sum + Math.abs(v as number), 0)

    const SIGNIFICANT_FLAGS = ['adversaryDisclosedFirst', 'paidRansom', 'scopeRevisedUp']
    const significantFlagNewlySet = SIGNIFICANT_FLAGS.some(
      flag => finalStateWithAchievements.flags[flag] && !previousStateSnapshot.flags[flag]
    )

    const isNotableTurn =
      phaseChanged || metricDeltaSum > 0.35 || dispatchDeliveredThisTurn || significantFlagNewlySet

    if (isNotableTurn) {
      setLastChoiceData({
        choiceLabel: choice.label,
        nodeTitle: currentNode.title,
        delta: choice.delta,
        previousState: previousStateSnapshot,
        currentState: finalState
      })
      setShowImpactModal(true)
    } else {
      setShowImpactModal(false)
      setLastChoiceData(null)
    }
  }, [scenario, state])

  // Cold open: a single acknowledgement on the SOC alert sets the incident lead name
  // (defaulting to "Incident Lead") and drops straight into the first decision node —
  // no TEMPO name-quiz intro.
  const handleSocAcknowledge = useCallback((name?: string) => {
    dispatch({ type: 'SET_PLAYER_NAME', payload: { playerName: name?.trim() || 'Incident Lead' } })
  }, [])

  const handleReset = useCallback(() => {
    if (!scenario) return
    // Close all modals first
    setShowPhaseSummary(false)
    setShowImpactModal(false)
    setCompletedPhaseId(null)
    setPreviousPhaseId(null)
    
    const initialState = createInitialState(scenario, scenarioConditions)
    dispatch({ type: 'RESET', payload: { initialState } })
    localStorage.removeItem('scenarioState')
    localStorage.removeItem('scenarioStateVersion')
  }, [scenario, scenarioConditions])

  const handleToggleDebug = useCallback(() => {
    dispatch({ type: 'TOGGLE_DEBUG' })
  }, [])

  const handleSetTimeMode = useCallback((mode: State['timeMode']) => {
    dispatch({ type: 'SET_TIME_MODE', payload: { mode } })
  }, [])

  const handleLoadScenario = useCallback((loadedState: State) => {
    dispatch({ type: 'INIT', payload: { initialState: loadedState } })
    setShowSaveLoad(false)
  }, [])
  
  // Show post-mortem when scenario is complete
  useEffect(() => {
    if (state && state.flags.isComplete) {
      setShowPostMortem(true)
    }
  }, [state])

  // Detect phase completion and show learning summary
  useEffect(() => {
    if (!state || !scenario) return
    
    const currentPhaseId = state.phaseId
    
    // Initialize previousPhaseId if not set
    if (!previousPhaseId) {
      setPreviousPhaseId(currentPhaseId)
      return
    }
    
    // Phase changed - show subtle notification
    if (previousPhaseId !== currentPhaseId && state && state.turn > 0) {
      // Phase Summary modal is disabled/unused — keep it closed. The Decision Impact
      // Modal is intentionally left alone here: phaseChanged is one of the conditions
      // that triggers it in handleChoice, so closing it here would immediately undo that.
      setShowPhaseSummary(false)
      setCompletedPhaseId(previousPhaseId)
      
      // Show phase transition notification
      const newPhase = scenario.phases.find(p => p.id === currentPhaseId)
      if (newPhase) {
        setNotification({
          type: 'phase_transition',
          title: `Entering ${newPhase.title}`,
          description: newPhase.description
        })
      }
    }
    setPreviousPhaseId(currentPhaseId)
  }, [state?.phaseId, scenario, previousPhaseId, state?.turn])

  // Time limit countdown
  useEffect(() => {
    if (timeRemaining !== undefined && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === undefined || prev <= 1) {
            // Time's up - show warning or end scenario
            alert('Time limit reached! Your scenario run has ended.')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining])

  // Update mobile state on resize - MUST be before conditional returns
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate currentNode - MUST be before conditional returns (used in JSX)
  const currentNode = scenario && state ? getNodeById(scenario, state.currentNodeId) : null
  
  // Scroll decision panel to top when turn changes (new decision appears)
  // MUST be before conditional returns (Rules of Hooks)
  useEffect(() => {
    if (state && decisionPanelRef.current) {
      // Use setTimeout to ensure DOM has updated with new content
      const timer = setTimeout(() => {
        if (decisionPanelRef.current) {
          decisionPanelRef.current.scrollTop = 0
        }
      }, 150) // Slightly longer delay to ensure content is rendered
      return () => clearTimeout(timer)
    }
  }, [state?.turn, state?.currentNodeId]) // Scroll when turn or node changes

  // Show title card first if needed (only ever once per browser)
  if (showTitleCard) {
    // Continue rendering - title card will be shown below
  }
  // Loading only shows while the scenario/state are actually being fetched/created
  else if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        width: '100vw',
        color: '#fff',
        backgroundColor: '#000000',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '12px' }}>Loading scenario...</div>
          {!scenario && <div style={{ fontSize: '12px', color: '#888' }}>Loading scenario data...</div>}
          {!state && scenario && <div style={{ fontSize: '12px', color: '#888' }}>Initializing state...</div>}
        </div>
      </div>
    )
  }

  // If we still don't have state after loading finished, something went wrong — retry a fresh init
  if (!state && !showTitleCard && scenario && !isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        width: '100vw',
        color: '#fff',
        backgroundColor: '#000000',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '12px' }}>Something went wrong.</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '12px',
              padding: '10px 20px',
              backgroundColor: '#60a5fa',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100vh', 
      width: '100%',
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: isMobile ? 'auto' : 'hidden'
    }}>
      {/* Header Bar */}
      <HeaderBar 
        state={state} 
        onToggleDebug={handleToggleDebug}
        onShowHelp={() => setShowWelcome(true)}
        onShowCredits={() => setShowCredits(true)}
        onShowScenarioConditions={() => setShowScenarioConditions(true)}
      />
      
      {/* Main Content Area */}
      <div style={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Left: Decision Panel */}
        <div 
          ref={decisionPanelRef}
          style={{ 
            // Narrower decision column on laptops to leave room for the globe
            flex: isMobile ? '0 0 auto' : isNarrowDesktop ? '0 0 320px' : '0 0 380px',
            width: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '50vh' : 'none',
            padding: isMobile ? '16px' : '24px', 
            borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: isMobile ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            overflowY: 'auto',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column'
          }}>
          {state && (
            <DecisionPanel 
              node={currentNode}
              state={state}
              onChoice={handleChoice}
              turn={state?.turn || 0}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Left of Globe: Metrics Panel */}
        {!isMobile && (
          <div style={{ 
            // Wide enough for Standards/Debt/Enforcement buttons in one row
            flex: isNarrowDesktop ? '0 0 320px' : '0 0 380px', 
            padding: isNarrowDesktop ? '14px' : '18px', 
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            overflowY: 'auto',
            backgroundColor: '#000000'
          }}>
            {/* War-room status strip — incident clock, facts, deadlines, dispatches, debt/control */}
            {state && <WarRoomStatusBar state={state} onSetTimeMode={handleSetTimeMode} />}

            {/* Map Mode Selector - matches app button highlighting */}
            {state && (
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                  alignSelf: 'stretch',
                  textAlign: 'center'
                }}>
                  Map View
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {(['disclosurePosture', 'disclosureDebt', 'regulatoryExposure'] as const).map(mode => {
                    const isActive = state?.map?.mode === mode
                    const label = mode === 'disclosurePosture' ? 'Posture' : mode === 'disclosureDebt' ? 'Debt' : 'Enforcement'
                    return (
                      <button
                        key={mode}
                        onClick={() => dispatch({ type: 'SET_MAP_MODE', payload: { mode } })}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                        style={{
                          padding: '12px 16px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: isActive ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: '#ffffff',
                          border: `2px solid ${isActive ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                          letterSpacing: '0.3px'
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Money / FAIR first — above map view */}
            {state && <MetricsPanel state={state} />}

            {/* Evidence, decision log, and dispatch feed — war-room context below core metrics */}
            {state && <EvidenceBoard state={state} />}
            {state && <DecisionLogPanel state={state} />}
            {state && <DispatchFeed state={state} />}
          </div>
        )}

        {/* Center: Globe */}
        <div style={{ 
          flex: isMobile ? '0 0 50vh' : 1,
          width: isMobile ? '100%' : 'auto',
          position: 'relative', 
          backgroundColor: '#000000',
          minWidth: 0,
          minHeight: isMobile ? '300px' : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {state && (
              hasWebGL ? (
                <GlobeErrorBoundary regionValues={state.map.regionValues} state={state} mapMode={state.map.mode}>
                  <GlobePanel regionValues={state.map.regionValues} state={state} mapMode={state.map.mode} />
                </GlobeErrorBoundary>
              ) : (
                <JurisdictionFallbackMap regionValues={state.map.regionValues} state={state} mapMode={state.map.mode} />
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Metrics */}
      {isMobile && (
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#000000',
          padding: '16px',
          overflowY: 'auto',
          maxHeight: '40vh'
        }}>
          {state && <WarRoomStatusBar state={state} onSetTimeMode={handleSetTimeMode} />}
          {state && <MetricsPanel state={state} />}
          {state && <EvidenceBoard state={state} />}
          {state && <DecisionLogPanel state={state} />}
          {state && <DispatchFeed state={state} />}
        </div>
      )}

      {/* Post-Mortem Modal */}
      {showPostMortem && state && (
        <PostMortemModal 
          state={state}
          onClose={() => setShowPostMortem(false)} 
        />
      )}

      {/* Decision Impact Modal */}
      {showImpactModal && lastChoiceData && (
        <DecisionImpactModal
          isOpen={showImpactModal}
          onClose={() => {
            setShowImpactModal(false)
            setLastChoiceData(null)
          }}
          choiceLabel={lastChoiceData.choiceLabel}
          nodeTitle={lastChoiceData.nodeTitle}
          delta={lastChoiceData.delta}
          previousState={lastChoiceData.previousState}
          currentState={lastChoiceData.currentState}
        />
      )}

      {/* Tutorial Modal - opt-in via Help, never shown on the cold-open path */}
      {showTutorial && !showPhaseSummary && !showImpactModal && !showPostMortem && (
        <TutorialModal 
          onClose={() => {
            setShowTutorial(false)
            sessionStorage.setItem('tutorialSeen', 'true')
          }}
        />
      )}

      {/* Save/Load Modal */}
      {showSaveLoad && scenario && (
        <SaveLoadModal
          currentState={state}
          scenarioVersion={scenario.version || '2.0.0'}
          onLoad={handleLoadScenario}
          onClose={() => setShowSaveLoad(false)}
        />
      )}

      {/* Scenario Conditions Selector - menu-accessible only, never blocks cold open */}
      {showScenarioConditions && (
        <StartingConditionSelector
          initialConditions={scenarioConditions}
          onApply={handleApplyScenarioConditions}
          onClose={() => setShowScenarioConditions(false)}
        />
      )}

      {/* Phase Summary Modal - Disabled to prevent black screen issues */}
      {/* {showPhaseSummary && (
        <PhaseSummaryModal
          phaseId={completedPhaseId}
          scenario={scenario}
          state={state}
          onClose={() => {
            setShowPhaseSummary(false)
            setCompletedPhaseId(null)
          }}
        />
      )} */}

      {/* Research Bibliography Modal */}
      {showResearchBibliography && scenario && (
        <ResearchBibliography
          scenario={scenario}
          onClose={() => setShowResearchBibliography(false)}
        />
      )}

      {/* Credits Modal */}
      {showCredits && (
        <CreditsModal
          onClose={() => setShowCredits(false)}
        />
      )}

      {/* Notification Banner */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          title={notification.title}
          description={notification.description}
          onClose={() => setNotification(null)}
          autoCloseDelay={3000}
        />
      )}

      {/* Choice Feedback Panel */}
      {choiceFeedback && (
        <ChoiceFeedbackPanel
          choiceLabel={choiceFeedback.choiceLabel}
          measuredChanges={choiceFeedback.measuredChanges}
          unmeasuredChanges={choiceFeedback.unmeasuredChanges}
          onClose={() => setChoiceFeedback(null)}
        />
      )}

      {/* Title Card - shows once per browser on cold open, never blocks return visits */}
      {showTitleCard && (
        <TitleCard
          onClose={() => {
            setShowTitleCard(false)
            localStorage.setItem('hasSeenTitleCard', 'true')
          }}
        />
      )}

      {/* SOC Alert - cold open lands here instead of a TEMPO name quiz. Single
          acknowledgement sets the incident lead name and drops straight into N01. */}
      {!showTitleCard && state && !state.playerName && (
        <SocAlertBanner onAcknowledge={handleSocAcknowledge} />
      )}

      {/* Welcome Modal - opt-in via Help button only; chains into the Tutorial on close */}
      {showWelcome && !showTitleCard && (
        <WelcomeModal
          onClose={() => {
            setShowWelcome(false)
            localStorage.setItem('hasSeenWelcome', 'true')
            setShowTutorial(true)
          }}
        />
      )}

      {/* Run Comparison Modal */}
      {showComparison && state && (
        <RunComparisonModal
          currentState={state}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Policy Comparison Modal */}
      {showPolicyComparison && state && (
        <PolicyComparisonModal
          currentState={state}
          onSelectRun={(runId) => {
            // Load the selected parallel run
            const parallelRuns = JSON.parse(localStorage.getItem('parallelRuns') || '[]')
            const selectedRun = parallelRuns.find((r: any) => r.id === runId)
            if (selectedRun) {
              dispatch({ type: 'INIT', payload: { initialState: selectedRun.state } })
            }
            setShowPolicyComparison(false)
          }}
          onClose={() => setShowPolicyComparison(false)}
        />
      )}

      {/* Debt Timeline Modal */}
      {showDebtTimeline && state && (
        <DebtTimelineModal
          state={state}
          onClose={() => setShowDebtTimeline(false)}
        />
      )}

      {/* Assumption Timeline Modal */}
      {showAssumptionTimeline && state && (
        <AssumptionTimeline
          state={state}
          onClose={() => setShowAssumptionTimeline(false)}
        />
      )}

      {/* Decision Tree View Modal */}
      {showDecisionTree && scenario && state && (
        <DecisionTreeView
          scenario={scenario}
          state={state}
          onClose={() => setShowDecisionTree(false)}
        />
      )}


      {/* Debug Panel */}
      {state?.flags?.showDebug && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '400px',
          maxHeight: '500px',
          backgroundColor: '#111111',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          overflowY: 'auto',
          zIndex: 999,
          fontSize: '11px',
          fontFamily: 'monospace'
        }}>
          <div style={{ color: '#fff', fontWeight: 600, marginBottom: '12px' }}>Debug: State JSON</div>
          <pre style={{ color: '#aaa', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App
