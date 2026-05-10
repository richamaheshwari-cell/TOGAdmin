"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useCreatePage } from "@/hooks/usePages";
import { RichTextEditor } from "@/components/editor";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import { slugFromTitle } from "@/lib/utils/slug";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  contentHtml: z.string(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

export default function NewPageRoute() {
  const router = useRouter();
  const createPage = useCreatePage();

  const { register, control, handleSubmit, setError, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", contentHtml: "", seoTitle: "", seoDesc: "", isPublished: false, sortOrder: 0 },
  });

  const onSubmit = async (values: FormValues) => {
    const slug = slugFromTitle(values.title);
    try {
      await createPage.mutateAsync({
        slug,
        title: values.title,
        contentHtml: values.contentHtml,
        seoTitle: values.seoTitle || undefined,
        seoDesc: values.seoDesc || undefined,
        isPublished: values.isPublished,
        sortOrder: values.sortOrder,
      });
      router.push("/cms");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "SLUG_EXISTS") setError("title", { message: "A page with this title (slug) already exists. Try a different title." });
      else setError("root", { message: getDisplayErrorMessage(err, "Failed to create page") });
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Button startIcon={<ArrowBackIcon />} component={Link} href="/cms" sx={{ mb: 2 }}>Back to Pages</Button>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>Add Page</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Create a new CMS page.</Typography>
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {errors.root && <Typography color="error" sx={{ mb: 2 }}>{errors.root.message}</Typography>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <>
              <TextField label="Title" {...register("title")} error={!!errors.title} helperText={errors.title?.message} fullWidth required />
              <Typography variant="body2" color="text.secondary">Slug: {watch("title") ? slugFromTitle(watch("title")) : "—"}</Typography>
            </>
            <Controller
              name="contentHtml"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  output="html"
                  placeholder="Write your page content… Add headings, paragraphs, and images."
                  minHeight={320}
                  aria-label="Page content"
                />
              )}
            />
            <TextField label="SEO Title" {...register("seoTitle")} fullWidth />
            <TextField label="SEO Description" {...register("seoDesc")} multiline rows={2} fullWidth />
            <TextField type="number" label="Sort order" {...register("sortOrder", { valueAsNumber: true })} inputProps={{ min: 0 }} fullWidth />
            <Controller
              name="isPublished"
              control={control}
              render={({ field }) => (
                <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="Published" />
              )}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button type="submit" variant="contained" color="primary" disabled={createPage.isPending}>
                {createPage.isPending ? "Creating…" : "Create Page"}
              </Button>
              <Button component={Link} href="/cms">Cancel</Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
