/**
 * Internationalization (i18n) support
 * Provides translation functions and language switching
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'pt' | 'ja'

export interface Translations {
  [key: string]: string | Translations
}

// English (default)
const translations: Record<Language, Translations> = {
  en: {
    app: {
      title: 'IMMEDIACY',
      decision: 'Decision',
      metrics: 'Metrics',
      advisors: 'Advisor Recommendations',
      help: 'Help',
      export: 'Export',
      reset: 'Reset'
    },
    buttons: {
      begin: 'Begin Exploration',
      next: 'Next',
      previous: 'Previous',
      skip: 'Skip',
      getStarted: 'Get Started',
      close: 'Close',
      continue: 'Continue',
      continueToNextPhase: 'Continue to Next Phase',
      save: 'Save',
      load: 'Load',
      share: 'Share',
      compare: 'Compare',
      policyCompare: 'Policy Compare',
      debtTimeline: 'Debt Timeline',
      metaAnalysis: 'Meta-Analysis',
      assumptions: 'Assumptions',
      tutorial: 'Tutorial',
      credits: 'Credits'
    },
    mapModes: {
      standards: 'Posture',
      debt: 'Debt',
      enforcement: 'Enforcement'
    },
    metrics: {
      successIndex: 'Control Index',
      debtIndex: 'Disclosure Debt Index',
      operationalControl: 'Operational Control',
      financialBurn: 'Response Burn',
      serviceDisruption: 'Exposure Severity',
      disclosurePosture: 'Disclosure Posture'
    },
    welcome: {
      whatThisIs: 'What This Is',
      longtermistPerspective: 'Pressure, Not Perfect Plans',
      keyConcept: 'Key Concept: Disclosure Debt',
      noWinning: 'There\'s No "Winning"',
      longtermistScope: 'Scope:',
      footer: 'Part of the i on GRC lab family'
    },
    tutorial: {
      welcome: 'Welcome to IMMEDIACY',
      globe: 'The 3D Globe',
      decisions: 'Making Decisions',
      metrics: 'Understanding Metrics',
      mechanics: 'Key Mechanics',
      ready: 'Ready to Start'
    },
    disclaimer: {
      title: 'Educational Model Disclaimer',
      about: 'About this simulator'
    }
  },
  es: {
    app: {
      title: 'IMMEDIACY',
      decision: 'Decisión',
      metrics: 'Métricas',
      advisors: 'Recomendaciones de Asesores',
      help: 'Ayuda',
      export: 'Exportar',
      reset: 'Reiniciar'
    },
    buttons: {
      begin: 'Comenzar Exploración',
      next: 'Siguiente',
      previous: 'Anterior',
      skip: 'Omitir',
      getStarted: 'Comenzar',
      close: 'Cerrar',
      continue: 'Continuar',
      continueToNextPhase: 'Continuar a la Siguiente Fase',
      save: 'Guardar',
      load: 'Cargar',
      share: 'Compartir',
      compare: 'Comparar',
      policyCompare: 'Comparar Políticas',
      debtTimeline: 'Línea de Tiempo de Deuda',
      metaAnalysis: 'Meta-Análisis',
      assumptions: 'Suposiciones',
      tutorial: 'Tutorial',
      credits: 'Créditos'
    },
    mapModes: {
      standards: 'Postura',
      debt: 'Deuda',
      enforcement: 'Cumplimiento'
    },
    metrics: {
      successIndex: 'Índice de Control',
      debtIndex: 'Índice de Deuda de Divulgación',
      operationalControl: 'Control Operativo',
      financialBurn: 'Gasto de Respuesta',
      serviceDisruption: 'Severidad de Exposición',
      disclosurePosture: 'Postura de Divulgación'
    },
    welcome: {
      whatThisIs: 'Qué Es Esto',
      longtermistPerspective: 'Presión, No Planes Perfectos',
      keyConcept: 'Concepto Clave: Deuda de Divulgación',
      noWinning: 'No Hay "Ganar"',
      longtermistScope: 'Alcance:',
      footer: 'Parte del laboratorio i on GRC'
    },
    tutorial: {
      welcome: 'Bienvenido a IMMEDIACY',
      globe: 'El Globo 3D',
      decisions: 'Tomar Decisiones',
      metrics: 'Entender las Métricas',
      mechanics: 'Mecánicas Clave',
      ready: 'Listo para Comenzar'
    },
    disclaimer: {
      title: 'Descargo de Responsabilidad del Modelo Educativo',
      about: 'Acerca de este simulador'
    }
  },
  fr: {
    app: {
      title: 'IMMEDIACY',
      decision: 'Décision',
      metrics: 'Métriques',
      advisors: 'Recommandations des Conseillers',
      help: 'Aide',
      export: 'Exporter',
      reset: 'Réinitialiser'
    },
    buttons: {
      begin: 'Commencer l\'Exploration',
      next: 'Suivant',
      previous: 'Précédent',
      skip: 'Passer',
      getStarted: 'Commencer',
      close: 'Fermer',
      continue: 'Continuer',
      continueToNextPhase: 'Continuer à la Phase Suivante',
      save: 'Enregistrer',
      load: 'Charger',
      share: 'Partager',
      compare: 'Comparer',
      policyCompare: 'Comparer les Politiques',
      debtTimeline: 'Chronologie de la Dette',
      metaAnalysis: 'Méta-Analyse',
      assumptions: 'Hypothèses',
      tutorial: 'Tutoriel',
      credits: 'Crédits'
    },
    mapModes: {
      standards: 'Posture',
      debt: 'Dette',
      enforcement: 'Application'
    },
    metrics: {
      successIndex: 'Indice de Contrôle',
      debtIndex: 'Indice de Dette de Divulgation',
      operationalControl: 'Contrôle Opérationnel',
      financialBurn: 'Coût de Réponse',
      serviceDisruption: 'Sévérité d\'Exposition',
      disclosurePosture: 'Posture de Divulgation'
    },
    welcome: {
      whatThisIs: 'Qu\'est-ce que c\'est',
      longtermistPerspective: 'Pression, Pas de Plans Parfaits',
      keyConcept: 'Concept Clé: Dette de Divulgation',
      noWinning: 'Il n\'y a pas de "Victoire"',
      longtermistScope: 'Portée:',
      footer: 'Faisant partie du labo i on GRC'
    },
    tutorial: {
      welcome: 'Bienvenue dans IMMEDIACY',
      globe: 'Le Globe 3D',
      decisions: 'Prendre des Décisions',
      metrics: 'Comprendre les Métriques',
      mechanics: 'Mécaniques Clés',
      ready: 'Prêt à Commencer'
    },
    disclaimer: {
      title: 'Avertissement sur le Modèle Éducatif',
      about: 'À propos de ce simulateur'
    }
  },
  de: {
    app: {
      title: 'IMMEDIACY',
      decision: 'Entscheidung',
      metrics: 'Metriken',
      advisors: 'Beraterempfehlungen',
      help: 'Hilfe',
      export: 'Exportieren',
      reset: 'Zurücksetzen'
    },
    buttons: {
      begin: 'Erkundung Beginnen',
      next: 'Weiter',
      previous: 'Zurück',
      skip: 'Überspringen',
      getStarted: 'Loslegen',
      close: 'Schließen',
      continue: 'Fortsetzen',
      continueToNextPhase: 'Zur Nächsten Phase',
      save: 'Speichern',
      load: 'Laden',
      share: 'Teilen',
      compare: 'Vergleichen',
      policyCompare: 'Politik Vergleichen',
      debtTimeline: 'Schulden-Zeitachse',
      metaAnalysis: 'Meta-Analyse',
      assumptions: 'Annahmen',
      tutorial: 'Tutorial',
      credits: 'Credits'
    },
    mapModes: {
      standards: 'Haltung',
      debt: 'Schulden',
      enforcement: 'Durchsetzung'
    },
    metrics: {
      successIndex: 'Kontrollindex',
      debtIndex: 'Offenlegungs-Schuldenindex',
      operationalControl: 'Operative Kontrolle',
      financialBurn: 'Reaktionsaufwand',
      serviceDisruption: 'Expositionsschwere',
      disclosurePosture: 'Offenlegungshaltung'
    },
    welcome: {
      whatThisIs: 'Was Dies Ist',
      longtermistPerspective: 'Druck, Keine Perfekten Pläne',
      keyConcept: 'Schlüsselkonzept: Offenlegungsschulden',
      noWinning: 'Es Gibt Kein "Gewinnen"',
      longtermistScope: 'Umfang:',
      footer: 'Teil des i on GRC Labors'
    },
    tutorial: {
      welcome: 'Willkommen bei IMMEDIACY',
      globe: 'Der 3D-Globus',
      decisions: 'Entscheidungen Treffen',
      metrics: 'Metriken Verstehen',
      mechanics: 'Schlüsselmechaniken',
      ready: 'Bereit zum Starten'
    },
    disclaimer: {
      title: 'Haftungsausschluss für Bildungsmodell',
      about: 'Über diesen Simulator'
    }
  },
  zh: {
    app: {
      title: 'IMMEDIACY',
      decision: '决策',
      metrics: '指标',
      advisors: '顾问建议',
      help: '帮助',
      export: '导出',
      reset: '重置'
    },
    mapModes: {
      standards: '态势',
      debt: '债务',
      enforcement: '监管'
    },
    metrics: {
      successIndex: '控制指数',
      debtIndex: '披露债务指数',
      operationalControl: '运营控制',
      financialBurn: '响应消耗',
      serviceDisruption: '暴露严重度',
      disclosurePosture: '披露态势'
    },
    disclaimer: {
      title: '教育模型免责声明',
      about: '关于此模拟器'
    }
  },
  pt: {
    app: {
      title: 'IMMEDIACY',
      decision: 'Decisão',
      metrics: 'Métricas',
      advisors: 'Recomendações de Assessores',
      help: 'Ajuda',
      export: 'Exportar',
      reset: 'Redefinir'
    },
    buttons: {
      begin: 'Começar Exploração',
      next: 'Próximo',
      previous: 'Anterior',
      skip: 'Pular',
      getStarted: 'Começar',
      close: 'Fechar',
      continue: 'Continuar',
      continueToNextPhase: 'Continuar para a Próxima Fase',
      save: 'Salvar',
      load: 'Carregar',
      share: 'Compartilhar',
      compare: 'Comparar',
      policyCompare: 'Comparar Políticas',
      debtTimeline: 'Linha do Tempo da Dívida',
      metaAnalysis: 'Meta-Análise',
      assumptions: 'Suposições',
      tutorial: 'Tutorial',
      credits: 'Créditos'
    },
    mapModes: {
      standards: 'Postura',
      debt: 'Dívida',
      enforcement: 'Fiscalização'
    },
    metrics: {
      successIndex: 'Índice de Controle',
      debtIndex: 'Índice de Dívida de Divulgação',
      operationalControl: 'Controle Operacional',
      financialBurn: 'Custo de Resposta',
      serviceDisruption: 'Severidade da Exposição',
      disclosurePosture: 'Postura de Divulgação'
    },
    welcome: {
      whatThisIs: 'O Que É Isso',
      longtermistPerspective: 'Pressão, Não Planos Perfeitos',
      keyConcept: 'Conceito Chave: Dívida de Divulgação',
      noWinning: 'Não Há "Vitória"',
      longtermistScope: 'Escopo:',
      footer: 'Parte do laboratório i on GRC'
    },
    tutorial: {
      welcome: 'Bem-vindo ao IMMEDIACY',
      globe: 'O Globo 3D',
      decisions: 'Tomar Decisões',
      metrics: 'Entender Métricas',
      mechanics: 'Mecânicas Principais',
      ready: 'Pronto para Começar'
    },
    disclaimer: {
      title: 'Aviso Legal do Modelo Educacional',
      about: 'Sobre este simulador'
    }
  },
  ja: {
    app: {
      title: 'IMMEDIACY',
      decision: '決定',
      metrics: '指標',
      advisors: 'アドバイザー推奨',
      help: 'ヘルプ',
      export: 'エクスポート',
      reset: 'リセット'
    },
    buttons: {
      begin: '探索を開始',
      next: '次へ',
      previous: '前へ',
      skip: 'スキップ',
      getStarted: '始める',
      close: '閉じる',
      continue: '続ける',
      continueToNextPhase: '次のフェーズへ',
      save: '保存',
      load: '読み込み',
      share: '共有',
      compare: '比較',
      policyCompare: '政策比較',
      debtTimeline: '負債タイムライン',
      metaAnalysis: 'メタ分析',
      assumptions: '仮定',
      tutorial: 'チュートリアル',
      credits: 'クレジット'
    },
    mapModes: {
      standards: '姿勢',
      debt: '負債',
      enforcement: '執行'
    },
    metrics: {
      successIndex: 'コントロール指数',
      debtIndex: '開示負債指数',
      operationalControl: '運用コントロール',
      financialBurn: '対応コスト',
      serviceDisruption: 'エクスポージャ深刻度',
      disclosurePosture: '開示姿勢'
    },
    welcome: {
      whatThisIs: 'これは何か',
      longtermistPerspective: '完璧な計画ではなく圧力',
      keyConcept: '重要な概念：開示負債',
      noWinning: '「勝利」はない',
      longtermistScope: '範囲：',
      footer: 'i on GRCラボの一部'
    },
    tutorial: {
      welcome: 'IMMEDIACYへようこそ',
      globe: '3D地球儀',
      decisions: '意思決定',
      metrics: '指標の理解',
      mechanics: '主要なメカニクス',
      ready: '開始の準備'
    },
    disclaimer: {
      title: '教育モデルの免責事項',
      about: 'このシミュレーターについて'
    }
  }
}

let currentLanguage: Language = 'en'

export function setLanguage(lang: Language) {
  currentLanguage = lang
  localStorage.setItem('preferredLanguage', lang)
}

export function getLanguage(): Language {
  const saved = localStorage.getItem('preferredLanguage')
  if (saved && saved in translations) {
    return saved as Language
  }
  // Try to detect browser language
  const browserLang = navigator.language.split('-')[0]
  if (browserLang in translations) {
    return browserLang as Language
  }
  return 'en'
}

export function t(key: string): string {
  const keys = key.split('.')
  let value: any = translations[currentLanguage]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Fallback to English
      value = translations.en
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2]
        } else {
          return key // Return key if translation not found
        }
      }
      break
    }
  }
  
  return typeof value === 'string' ? value : key
}

// Initialize language on load
if (typeof window !== 'undefined') {
  currentLanguage = getLanguage()
}
