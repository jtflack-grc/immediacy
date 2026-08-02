/**
 * Country-specific animal welfare data and fast facts
 */

export interface CountryWelfareData {
  name: string
  iso3: string
  fastFacts: string[]
  baselineGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  baselineScore: number // 0-1 score that maps to grade
  sources?: string[]  // Research citations for in-play countries
  detailedContext?: string  // Richer context for in-play countries
}

// Detailed data for tracked countries
export const countryWelfareData: Record<string, CountryWelfareData> = {
  'USA': {
    name: 'United States',
    iso3: 'USA',
    fastFacts: [
      'No federal law protecting farm animals during rearing',
      'State-level protections vary widely (e.g., California Proposition 12)',
      'Humane Slaughter Act covers only transport and slaughter',
      '~99% of farm animals raised in intensive systems',
      'Growing plant-based protein market (~$8B in 2023)'
    ],
    baselineGrade: 'D',
    baselineScore: 0.3,
    sources: [
      'https://www.aphis.usda.gov/aphis/ourfocus/animalwelfare',
      'https://www.humanesociety.org/resources/farm-animal-welfare-legislation',
      'https://www.goodfoodinstitute.org/state-of-the-industry-report'
    ],
    detailedContext: 'The U.S. has a fragmented approach to farm animal welfare, with state-level initiatives like California\'s Proposition 12 (2018) creating patchwork protections. The federal Humane Slaughter Act (1958) only covers transport and slaughter, not rearing conditions. Approximately 99% of farm animals are raised in intensive confinement systems. However, the alternative protein sector is rapidly growing, with investments exceeding $8B in 2023, indicating market-driven shifts toward welfare-aligned production.'
  },
  'GBR': {
    name: 'United Kingdom',
    iso3: 'GBR',
    fastFacts: [
      'First country to recognize animal sentience in law (2006)',
      'Banned battery cages for laying hens (2012)',
      'Mandatory CCTV in slaughterhouses (2018)',
      'Strongest farm animal welfare laws in Europe',
      'High public support for welfare improvements'
    ],
    baselineGrade: 'B',
    baselineScore: 0.4,
    sources: [
      'https://www.gov.uk/government/publications/animal-welfare-act-2006',
      'https://www.rspca.org.uk/whatwedo/lobbying/farmanimals',
      'https://www.compassioninfoodbusiness.com/'
    ],
    detailedContext: 'The UK was the first country to legally recognize animal sentience (Animal Welfare Act 2006). Post-Brexit, the UK has maintained and strengthened EU welfare standards, including mandatory CCTV in slaughterhouses (2018) and bans on battery cages (2012). The UK has some of the strongest farm animal welfare protections globally, driven by high public support and effective enforcement through organizations like the RSPCA. However, post-Brexit trade deals have raised concerns about maintaining these standards.'
  },
  'FRA': {
    name: 'France',
    iso3: 'FRA',
    fastFacts: [
      'EU member with mandatory welfare standards',
      'Banned battery cages (2012) and veal crates',
      'Growing alternative protein sector',
      'Strong enforcement through DGAL',
      'Public campaigns increasing awareness'
    ],
    baselineGrade: 'C',
    baselineScore: 0.35,
    sources: [
      'https://ec.europa.eu/food/animals/welfare/strategy_en',
      'https://agriculture.gouv.fr/animal-welfare-france',
      'https://www.goodfoodinstitute.org/europe/france'
    ],
    detailedContext: 'France, as an EU member state, implements comprehensive EU welfare directives including bans on battery cages (2012) and veal crates. The Direction Générale de l\'Alimentation (DGAL) enforces welfare standards with regular inspections. France has a growing alternative protein sector, with companies like Ynsect and Innovafeed leading in insect-based proteins. Public awareness campaigns and consumer demand are driving improvements, though enforcement capacity varies by region.'
  },
  'DEU': {
    name: 'Germany',
    iso3: 'DEU',
    fastFacts: [
      'EU member with strict welfare regulations',
      'Banned battery cages and sow stalls',
      'Strong 3Rs enforcement for lab animals',
      'Leading alternative protein research',
      'High consumer demand for welfare products'
    ],
    baselineGrade: 'B',
    baselineScore: 0.4,
    sources: [
      'https://www.bmel.de/EN/topics/animals/animal-welfare/animal-welfare_node.html',
      'https://www.goodfoodinstitute.org/europe/germany',
      'https://www.bfr.bund.de/en/home.html'
    ],
    detailedContext: 'Germany has some of the strictest animal welfare regulations in the EU, with comprehensive bans on battery cages and sow stalls. The country enforces the 3Rs principle (Replace, Reduce, Refine) rigorously for laboratory animals. Germany is a leader in alternative protein research and development, with companies like Rügenwalder Mühle and Beyond Meat establishing significant operations. High consumer demand for welfare-certified products drives market innovation, though intensive farming systems remain prevalent.'
  },
  'CHN': {
    name: 'China',
    iso3: 'CHN',
    fastFacts: [
      'World\'s largest producer of farm animals',
      'Limited national welfare legislation',
      'Growing middle class demanding better welfare',
      'Rapid expansion of intensive farming',
      'Alternative protein investment increasing'
    ],
    baselineGrade: 'F',
    baselineScore: 0.45,
    sources: [
      'https://www.goodfoodinstitute.org/china',
      'https://www.worldanimalprotection.org/countries/china',
      'https://www.nature.com/articles/s41598-021-82355-5'
    ],
    detailedContext: 'China is the world\'s largest producer of farm animals, with over 700 million pigs, 4 billion poultry, and significant cattle production. National welfare legislation is minimal, focusing primarily on food safety rather than animal welfare during rearing. However, a growing middle class is increasingly concerned about animal welfare, driving demand for higher-welfare products. China is rapidly expanding intensive farming systems while simultaneously becoming a major investor in alternative proteins, with companies like Starfield and Zhenmeat leading innovation.'
  },
  'IND': {
    name: 'India',
    iso3: 'IND',
    fastFacts: [
      'Constitutional protection for animals (Article 51A)',
      'Strong cultural traditions around animal welfare',
      'Large dairy industry with mixed welfare standards',
      'Growing meat consumption in urban areas',
      'Limited enforcement capacity'
    ],
    baselineGrade: 'C',
    baselineScore: 0.4,
    sources: [
      'https://www.indiacode.nic.in/show-data?actid=AC_CEN_5_23_00010_196059_1517807320172',
      'https://www.worldanimalprotection.org/countries/india',
      'https://www.goodfoodinstitute.org/india'
    ],
    detailedContext: 'India has unique constitutional protections for animals (Article 51A(g)) and strong cultural traditions emphasizing ahimsa (non-violence). The country has the world\'s largest dairy herd, with mixed welfare standards ranging from traditional extensive systems to modern intensive operations. Urban areas show growing meat consumption, while rural areas maintain traditional practices. Enforcement capacity is limited, with animal welfare organizations like PETA India and FIAPO working to improve standards. India is also emerging as a hub for plant-based protein innovation.'
  },
  'BRA': {
    name: 'Brazil',
    iso3: 'BRA',
    fastFacts: [
      'Major exporter of animal products',
      'Large-scale intensive farming operations',
      'Amazon deforestation linked to cattle ranching',
      'Growing welfare awareness in urban areas',
      'Limited national welfare standards'
    ],
    baselineGrade: 'D',
    baselineScore: 0.4,
    sources: [
      'https://www.worldanimalprotection.org/countries/brazil',
      'https://www.goodfoodinstitute.org/brazil',
      'https://www.nature.com/articles/s41598-020-76571-8'
    ],
    detailedContext: 'Brazil is a major global exporter of animal products, particularly beef, poultry, and pork. The country has large-scale intensive farming operations, with significant concerns about Amazon deforestation linked to cattle ranching. National welfare standards are limited, though some states have implemented stricter regulations. Urban areas show growing awareness of animal welfare issues, driving demand for higher-welfare products. Brazil is also developing an alternative protein sector, with companies like Fazenda Futuro leading innovation in plant-based meats.'
  },
  'ZAF': {
    name: 'South Africa',
    iso3: 'ZAF',
    fastFacts: [
      'Mixed farming systems (intensive and extensive)',
      'Wildlife farming and conservation programs',
      'Growing middle class with welfare concerns',
      'Limited national welfare legislation',
      'Strong conservation traditions'
    ],
    baselineGrade: 'C',
    baselineScore: 0.35,
    sources: [
      'https://www.worldanimalprotection.org/countries/south-africa',
      'https://www.nspca.co.za/',
      'https://www.agriculture.gov.za/'
    ],
    detailedContext: 'South Africa has a unique mix of intensive and extensive farming systems, with significant wildlife farming operations alongside traditional livestock production. The country has strong conservation traditions, with national parks and wildlife reserves playing important roles. National welfare legislation is limited, though the NSPCA (National Council of SPCAs) provides enforcement and advocacy. A growing middle class is increasingly concerned about animal welfare, particularly in urban areas. The country faces challenges balancing economic development, food security, and animal welfare.'
  },
  'AUS': {
    name: 'Australia',
    iso3: 'AUS',
    fastFacts: [
      'State-level welfare standards (varies by state)',
      'Live export industry with welfare concerns',
      'Strong RSPCA presence and enforcement',
      'Growing alternative protein market',
      'High public awareness of welfare issues'
    ],
    baselineGrade: 'C',
    baselineScore: 0.3,
    sources: [
      'https://www.agriculture.gov.au/animal/welfare',
      'https://www.rspca.org.au/',
      'https://www.goodfoodinstitute.org/australia'
    ],
    detailedContext: 'Australia has a federal system with state-level welfare standards that vary significantly. The Model Codes of Practice provide voluntary guidelines, with enforcement primarily through state RSPCA organizations. The live export industry has faced significant public scrutiny and welfare concerns, leading to reforms and increased oversight. Australia has a growing alternative protein market, with companies like v2food and Fable Foods gaining traction. High public awareness of welfare issues drives demand for higher-welfare products, though intensive farming systems remain common.'
  },
  'CAN': {
    name: 'Canada',
    iso3: 'CAN',
    fastFacts: [
      'Provincial welfare standards (varies by province)',
      'National codes of practice (voluntary)',
      'Growing plant-based protein industry',
      'Public support for welfare improvements',
      'Limited federal enforcement'
    ],
    baselineGrade: 'C',
    baselineScore: 0.3,
    sources: [
      'https://www.canada.ca/en/environment-climate-change/services/animal-welfare.html',
      'https://www.nfacc.ca/',
      'https://www.goodfoodinstitute.org/canada'
    ],
    detailedContext: 'Canada operates under a federal system with provincial jurisdiction over animal welfare, leading to varying standards across provinces. The National Farm Animal Care Council (NFACC) develops voluntary codes of practice, though enforcement is limited. Federal legislation covers transport and slaughter, but not on-farm conditions. Canada has a rapidly growing plant-based protein industry, with companies like Lightlife and Field Roast (now owned by Greenleaf Foods) leading innovation. Public support for welfare improvements is strong, with increasing consumer demand for higher-welfare products.'
  },
  'MEX': {
    name: 'Mexico',
    iso3: 'MEX',
    fastFacts: [
      'Limited national welfare legislation',
      'Growing intensive farming sector',
      'Cultural traditions around animal welfare',
      'Increasing urban demand for welfare products',
      'Limited enforcement capacity'
    ],
    baselineGrade: 'D',
    baselineScore: 0.25,
    sources: [
      'https://www.worldanimalprotection.org/countries/mexico',
      'https://www.gob.mx/senasica',
      'https://www.goodfoodinstitute.org/mexico'
    ],
    detailedContext: 'Mexico has limited national welfare legislation, with most regulations focused on food safety and disease control rather than animal welfare during rearing. The country has a growing intensive farming sector, particularly in poultry and pork production. Cultural traditions around animal welfare exist, particularly in rural areas, though these are often in conflict with modern intensive systems. Urban areas show increasing demand for higher-welfare products, driven by growing middle-class awareness. Enforcement capacity is limited, with SENASICA (National Service of Health, Safety and Food Quality) primarily focused on food safety rather than welfare.'
  },
  'ITA': {
    name: 'Italy',
    iso3: 'ITA',
    fastFacts: [
      'EU member with mandatory welfare standards',
      'Strong cultural traditions around food and animal welfare',
      'Growing alternative protein sector',
      'Regional variations in enforcement',
      'High consumer awareness of welfare issues'
    ],
    baselineGrade: 'C',
    baselineScore: 0.35,
    sources: [
      'https://ec.europa.eu/food/animals/welfare/strategy_en',
      'https://www.goodfoodinstitute.org/europe/italy',
      'https://www.worldanimalprotection.org/countries/italy'
    ],
    detailedContext: 'Italy, as an EU member, implements comprehensive EU welfare directives. The country has strong cultural traditions around food quality and animal welfare, with regional variations in enforcement. Italy has a growing alternative protein sector, with companies like Valsoia leading in plant-based products. Consumer awareness of welfare issues is high, particularly in northern regions. Enforcement varies by region, with some areas having stronger oversight than others.'
  },
  'ESP': {
    name: 'Spain',
    iso3: 'ESP',
    fastFacts: [
      'EU member with mandatory welfare standards',
      'Major exporter of animal products',
      'Large-scale intensive farming operations',
      'Growing alternative protein sector',
      'Regional enforcement variations'
    ],
    baselineGrade: 'C',
    baselineScore: 0.32,
    sources: [
      'https://ec.europa.eu/food/animals/welfare/strategy_en',
      'https://www.goodfoodinstitute.org/europe/spain',
      'https://www.worldanimalprotection.org/countries/spain'
    ],
    detailedContext: 'Spain is a major EU exporter of animal products, with large-scale intensive farming operations particularly in pork and poultry. As an EU member, Spain implements comprehensive welfare directives, though enforcement varies by region. The country has a growing alternative protein sector, with companies like Heura leading innovation. Spain faces challenges balancing export competitiveness with welfare standards, with some regions implementing stricter standards than others.'
  },
  'NLD': {
    name: 'Netherlands',
    iso3: 'NLD',
    fastFacts: [
      'EU member with high welfare standards',
      'Leading alternative protein research',
      'Strong enforcement and oversight',
      'High public support for welfare',
      'Innovative farming systems'
    ],
    baselineGrade: 'B',
    baselineScore: 0.42,
    sources: [
      'https://ec.europa.eu/food/animals/welfare/strategy_en',
      'https://www.goodfoodinstitute.org/europe/netherlands',
      'https://www.nvwa.nl/onderwerpen/dierenwelzijn'
    ],
    detailedContext: 'The Netherlands has some of the highest animal welfare standards in the EU, with strong enforcement and oversight. The country is a leader in alternative protein research and development, with companies like Mosa Meat (cultured meat) and The Vegetarian Butcher leading innovation. High public support for animal welfare drives market demand for higher-welfare products. The Netherlands has innovative farming systems, though intensive operations remain common.'
  },
  'POL': {
    name: 'Poland',
    iso3: 'POL',
    fastFacts: [
      'EU member with mandatory welfare standards',
      'Major producer of animal products',
      'Growing intensive farming sector',
      'Limited enforcement capacity',
      'Growing alternative protein market'
    ],
    baselineGrade: 'D',
    baselineScore: 0.28,
    sources: [
      'https://ec.europa.eu/food/animals/welfare/strategy_en',
      'https://www.goodfoodinstitute.org/europe/poland',
      'https://www.worldanimalprotection.org/countries/poland'
    ],
    detailedContext: 'Poland is a major EU producer of animal products, with a growing intensive farming sector. As an EU member, Poland implements welfare directives, though enforcement capacity is limited. The country faces challenges balancing economic competitiveness with welfare standards. A growing alternative protein market is emerging, driven by urban consumer demand. Poland\'s welfare standards are improving but lag behind some Western EU member states.'
  },
  'SWE': {
    name: 'Sweden',
    iso3: 'SWE',
    fastFacts: [
      'EU member with very high welfare standards',
      'Strong enforcement and oversight',
      'Leading alternative protein market',
      'High public support for welfare',
      'Innovative welfare systems'
    ],
    baselineGrade: 'A-',
    baselineScore: 0.48,
    sources: [
      'https://ec.europa.eu/food/animals/welfare/strategy_en',
      'https://www.goodfoodinstitute.org/europe/sweden',
      'https://www.jordbruksverket.se/en/animal-welfare'
    ],
    detailedContext: 'Sweden has some of the highest animal welfare standards globally, with strong enforcement and oversight. The country is a leader in alternative protein markets, with high consumer adoption of plant-based products. High public support for animal welfare drives both policy and market demand. Sweden has innovative welfare systems, including group housing for sows and enriched cages for laying hens. The country serves as a model for welfare-focused governance.'
  },
  'DNK': {
    name: 'Denmark',
    iso3: 'DNK',
    fastFacts: [
      'EU member with high welfare standards',
      'Major exporter of animal products',
      'Strong enforcement systems',
      'Growing alternative protein sector',
      'High public awareness'
    ],
    baselineGrade: 'B',
    baselineScore: 0.4,
    sources: [
      'https://ec.europa.eu/food/animals/welfare/strategy_en',
      'https://www.goodfoodinstitute.org/europe/denmark',
      'https://www.foedevarestyrelsen.dk/english/Animal/AnimalWelfare/Pages/default.aspx'
    ],
    detailedContext: 'Denmark is a major EU exporter of animal products with high welfare standards and strong enforcement systems. The country has a growing alternative protein sector, with companies like Naturli\' Foods leading innovation. High public awareness of welfare issues drives both policy and market demand. Denmark balances export competitiveness with welfare standards, implementing EU directives while maintaining strong oversight.'
  },
  'JPN': {
    name: 'Japan',
    iso3: 'JPN',
    fastFacts: [
      'Limited national welfare legislation',
      'High consumer demand for animal products',
      'Growing awareness of welfare issues',
      'Strong alternative protein market',
      'Cultural traditions influence practices'
    ],
    baselineGrade: 'D',
    baselineScore: 0.32,
    sources: [
      'https://www.goodfoodinstitute.org/japan',
      'https://www.worldanimalprotection.org/countries/japan',
      'https://www.maff.go.jp/e/policies/livestock/animal_welfare/'
    ],
    detailedContext: 'Japan has limited national welfare legislation, with most regulations focused on food safety. The country has high consumer demand for animal products, though growing awareness of welfare issues is driving change. Japan has a strong alternative protein market, with companies like Next Meats leading innovation. Cultural traditions around food and animal treatment influence practices, creating unique challenges and opportunities for welfare improvements.'
  },
  'KOR': {
    name: 'South Korea',
    iso3: 'KOR',
    fastFacts: [
      'Limited national welfare legislation',
      'Rapidly growing animal agriculture',
      'Growing middle class with welfare concerns',
      'Strong alternative protein market',
      'Increasing public awareness'
    ],
    baselineGrade: 'D',
    baselineScore: 0.3,
    sources: [
      'https://www.goodfoodinstitute.org/south-korea',
      'https://www.worldanimalprotection.org/countries/south-korea',
      'https://www.mafra.go.kr/english/'
    ],
    detailedContext: 'South Korea has limited national welfare legislation, with a rapidly growing animal agriculture sector. A growing middle class is increasingly concerned about animal welfare, driving demand for higher-welfare products. The country has a strong alternative protein market, with companies like Unlimeat leading innovation. Public awareness of welfare issues is increasing, though enforcement capacity remains limited.'
  },
  'THA': {
    name: 'Thailand',
    iso3: 'THA',
    fastFacts: [
      'Major exporter of animal products',
      'Limited national welfare standards',
      'Growing intensive farming sector',
      'Cultural traditions influence practices',
      'Growing alternative protein sector'
    ],
    baselineGrade: 'D',
    baselineScore: 0.28,
    sources: [
      'https://www.goodfoodinstitute.org/thailand',
      'https://www.worldanimalprotection.org/countries/thailand',
      'https://www.dld.go.th/en/'
    ],
    detailedContext: 'Thailand is a major exporter of animal products, particularly poultry and seafood. The country has limited national welfare standards, with a growing intensive farming sector. Cultural traditions around animal treatment influence practices, creating both challenges and opportunities. Thailand has a growing alternative protein sector, driven by both domestic demand and export opportunities. The country faces challenges balancing export competitiveness with welfare improvements.'
  },
  'IDN': {
    name: 'Indonesia',
    iso3: 'IDN',
    fastFacts: [
      'Large population and animal agriculture sector',
      'Limited national welfare legislation',
      'Growing intensive farming',
      'Cultural and religious traditions influence practices',
      'Growing alternative protein market'
    ],
    baselineGrade: 'D',
    baselineScore: 0.3,
    sources: [
      'https://www.goodfoodinstitute.org/indonesia',
      'https://www.worldanimalprotection.org/countries/indonesia',
      'https://www.pertanian.go.id/'
    ],
    detailedContext: 'Indonesia has a large population and growing animal agriculture sector, with limited national welfare legislation. The country has a growing intensive farming sector, particularly in poultry. Cultural and religious traditions (including halal requirements) influence animal treatment practices. Indonesia has a growing alternative protein market, with companies like Green Rebel leading innovation. Enforcement capacity is limited, with most oversight focused on food safety rather than welfare.'
  },
  'ARG': {
    name: 'Argentina',
    iso3: 'ARG',
    fastFacts: [
      'Major exporter of animal products (especially beef)',
      'Limited national welfare standards',
      'Traditional extensive farming systems',
      'Growing intensive farming sector',
      'Growing alternative protein sector'
    ],
    baselineGrade: 'D',
    baselineScore: 0.32,
    sources: [
      'https://www.goodfoodinstitute.org/argentina',
      'https://www.worldanimalprotection.org/countries/argentina',
      'https://www.argentina.gob.ar/senasa'
    ],
    detailedContext: 'Argentina is a major global exporter of animal products, particularly beef, with traditional extensive farming systems. The country has limited national welfare standards, with a growing intensive farming sector. Argentina has a growing alternative protein sector, with companies like NotCo leading innovation in plant-based products. The country faces challenges balancing export competitiveness with welfare improvements, with most oversight focused on food safety and disease control.'
  },
  'CHL': {
    name: 'Chile',
    iso3: 'CHL',
    fastFacts: [
      'Export-oriented animal agriculture',
      'Limited national welfare standards',
      'Growing intensive farming',
      'Growing alternative protein sector',
      'Increasing public awareness'
    ],
    baselineGrade: 'D',
    baselineScore: 0.3,
    sources: [
      'https://www.goodfoodinstitute.org/chile',
      'https://www.worldanimalprotection.org/countries/chile',
      'https://www.sag.gob.cl/'
    ],
    detailedContext: 'Chile has an export-oriented animal agriculture sector with limited national welfare standards. The country has a growing intensive farming sector, particularly in salmon and poultry. Chile has a growing alternative protein sector, with companies like NotCo (Chilean-founded) leading innovation. Increasing public awareness of welfare issues is driving market demand, though enforcement capacity remains limited.'
  },
  'NZL': {
    name: 'New Zealand',
    iso3: 'NZL',
    fastFacts: [
      'High welfare standards with comprehensive legislation',
      'Strong enforcement and oversight',
      'Export-oriented agriculture',
      'Growing alternative protein sector',
      'High public support for welfare'
    ],
    baselineGrade: 'B+',
    baselineScore: 0.45,
    sources: [
      'https://www.mpi.govt.nz/animals/animal-welfare/',
      'https://www.goodfoodinstitute.org/new-zealand',
      'https://www.spca.nz/'
    ],
    detailedContext: 'New Zealand has high animal welfare standards with comprehensive legislation covering all animal categories. The country has strong enforcement and oversight, with the SPCA playing a key role. New Zealand\'s export-oriented agriculture balances competitiveness with welfare standards. The country has a growing alternative protein sector, with high public support for welfare improvements. New Zealand serves as a model for comprehensive welfare governance.'
  },
  'EGY': {
    name: 'Egypt',
    iso3: 'EGY',
    fastFacts: [
      'Large population and animal agriculture',
      'Limited national welfare legislation',
      'Cultural and religious traditions influence practices',
      'Growing intensive farming',
      'Limited enforcement capacity'
    ],
    baselineGrade: 'D',
    baselineScore: 0.28,
    sources: [
      'https://www.worldanimalprotection.org/countries/egypt',
      'https://www.goodfoodinstitute.org/egypt',
      'https://www.agriculture.gov.eg/'
    ],
    detailedContext: 'Egypt has a large population and significant animal agriculture sector, with limited national welfare legislation. Cultural and religious traditions (including halal requirements) influence animal treatment practices. The country has a growing intensive farming sector, particularly in poultry. Enforcement capacity is limited, with most oversight focused on food safety and disease control rather than welfare during rearing.'
  },
  'KEN': {
    name: 'Kenya',
    iso3: 'KEN',
    fastFacts: [
      'Mixed farming systems (traditional and intensive)',
      'Limited national welfare legislation',
      'Wildlife conservation and farming coexist',
      'Growing urban demand for animal products',
      'Limited enforcement capacity'
    ],
    baselineGrade: 'D',
    baselineScore: 0.3,
    sources: [
      'https://www.worldanimalprotection.org/countries/kenya',
      'https://www.goodfoodinstitute.org/kenya',
      'https://www.kalro.org/'
    ],
    detailedContext: 'Kenya has mixed farming systems, with traditional extensive systems coexisting with growing intensive operations. The country has limited national welfare legislation, with wildlife conservation playing an important role. Growing urban demand for animal products is driving expansion of intensive farming. Enforcement capacity is limited, with most oversight focused on food safety and disease control. Kenya faces challenges balancing food security, economic development, and animal welfare.'
  },
  'NGA': {
    name: 'Nigeria',
    iso3: 'NGA',
    fastFacts: [
      'Large population and growing animal agriculture',
      'Limited national welfare legislation',
      'Mixed farming systems',
      'Growing intensive farming sector',
      'Limited enforcement capacity'
    ],
    baselineGrade: 'D',
    baselineScore: 0.28,
    sources: [
      'https://www.worldanimalprotection.org/countries/nigeria',
      'https://www.goodfoodinstitute.org/nigeria',
      'https://www.fmard.gov.ng/'
    ],
    detailedContext: 'Nigeria has a large population and rapidly growing animal agriculture sector, with limited national welfare legislation. The country has mixed farming systems, with traditional extensive systems alongside growing intensive operations. Nigeria faces significant challenges balancing food security, economic development, and animal welfare. Enforcement capacity is very limited, with most oversight focused on food safety and disease control rather than welfare during rearing.'
  },
  'SAU': {
    name: 'Saudi Arabia',
    iso3: 'SAU',
    fastFacts: [
      'Major importer of animal products',
      'Limited national welfare legislation',
      'Cultural and religious traditions (halal) influence practices',
      'Growing intensive farming sector',
      'Limited enforcement capacity'
    ],
    baselineGrade: 'D',
    baselineScore: 0.3,
    sources: [
      'https://www.worldanimalprotection.org/countries/saudi-arabia',
      'https://www.goodfoodinstitute.org/saudi-arabia',
      'https://www.mewa.gov.sa/'
    ],
    detailedContext: 'Saudi Arabia is a major importer of animal products, with limited national welfare legislation. Cultural and religious traditions, particularly halal requirements, significantly influence animal treatment practices. The country has a growing intensive farming sector, driven by food security concerns. Enforcement capacity is limited, with most oversight focused on halal certification and food safety rather than welfare during rearing.'
  },
  'TUR': {
    name: 'Turkey',
    iso3: 'TUR',
    fastFacts: [
      'Bridge between Europe and Middle East',
      'EU candidate with improving welfare standards',
      'Major producer of animal products',
      'Cultural and religious traditions influence practices',
      'Growing alternative protein sector'
    ],
    baselineGrade: 'D',
    baselineScore: 0.32,
    sources: [
      'https://www.goodfoodinstitute.org/turkey',
      'https://www.worldanimalprotection.org/countries/turkey',
      'https://www.tarimorman.gov.tr/'
    ],
    detailedContext: 'Turkey is a major producer of animal products, serving as a bridge between Europe and the Middle East. As an EU candidate country, Turkey is improving welfare standards to align with EU directives. Cultural and religious traditions, including halal requirements, influence animal treatment practices. The country has a growing alternative protein sector, driven by both domestic demand and export opportunities. Turkey faces challenges balancing traditional practices with modern welfare standards.'
  },
  'ISR': {
    name: 'Israel',
    iso3: 'ISR',
    fastFacts: [
      'Limited national welfare legislation',
      'Strong alternative protein innovation',
      'High-tech farming systems',
      'Growing public awareness of welfare',
      'Cultural traditions influence practices'
    ],
    baselineGrade: 'C',
    baselineScore: 0.35,
    sources: [
      'https://www.goodfoodinstitute.org/israel',
      'https://www.worldanimalprotection.org/countries/israel',
      'https://www.gov.il/en/departments/ministry_of_agriculture'
    ],
    detailedContext: 'Israel has limited national welfare legislation but is a global leader in alternative protein innovation, with companies like Aleph Farms (cultured meat) and Redefine Meat leading the industry. The country has high-tech farming systems and growing public awareness of animal welfare issues. Cultural traditions, including kosher requirements, influence animal treatment practices. Israel demonstrates how technological innovation can drive welfare improvements through alternative protein development.'
  },
  'PHL': {
    name: 'Philippines',
    iso3: 'PHL',
    fastFacts: [
      'Large population and growing animal agriculture',
      'Limited national welfare legislation',
      'Growing intensive farming sector',
      'Cultural traditions influence practices',
      'Growing alternative protein market'
    ],
    baselineGrade: 'D',
    baselineScore: 0.28,
    sources: [
      'https://www.goodfoodinstitute.org/philippines',
      'https://www.worldanimalprotection.org/countries/philippines',
      'https://www.da.gov.ph/'
    ],
    detailedContext: 'The Philippines has a large population and growing animal agriculture sector, with limited national welfare legislation. The country has a growing intensive farming sector, particularly in poultry and pork. Cultural traditions influence animal treatment practices. The Philippines has a growing alternative protein market, driven by urban consumer demand. Enforcement capacity is limited, with most oversight focused on food safety and disease control.'
  },
  'MYS': {
    name: 'Malaysia',
    iso3: 'MYS',
    fastFacts: [
      'Growing animal agriculture sector',
      'Limited national welfare legislation',
      'Cultural and religious traditions (halal) influence practices',
      'Growing alternative protein sector',
      'Increasing public awareness'
    ],
    baselineGrade: 'D',
    baselineScore: 0.3,
    sources: [
      'https://www.goodfoodinstitute.org/malaysia',
      'https://www.worldanimalprotection.org/countries/malaysia',
      'https://www.doa.gov.my/'
    ],
    detailedContext: 'Malaysia has a growing animal agriculture sector with limited national welfare legislation. Cultural and religious traditions, particularly halal requirements, significantly influence animal treatment practices. The country has a growing alternative protein sector, with companies like Phuture Foods leading innovation. Increasing public awareness of welfare issues is driving market demand, though enforcement capacity remains limited.'
  }
}

