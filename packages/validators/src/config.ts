import { z } from "zod"

export const configSchema = z.object({
  name: z.string().min(1, "Name is required").regex(/^[a-zA-Z0-9_-]+$/, "Name can only contain alphanumeric characters, underscores, and dashes"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),

  targetTurns: z.coerce.number().min(1).max(50).default(8),
  maxFollowUpsPerTopic: z.coerce.number().min(0).max(10).default(2),
  hardCapTurnsPerTopic: z.coerce.number().min(1).max(50).default(8),

  // We will store activityConfig as a string in the form, and parse it to JSON
  activityConfig: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val)
      return typeof parsed === "object" && parsed !== null
    } catch {
      return false
    }
  }, "Must be a valid JSON object").default("{}"),

  questionTimeSecs: z.coerce.number().min(30).max(1800).default(120),
  followUpTimeSecs: z.coerce.number().min(30).max(1800).default(90),
  clarificationTimeSecs: z.coerce.number().min(10).max(600).default(30),
  activityTimeSecs: z.coerce.number().min(60).max(3600).default(300),

  maxPauseCount: z.coerce.number().min(0).max(10).default(2),
  resumeDeadlineHours: z.coerce.number().min(1).max(720).default(24),

  allowedDifficultyModes: z.array(z.enum(["GRADUAL", "ADAPTIVE", "INTENSIVE"])).min(1, "At least one difficulty mode must be allowed").default(["GRADUAL", "ADAPTIVE", "INTENSIVE"]),

  parseFullResume: z.boolean().default(false),
  maxProjectsToExtract: z.coerce.number().min(0).max(20).default(3),
  maxSkillsPerCategory: z.coerce.number().min(0).max(50).default(10),
  maxExperienceYears: z.coerce.number().min(0).max(50).default(10),

  reportDepth: z.enum(["MINIMAL", "STANDARD", "DETAILED", "EXHAUSTIVE"]).default("STANDARD"),
  maxTopicsInReport: z.coerce.number().min(1).max(20).default(5),
  maxSuggestionsCount: z.coerce.number().min(0).max(10).default(3),
  includeActivityReport: z.boolean().default(true),
  includeTopicEvidence: z.boolean().default(false),
  includeAuthAnalysis: z.boolean().default(false),

  reportUnlockable: z.boolean().default(false),

  plannerModel: z.string().min(1).default("gemini-2.5-flash"),
  interviewModel: z.string().min(1).default("gemini-2.5-flash"),
  judgeModel: z.string().min(1).default("gemini-2.5-flash"),
  reportModel: z.string().min(1).default("gemini-2.5-flash"),

  questionGenMode: z.enum(["HYBRID"]).default("HYBRID"),
})

export type ConfigInput = z.infer<typeof configSchema>
export type ConfigFormInput = z.input<typeof configSchema>
