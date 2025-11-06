// Salary data based on BLS Occupational Employment and Wage Statistics
// and industry research for startup roles

export interface OccupationData {
  id: string;
  title: string;
  category: string;
  salaryByRegion: {
    national: number;
    northeast: number;
    midwest: number;
    south: number;
    west: number;
  };
}

export interface MetroAreaData {
  id: string;
  name: string;
  state: string;
  region: "northeast" | "midwest" | "south" | "west";
  costOfLivingIndex: number; // 100 = national average
  salaryMultiplier: number; // Typical salary adjustment for this metro
  costOfLivingSource: {
    name: string;
    url: string;
  };
}

export const OCCUPATIONS: OccupationData[] = [
  {
    id: "other",
    title: "Other (Custom Role)",
    category: "Other",
    salaryByRegion: {
      national: 95000,
      northeast: 108768,
      midwest: 91430,
      south: 83346,
      west: 103418,
    },
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Engineering",
    salaryByRegion: {
      national: 120000,
      northeast: 135000,
      midwest: 105000,
      south: 110000,
      west: 145000,
    },
  },
  {
    id: "senior-software-engineer",
    title: "Senior Software Engineer",
    category: "Engineering",
    salaryByRegion: {
      national: 155000,
      northeast: 170000,
      midwest: 140000,
      south: 145000,
      west: 180000,
    },
  },
  {
    id: "staff-engineer",
    title: "Staff Engineer",
    category: "Engineering",
    salaryByRegion: {
      national: 190000,
      northeast: 210000,
      midwest: 170000,
      south: 175000,
      west: 220000,
    },
  },
  {
    id: "engineering-manager",
    title: "Engineering Manager",
    category: "Engineering",
    salaryByRegion: {
      national: 165000,
      northeast: 180000,
      midwest: 150000,
      south: 155000,
      west: 190000,
    },
  },
  {
    id: "product-manager",
    title: "Product Manager",
    category: "Product",
    salaryByRegion: {
      national: 130000,
      northeast: 145000,
      midwest: 115000,
      south: 120000,
      west: 155000,
    },
  },
  {
    id: "senior-product-manager",
    title: "Senior Product Manager",
    category: "Product",
    salaryByRegion: {
      national: 160000,
      northeast: 175000,
      midwest: 145000,
      south: 150000,
      west: 185000,
    },
  },
  {
    id: "product-designer",
    title: "Product Designer",
    category: "Design",
    salaryByRegion: {
      national: 110000,
      northeast: 125000,
      midwest: 95000,
      south: 100000,
      west: 135000,
    },
  },
  {
    id: "senior-product-designer",
    title: "Senior Product Designer",
    category: "Design",
    salaryByRegion: {
      national: 140000,
      northeast: 155000,
      midwest: 125000,
      south: 130000,
      west: 165000,
    },
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "Data",
    salaryByRegion: {
      national: 125000,
      northeast: 140000,
      midwest: 110000,
      south: 115000,
      west: 150000,
    },
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    category: "Data",
    salaryByRegion: {
      national: 130000,
      northeast: 145000,
      midwest: 115000,
      south: 120000,
      west: 155000,
    },
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    category: "Engineering",
    salaryByRegion: {
      national: 125000,
      northeast: 140000,
      midwest: 110000,
      south: 115000,
      west: 150000,
    },
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    category: "Marketing",
    salaryByRegion: {
      national: 105000,
      northeast: 120000,
      midwest: 90000,
      south: 95000,
      west: 130000,
    },
  },
  {
    id: "sales-engineer",
    title: "Sales Engineer",
    category: "Sales",
    salaryByRegion: {
      national: 115000,
      northeast: 130000,
      midwest: 100000,
      south: 105000,
      west: 140000,
    },
  },
  {
    id: "account-executive",
    title: "Account Executive",
    category: "Sales",
    salaryByRegion: {
      national: 95000,
      northeast: 110000,
      midwest: 80000,
      south: 85000,
      west: 120000,
    },
  },
  {
    id: "customer-success",
    title: "Customer Success Manager",
    category: "Customer Success",
    salaryByRegion: {
      national: 85000,
      northeast: 95000,
      midwest: 75000,
      south: 78000,
      west: 105000,
    },
  },
  {
    id: "hr-manager",
    title: "HR Manager",
    category: "Human Resources",
    salaryByRegion: {
      national: 95000,
      northeast: 110000,
      midwest: 85000,
      south: 88000,
      west: 115000,
    },
  },
  {
    id: "recruiter",
    title: "Technical Recruiter",
    category: "Human Resources",
    salaryByRegion: {
      national: 80000,
      northeast: 90000,
      midwest: 70000,
      south: 73000,
      west: 95000,
    },
  },
  {
    id: "operations-manager",
    title: "Operations Manager",
    category: "Operations",
    salaryByRegion: {
      national: 90000,
      northeast: 105000,
      midwest: 80000,
      south: 83000,
      west: 110000,
    },
  },
];

