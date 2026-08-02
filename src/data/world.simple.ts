// Simplified world GeoJSON - 11 countries with recognizable shapes
export const worldGeoJSON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { NAME: "United States", ISO_A3: "USA" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-125, 25], [-100, 25], [-90, 30], [-85, 35], [-80, 40], [-75, 45], [-70, 47], [-66, 49],
          [-66, 45], [-70, 42], [-75, 40], [-80, 35], [-85, 30], [-90, 28], [-100, 26], [-125, 25]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "Canada", ISO_A3: "CAN" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-125, 49], [-100, 49], [-90, 50], [-80, 52], [-70, 55], [-66, 60], [-66, 83],
          [-100, 83], [-125, 83], [-125, 49]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "Mexico", ISO_A3: "MEX" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-118, 14], [-105, 14], [-97, 19], [-92, 20], [-88, 19], [-105, 32], [-118, 32], [-118, 14]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "United Kingdom", ISO_A3: "GBR" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-10, 50], [-5, 50], [-2, 52], [2, 54], [2, 61], [-5, 61], [-10, 61], [-10, 50]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "France", ISO_A3: "FRA" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-5, 42], [8, 42], [8, 51], [-5, 51], [-5, 42]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "Germany", ISO_A3: "DEU" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [5, 47], [15, 47], [15, 55], [5, 55], [5, 47]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "India", ISO_A3: "IND" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [68, 6], [97, 6], [97, 37], [68, 37], [68, 6]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "China", ISO_A3: "CHN" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [73, 18], [135, 18], [135, 54], [73, 54], [73, 18]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "Brazil", ISO_A3: "BRA" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-75, -35], [-35, -35], [-35, 5], [-75, 5], [-75, -35]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "South Africa", ISO_A3: "ZAF" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [16, -35], [33, -35], [33, -22], [16, -22], [16, -35]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { NAME: "Australia", ISO_A3: "AUS" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [113, -44], [154, -44], [154, -10], [113, -10], [113, -44]
        ]]
      }
    }
  ]
}
