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
      title: 'Inheritance',
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
      standards: 'Standards',
      debt: 'Debt',
      enforcement: 'Enforcement'
    },
    metrics: {
      successIndex: 'Success Index',
      debtIndex: 'Debt Index',
      productionEfficiency: 'Production Efficiency',
      costPerUnit: 'Cost Per Unit',
      welfareIncidentRate: 'Welfare Incident Rate',
      welfareStandardAdoption: 'Welfare Standard Adoption'
    },
    welcome: {
      whatThisIs: 'What This Is',
      longtermistPerspective: 'A Longtermist Perspective',
      keyConcept: 'Key Concept: Governance Debt',
      noWinning: 'There\'s No "Winning"',
      longtermistScope: 'Longtermist scope:',
      footer: 'Part of the Electric Sheep / Futurekind ecosystem'
    },
    tutorial: {
      welcome: 'Welcome to the Animal Welfare Governance Simulator',
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
      title: 'Inheritance',
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
      standards: 'Estándares',
      debt: 'Deuda',
      enforcement: 'Cumplimiento'
    },
    metrics: {
      successIndex: 'Índice de Éxito',
      debtIndex: 'Índice de Deuda',
      productionEfficiency: 'Eficiencia de Producción',
      costPerUnit: 'Costo por Unidad',
      welfareIncidentRate: 'Tasa de Incidentes de Bienestar',
      welfareStandardAdoption: 'Adopción de Estándares de Bienestar'
    },
    welcome: {
      whatThisIs: 'Qué Es Esto',
      longtermistPerspective: 'Una Perspectiva Longtermista',
      keyConcept: 'Concepto Clave: Deuda de Gobernanza',
      noWinning: 'No Hay "Ganar"',
      longtermistScope: 'Alcance longtermista:',
      footer: 'Parte del ecosistema Electric Sheep / Futurekind'
    },
    tutorial: {
      welcome: 'Bienvenido al Simulador de Gobernanza de Bienestar Animal',
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
      title: 'Simulateur de Gouvernance du Bien-être Animal',
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
      standards: 'Normes',
      debt: 'Dette',
      enforcement: 'Application'
    },
    metrics: {
      successIndex: 'Indice de Réussite',
      debtIndex: 'Indice de Dette',
      productionEfficiency: 'Efficacité de Production',
      costPerUnit: 'Coût par Unité',
      welfareIncidentRate: 'Taux d\'Incidents de Bien-être',
      welfareStandardAdoption: 'Adoption des Normes de Bien-être'
    },
    welcome: {
      whatThisIs: 'Qu\'est-ce que c\'est',
      longtermistPerspective: 'Une Perspective Longtermiste',
      keyConcept: 'Concept Clé: Dette de Gouvernance',
      noWinning: 'Il n\'y a pas de "Victoire"',
      longtermistScope: 'Portée longtermiste:',
      footer: 'Faisant partie de l\'écosystème Electric Sheep / Futurekind'
    },
    tutorial: {
      welcome: 'Bienvenue dans le Simulateur de Gouvernance du Bien-être Animal',
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
      title: 'Inheritance',
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
      standards: 'Standards',
      debt: 'Schulden',
      enforcement: 'Durchsetzung'
    },
    metrics: {
      successIndex: 'Erfolgsindex',
      debtIndex: 'Schuldenindex',
      productionEfficiency: 'Produktionseffizienz',
      costPerUnit: 'Kosten pro Einheit',
      welfareIncidentRate: 'Tierschutzvorfallrate',
      welfareStandardAdoption: 'Tierschutzstandard-Annahme'
    },
    welcome: {
      whatThisIs: 'Was Dies Ist',
      longtermistPerspective: 'Eine Longtermistische Perspektive',
      keyConcept: 'Schlüsselkonzept: Governance-Schulden',
      noWinning: 'Es Gibt Kein "Gewinnen"',
      longtermistScope: 'Longtermistischer Umfang:',
      footer: 'Teil des Electric Sheep / Futurekind Ökosystems'
    },
    tutorial: {
      welcome: 'Willkommen beim Tierschutz-Governance-Simulator',
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
      title: 'Inheritance',
      decision: '决策',
      metrics: '指标',
      advisors: '顾问建议',
      help: '帮助',
      export: '导出',
      reset: '重置'
    },
    mapModes: {
      standards: '标准',
      debt: '债务',
      enforcement: '执法'
    },
    metrics: {
      successIndex: '成功指数',
      debtIndex: '债务指数',
      productionEfficiency: '生产效率',
      costPerUnit: '单位成本',
      welfareIncidentRate: '福利事件率',
      welfareStandardAdoption: '福利标准采用'
    },
    disclaimer: {
      title: '教育模型免责声明',
      about: '关于此模拟器'
    }
  },
  pt: {
    app: {
      title: 'Simulador de Governança de Bem-estar Animal',
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
      standards: 'Padrões',
      debt: 'Dívida',
      enforcement: 'Fiscalização'
    },
    metrics: {
      successIndex: 'Índice de Sucesso',
      debtIndex: 'Índice de Dívida',
      productionEfficiency: 'Eficiência de Produção',
      costPerUnit: 'Custo por Unidade',
      welfareIncidentRate: 'Taxa de Incidentes de Bem-estar',
      welfareStandardAdoption: 'Adoção de Padrões de Bem-estar'
    },
    welcome: {
      whatThisIs: 'O Que É Isso',
      longtermistPerspective: 'Uma Perspectiva Longtermista',
      keyConcept: 'Conceito Chave: Dívida de Governança',
      noWinning: 'Não Há "Vitória"',
      longtermistScope: 'Escopo longtermista:',
      footer: 'Parte do ecossistema Electric Sheep / Futurekind'
    },
    tutorial: {
      welcome: 'Bem-vindo ao Simulador de Governança de Bem-estar Animal',
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
      title: 'Inheritance',
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
      standards: '基準',
      debt: '負債',
      enforcement: '執行'
    },
    metrics: {
      successIndex: '成功指数',
      debtIndex: '負債指数',
      productionEfficiency: '生産効率',
      costPerUnit: '単価',
      welfareIncidentRate: '福祉インシデント率',
      welfareStandardAdoption: '福祉基準の採用'
    },
    welcome: {
      whatThisIs: 'これは何か',
      longtermistPerspective: '長期主義的視点',
      keyConcept: '重要な概念：ガバナンス負債',
      noWinning: '「勝利」はない',
      longtermistScope: '長期主義的範囲：',
      footer: 'Electric Sheep / Futurekind エコシステムの一部'
    },
    tutorial: {
      welcome: '動物福祉ガバナンスシミュレーターへようこそ',
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
