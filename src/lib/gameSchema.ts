import { z } from "zod";

/**
 * Games form validation aligned with POST/PUT /api/v1/admin/games.
 * See API: title/slug 2–200, casinoIds 1–100, tag max 15 (UI), providers 1–120 each, details 1–200 each,
 * seoTitle max 200, seoDesc max 500, focusKeywords 1–80 each, content optional TipTap.
 */
export const gameStatusEnum = z.enum(["published", "draft", "pending"]);

export const gameFormSchema = z.object({
  title: z.string().min(2, "At least 2 characters").max(200, "Max 200 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .max(200, "Max 200 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case (lowercase, hyphens only)"),
  /** At least one casino (UUID/cuid id from API). */
  casinoIds: z.array(z.string().min(1)).min(1, "Select at least one casino").max(100, "Max 100 casinos"),
  featureImg: z.string().url().optional().or(z.literal("")),
  tag: z.string().max(15, "Max 15 characters").optional().or(z.literal("")),
  gameProvider: z.array(z.string().min(1, "1–120 chars").max(120)),
  gameDetails: z.array(z.string().min(1, "1–200 chars").max(200)),
  clientLink: z.string().url().optional().or(z.literal("")),
  status: gameStatusEnum,
  seoTitle: z.string().max(200, "Max 200 characters").optional().or(z.literal("")),
  seoDesc: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
  focusKeywords: z.array(z.string().min(1, "1–80 chars").max(80)),
  content: z.string().optional(),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;

export const defaultGameFormValues: GameFormValues = {
  title: "",
  slug: "",
  casinoIds: [],
  featureImg: "",
  tag: "",
  gameProvider: [],
  gameDetails: [],
  clientLink: "",
  status: "draft",
  seoTitle: "",
  seoDesc: "",
  focusKeywords: [],
  content: "",
};
