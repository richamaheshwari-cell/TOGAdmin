import { z } from "zod";

/**
 * Casino form validation aligned with POST/PUT /api/v1/admin/casinos.
 * Limits avoid 400 Invalid request body: casinoName 2–120, slug 2–140 (read-only in UI),
 * bonusAmt required/dollars only/max 120, payoutSpeed required/max 15, bonusDetails each 1–80,
 * tags required/each 1–40, seoTitle required/max 66, seoDesc required/max 160, content optional.
 */
export const casinoStatusEnum = z.enum(["published", "draft", "pending"]);

/** Dollar amount only (e.g. 1200 or $1200.50) to avoid layout issues on public UI */
const bonusAmtSchema = z
  .string()
  .min(1, "Bonus amount is required")
  .max(120, "Max 120 characters")
  .refine((val) => /^\$?\d+(\.\d{1,2})?$/.test(val.trim()), "Enter amount in dollars only (e.g. 1200 or $1200)");

export const casinoFormSchema = z.object({
  casinoName: z.string().min(2, "At least 2 characters").max(120, "Max 120 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .max(140, "Max 140 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case (lowercase, hyphens only)"),
  featureImg: z.string().url().optional().or(z.literal("")),
  rating: z.number().min(0).max(5),
  status: casinoStatusEnum,
  reviewCount: z.number().int().min(0),
  bonusAmt: bonusAmtSchema,
  bonusDetails: z.array(z.string().min(1, "1–80 chars").max(80)),
  totalGames: z.number().int().min(0).nullable(),
  tags: z.array(z.string().min(1, "1–40 chars").max(40)).min(1, "At least one tag required"),
  payoutSpeed: z.string().min(1, "Payout speed is required").max(15, "Max 15 characters"),
  clientLink: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().min(1, "SEO title is required").max(66, "50–66 characters recommended for search"),
  seoDesc: z.string().min(1, "SEO description is required").max(160, "~160 characters for search snippets"),
  content: z.string().optional(), // TipTap JSON – not required
});

export type CasinoFormValues = z.infer<typeof casinoFormSchema>;

export const defaultCasinoFormValues: CasinoFormValues = {
  casinoName: "",
  slug: "",
  featureImg: "",
  rating: 0,
  status: "draft",
  reviewCount: 0,
  bonusAmt: "",
  bonusDetails: [],
  totalGames: null,
  tags: [],
  payoutSpeed: "",
  clientLink: "",
  seoTitle: "",
  seoDesc: "",
  content: "",
};
