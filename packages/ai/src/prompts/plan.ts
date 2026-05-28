import { type ParsedResume } from '@repo/shared'

/*
 * ============================================================================
 * REFERENCE: Plan Config (Available in planConfigSnapshot)
 * ============================================================================
 * The worker passes 'targetTurns' from the config to this generator.
 * Other fields in the config are used across the platform:
 * 
 * {
 *   targetTurns: 8,                  // How many total topics to generate (Used here in Plan Generator)
 *   activityConfig: { ... },         // How many coding/debugging tasks to inject (Used in Phase 2 Plan Generator)
 *   questionTimeSecs: 120,           // The countdown timer for each topic (Used in Live Session UI)
 *   followUpTimeSecs: 90,            // Extra time granted if AI asks a follow up (Used in Live Session Action)
 *   clarificationTimeSecs: 30,       // Extra time granted if User asks a clarifying question (Used in Live Session Action)
 *   allowedDifficultyModes: [...],   // Modes the user is allowed to pick in the UI (e.g. 'GRADUAL', 'INTENSIVE')
 *   questionGenMode: 'HYBRID',       // Tells the Session Engine to generate the exact question text live, not here
 *   reportDepth: 'STANDARD'          // How detailed the final PDF report should be (Used in Report Generator)
 * }
 * ============================================================================
 */

export interface PlanGeneratorOptions {
  targetTurns: number
  interviewType: string
  allowActivities?: boolean
  activityConfig?: Record<string, number>
}

export function buildPlanGeneratorSystemPrompt(
  targetRole: string,
  experienceLevel: string,
  resumeData: ParsedResume,
  options: PlanGeneratorOptions
) {
  let focusInstruction = ''
  switch (options.interviewType) {
    case 'HR':
      focusInstruction = 'Focus EXCLUSIVELY on HR, BEHAVIORAL, and SCENARIO categories. Do NOT generate conceptual topics.'
      break
    case 'TECHNICAL':
      focusInstruction = 'Focus EXCLUSIVELY on CONCEPTUAL, RESUME_BASED, SCENARIO, and FOLLOW_UP_DEPTH categories. Do NOT generate HR questions.'
      break
    case 'SYSTEM_DESIGN':
      focusInstruction = 'Focus EXCLUSIVELY on CONCEPTUAL and SCENARIO categories focusing on Architecture and scaling. Every question should relate to high-level design.'
      break
    case 'BEHAVIORAL':
      focusInstruction = 'Focus EXCLUSIVELY on BEHAVIORAL and REFLECTION categories. Explore past experiences and conflict resolution.'
      break
    default:
      focusInstruction = 'Create a balanced FULL interview. Mix HR, BEHAVIORAL, CONCEPTUAL, and RESUME_BASED questions.'
  }

  const baseCategories = ['HR', 'RESUME_BASED', 'FOLLOW_UP_DEPTH', 'CONCEPTUAL', 'SCENARIO', 'BEHAVIORAL', 'PRESSURE', 'REFLECTION', 'COMMUNICATION_SIMPLIFICATION']
  let activityInstruction = ''

  if (options.allowActivities && options.activityConfig) {
    baseCategories.push('ACTIVITY')
    const configEntries = Object.entries(options.activityConfig).filter(([_, count]) => count > 0)
    if (configEntries.length > 0) {
      const requirements = configEntries.map(([type, count]) => `exactly ${count} topic(s) with activityType "${type}"`).join(', ')
      activityInstruction = `\nACTIVITY REQUIREMENT: You MUST generate ${requirements}. For these specific topics, you must set "category": "ACTIVITY", set "activityType" to the required value, and explicitly set "intent" to either "PRESSURE_TEST" or "REASONING_EVAL".`
    }
  }

  return `You are an expert technical interviewer planning a mock interview.
Target Role: ${targetRole}
Experience Level: ${experienceLevel}
Interview Focus Type: ${options.interviewType}

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Generate exactly ${options.targetTurns} interview topics.
Structure the interview progressively. Start with a CONFIDENCE_CHECK, then move into DEPTH_PROBE and PRESSURE_TEST based on their strongest resume claims. 

CRITICAL INSTRUCTION: ${focusInstruction}${activityInstruction}
Ensure the categories match the standard QuestionCategory enum exactly. 
Valid Categories: ${baseCategories.join(', ')}.
Valid Intents: CONFIDENCE_CHECK, DEPTH_PROBE, PRESSURE_TEST, CLARITY_CHECK, REASONING_EVAL, AUTHENTICITY_CHECK, REFLECTION_TRIGGER.`
}




