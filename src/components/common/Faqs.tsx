"use client";

import { Control, useFieldArray, Controller } from "react-hook-form";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";

export type FaqItem = {
  question: string;
  answer: string;
};

type FaqsProps = {
  control: Control<any>;
  name?: string;
  title?: string;
};

export default function Faqs({
  control,
  name = "faqs",
  title = "Frequently Asked Questions",
}: FaqsProps) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {fields.map((field, index) => (
          <Paper
            key={field.id}
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}
          >
            <Controller
              name={`${name}.${index}.question`}
              control={control}
              defaultValue=""
              render={({ field: f, fieldState }) => (
                <TextField
                  {...f}
                  label={`Question ${index + 1}`}
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Controller
              name={`${name}.${index}.answer`}
              control={control}
              defaultValue=""
              render={({ field: f, fieldState }) => (
                <TextField
                  {...f}
                  label={`Answer ${index + 1}`}
                  fullWidth
                  multiline
                  minRows={4}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                size="small"
                color="inherit"
                sx={{ color: "text.secondary", textTransform: "none" }}
                onClick={() => remove(index)}
              >
                Remove FAQ
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ mt: fields.length > 0 ? 2 : 0 }}>
        <Button
          variant="contained"
          onClick={() => append({ question: "", answer: "" })}
        >
          Add FAQ
        </Button>
      </Box>
    </Paper>
  );
}
