import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ImagePlus, RotateCcw, ScanLine, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useProfile } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { runMockDiagnosis, type MockDiagnosis } from "@/lib/diagnosis";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/")({
  component: DiagnosisPage,
});

type Stage = "idle" | "scanning" | "done";

function DiagnosisPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MockDiagnosis | null>(null);
  const [dragging, setDragging] = useState(false);

  const history = useQuery({
    queryKey: ["diagnoses", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (diagnosis: MockDiagnosis) => {
      const { error } = await supabase.from("diagnoses").insert({
        user_id: user!.id,
        crop: diagnosis.crop,
        issue: diagnosis.issue,
        severity: diagnosis.severity,
        confidence: diagnosis.confidence,
        recommendations: diagnosis.actions,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnoses", user?.id] });
    },
    onError: () => toast.error("Could not save this diagnosis to your history."),
  });

  useEffect(() => {
    if (stage !== "scanning") return;
    setProgress(0);
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 4;
      });
    }, 60);
    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage === "scanning" && progress >= 100) {
      const diagnosis = runMockDiagnosis(fileName);
      setResult(diagnosis);
      setStage("done");
      save.mutate(diagnosis);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, stage]);

  function acceptFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file of the affected plant.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large. Please use a photo under 10MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setResult(null);
    setStage("idle");
  }

  function reset() {
    setPreview(null);
    setFileName("");
    setResult(null);
    setStage("idle");
    setProgress(0);
  }

  const greetingName = profile?.display_name ?? "Farmer";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold tracking-widest text-primary uppercase">
          {t("app.greeting")}, {greetingName}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold sm:text-3xl">{t("diagnosis.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("diagnosis.subtitle")}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-border/70 shadow-card">
          <CardContent className="space-y-4 pt-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                acceptFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
                dragging ? "border-primary bg-primary-soft/60" : "border-border bg-muted/40",
              )}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Uploaded crop sample"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {stage === "scanning" ? (
                    <div className="absolute inset-0 bg-foreground/45">
                      <div
                        className="absolute inset-x-0 h-1 bg-primary shadow-lift transition-all duration-100"
                        style={{ top: `${progress}%` }}
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-leaf text-primary-foreground">
                    <ImagePlus className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-4 text-sm font-semibold">Drag & drop a crop photo here</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Clear, close-up photos of the affected leaves work best (JPG or PNG, max 10MB).
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => fileInput.current?.click()}>
                <Upload className="mr-2 h-4 w-4" aria-hidden />
                {t("diagnosis.upload")}
              </Button>
              <Button variant="outline" onClick={() => cameraInput.current?.click()}>
                <Camera className="mr-2 h-4 w-4" aria-hidden />
                Use camera
              </Button>
              <Button
                onClick={() => setStage("scanning")}
                disabled={!preview || stage === "scanning"}
                className="sm:ml-auto"
              >
                <ScanLine className="mr-2 h-4 w-4" aria-hidden />
                {stage === "scanning" ? "Analysing…" : t("diagnosis.analyse")}
              </Button>
              {preview ? (
                <Button variant="ghost" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                  Reset
                </Button>
              ) : null}
            </div>

            {stage === "scanning" ? (
              <div className="space-y-2">
                <Progress value={progress} aria-label="Analysis progress" />
                <p className="text-xs font-medium text-muted-foreground">
                  Comparing against 12 400 reference samples… {progress}%
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {stage === "scanning" ? (
            <Card className="border-border/70">
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : null}

          {stage === "done" && result ? <ResultCard result={result} /> : null}

          {stage === "idle" && !result ? (
            <Card className="border-border/70 bg-primary-soft/50">
              <CardContent className="space-y-3 pt-6 text-sm">
                <p className="font-bold">Get a sharper diagnosis</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Photograph in daylight, avoiding harsh shadows.</li>
                  <li>Fill the frame with the affected leaf or stem.</li>
                  <li>Include both healthy and damaged tissue in the shot.</li>
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent scans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.isLoading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : history.data && history.data.length > 0 ? (
                history.data.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{row.issue}</p>
                      <p className="text-xs text-muted-foreground">{row.crop}</p>
                    </div>
                    <Badge variant="secondary">{row.severity}%</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your scan history will appear here after your first diagnosis.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: MockDiagnosis }) {
  const tone =
    result.severity >= 70 ? "bg-destructive" : result.severity >= 40 ? "bg-warning" : "bg-primary";

  return (
    <Card className="border-primary/30 shadow-lift">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground">{result.type}</Badge>
          <span className="text-xs font-semibold text-muted-foreground">
            {result.confidence}% confidence
          </span>
        </div>
        <CardTitle className="mt-2 text-lg">{result.issue}</CardTitle>
        <p className="text-sm text-muted-foreground">Detected on {result.crop}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
            <span>Severity</span>
            <span>{result.severityLabel}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", tone)}
              style={{ width: `${result.severity}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold">Treatment action plan</p>
          <ol className="space-y-2.5">
            {result.actions.map((action, index) => (
              <li key={action} className="flex gap-3 text-sm text-muted-foreground">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                  {index + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
          {result.note}
        </div>

        <Button asChild variant="secondary" className="w-full">
          <Link to="/app/advisor">
            <Sparkles className="mr-2 h-4 w-4" aria-hidden />
            Ask the AI Farm Advisor about this
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