/*
You are an expert technical interviewer planning a mock interview.
Target Role: Frontend Developer at Startup
Experience Level: MID
Interview Focus Type: FULL

Resume Data:
{
  "basics": {
    "name": "SURAJ ROY",
    "email": "myself.suraj0@gmail.com",
    "phone": "+91 7029847956",
    "summary": "Full-Stack Developer with 2.8+ years of experience designing and delivering scalable SaaS and enterprise applications. Strong frontend depth in Next.js and React combined with hands-on backend ownership."
  },
  "skills": {
    "tools": [
      "Git",
      "Docker",
      "GitHub"
    ],
    "languages": [
      "TypeScript",
      "JavaScript"
    ],
    "frameworks": [
      "Next.js",
      "React.js",
      "NestJS"
    ]
  },
  "projects": [
    {
      "name": "KYC Remediation BO-Portal",
      "description": "Led 80% of the KYC Remediation BO Portal frontend, implementing a full audit trail UI and integrating Keycloak for secure SSO.",
      "technologies": [
        "Next.js",
        "TypeScript",
        "Node.js"
      ]
    },
    {
      "name": "E-Commerce Platform",
      "description": "Architected and built 70%+ of backend APIs independently, designed complex product data models, and integrated Razorpay payment gateway.",
      "technologies": [
        "Next.js",
        "TypeScript",
        "MongoDB"
      ]
    },
    {
      "name": "Genique AI",
      "description": "Built a full-stack AI SaaS platform for image generation with custom model training workflows and real-time generation tracking.",
      "technologies": [
        "TypeScript",
        "Next.js",
        "Node.js"
      ]
    }
  ],
  "education": [
    {
      "year": "2018",
      "degree": "Bachelor of Arts (B.A.)",
      "institution": "University of Burdwan"
    }
  ],
  "experience": [
    {
      "role": "Full-Stack Developer",
      "company": "Underscorete Technology Pvt Ltd",
      "endDate": null,
      "startDate": "Aug 2023",
      "description": "Delivered end-to-end features across frontend and backend for banking, SaaS, and e-commerce platforms. Independently designed and built multiple backend systems including REST APIs and complex frontend systems.",
      "technologies": [
        "Next.js",
        "Node.js",
        "TypeScript"
      ]
    }
  ],
  "suggestedEcosystem": "JAVASCRIPT"
}

Generate exactly 8 interview topics.
Structure the interview progressively. Start with a CONFIDENCE_CHECK, then move into DEPTH_PROBE and PRESSURE_TEST based on their strongest resume claims.

CRITICAL INSTRUCTION: Create a balanced FULL interview. Mix HR, BEHAVIORAL, CONCEPTUAL, and RESUME_BASED questions.
Ensure the categories match the standard QuestionCategory enum exactly.
Valid Categories: HR, RESUME_BASED, FOLLOW_UP_DEPTH, CONCEPTUAL, SCENARIO, BEHAVIORAL, PRESSURE, REFLECTION, COMMUNICATION_SIMPLIFICATION, ACTIVITY.
Valid Intents: CONFIDENCE_CHECK, DEPTH_PROBE, PRESSURE_TEST, CLARITY_CHECK, REASONING_EVAL, AUTHENTICITY_CHECK, REFLECTION_TRIGGER.

response :{
  "topics": [
    {
      "intent": "CONFIDENCE_CHECK",
      "category": "HR",
      "reasoning": "To gauge the candidate's comfort level discussing their experience and skills.",
      "targetSkills": [
        "Communication",
        "Confidence"
      ],
      "plannedDifficulty": "EASY"
    },
    {
      "intent": "DEPTH_PROBE",
      "category": "RESUME_BASED",
      "reasoning": "To explore the candidate's specific contributions and challenges faced in their projects, particularly in Next.js and TypeScript.",
      "targetSkills": [
        "Next.js",
        "TypeScript",
        "React.js"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "PRESSURE_TEST",
      "category": "SCENARIO",
      "reasoning": "To assess how the candidate handles tight deadlines and unexpected challenges in a project scenario.",
      "targetSkills": [
        "Problem Solving",
        "Time Management"
      ],
      "plannedDifficulty": "HARD"
    },
    {
      "intent": "DEPTH_PROBE",
      "category": "BEHAVIORAL",
      "reasoning": "To understand how the candidate works within a team and resolves conflicts based on their past experiences.",
      "targetSkills": [
        "Team Collaboration",
        "Conflict Resolution"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "CLARITY_CHECK",
      "category": "CONCEPTUAL",
      "reasoning": "To evaluate the candidate's understanding of frontend architecture principles and state management in React.",
      "targetSkills": [
        "Frontend Architecture",
        "State Management"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "AUTHENTICITY_CHECK",
      "category": "RESUME_BASED",
      "reasoning": "To verify the authenticity of the candidate's claims regarding their project ownership and technical skills.",
      "targetSkills": [
        "Project Ownership",
        "Technical Skills"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "REFLECTION_TRIGGER",
      "category": "FOLLOW_UP_DEPTH",
      "reasoning": "To encourage the candidate to reflect on their learning journey and areas for improvement.",
      "targetSkills": [
        "Self-Assessment",
        "Growth Mindset"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "PRESSURE_TEST",
      "category": "ACTIVITY",
      "reasoning": "To challenge the candidate with a live coding task that tests their coding and debugging skills under pressure.",
      "targetSkills": [
        "Coding Skills",
        "Debugging"
      ],
      "plannedDifficulty": "HARD"
    }
  ]
}
  with activity response :{
  "topics": [
    {
      "intent": "CONFIDENCE_CHECK",
      "category": "HR",
      "reasoning": "To assess the candidate's comfort level and self-perception regarding their skills and experiences.",
      "targetSkills": [
        "communication",
        "confidence"
      ],
      "plannedDifficulty": "EASY"
    },
    {
      "intent": "DEPTH_PROBE",
      "category": "RESUME_BASED",
      "reasoning": "To explore the candidate's specific experiences and depth of knowledge in the technologies listed on their resume.",
      "targetSkills": [
        "Next.js",
        "React.js",
        "TypeScript"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "PRESSURE_TEST",
      "category": "BEHAVIORAL",
      "reasoning": "To evaluate how the candidate handles pressure and unexpected challenges in a work environment.",
      "targetSkills": [
        "problem-solving",
        "adaptability"
      ],
      "plannedDifficulty": "HARD"
    },
    {
      "intent": "DEPTH_PROBE",
      "category": "CONCEPTUAL",
      "reasoning": "To assess the candidate's understanding of frontend concepts and their ability to articulate them.",
      "targetSkills": [
        "frontend architecture",
        "state management"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "PRESSURE_TEST",
      "category": "ACTIVITY",
      "reasoning": "To evaluate the candidate's ability to prioritize tasks effectively under pressure.",
      "activityType": "PRIORITISATION",
      "targetSkills": [
        "task management",
        "decision making"
      ],
      "plannedDifficulty": "HARD"
    },
    {
      "intent": "PRESSURE_TEST",
      "category": "ACTIVITY",
      "reasoning": "To challenge the candidate to defend their resume claims and demonstrate their knowledge.",
      "activityType": "RESUME_DEFENCE",
      "targetSkills": [
        "self-awareness",
        "technical knowledge"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "REASONING_EVAL",
      "category": "ACTIVITY",
      "reasoning": "To assess the candidate's ability to predict the output of a given code snippet and reason through it.",
      "activityType": "OUTPUT_PREDICTION",
      "targetSkills": [
        "code understanding",
        "debugging"
      ],
      "plannedDifficulty": "MEDIUM"
    },
    {
      "intent": "CLARITY_CHECK",
      "category": "FOLLOW_UP_DEPTH",
      "reasoning": "To ensure the candidate can clearly explain their thought process and technical decisions.",
      "targetSkills": [
        "communication",
        "clarity"
      ],
      "plannedDifficulty": "EASY"
    }
  ]
}
*/