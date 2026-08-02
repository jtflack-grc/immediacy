import { useState, useEffect, useReducer, useCallback, useRef } from 'react'
import GlobePanel from './components/GlobePanel'
import DecisionPanel from './components/DecisionPanel'
import TurnUCollection from './components/TurnUCollection'
import HeaderBar from './components/HeaderBar'
import MetricsPanel from './components/MetricsPanel'
import PostMortemModal from './components/PostMortemModal'
import TutorialModal from './components/TutorialModal'
import SaveLoadModal from './components/SaveLoadModal'
import ScenarioVariationModal from './components/ScenarioVariationModal'
import PhaseSummaryModal from './components/PhaseSummaryModal'
import DecisionImpactModal from './components/DecisionImpactModal'
import ValidationDisclaimer from './components/ValidationDisclaimer'
import CreditsModal from './components/CreditsModal'
import ResearchBibliography from './components/ResearchBibliography'
import GreatPersonModal from './components/GreatPersonModal'
import GreatPersonPanel from './components/GreatPersonPanel'
import WonderPanel from './components/WonderPanel'
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
import { applyDifficulty, applyStartingCondition } from './utils/scenarioVariations'
import { getMetricChangeReason } from './utils/feedbackReasons'
import { checkGreatPersonUnlocks, applyGreatPersonEffect, GreatPerson as GreatPersonData } from './utils/greatPeople'
import { checkAchievements } from './utils/achievements'
import { checkWonderCompletions, applyWonderEffect, getWonder, Wonder as WonderData } from './utils/wonders'
import { DifficultyLevel, StartingCondition } from './utils/scenarioVariations'
import './index.css'
import { reducer, Action } from './engine/reducer'
import { State } from './engine/scenarioTypes'
import { loadScenario, createInitialState, getNodeById, getPhaseByNodeId } from './engine/scenarioLoader'
import { reaffirmAssumption } from './engine/memoryDecay'
import { loadFromShareableURL } from './utils/exportUtils'

