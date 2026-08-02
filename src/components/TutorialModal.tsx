import { useState } from 'react'
import { t } from '../utils/i18n'

interface TutorialModalProps {
  onClose: () => void
}

export default function TutorialModal({ onClose }: TutorialModalProps) {
  const [step, setStep] = useState(0)
  
  const steps = [
    {
      title: 'Welcome to IMMEDIACY',
      content: (
        <div>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            This interactive war game puts you under <strong>disclosure pressure</strong> —
            Legal, HR, Tech, Comms, and the Board all want different things, and the clock is running.
            You'll make decisions that affect both <strong>measured outcomes</strong> (what leadership watches)
            and <strong>disclosure debt</strong> (hidden costs of silence, spin, and delay).
          </p>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            Navigate phases of an unfolding incident. Each choice has consequences that compound in hours, not decades.
            Silence is a choice. So is saying too much, too soon.
          </p>
          <p style={{ lineHeight: '1.6', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
            Tagline: Every Second Counts. Built on the Inheritance decision shell.
          </p>
        </div>
      )
    },
    {
      title: t('tutorial.globe'),
      content: (
        <div>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            The globe visualizes stakeholder pressure and jurisdiction risk. You can switch between three views:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>Standards / posture</strong> — how ready regions look on paper</li>
            <li><strong>Debt / exposure</strong> — accumulated compromise and disclosure lag</li>
            <li><strong>Enforcement</strong> — how hard regulators and counterparties can push</li>
          </ul>
          <p style={{ marginTop: '16px', lineHeight: '1.6' }}>
            Hover over regions for detail. Arcs show pressure flows between stakeholders.
            Rings mark recent events — leaks, filings, threat actor moves.
          </p>
        </div>
      )
    },
    {
      title: t('tutorial.decisions'),
      content: (
        <div>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            For each decision node, you'll choose under time pressure:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>Read the context</strong> — what just happened, who knows, who is watching</li>
            <li><strong>Review advisor recommendations</strong> — counsel, Comms, Tech, and other pressure voices</li>
            <li><strong>Hover over choices</strong> — preview impact before you commit</li>
            <li><strong>Record your rationale</strong> — capture why you spoke, stalled, or stayed silent</li>
            <li><strong>Note assumptions</strong> — track what you are betting on about facts, law, and narrative</li>
          </ul>
          <p style={{ marginTop: '16px', lineHeight: '1.6' }}>
            Use keyboard shortcuts (1-5) to quickly select choices. Choices are randomized per node to prevent memorization.
          </p>
        </div>
      )
    },
    {
      title: t('tutorial.metrics'),
      content: (
        <div>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            The metrics panel shows two categories under crisis load:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>Measured Metrics</strong> — what the war room watches (control, cost, incident rate, posture)</li>
            <li><strong>Disclosure / governance debt</strong> — hidden costs that compound on the clock (debt, enforcement gaps, irreversibility, lock-in)</li>
          </ul>
          <p style={{ marginTop: '16px', lineHeight: '1.6' }}>
            Hover over any metric for explanations and research citations.
            Sparklines show trends. Warning icons mark dangerous levels — narrative collapse, regulatory tripwires, or irreversible commitments.
          </p>
        </div>
      )
    },
    {
      title: 'Key Mechanics',
      content: (
        <div>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>Pressure archetypes</strong> — counsel, reporters, operators, and adversarial actors force the tempo</li>
            <li><strong>Memory Decay</strong> — assumptions weaken unless you reaffirm them under fire</li>
            <li><strong>System Irreversibility</strong> — some moves lock you in (statements made, lawyers retained, ransom paths taken)</li>
            <li><strong>Disclosure Debt</strong> — short-term silence creates compounding problems on the clock</li>
            <li><strong>Case Studies</strong> — decisions echo real disclosure failures and near-misses</li>
            <li><strong>Short-horizon framing</strong> — evaluate choices for the next hour and the next headline, not the next decade</li>
          </ul>
          <p style={{ marginTop: '16px', lineHeight: '1.6' }}>
            All your decisions are tracked throughout the simulation. At the end, you'll get a post-mortem report
            showing your trajectory — including how choices created or paid down disclosure debt and commitment lock.
          </p>
        </div>
      )
    },
    {
      title: t('tutorial.ready'),
      content: (
        <div>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            You're ready to begin! Remember:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li>There are no perfect answers — explore different disclosure paths under pressure</li>
            <li>Watch both measured control and unmeasured disclosure debt</li>
            <li><strong>Every second counts</strong> — silence and spin compound on the clock</li>
            <li>Review advisor recommendations for counsel, IR, Comms, and privacy angles</li>
            <li>Think about <strong>commitment lock</strong> — statements, payments, and attributions that are hard to unwind</li>
            <li><strong>Adversaries disclose too</strong> — leak sites and reporters write the story if you won't</li>
          </ul>
          <p style={{ marginTop: '16px', lineHeight: '1.6', fontStyle: 'italic' }}>
            IMMEDIACY is part of the i on GRC lab family — a short-horizon disclosure war game on the Inheritance decision shell.
          </p>
        </div>
      )
    }
  ]
  
  const currentStep = steps[step]
  const isFirst = step === 0
  const isLast = step === steps.length - 1
  
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
    }}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {currentStep.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#888',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('buttons.skip')}
          </button>
        </div>
        
        <div style={{
          fontSize: '14px',
          color: '#bbb',
          lineHeight: '1.6',
          marginBottom: '32px',
          minHeight: '200px'
        }}>
          {currentStep.content}
        </div>
        
        {/* Progress indicator */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: idx === step ? '#3b82f6' : idx < step ? '#60a5fa' : 'rgba(255, 255, 255, 0.2)',
                  transition: 'background-color 0.2s'
                }}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '8px' }}>
            Step {step + 1} of {steps.length}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={isFirst}
            style={{
              padding: '10px 20px',
              backgroundColor: isFirst ? 'transparent' : '#111111',
              color: isFirst ? '#666' : '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              cursor: isFirst ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isFirst ? 0.5 : 1
            }}
          >
            {t('buttons.previous')}
          </button>
          <button
            onClick={() => {
              if (isLast) {
                onClose()
              } else {
                setStep(step + 1)
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            {isLast ? t('buttons.getStarted') : t('buttons.next')}
          </button>
        </div>
      </div>
    </div>
  )
}
