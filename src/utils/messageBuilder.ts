import { Node } from '../engine/scenarioTypes'

export interface ChatMessage {
  id: string
  type: 'system' | 'prompt' | 'context' | 'vignette' | 'caseStudy' | 'moralUncertainty' | 'longtermism' | 'choices'
  content: string
  delay: number // Milliseconds to wait before showing this message
  metadata?: {
    caseStudyIndex?: number
    uncertaintyIndex?: number
    longtermismIndex?: number
  }
}

/**
 * Converts a node into a sequence of chat messages
 */
export function buildMessageSequence(node: Node, turn: number, playerName?: string): ChatMessage[] {
  const messages: ChatMessage[] = []
  let currentDelay = 0

  // 1. System message - Turn and title
  messages.push({
    id: `${node.id}-system`,
    type: 'system',
    content: `**Turn ${turn}**\n\n**${node.title}**`,
    delay: currentDelay
  })
  currentDelay += 800 // Wait for system message to finish typing

  // 2. Prompt message - personalize with player name if available
  if (node.prompt) {
    let promptContent = node.prompt
    // Add player name to prompt if available and it's a question/decision prompt
    if (playerName && turn >= 0 && (node.prompt.includes('?') || node.prompt.includes('how') || node.prompt.includes('should'))) {
      // Prepend name naturally - only if it makes conversational sense
      promptContent = `${playerName}, ${node.prompt.charAt(0).toLowerCase() + node.prompt.slice(1)}`
    }
    
    messages.push({
      id: `${node.id}-prompt`,
      type: 'prompt',
      content: promptContent,
      delay: currentDelay
    })
    currentDelay += Math.max(500, promptContent.length * 20) // Estimate typing time
  }

  // 3. Context message
  if ((node as any).context) {
    messages.push({
      id: `${node.id}-context`,
      type: 'context',
      content: (node as any).context,
      delay: currentDelay
    })
    currentDelay += Math.max(800, (node as any).context.length * 15)
  }

  // 4. Vignette message
  if ((node as any).vignette) {
    messages.push({
      id: `${node.id}-vignette`,
      type: 'vignette',
      content: (node as any).vignette,
      delay: currentDelay
    })
    currentDelay += Math.max(800, (node as any).vignette.length * 15)
  }

  // 5. Case studies (one message per case study)
  if (node.caseStudies && node.caseStudies.length > 0) {
    const caseStudyCount = node.caseStudies.length
    node.caseStudies.forEach((study, idx) => {
      let studyContent = `**${study.title}**`
      if (study.year) {
        studyContent += ` (${study.year})`
      }
      // Add citation count badge
      const hasUrl = !!study.url
      const hasDoi = !!study.doi
      const citationCount = (hasUrl ? 1 : 0) + (hasDoi ? 1 : 0)
      if (citationCount > 0) {
        studyContent += ` <span style="font-size: 11px; color: #60a5fa; font-weight: 600;">[${citationCount} source${citationCount > 1 ? 's' : ''}]</span>`
      }
      if (study.sourceType) {
        const sourceTypeLabel = study.sourceType.replace('-', ' ')
        studyContent += ` <span style="font-size: 10px; padding: 2px 6px; background: rgba(96, 165, 250, 0.2); border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${sourceTypeLabel}</span>`
      }
      if (study.description) {
        studyContent += `\n\n${study.description}`
      }
      if (study.analysis) {
        studyContent += `\n\n**Analysis:**\n${study.analysis}`
      }
      if (study.outcomes) {
        studyContent += `\n\n**Key Outcomes:**\n${study.outcomes}`
      }
      if (study.url) {
        studyContent += `\n\n[Read Source →](${study.url})`
      }
      if (study.doi) {
        studyContent += `\n\n[DOI: ${study.doi} →](https://doi.org/${study.doi})`
      }
      if (study.archiveUrl) {
        studyContent += `\n\n[Archived Version →](${study.archiveUrl})`
      }
      if (study.lastVerified) {
        studyContent += `\n\n<span style="font-size: 11px; color: #4ade80;">✓ Verified ${study.lastVerified}</span>`
      }

      messages.push({
        id: `${node.id}-casestudy-${idx}`,
        type: 'caseStudy',
        content: studyContent,
        delay: currentDelay,
        metadata: { caseStudyIndex: idx }
      })
      // Case studies type out very fast - minimal delay for spacing
      currentDelay += 100 // Very short delay between case studies
    })
  }

  // 6. Moral uncertainties
  if ((node as any).moralUncertainties && (node as any).moralUncertainties.length > 0) {
    const uncertainties = (node as any).moralUncertainties
    const uncertaintyText = `**Key Questions:**\n\n${uncertainties.map((q: string, idx: number) => `${idx + 1}. ${q}`).join('\n\n')}`
    
    messages.push({
      id: `${node.id}-moral-uncertainty`,
      type: 'moralUncertainty',
      content: uncertaintyText,
      delay: currentDelay
    })
    currentDelay += Math.max(800, uncertaintyText.length * 15)
  }

  // 7. Longtermism considerations (if any)
  // Note: This would need to be passed in or fetched separately
  // For now, we'll skip it and handle it separately in the component

  // 8. Choices message (will be handled separately in the component)
  messages.push({
    id: `${node.id}-choices`,
    type: 'choices',
    content: '**Here are your options:**',
    delay: currentDelay
  })

  return messages
}
