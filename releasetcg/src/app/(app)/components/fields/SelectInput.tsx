type SelectOption = string | { label: string; value: string };

type SelectInputProps = {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export function SelectInput({
  label,
  value,
  options,
  onChange,
}: SelectInputProps) {
  return (
    <div>
      {label && (
        <label className="mb-1 block font-medium">
          {label}
        </label>
      )}

      <select
        className="w-full rounded border p-2"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : option.value;

          const text =
            typeof option === "string"
              ? option === ""
                ? "None"
                : option
              : option.label;

          return (
            <option
              key={optionValue}
              value={optionValue}
            >
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
}
