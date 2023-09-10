import { Control, Controller, FieldValues, Path } from "react-hook-form";
import TextField from "@mui/material/TextField";

type FormInputTextProps<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
};

export function FormInputText<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
}: FormInputTextProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextField
          helperText={error ? error.message : null}
          size="small"
          error={!!error}
          onChange={onChange}
          value={value}
          fullWidth
          label={label}
          variant="outlined"
        />
      )}
    />
  );
}
