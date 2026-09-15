// Broad program choices for check-in, not an admissions catalogue.
// Reference: https://apps.ualberta.ca/catalogue and UAlberta faculty listings.
// Other accommodates specializations, combined degrees, and graduate programs.
export const programs: Record<string, string[]> = {
  "Agricultural, Life & Environmental Sciences": ["Agriculture", "Animal Health", "Environmental and Conservation Sciences", "Forestry", "Human Ecology", "Nutrition and Food Science"],
  "Arts": ["Anthropology", "Art and Design", "Drama", "Economics", "English", "History", "Linguistics", "Music", "Philosophy", "Planning", "Political Science", "Psychology", "Sociology"],
  "Augustana": ["Arts", "Management", "Music", "Science"],
  "Business": ["Accounting", "Business Economics and Law", "Finance", "Human Resource Management", "Marketing", "Operations Management", "Strategic Management and Organization"],
  "Campus Saint-Jean": ["Arts", "Commerce", "Education", "Engineering", "Nursing", "Science"],
  "Education": ["Elementary Education", "Secondary Education", "Educational Psychology", "Educational Policy Studies"],
  "Engineering": ["Qualifying Year", "Chemical Engineering", "Civil Engineering", "Computer Engineering", "Electrical Engineering", "Engineering Physics", "Materials Engineering", "Mechanical Engineering", "Mining Engineering", "Petroleum Engineering"],
  "Kinesiology, Sport & Recreation": ["Kinesiology", "Recreation, Sport and Tourism"],
  "Law": ["Law"],
  "Medicine & Dentistry": ["Medicine", "Dentistry", "Dental Hygiene", "Medical Laboratory Science", "Radiation Therapy"],
  "Native Studies": ["Native Studies"],
  "Nursing": ["Nursing"],
  "Pharmacy & Pharmaceutical Sciences": ["Pharmacy", "Pharmaceutical Sciences"],
  "Public Health": ["Public Health"],
  "Rehabilitation Medicine": ["Occupational Therapy", "Physical Therapy", "Speech-Language Pathology", "Rehabilitation Science"],
  "Science": ["Biochemistry", "Biological Sciences", "Chemistry", "Computing Science", "Earth Sciences", "Environmental Earth Sciences", "Geophysics", "Immunology and Infection", "Mathematics", "Neuroscience", "Pharmacology", "Physics", "Physiology", "Planning", "Psychology", "Statistics"],
  "Other / unaffiliated": [],
};
export function programOptions(faculty: unknown): string[] {
  return [...(typeof faculty === "string" && Object.hasOwn(programs, faculty) ? programs[faculty] : []), "Other", "Not applicable"];
}
