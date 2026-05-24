export interface ResumeParsedData {
  basics: {
    name: string | null;
    email: string | null;
    phone: string | null;
    summary: string | null;
  };
  experience: {
    company: string;
    role: string;
    startDate: string | null;
    endDate: string | null;
    description: string;
    technologies: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    year: string | null;
  }[];
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
  };
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  suggestedEcosystem: 'JAVASCRIPT' | 'PYTHON' | 'JAVA' | 'GO' | 'OTHER' | null;
}
