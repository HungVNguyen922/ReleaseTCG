export const colorMap: Record<
  string,
  { label: string; bg: string }
> = {
  Red: { label: "R", bg: "bg-red-500" },
  Orange: { label: "O", bg: "bg-orange-500" },
  Yellow: { label: "Y", bg: "bg-yellow-400 text-black" },
  Green: { label: "G", bg: "bg-green-500" },
  Cyan: { label: "C", bg: "bg-cyan-500" },
  Blue: { label: "B", bg: "bg-blue-600" },
  Violet: { label: "V", bg: "bg-violet-600" },
  Magenta: { label: "M", bg: "bg-fuchsia-600" },
  Pink: { label: "P", bg: "bg-pink-500" },
};

type Props = {
  palette: string[];
  size?: "sm" | "md";
};

export function PaletteChips({
  palette,
  size = "sm",
}: Props) {
  const classes =
    size === "sm"
      ? "h-5 w-5 text-[10px]"
      : "h-6 w-6 text-xs";

  return (
    <div className="flex flex-wrap gap-1">
      {palette.map((color) => {
        const chip = colorMap[color];

        return (
          <span
            key={color}
            className={`flex items-center justify-center rounded-full font-bold text-white ${chip.bg} ${classes}`}
          >
            {chip.label}
          </span>
        );
      })}
    </div>
  );
}