export const METRO_AREAS: MetroAreaData[] = [
  // West Coast - High Cost
  {
    id: "sf-bay",
    name: "San Francisco Bay Area",
    state: "CA",
    region: "west",
    costOfLivingIndex: 165,
    salaryMultiplier: 1.45,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "seattle",
    name: "Seattle",
    state: "WA",
    region: "west",
    costOfLivingIndex: 145,
    salaryMultiplier: 1.35,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "san-diego",
    name: "San Diego",
    state: "CA",
    region: "west",
    costOfLivingIndex: 140,
    salaryMultiplier: 1.25,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    state: "CA",
    region: "west",
    costOfLivingIndex: 142,
    salaryMultiplier: 1.28,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "portland",
    name: "Portland",
    state: "OR",
    region: "west",
    costOfLivingIndex: 128,
    salaryMultiplier: 1.18,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "denver",
    name: "Denver",
    state: "CO",
    region: "west",
    costOfLivingIndex: 125,
    salaryMultiplier: 1.15,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  
  // Northeast - High Cost
  {
    id: "nyc",
    name: "New York City",
    state: "NY",
    region: "northeast",
    costOfLivingIndex: 168,
    salaryMultiplier: 1.42,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "boston",
    name: "Boston",
    state: "MA",
    region: "northeast",
    costOfLivingIndex: 148,
    salaryMultiplier: 1.35,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "philadelphia",
    name: "Philadelphia",
    state: "PA",
    region: "northeast",
    costOfLivingIndex: 115,
    salaryMultiplier: 1.10,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "washington-dc",
    name: "Washington DC",
    state: "DC",
    region: "northeast",
    costOfLivingIndex: 152,
    salaryMultiplier: 1.30,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  
  // South - Moderate Cost
  {
    id: "austin",
    name: "Austin",
    state: "TX",
    region: "south",
    costOfLivingIndex: 118,
    salaryMultiplier: 1.15,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "dallas",
    name: "Dallas",
    state: "TX",
    region: "south",
    costOfLivingIndex: 108,
    salaryMultiplier: 1.08,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "houston",
    name: "Houston",
    state: "TX",
    region: "south",
    costOfLivingIndex: 102,
    salaryMultiplier: 1.05,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "atlanta",
    name: "Atlanta",
    state: "GA",
    region: "south",
    costOfLivingIndex: 108,
    salaryMultiplier: 1.10,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "miami",
    name: "Miami",
    state: "FL",
    region: "south",
    costOfLivingIndex: 120,
    salaryMultiplier: 1.12,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "raleigh",
    name: "Raleigh-Durham",
    state: "NC",
    region: "south",
    costOfLivingIndex: 105,
    salaryMultiplier: 1.08,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "nashville",
    name: "Nashville",
    state: "TN",
    region: "south",
    costOfLivingIndex: 110,
    salaryMultiplier: 1.05,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  
  // Midwest - Lower Cost
  {
    id: "chicago",
    name: "Chicago",
    state: "IL",
    region: "midwest",
    costOfLivingIndex: 115,
    salaryMultiplier: 1.12,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "minneapolis",
    name: "Minneapolis",
    state: "MN",
    region: "midwest",
    costOfLivingIndex: 108,
    salaryMultiplier: 1.08,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "detroit",
    name: "Detroit",
    state: "MI",
    region: "midwest",
    costOfLivingIndex: 95,
    salaryMultiplier: 0.98,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "columbus",
    name: "Columbus",
    state: "OH",
    region: "midwest",
    costOfLivingIndex: 98,
    salaryMultiplier: 1.00,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
  {
    id: "kansas-city",
    name: "Kansas City",
    state: "MO",
    region: "midwest",
    costOfLivingIndex: 95,
    salaryMultiplier: 0.98,
    costOfLivingSource: {
      name: "Council for Community and Economic Research (C2ER)",
      url: "https://www.coli.org/",
    },
  },
];

export const REGIONS = [
  { id: "national", name: "National Average" },
  { id: "northeast", name: "Northeast" },
  { id: "midwest", name: "Midwest" },
  { id: "south", name: "South" },
  { id: "west", name: "West" },
] as const;

export type RegionId = typeof REGIONS[number]["id"];

export function getOccupationById(id: string): OccupationData | undefined {
  return OCCUPATIONS.find(occ => occ.id === id);
}

export function getMetroAreaById(id: string): MetroAreaData | undefined {
  return METRO_AREAS.find(metro => metro.id === id);
}

export function getAverageSalaryForLocation(
  occupation: OccupationData,
  metroId?: string,
  regionId?: RegionId
): number {
  if (metroId) {
    const metro = getMetroAreaById(metroId);
    if (metro) {
      const regionalSalary = occupation.salaryByRegion[metro.region];
      return Math.round(regionalSalary * metro.salaryMultiplier);
    }
  }
  
  if (regionId && regionId !== "national") {
    return occupation.salaryByRegion[regionId as keyof typeof occupation.salaryByRegion];
  }
  
  return occupation.salaryByRegion.national;
}

