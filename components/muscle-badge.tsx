import { cn } from "@/lib/utils";
import { MUSCLE_COLORS, MUSCLE_LABELS, type MuscleGroup } from "@/lib/exercises-db";

interface MuscleBadgeProps {
  muscle: MuscleGroup;
  size?: "sm" | "xs";
  className?: string;
}

export function MuscleBadge({ muscle, size = "sm", className }: MuscleBadgeProps) {
  const colors = MUSCLE_COLORS[muscle] ?? MUSCLE_COLORS.geral;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colors.bg, colors.text, colors.border,
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className
      )}
    >
      {MUSCLE_LABELS[muscle]}
    </span>
  );
}
