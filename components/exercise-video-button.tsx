"use client";

import { ExternalLink, Play } from "lucide-react";
import { getYouTubeSearchUrl } from "@/lib/exercises-db";

interface ExerciseVideoButtonProps {
  exerciseName: string;
  variant?: "icon" | "full";
}

export function ExerciseVideoButton({
  exerciseName,
  variant = "icon",
}: ExerciseVideoButtonProps) {
  const url = getYouTubeSearchUrl(exerciseName);

  if (variant === "icon") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Ver execução: ${exerciseName}`}
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors shrink-0"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
    >
      <Play className="w-3 h-3 fill-current" />
      Ver execução
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}
