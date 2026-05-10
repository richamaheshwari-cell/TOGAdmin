import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";

export type VisibilityFieldName =
  | "showInBlog"
  | "showInGameArticle"
  | "showInBonusArticle"
  | "showInCasinoArticle";

export type VisibilityFlags = {
  showInBlog: boolean;
  showInGameArticle: boolean;
  showInBonusArticle: boolean;
  showInCasinoArticle: boolean;
};

type VisibilityFormValues = FieldValues & VisibilityFlags;

type VisibilityOption = {
  name: VisibilityFieldName;
  label: string;
};

type CheckBoxesComponentProps<TFormValues extends VisibilityFormValues> = {
  control: Control<TFormValues>;
  title?: string;
  options?: VisibilityOption[];
};

const DEFAULT_OPTIONS: VisibilityOption[] = [
  {
    name: "showInBlog",
    label: "Show in Blog",
  },
  {
    name: "showInGameArticle",
    label: "Show in Game Article",
  },
  {
    name: "showInBonusArticle",
    label: "Show in Bonus Article",
  },
  {
    name: "showInCasinoArticle",
    label: "Show in Casino Article",
  },
];

export default function CheckBoxesComponent<
  TFormValues extends VisibilityFormValues,
>({
  control,
  title = "Visibility Settings",
  options = DEFAULT_OPTIONS,
}: CheckBoxesComponentProps<TFormValues>) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        {title}
      </Typography>

      <FormGroup>
        {options.map((option) => (
          <Controller
            key={option.name}
            name={option.name as FieldPath<TFormValues>}
            control={control}
            render={({ field: controllerField }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!controllerField.value}
                    onChange={(e) => controllerField.onChange(e.target.checked)}
                  />
                }
                label={option.label}
              />
            )}
          />
        ))}
      </FormGroup>
    </Box>
  );
}
