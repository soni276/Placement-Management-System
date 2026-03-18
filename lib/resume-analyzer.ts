export const ROLE_SKILL_MAP: Record<string, string[]> = {
  "Software Engineer": ["python", "java", "c++", "algorithms", "data structures", "git", "sql"],
  "Data Scientist": ["python", "machine learning", "deep learning", "tensorflow", "pandas", "numpy", "statistics"],
  "Web Developer": ["html", "css", "javascript", "react", "nodejs", "typescript", "restapi"],
  "DevOps Engineer": ["docker", "kubernetes", "ci/cd", "aws", "linux", "terraform", "jenkins"],
  "Database Admin": ["sql", "mysql", "postgresql", "mongodb", "indexing", "query optimization"],
  "Mobile Developer": ["flutter", "react native", "android", "ios", "swift", "kotlin"],
};

const ALL_SKILLS = Array.from(
  new Set(Object.values(ROLE_SKILL_MAP).flat())
);

export function detectSkills(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const skill of ALL_SKILLS) {
    const re = new RegExp(`\\b${escapeRe(skill)}\\b`, "i");
    if (re.test(lower)) {
      found.add(skill.replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }
  return Array.from(found).sort();
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function calculateResumeScore(skills: string[]): number {
  if (skills.length === 0) return 0;
  return Math.min(100, 30 + skills.length * 15);
}

export function recommendRoles(skills: string[]): Array<{ role: string; matchCount: number }> {
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));
  const matches: Array<{ role: string; matchCount: number }> = [];
  for (const [role, roleSkills] of Object.entries(ROLE_SKILL_MAP)) {
    const overlap = roleSkills.filter((rs) => skillSet.has(rs)).length;
    if (overlap >= 1) matches.push({ role, matchCount: overlap });
  }
  return matches.sort((a, b) => b.matchCount - a.matchCount).slice(0, 5);
}

export function getSuggestions(skills: string[]): string[] {
  const suggestions: string[] = [];
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));
  for (const [role, roleSkills] of Object.entries(ROLE_SKILL_MAP)) {
    const missing = roleSkills.filter((rs) => !skillSet.has(rs));
    if (missing.length > 0 && missing.length <= 3) {
      suggestions.push(`For ${role}: add ${missing.join(", ")}`);
    }
  }
  return suggestions.slice(0, 5);
}
