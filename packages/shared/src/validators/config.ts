import { z } from "zod"

export const configSchema = z.object({
  name: z.string().min(1, "Name is required").regex(/^[a-zA-Z0-9_-]+$/, "Name can only contain alphanumeric characters, underscores, and dashes"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),

  targetTopics: z.coerce.number().min(1).max(50).default(8),
  maxFollowUpsPerTopic: z.coerce.number().min(0).max(10).default(2),
  maxClarificationsPerTopic: z.coerce.number().min(0).max(10).default(2),

  // We will store activityConfig as a string in the form, and parse it to JSON
  activityConfig: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val)
      return typeof parsed === "object" && parsed !== null
    } catch {
      return false
    }
  }, "Must be a valid JSON object").default("{}"),

  defaultTopicTimeLimitSecs: z.coerce.number().min(30).max(3600).default(600),

  maxPauseCount: z.coerce.number().min(0).max(10).default(2),
  resumeDeadlineHours: z.coerce.number().min(1).max(720).default(24),

  allowedDifficultyModes: z.array(z.enum(["GRADUAL", "ADAPTIVE", "INTENSIVE"])).min(1, "At least one difficulty mode must be allowed").default(["GRADUAL", "ADAPTIVE", "INTENSIVE"]),

  maxResumeUploadsPerJobProfile: z.coerce.number().min(1).max(100).default(1),
  maxResumeUploadsPerDay: z.coerce.number().min(0).max(100).default(1),
  maxJobProfiles: z.coerce.number().min(1).max(100).default(1),
  parseFullResume: z.boolean().default(false),
  maxProjectsToExtract: z.coerce.number().min(0).max(20).default(3),
  maxSkillsPerCategory: z.coerce.number().min(0).max(50).default(10),
  maxExperienceYears: z.coerce.number().min(0).max(50).default(10),

  reportDepth: z.enum(["MINIMAL", "STANDARD", "DETAILED", "EXHAUSTIVE"]).default("STANDARD"),
  reportUnlockable: z.boolean().default(false),

  questionGenMode: z.enum(["HYBRID"]).default("HYBRID"),
})

export type ConfigInput = z.infer<typeof configSchema>
export type ConfigFormInput = z.input<typeof configSchema>