/**
 * Generate basic fast facts for countries without detailed data
 */
export function generateBasicFastFacts(iso3: string, countryName: string): string[] {
  // Regional patterns for basic facts
  const regionalPatterns: Record<string, string[]> = {
    'EU': [
      'EU member states follow common welfare directives',
      'Animal welfare standards vary by member state implementation',
      'Growing focus on farm animal welfare in recent years'
    ],
    'ASIA': [
      'Rapidly growing animal agriculture sector',
      'Cultural traditions influence welfare practices',
      'Increasing awareness of animal welfare issues'
    ],
    'AFRICA': [
      'Mixed farming systems (traditional and intensive)',
      'Wildlife conservation and farming coexist',
      'Limited formal welfare legislation'
    ],
    'LATIN_AMERICA': [
      'Growing export-oriented animal agriculture',
      'Traditional farming practices transitioning to intensive systems',
      'Limited national welfare standards'
    ],
    'MIDDLE_EAST': [
      'Cultural and religious traditions influence animal treatment',
      'Growing urban demand for animal products',
      'Limited formal welfare legislation'
    ],
    'OCEANIA': [
      'Island nations with unique ecosystem considerations',
      'Tourism and conservation influence welfare policies',
      'Limited formal welfare standards'
    ]
  }

  // Default generic facts
  const defaultFacts = [
    'Animal welfare standards vary by region and industry',
    'Limited comprehensive national welfare legislation',
    'Growing awareness of animal welfare issues',
    'Welfare practices influenced by cultural and economic factors'
  ]

  // Try to match by region (simplified logic)
  if (['FRA', 'DEU', 'ITA', 'ESP', 'NLD', 'BEL', 'POL', 'SWE', 'DNK', 'FIN', 'AUT', 'PRT', 'GRC', 'IRL', 'CZE', 'HUN', 'ROU', 'BGR', 'HRV', 'SVK', 'SVN', 'EST', 'LVA', 'LTU'].includes(iso3)) {
    return regionalPatterns['EU']
  }
  
  if (['CHN', 'IND', 'JPN', 'KOR', 'THA', 'VNM', 'IDN', 'PHL', 'MYS', 'SGP', 'BGD', 'PAK'].includes(iso3)) {
    return regionalPatterns['ASIA']
  }
  
  if (['ZAF', 'EGY', 'KEN', 'NGA', 'GHA', 'TZA', 'UGA', 'ETH', 'MAR', 'TUN', 'DZA'].includes(iso3)) {
    return regionalPatterns['AFRICA']
  }
  
  if (['BRA', 'MEX', 'ARG', 'CHL', 'COL', 'PER', 'VEN', 'ECU', 'BOL', 'PRY', 'URY'].includes(iso3)) {
    return regionalPatterns['LATIN_AMERICA']
  }
  
  if (['SAU', 'ARE', 'IRN', 'IRQ', 'ISR', 'TUR', 'EGY'].includes(iso3)) {
    return regionalPatterns['MIDDLE_EAST']
  }
  
  if (['NZL', 'PNG', 'FJI', 'PHL'].includes(iso3)) {
    return regionalPatterns['OCEANIA']
  }

  return defaultFacts
}

