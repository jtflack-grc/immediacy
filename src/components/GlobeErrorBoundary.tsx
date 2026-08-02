import { Component, ErrorInfo, ReactNode } from 'react'
import { State, MapMode } from '../engine/scenarioTypes'
import JurisdictionFallbackMap from './JurisdictionFallbackMap'

interface GlobeErrorBoundaryProps {
  children: ReactNode
  regionValues: Record<string, number>
  state?: State
  mapMode?: MapMode
}

interface GlobeErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches runtime errors thrown by the WebGL globe (react-globe.gl / three.js)
 * and swaps in the 2D jurisdiction fallback instead of crashing the whole app.
 */
export default class GlobeErrorBoundary extends Component<GlobeErrorBoundaryProps, GlobeErrorBoundaryState> {
  constructor(props: GlobeErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): GlobeErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Globe rendering error, falling back to jurisdiction list:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <JurisdictionFallbackMap
          regionValues={this.props.regionValues}
          state={this.props.state}
          mapMode={this.props.mapMode}
        />
      )
    }

    return this.props.children
  }
}
