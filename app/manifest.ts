import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GymQuest — Fitness Gamificado",
    short_name: "GymQuest",
    description:
      "Transforme seus objetivos fitness em missões épicas. Treino, alimentação e progresso gamificados.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#030712",
    theme_color: "#10b981",
    categories: ["fitness", "health", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
