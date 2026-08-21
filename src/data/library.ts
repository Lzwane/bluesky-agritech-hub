import maizeBlight from "@/assets/lib-maize-blight.jpg";
import tomatoBlight from "@/assets/lib-tomato-blight.jpg";
import aphids from "@/assets/lib-aphids.jpg";
import citrusDeficiency from "@/assets/lib-citrus-deficiency.jpg";

export type EntryType = "Disease" | "Pest" | "Deficiency";

export interface LibraryEntry {
  id: string;
  name: string;
  scientific: string;
  type: EntryType;
  crops: string[];
  image: string;
  summary: string;
  symptoms: string[];
  organic: string[];
  chemical: string[];
  severity: "Low" | "Moderate" | "High" | "Severe";
}

export const CROP_FILTERS = [
  "Maize",
  "Tomato",
  "Citrus",
  "Spinach",
  "Potato",
  "Soybean",
  "Cabbage",
  "Grapes",
];

export const LIBRARY: LibraryEntry[] = [
  {
    id: "grey-leaf-spot",
    name: "Grey Leaf Spot",
    scientific: "Cercospora zeae-maydis",
    type: "Disease",
    crops: ["Maize"],
    image: maizeBlight,
    severity: "High",
    summary:
      "A fungal leaf disease that thrives in warm, humid summer rainfall regions and can cut maize yields sharply when it reaches the ear leaf before grain fill.",
    symptoms: [
      "Long, rectangular tan to grey lesions running parallel to the leaf veins",
      "Lesions start on lower leaves and move upward after wet weather",
      "Leaves dry out prematurely, giving a scorched appearance",
    ],
    organic: [
      "Rotate maize with a non-host crop such as soybean or sunflower",
      "Bury or remove infected residue to reduce spore carry-over",
      "Widen row spacing to improve airflow through the canopy",
    ],
    chemical: [
      "Apply a strobilurin + triazole mix at first lesion appearance on the ear leaf",
      "Repeat after 14-21 days if wet conditions continue",
      "Rotate active ingredients to avoid resistance build-up",
    ],
  },
  {
    id: "late-blight",
    name: "Late Blight",
    scientific: "Phytophthora infestans",
    type: "Disease",
    crops: ["Tomato", "Potato"],
    image: tomatoBlight,
    severity: "Severe",
    summary:
      "An aggressive water mould that can destroy a tomato or potato block within days under cool, wet, overcast conditions.",
    symptoms: [
      "Dark, water-soaked patches with pale yellow-green halos on leaves",
      "White fuzzy growth on the underside of leaves in humid mornings",
      "Firm brown rot on fruit and stems, spreading rapidly",
    ],
    organic: [
      "Remove and destroy infected plants immediately - do not compost",
      "Switch to drip irrigation and water early so leaves dry off",
      "Apply copper-based sprays preventatively before wet spells",
    ],
    chemical: [
      "Rotate a systemic fungicide (mandipropamid or dimethomorph) with a protectant",
      "Spray on a 7-day interval during high-risk weather",
      "Follow the label pre-harvest interval strictly",
    ],
  },
  {
    id: "aphids",
    name: "Aphids",
    scientific: "Aphidoidea spp.",
    type: "Pest",
    crops: ["Spinach", "Cabbage", "Tomato", "Soybean"],
    image: aphids,
    severity: "Moderate",
    summary:
      "Sap-sucking insects that multiply extremely fast in sheltered tunnels and transmit several plant viruses while they feed.",
    symptoms: [
      "Dense clusters of soft green or black insects on new growth and stem tips",
      "Curled, puckered leaves and stunted shoots",
      "Sticky honeydew and black sooty mould on lower leaves",
      "Ants moving up and down the stems",
    ],
    organic: [
      "Release or encourage ladybirds and lacewings as natural predators",
      "Spray neem oil or potassium soap on a 7-day cycle, covering leaf undersides",
      "Use yellow sticky traps to monitor and knock down winged adults",
    ],
    chemical: [
      "Apply a selective systemic aphicide such as flonicamid",
      "Avoid broad-spectrum pyrethroids that wipe out beneficial insects",
      "Alternate chemical groups between applications",
    ],
  },
  {
    id: "zinc-nitrogen-deficiency",
    name: "Zinc & Nitrogen Deficiency",
    scientific: "Nutrient disorder",
    type: "Deficiency",
    crops: ["Citrus", "Maize"],
    image: citrusDeficiency,
    severity: "Moderate",
    summary:
      "Common on sandy, high-pH soils. Interveinal yellowing reduces photosynthesis, fruit size and next season's bud quality.",
    symptoms: [
      "Yellow mottling between green veins on younger leaves",
      "Small, narrow leaves and shortened shoot growth",
      "Uniform pale green on older leaves where nitrogen is short",
    ],
    organic: [
      "Work in well-matured compost and mulch to raise organic matter",
      "Plant a legume cover crop to fix nitrogen between rows",
      "Correct soil pH with gypsum or elemental sulphur where it is too high",
    ],
    chemical: [
      "Foliar zinc chelate spray during the spring flush for a fast correction",
      "Split-apply LAN or urea according to leaf and soil analysis",
      "Re-test leaves after 6-8 weeks to confirm recovery",
    ],
  },
  {
    id: "fall-armyworm",
    name: "Fall Armyworm",
    scientific: "Spodoptera frugiperda",
    type: "Pest",
    crops: ["Maize", "Soybean"],
    image: maizeBlight,
    severity: "Severe",
    summary:
      "A migratory caterpillar pest that feeds inside the maize whorl and can strip young plants within a single week.",
    symptoms: [
      "Ragged 'window pane' feeding holes across young leaves",
      "Moist sawdust-like frass packed into the whorl",
      "Larvae with an inverted white Y marking on the head capsule",
    ],
    organic: [
      "Scout twice weekly and hand-pick larvae from the whorl on small plots",
      "Apply Bacillus thuringiensis or a spinosad-based bio-insecticide at dusk",
      "Push sand or wood ash into infested whorls as a low-cost knockdown",
    ],
    chemical: [
      "Target larvae early with chlorantraniliprole directed into the whorl",
      "Spray late afternoon when larvae are actively feeding",
      "Rotate insecticide groups every application",
    ],
  },
  {
    id: "powdery-mildew",
    name: "Powdery Mildew",
    scientific: "Erysiphe necator",
    type: "Disease",
    crops: ["Grapes", "Tomato", "Cabbage"],
    image: tomatoBlight,
    severity: "Moderate",
    summary:
      "A dry-weather fungus that coats leaves and bunches in white powder, reducing sugar accumulation and fruit quality.",
    symptoms: [
      "White to grey powdery patches on the upper leaf surface",
      "Leaves curl upward and drop early",
      "Dull, scarred berries that crack as they swell",
    ],
    organic: [
      "Apply wettable sulphur or potassium bicarbonate every 10-14 days",
      "Open the canopy by removing excess leaves around bunches",
      "Spray a diluted milk or bicarbonate solution as an early suppressant",
    ],
    chemical: [
      "Use a DMI or SDHI fungicide at first sign of infection",
      "Maintain full coverage of both leaf surfaces",
      "Stop applications at the label pre-harvest interval",
    ],
  },
];