function App() {
  const [scenario, setScenario] = useState<any>(null)
  const [state, dispatch] = useReducer(reducer, null as any)
  const [isLoading, setIsLoading] = useState(true)
  const decisionPanelRef = useRef<HTMLDivElement>(null)
  const [showPostMortem, setShowPostMortem] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSaveLoad, setShowSaveLoad] = useState(false)
  const [showVariationModal, setShowVariationModal] = useState(false)
  const [showTitleCard, setShowTitleCard] = useState(() => {
    // Temporarily force show for testing - change back to: !localStorage.getItem('hasSeenTitleCard')
    const shouldShow = true
    console.log('showTitleCard initial value:', shouldShow)
    // If showing title card for first time, clear tutorial seen flag so tutorial shows after
    if (shouldShow && !localStorage.getItem('hasSeenTitleCard')) {
      sessionStorage.removeItem('tutorialSeen')
    }
    return shouldShow
  })
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('hasSeenWelcome')
  })
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
  const [showGreatPersonModal, setShowGreatPersonModal] = useState(false)
  const [unlockedGreatPerson, setUnlockedGreatPerson] = useState<GreatPersonData | null>(null)
  const [showWonderModal, setShowWonderModal] = useState(false)
  const [completedWonder, setCompletedWonder] = useState<WonderData | null>(null)
  const [showStartingSelector, setShowStartingSelector] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium')
  const [selectedStartingCondition, setSelectedStartingCondition] = useState<StartingCondition>('default')
  const [notification, setNotification] = useState<{
    type: 'great_person' | 'wonder' | 'phase_transition'
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
  
  const handleTutorialClose = () => {
    setShowTutorial(false)
    // Mark tutorial as seen for this session
    sessionStorage.setItem('tutorialSeen', 'true')
    // After tutorial, show starting selector if no saved state
    if (!state || state.auditTrail.length === 0) {
      setShowStartingSelector(true)
    }
  }
  
  // Show tutorial only on first visit (not on every refresh or phase change)
  useEffect(() => {
    // Only check once when component first mounts
    // Don't show if we're in the middle of a game (have audit trail) or if already seen
    const tutorialSeen = sessionStorage.getItem('tutorialSeen')
    if (!tutorialSeen) {
      // Wait a bit for state to load, then check
      const timer = setTimeout(() => {
        if (state && state.auditTrail.length === 0 && !state.flags.isComplete) {
          // Only show on truly fresh start - no decisions made yet
          setShowTutorial(true)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, []) // Empty array - only run once on mount, not on state changes

  // Load scenario and initialize state
  useEffect(() => {
    async function init() {
      try {
        console.log('App: Starting initialization...')
        // Force reload scenario to get latest version with new nodes
        const loadedScenario = await loadScenario(true)
        console.log('App: Scenario loaded', loadedScenario)
        setScenario(loadedScenario)
        
        // Try to load from shareable URL first
        const sharedState = loadFromShareableURL()
        if (sharedState) {
          dispatch({ type: 'INIT', payload: { initialState: sharedState } })
          setIsLoading(false)
          return
        }
        
        // Try to load from localStorage
        const saved = localStorage.getItem('scenarioState')
        const savedVersion = localStorage.getItem('scenarioStateVersion')
        const currentVersion = loadedScenario.version || '1.0.0'
        
        let initialState: State
        
        if (saved && savedVersion === currentVersion) {
          try {
            const parsed = JSON.parse(saved)
            // Validate it has the right structure
            if (parsed.turn !== undefined && parsed.metrics && parsed.map) {
              // Additional validation: check for required fields
              if (parsed.metrics.measured && parsed.metrics.unmeasured && parsed.map.regionValues) {
                // Validate that the currentNodeId exists in the scenario
                const nodeExists = getNodeById(loadedScenario, parsed.currentNodeId)
                if (nodeExists) {
                  initialState = parsed as State
                } else {
                  throw new Error('Current node ID not found in scenario')
                }
              } else {
                throw new Error('Invalid state structure - missing required fields')
              }
            } else {
              throw new Error('Invalid state structure')
            }
          } catch (e) {
            console.error('Failed to parse localStorage state (version mismatch or invalid):', e)
            // Reset to initial state due to incompatibility
            // Clear incompatible state
            localStorage.removeItem('scenarioState')
            localStorage.removeItem('scenarioStateVersion')
            const baseState = createInitialState(loadedScenario)
            // Apply any saved variation settings
            const savedVariation = localStorage.getItem('scenarioVariation')
            if (savedVariation) {
              try {
                const variation = JSON.parse(savedVariation)
                if (variation.difficulty && variation.startingCondition) {
                  const adjustedMetrics = applyStartingCondition(
                    applyDifficulty(baseState.metrics, variation.difficulty),
                    variation.startingCondition
                  )
                  initialState = {
                    ...baseState,
                    metrics: adjustedMetrics,
                    initialMetrics: JSON.parse(JSON.stringify(adjustedMetrics))
                  }
                } else {
                  initialState = baseState
                }
              } catch {
                initialState = baseState
              }
            } else {
              // New game - don't show selector yet, let welcome/tutorial show first
              // Only show selector if welcome has been seen
              const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
              if (hasSeenWelcome) {
                setShowStartingSelector(true)
              }
              setIsLoading(false)
              return
            }
          }
        } else {
          // Version mismatch or no saved state
          if (saved && savedVersion !== currentVersion) {
            // Version mismatch - resetting state
            localStorage.removeItem('scenarioState')
            localStorage.removeItem('scenarioStateVersion')
          }
          // Only show selector if welcome has been seen
          const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
          if (hasSeenWelcome) {
            setShowStartingSelector(true)
          }
          setIsLoading(false)
          return
        }
        
        // Check if welcome has been seen
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
        
        // Don't auto-load saved state - always show welcome/selector flow first
        // User can choose to continue saved game or start fresh
        if (!hasSeenWelcome) {
          // Welcome hasn't been seen - show it first
          setIsLoading(false)
          // Welcome will be shown (already set in useState)
          // Don't load state yet - will be handled after welcome closes
        } else {
          // Welcome seen - show selector to let them choose
          setShowStartingSelector(true)
          setIsLoading(false)
          // Don't auto-load saved state - let them choose via selector
        }
      } catch (error) {
        console.error('Initialization error:', error)
        alert(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }
    
    init()
  }, [])
  
  // Handle starting condition selection
  const handleStartingConditionSelect = (difficulty: DifficultyLevel, startingCondition: StartingCondition) => {
    setSelectedDifficulty(difficulty)
    setSelectedStartingCondition(startingCondition)
    
    if (scenario) {
      try {
        const initialState = createInitialState(scenario, difficulty, startingCondition)
        dispatch({ type: 'INIT', payload: { initialState } })
        setIsLoading(false)
        // Don't hide selector immediately - useEffect will hide it when state is available
        
        // Save variation settings
        localStorage.setItem('scenarioVariation', JSON.stringify({ difficulty, startingCondition }))
      } catch (error) {
        console.error('Error creating initial state:', error)
        alert(`Failed to start scenario: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setShowStartingSelector(true) // Show selector again on error
      }
    } else {
      console.error('Scenario not loaded when trying to start')
      alert('Scenario not loaded. Please refresh the page.')
      setShowStartingSelector(true) // Show selector again
    }
  }

  // Hide starting selector once state is confirmed available (after user selects difficulty)
  // This ensures state is actually set before hiding selector
  useEffect(() => {
    if (state && state.currentNodeId && showStartingSelector && !isLoading) {
      // State is confirmed available - safe to hide selector
      console.log('State confirmed available, hiding selector')
      setShowStartingSelector(false)
    }
  }, [state?.currentNodeId, showStartingSelector, isLoading])
  
  // Save to localStorage on state change
  useEffect(() => {
    if (state && scenario) {
      localStorage.setItem('scenarioState', JSON.stringify(state))
      localStorage.setItem('scenarioStateVersion', scenario.version || '1.0.0')
    }
  }, [state, scenario])

  const handleChoice = useCallback((choiceIndex: number, ownerRole: string, rationale: string, assumptions: string, preserveAssumptions: boolean) => {
    if (!scenario || !state) return
    
    // Force close all modals before processing choice to prevent black screen
    setShowImpactModal(false)
    setShowGreatPersonModal(false)
    setShowWonderModal(false)
    setShowPhaseSummary(false)
    
    const currentNode = getNodeById(scenario, state.currentNodeId)
    if (!currentNode || !currentNode.choices[choiceIndex]) return
    
    const choice = currentNode.choices[choiceIndex]
    const phaseId = getPhaseByNodeId(scenario, state.currentNodeId) || state.phaseId
    
    // Generate unmeasured impact description
    const unmeasuredParts: string[] = []
    if (choice.delta.metrics?.unmeasured) {
      const um = choice.delta.metrics.unmeasured
      if (um.welfareDebt) unmeasuredParts.push('increased welfare debt')
      if (um.enforcementGap) unmeasuredParts.push('increased enforcement gap')
      if (um.regulatoryCapture) unmeasuredParts.push('increased regulatory capture')
      if (um.sentienceKnowledgeGap) unmeasuredParts.push('increased knowledge gaps about animal sentience')
      if (um.systemIrreversibility) unmeasuredParts.push('increased system irreversibility')
    }
    const unmeasuredImpact = unmeasuredParts.length > 0 
      ? `This decision ${unmeasuredParts.join(', ')}.`
      : 'No significant unmeasured impacts detected.'

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
    
    // Update to next node
    const finalState: State = {
      ...newState,
      currentNodeId: choice.nextNodeId,
      phaseId: getPhaseByNodeId(scenario, choice.nextNodeId) || phaseId,
      flags: {
        ...newState.flags,
        isComplete: choice.nextNodeId === 'N16_COMPLETE',
      },
    }
    
    // Check for achievements
    const newAchievements = checkAchievements(finalState)
    newAchievements.forEach(achievementId => {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId } })
    })
    
    // Check for wonder completions
    const newWonders = checkWonderCompletions(finalState)
    let stateWithWonders = finalState
    if (newWonders.length > 0) {
      // Apply first wonder effect (others will be checked next turn)
      const firstWonderId = newWonders[0]
      const wonder = getWonder(firstWonderId)
      if (wonder) {
        stateWithWonders = applyWonderEffect(finalState, wonder)
        dispatch({ type: 'COMPLETE_WONDER', payload: { wonderId: firstWonderId } })
        setCompletedWonder(wonder)
        // Show Wonder notification banner
        setNotification({
          type: 'wonder',
          title: wonder.title,
          description: wonder.description
        })
      }
    }
    
    // Update finalState with achievements and wonders
    const finalStateWithAchievements = {
      ...stateWithWonders,
      achievements: [...(finalState.achievements || []), ...newAchievements],
      completedWonders: [...(finalState.completedWonders || []), ...newWonders]
    }
    
    // Check for Great Person unlocks
    const unlockedPerson = checkGreatPersonUnlocks(finalStateWithAchievements)
    if (unlockedPerson) {
      // Apply Great Person effect
      const stateWithEffect = applyGreatPersonEffect(finalState, unlockedPerson)
      
      // Add to state
      dispatch({ 
        type: 'UNLOCK_GREAT_PERSON', 
        payload: { 
          person: {
            id: unlockedPerson.id,
            title: unlockedPerson.title,
            description: unlockedPerson.description,
            quote: unlockedPerson.quote,
            unlockedTurn: finalState.turn
          }
        } 
      })
      
      // Apply effect to metrics
      const updatedState = {
        ...stateWithEffect,
        greatPeople: [...(finalStateWithAchievements.greatPeople || []), {
          id: unlockedPerson.id,
          title: unlockedPerson.title,
          description: unlockedPerson.description,
          quote: unlockedPerson.quote,
          unlockedTurn: finalState.turn
        }],
        achievements: finalStateWithAchievements.achievements
      }
      
      dispatch({ type: 'INIT', payload: { initialState: updatedState } })
      
      // Show Great Person notification banner
      setNotification({
        type: 'great_person',
        title: unlockedPerson.title,
        description: unlockedPerson.description
      })
      // Great Person modal disabled to prevent black screen issues
      // setUnlockedGreatPerson(unlockedPerson)
      // setShowGreatPersonModal(true)
    } else {
      dispatch({ type: 'INIT', payload: { initialState: finalStateWithAchievements } })
    }
    
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
        if (Math.abs(change) > 0.01) { // Only show significant changes
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
        if (Math.abs(change) > 0.01) {
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
    
    // Show impact modal (re-enabled)
    const newPhaseId = getPhaseByNodeId(scenario, choice.nextNodeId) || phaseId
    const phaseChanged = phaseId !== newPhaseId
    
    // Show impact modal only if phase didn't change
    if (!phaseChanged) {
      setLastChoiceData({
        choiceLabel: choice.label,
        nodeTitle: currentNode.title,
        delta: choice.delta,
        previousState: previousStateSnapshot,
        currentState: unlockedPerson ? applyGreatPersonEffect(finalState, unlockedPerson) : finalState
      })
      setShowImpactModal(true)
    } else {
      // Phase changed - close impact modal
      setShowImpactModal(false)
      setLastChoiceData(null)
    }
  }, [scenario, state])

  const handleNameSubmit = useCallback((name: string) => {
    if (state) {
      dispatch({ type: 'SET_PLAYER_NAME', payload: { playerName: name } })
    }
  }, [state])

  const handleReset = useCallback(() => {
    if (!scenario) return
    // Close all modals first
    setShowPhaseSummary(false)
    setShowImpactModal(false)
    setShowGreatPersonModal(false)
    setShowWonderModal(false)
    setCompletedPhaseId(null)
    setPreviousPhaseId(null)
    
    const initialState = createInitialState(scenario)
    dispatch({ type: 'RESET', payload: { initialState } })
    localStorage.removeItem('scenarioState')
    localStorage.removeItem('scenarioStateVersion')
  }, [scenario])

  const handleToggleDebug = useCallback(() => {
    dispatch({ type: 'TOGGLE_DEBUG' })
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
      // Force close all modals immediately to prevent black screen
      setShowImpactModal(false)
      setShowGreatPersonModal(false)
      setShowWonderModal(false)
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

  // Show starting condition selector if needed (but only after welcome/tutorial)
  // Note: selector needs scenario to be loaded
  // Check localStorage/sessionStorage directly to avoid race conditions with state updates
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
  const tutorialSeen = sessionStorage.getItem('tutorialSeen')
  if (showStartingSelector && scenario && !showWelcome && !showTutorial && !showTitleCard && hasSeenWelcome && tutorialSeen) {
    return <StartingConditionSelector onSelect={handleStartingConditionSelect} />
  }
  
  // Show title card first if needed
  if (showTitleCard) {
    // Continue rendering - title card will be shown below
  }
  // Show welcome modal if not seen - this can show even while scenario is loading
  else if (showWelcome) {
    // Continue rendering - welcome modal will be shown below
  }
  // Show loading only if we're actually loading and not showing welcome/tutorial/selector
  else if (isLoading && !showWelcome && !showStartingSelector && !showTitleCard) {
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
  
  // If no state and selector is closed, something went wrong - re-show selector
  // This prevents black screen if state didn't initialize properly
  if (!state && !showWelcome && !showStartingSelector && !showTitleCard && scenario && !isLoading) {
    console.warn('State not available after selector closed, re-showing selector')
    // Re-show selector to allow retry
    return <StartingConditionSelector onSelect={handleStartingConditionSelect} />
  }
  
  // If we don't have state yet and we're still loading, show loading screen (but not if title card is showing)
  if (!state && (isLoading || !scenario) && !showTitleCard) {
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
          <div style={{ fontSize: '18px', marginBottom: '12px' }}>Loading...</div>
          {!scenario && <div style={{ fontSize: '12px', color: '#888' }}>Loading scenario data...</div>}
          {!state && scenario && <div style={{ fontSize: '12px', color: '#888' }}>Initializing game state...</div>}
        </div>
      </div>
    )
  }

  // Debug logging removed for performance

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
        onShowTutorial={() => setShowTutorial(true)}
        onShowCredits={() => setShowCredits(true)}
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
          {state && !state.playerName ? (
            <TurnUCollection 
              onNameSubmit={handleNameSubmit}
              skipAnimation={false}
            />
          ) : (
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
                  {(['welfareStandards', 'welfareDebt', 'enforcement'] as const).map(mode => {
                    const isActive = state?.map?.mode === mode
                    const label = mode === 'welfareStandards' ? 'Standards' : mode === 'welfareDebt' ? 'Debt' : 'Enforcement'
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
            
            {/* Tools Menu - disabled for stability (was causing rare black-screen issues) */}
            
            {state && <GreatPersonPanel state={state} />}
            {state && <WonderPanel state={state} />}
            {state && <MetricsPanel state={state} />}
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
            {state && <GlobePanel regionValues={state.map.regionValues} state={state} mapMode={state.map.mode} />}
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
          {state && <MetricsPanel state={state} />}
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

      {/* Tutorial Modal - Only show if no other modals are active */}
      {showTutorial && !showPhaseSummary && !showImpactModal && !showPostMortem && (
        <TutorialModal 
          onClose={() => {
            setShowTutorial(false)
            // Mark tutorial as seen for this session
            sessionStorage.setItem('tutorialSeen', 'true')
            // After tutorial, show starting selector if no saved state
            if (!state || state.auditTrail.length === 0) {
              setShowStartingSelector(true)
            }
          }}
        />
      )}

      {/* Save/Load Modal */}
      {showSaveLoad && scenario && (
        <SaveLoadModal
          currentState={state}
          scenarioVersion={scenario.version || '1.0.0'}
          onLoad={handleLoadScenario}
          onClose={() => setShowSaveLoad(false)}
        />
      )}

      {/* Scenario Variation Modal */}
      {showVariationModal && (
        <ScenarioVariationModal
          onStart={(variation) => {
            // Save variation settings
            localStorage.setItem('scenarioVariation', JSON.stringify(variation))
            
            // Reset state with new variation
            if (scenario) {
              const baseState = createInitialState(scenario)
              const adjustedMetrics = applyStartingCondition(
                applyDifficulty(baseState.metrics, variation.difficulty),
                variation.startingCondition
              )
              const newState = {
                ...baseState,
                metrics: adjustedMetrics,
                initialMetrics: JSON.parse(JSON.stringify(adjustedMetrics))
              }
              dispatch({ type: 'INIT', payload: { initialState: newState } })
              
              // Set time limit if enabled
              if (variation.timeLimit) {
                setTimeLimit(variation.timeLimit)
                setTimeRemaining(variation.timeLimit * 60) // Convert to seconds
              }
            }
            
            setShowVariationModal(false)
          }}
          onClose={() => setShowVariationModal(false)}
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

      {/* Great Person Modal - Disabled to prevent black screen issues */}
      {/* {showGreatPersonModal && unlockedGreatPerson && state && (
        <GreatPersonModal 
          person={unlockedGreatPerson} 
          state={state}
          onClose={() => {
            setShowGreatPersonModal(false)
            setUnlockedGreatPerson(null)
          }} 
        />
      )} */}

      {/* Notification Banner */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          title={notification.title}
          description={notification.description}
          onClose={() => setNotification(null)}
          autoCloseDelay={notification.type === 'phase_transition' ? 3000 : 5000}
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

      {/* Title Card - Shows first on initial load */}
      {showTitleCard && (
        <TitleCard
          onClose={() => {
            console.log('TitleCard onClose called')
            // Check if this is the first time seeing the title card BEFORE setting the flag
            const isFirstTime = !localStorage.getItem('hasSeenTitleCard')
            setShowTitleCard(false)
            localStorage.setItem('hasSeenTitleCard', 'true')
            
            // After title card, check what to show next
            // Use setTimeout to ensure state updates happen after title card closes
            setTimeout(() => {
              const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
              
              console.log('TitleCard onClose - hasSeenWelcome:', hasSeenWelcome, 'isFirstTime:', isFirstTime)
              
              if (!hasSeenWelcome) {
                // Show welcome modal first
                console.log('TitleCard: Showing welcome modal')
                setShowWelcome(true)
              } else {
                // Welcome already seen - always show tutorial after title card
                // This ensures users get help/tutorial after seeing the title card
                sessionStorage.removeItem('tutorialSeen')
                console.log('TitleCard: Showing tutorial after title card')
                setShowTutorial(true)
              }
            }, 100)
          }}
        />
      )}

      {/* Welcome Modal */}
      {showWelcome && !showTitleCard && (
        <WelcomeModal
          onClose={() => {
            setShowWelcome(false)
            localStorage.setItem('hasSeenWelcome', 'true')
            
            // After welcome closes, show tutorial if not seen, otherwise show selector
            // Don't auto-load saved state - let user choose via selector
            const tutorialSeen = sessionStorage.getItem('tutorialSeen')
            if (!tutorialSeen) {
              setShowTutorial(true)
            } else {
              // Tutorial seen, show starting selector
              setShowStartingSelector(true)
            }
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