/**
 * Calculate letter grade from welfare score (0-1)
 */
export function getWelfareGrade(score: number): 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F' {
  if (score >= 0.9) return 'A+'
  if (score >= 0.85) return 'A'
  if (score >= 0.8) return 'A-'
  if (score >= 0.75) return 'B+'
  if (score >= 0.7) return 'B'
  if (score >= 0.65) return 'B-'
  if (score >= 0.6) return 'C+'
  if (score >= 0.55) return 'C'
  if (score >= 0.5) return 'C-'
  if (score >= 0.45) return 'D+'
  if (score >= 0.4) return 'D'
  if (score >= 0.35) return 'D-'
  return 'F'
}

/**
 * Get grade color
 */
export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#4ade80' // Green
  if (grade.startsWith('B')) return '#84cc16' // Light green
  if (grade.startsWith('C')) return '#eab308' // Yellow
  if (grade.startsWith('D')) return '#f97316' // Orange
  return '#ef4444' // Red
}

/**
 * Get country welfare data or return default
 */
export function getCountryData(iso3: string, countryName?: string): CountryWelfareData | null {
  // Check if we have detailed data
  if (countryWelfareData[iso3]) {
    return countryWelfareData[iso3]
  }
  
  // Generate basic data for countries without detailed info
  if (countryName) {
    // Estimate baseline score based on region (simplified)
    let baselineScore = 0.3 // Default
    
    // EU countries tend to have better welfare
    if (['FRA', 'DEU', 'ITA', 'ESP', 'NLD', 'BEL', 'POL', 'SWE', 'DNK', 'FIN', 'AUT', 'PRT', 'GRC', 'IRL'].includes(iso3)) {
      baselineScore = 0.35
    }
    
    // Some Asian countries
    if (['JPN', 'KOR', 'SGP'].includes(iso3)) {
      baselineScore = 0.32
    }
    
    return {
      name: countryName,
      iso3: iso3,
      fastFacts: generateBasicFastFacts(iso3, countryName),
      baselineGrade: getWelfareGrade(baselineScore),
      baselineScore: baselineScore
    }
  }
  
  return null
}
