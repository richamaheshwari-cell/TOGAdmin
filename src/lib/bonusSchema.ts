import { z } from "zod";

export const bonusStatusEnum = z.enum(["published", "draft", "pending"]);

/** Form uses array of { value } so useFieldArray types work; submit shape uses string[]. */
export const bonusFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case (lowercase, hyphens only)"),
  featureImg: z.string().url().optional().or(z.literal("")),
  description: z.array(z.object({ value: z.string() })),
  /** Optional; omit or empty string when not set yet (must be valid URL if provided). */
  clientLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  highlight: z.string().min(1, "Highlight is required"),
  bonusType: z.string().min(1, "Bonus type is required"),
  iconKey: z.string().min(1, "Icon is required"),
  status: bonusStatusEnum,
});

export type BonusFormValues = z.infer<typeof bonusFormSchema>;

/** Shape passed to onSubmit / API (description as string[]). */
export type BonusSubmitValues = Omit<BonusFormValues, "description"> & { description: string[] };

export const defaultBonusFormValues: BonusFormValues = {
  title: "",
  slug: "",
  featureImg: "",
  description: [{ value: "" }],
  clientLink: "",
  highlight: "",
  bonusType: "",
  iconKey: "",
  status: "draft",
};
