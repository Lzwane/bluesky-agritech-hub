export interface MockDiagnosis {
  crop: string;
  issue: string;
  type: "Disease" | "Pest" | "Deficiency";
  severity: number;
  severityLabel: string;
  confidence: number;
  actions: string[];
  note: string;
}

const SAMPLES: Omit<MockDiagnosis, "severityLabel">[] = [
  {
    crop: "Maize",
    issue: "Grey Leaf Spot (Cercospora zeae-maydis)",
    type: "Disease",
    severity: 72,
    confidence: 91,
    actions: [
      "Scout the ear leaf across 5 points in the block and record lesion counts.",
      "Apply a strobilurin + triazole fungicide within 48 hours while lesions are still on lower leaves.",
      "Re-inspect after 14 days and repeat only if wet weather continues.",
      "Plan a rotation to soybean or sunflower next season to break the disease cycle.",
    ],
    note: "Grey leaf spot spreads fastest above 25°C with long dew periods. Early spraying protects the ear leaf, which drives most of your yield.",
  },
  {
    crop: "Tomato",
    issue: "Late Blight (Phytophthora infestans)",
    type: "Disease",
    severity: 88,
    confidence: 94,
    actions: [
      "Remove and destroy visibly infected plants today — do not compost them.",
      "Apply a systemic fungicide (mandipropamid) followed by a protectant 7 days later.",
      "Switch to drip irrigation and water in the morning so foliage dries.",
      "Increase spacing on the next planting to improve airflow.",
    ],
    note: "Late blight can destroy an entire block in under a week during cool, wet, overcast weather. Act the same day.",
  },
  {
    crop: "Spinach",
    issue: "Aphid infestation (Aphidoidea spp.)",
    type: "Pest",
    severity: 46,
    confidence: 89,
    actions: [
      "Hose down heavily infested growing points to knock the colonies back.",
      "Spray neem oil or potassium soap, covering the leaf undersides thoroughly.",
      "Repeat after 7 days and hang yellow sticky traps to monitor winged adults.",
      "Encourage ladybirds and lacewings instead of broad-spectrum insecticides.",
    ],
    note: "Aphids also transmit viruses, so keep pressure low even when leaf damage looks mild.",
  },
  {
    crop: "Citrus",
    issue: "Zinc & nitrogen deficiency",
    type: "Deficiency",
    severity: 38,
    confidence: 87,
    actions: [
      "Take a leaf sample from the spring flush for a full nutrient analysis.",
      "Apply a foliar zinc chelate spray for a fast correction of the mottling.",
      "Split-apply LAN according to the soil report rather than one heavy dose.",
      "Mulch under the canopy to protect roots and improve nutrient uptake.",
    ],
    note: "Sandy, high-pH soils lock up zinc. Correcting soil pH gives a longer-lasting result than foliar sprays alone.",
  },
  {
    crop: "Maize",
    issue: "Fall Armyworm (Spodoptera frugiperda)",
    type: "Pest",
    severity: 64,
    confidence: 92,
    actions: [
      "Inspect 100 plants and record the percentage of infested whorls.",
      "Spray chlorantraniliprole directed into the whorl in the late afternoon.",
      "Where infestation is under 10%, hand-remove larvae on small plots first.",
      "Rotate insecticide groups between applications to slow resistance.",
    ],
    note: "Larvae feed deep inside the whorl, so spray volume and nozzle placement matter more than product choice.",
  },
];

function label(severity: number): string {
  if (severity >= 75) return "Severe";
  if (severity >= 55) return "High";
  if (severity >= 35) return "Moderate";
  return "Low";
}

export function runMockDiagnosis(seed: string): MockDiagnosis {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  const sample = SAMPLES[(hash + seed.length) % SAMPLES.length]!;
  return { ...sample, severityLabel: label(sample.severity) };
}
