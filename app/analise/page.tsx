"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import {
  Camera, Upload, X, Loader2, Sparkles, ChevronRight,
  RotateCcw, Info, AlertTriangle,
} from "lucide-react";
import Image from "next/image";

interface UploadedImage {
  id: string;
  dataUrl: string;
  label: string;
}

const POSE_LABELS: Record<string, string[]> = {
  pt: ["Frente (Relaxado)", "Costas (Relaxado)", "Lateral Esquerda", "Lateral Direita"],
  en: ["Front (Relaxed)", "Back (Relaxed)", "Left Side", "Right Side"],
  nl: ["Voorkant (Ontspannen)", "Achterkant (Ontspannen)", "Linkerzijde", "Rechterzijde"],
};

export default function AnalisePage() {
  const { t, lang } = useLanguage();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const posLabels = POSE_LABELS[lang] ?? POSE_LABELS["pt"];

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (images.length + files.length > 4) {
        toast.error(t("analyzer.max_photos"));
        return;
      }

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) { toast.error(t("analyzer.invalid_file")); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error(t("analyzer.file_too_large")); return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const idx = images.length;
          setImages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), dataUrl, label: posLabels[idx] ?? `Foto ${prev.length + 1}` },
          ]);
        };
        reader.readAsDataURL(file);
      });

      e.target.value = "";
    },
    [images, posLabels, t]
  );

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setAnalysis(null);
  };

  const runAnalysis = async () => {
    if (images.length === 0) { toast.error(t("analyzer.need_photo")); return; }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/analise-fisico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map((i) => i.dataUrl), language: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "ANTHROPIC_API_KEY not configured") {
          toast.error(t("analyzer.key_missing"));
        } else {
          toast.error(t("analyzer.error"));
        }
        return;
      }
      setAnalysis(data.analysis);
    } catch {
      toast.error(t("analyzer.error"));
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => { setImages([]); setAnalysis(null); };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t("analyzer.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("analyzer.subtitle")}</p>
        </div>
      </div>

      {/* Info card */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-3 pb-3">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{t("analyzer.info_1")}</p>
              <p>{t("analyzer.info_2")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!analysis ? (
        <>
          {/* Upload area */}
          <Card className="border-dashed border-2 border-border/60">
            <CardContent className="pt-6 pb-6">
              {images.length === 0 ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-3 py-6 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{t("analyzer.upload_prompt")}</p>
                    <p className="text-sm mt-1">{t("analyzer.upload_hint")}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{t("analyzer.max_photos_badge")}</Badge>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img) => (
                      <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border">
                        <div className="relative aspect-[3/4]">
                          <Image
                            src={img.dataUrl}
                            alt={img.label}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                          <p className="text-xs text-white font-medium">{img.label}</p>
                        </div>
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}

                    {/* Add more slot */}
                    {images.length < 4 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-xs">{t("analyzer.add_photo")}</span>
                      </button>
                    )}
                  </div>

                  {/* Pose guide */}
                  <div className="bg-secondary/40 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{t("analyzer.pose_guide")}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {posLabels.map((label, i) => (
                        <div key={i} className={`flex items-center gap-1.5 text-xs ${i < images.length ? "text-green-400" : "text-muted-foreground"}`}>
                          <ChevronRight className="w-3 h-3" />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            onClick={runAnalysis}
            disabled={images.length === 0 || analyzing}
            className="w-full gap-2 h-12 text-base"
          >
            {analyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t("analyzer.analyzing")}</>
            ) : (
              <><Sparkles className="w-5 h-5" /> {t("analyzer.analyze_btn")}</>
            )}
          </Button>

          {/* Disclaimer */}
          <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{t("analyzer.disclaimer")}</p>
          </div>
        </>
      ) : (
        <>
          {/* Analysis result */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t("analyzer.result_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Thumbnail strip */}
              <div className="flex gap-2 mb-4">
                {images.map((img) => (
                  <div key={img.id} className="relative w-16 h-20 rounded-lg overflow-hidden border border-border shrink-0">
                    <Image src={img.dataUrl} alt={img.label} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>

              {/* Markdown-like render */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <AnalysisRenderer text={analysis} />
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{t("analyzer.disclaimer")}</p>
          </div>

          <Button variant="outline" onClick={reset} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" /> {t("analyzer.new_analysis")}
          </Button>
        </>
      )}
    </div>
  );
}

/** Renders the AI markdown-like response with proper formatting */
function AnalysisRenderer({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Bold headers with **
        if (line.match(/^\*\*.*\*\*/) || line.match(/^#+\s/)) {
          const clean = line.replace(/^#+\s/, "").replace(/\*\*/g, "");
          return (
            <h3 key={i} className="font-bold text-foreground mt-4 first:mt-0 flex items-center gap-1.5">
              {clean}
            </h3>
          );
        }
        // List items
        if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const clean = line.replace(/^[-•*]\s/, "").replace(/^\d+\.\s/, "").replace(/\*\*/g, "");
          return (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              <span>{clean}</span>
            </div>
          );
        }
        // Warning / Disclaimer line
        if (line.startsWith("⚠️")) {
          return (
            <p key={i} className="text-xs text-muted-foreground italic mt-3 pt-3 border-t border-border">
              {line}
            </p>
          );
        }
        // Empty line
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Normal paragraph
        return (
          <p key={i} className="text-sm text-muted-foreground">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      })}
    </div>
  );
}
