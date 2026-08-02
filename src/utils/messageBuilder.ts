import { Node } from '../engine/scenarioTypes'
import type { SecurityResearchCard } from './securityResearch'

export interface ChatMessage {
  id: string
  type: 'system' | 'prompt' | 'context' | 'vignette' | 'caseStudy' | 'research' | 'choices'
  content: string
  delay: number // Milliseconds to wait before showing this message
  metadata?: {
    caseStudyIndex?: number
    uncertaintyIndex?: number
    researchIndex?: number
  }
}

/**
 * Personalize a prompt with the player name without mangling acronyms (SOC, GDPR, etc.).
 * Only lowercases the first letter when the prompt is ordinary sentence case.
 */
export function personalizePrompt(playerName: string, prompt: string): string {
  const first = prompt.charAt(0)
  const second = prompt.charAt(1)
  const isUpper = (c: string) => c.length === 1 && c >= 'A' && c <= 'Z'
  const isLower = (c: string) => c.length === 1 && c >= 'a' && c <= 'z'
  // Sentence case: "Should we…" → "should we…". Acronyms: "SOC flags…" stays "SOC…".
  const shouldLowerFirst = isUpper(first) && isLower(second)
  const body = shouldLowerFirst ? first.toLowerCase() + prompt.slice(1) : prompt
  return `${playerName}, ${body}`
}

function formatResearchCard(card: SecurityResearchCard, nodeId: string, index: number, delay: number): ChatMessage {
  const content = `**Research Lab · ${card.framework}**\n\n**${card.title}**\n\n${card.description}\n\n*Consider:* ${card.keyQuestions[0]}`
  return {
    id: `${nodeId}-research-${index}`,
    type: 'research',
    content,
    delay,
    metadata: { researchIndex: index },
  }
}

/**
 * Converts a node into a sequence of chat messages.
 * Research cards are inserted before the choices beat so callers use one array
 * for both display indexes and completion sequencing.
 */
export function buildMessageSequence(
  node: Node,
  turn: number,
  playerName?: string,
  researchCards: SecurityResearchCard[] = []
): ChatMessage[] {
  const messages: ChatMessage[] = []
  let currentDelay = 0

  // 1. System message - Turn and title
  messages.push({
    id: `${node.id}-system`,
    type: 'system',
    content: `**Turn ${turn}**\n\n**${node.title}**`,
    delay: currentDelay
  })
  currentDelay += 800

  // 2. Prompt message - personalize with player name if available
  if (node.prompt) {
    let promptContent = node.prompt
    if (playerName && turn >= 0 && (node.prompt.includes('?') || node.prompt.includes('how') || node.prompt.includes('should'))) {
      promptContent = personalizePrompt(playerName, node.prompt)
    }

    messages.push({
      id: `${node.id}-prompt`,
      type: 'prompt',
      content: promptContent,
      delay: currentDelay
    })
    currentDelay += Math.max(500, promptContent.length * 20)
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
    node.caseStudies.forEach((study, idx) => {
      let studyContent = `**${study.title}**`
      if (study.year) {
        studyContent += ` (${study.year})`
      }
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
      if (study.teachingNote) {
        studyContent += `\n\n<span style="font-size: 11px; color: #fb923c;">⚠ Teaching note: ${study.teachingNote}</span>`
      }

      messages.push({
        id: `${node.id}-casestudy-${idx}`,
        type: 'caseStudy',
        content: studyContent,
        delay: currentDelay,
        metadata: { caseStudyIndex: idx }
      })
      currentDelay += 100
    })
  }

  // 6. Key questions (formerly moral uncertainties)
  if ((node as any).moralUncertainties && (node as any).moralUncertainties.length > 0) {
    const uncertainties = (node as any).moralUncertainties
    const uncertaintyText = `**Key Questions:**\n\n${uncertainties.map((q: string, idx: number) => `${idx + 1}. ${q}`).join('\n\n')}`

    messages.push({
      id: `${node.id}-key-questions`,
      type: 'context',
      content: uncertaintyText,
      delay: currentDelay,
      metadata: { uncertaintyIndex: 0 }
    })
    currentDelay += Math.max(800, uncertaintyText.length * 15)
  }

  // 7. Research lab beats (same array as the rest — keeps display indexes aligned)
  researchCards.slice(0, 2).forEach((card, idx) => {
    messages.push(formatResearchCard(card, node.id, idx, currentDelay))
    currentDelay += 1000
  })

  // 8. Choices cue (completion of this beat unlocks the decision buttons)
  messages.push({
    id: `${node.id}-choices`,
    type: 'choices',
    content: '**Here are your options:**',
    delay: currentDelay
  })

  return messages
}

/** Briefing messages only — excludes the choices cue used for sequencing. */
export function getBriefingMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter(m => m.type !== 'choices')
}
