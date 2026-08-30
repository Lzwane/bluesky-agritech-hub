import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Leaf,
  FlaskConical,
  ShieldAlert,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/diagnosis")({
  component: DiagnosisPage,
});

interface DiagnosticReport {
  crop: string;
  disease_name: string;
  scientific_name: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High" | "Critical";
  pathogen_type:
    | "Fungal"
    | "Bacterial"
    | "Viral"
    | "Pest Infestation"
    | "Nutrient Deficiency"
    | "Healthy";
  symptoms_observed: string[];
  organic_treatment: string;
  chemical_treatment: string;
  preventative_measures: string;
  safety_note: string;
}

const COMMON_CROPS = [
  "Maize / Corn",
  "Tomato",
  "Citrus (Oranges/Lemons)",
  "Potato",
  "Cabbage / Brassicas",
  "Avocado",
  "Sugarcane",
  "Macadamia",
  "Other / Unknown",
];

export function DiagnosisPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedCrop, setSelectedCrop] = useState<string>("Maize / Corn");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMediaType, setImageMediaType] = useState<string>("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file size must be under 15MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const resolvedType = validTypes.includes(file.type) ? file.type : "image/jpeg";
    setImageMediaType(resolvedType);

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);
    setReport(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = typeof reader.result === "string" ? reader.result : "";
      const base64Clean = base64String.includes(",") ? base64String.split(",")[1] : base64String;
      if (base64Clean) {
        setImageBase64(base64Clean);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunDiagnosis = async () => {
    if (!imageBase64) {
      toast.error("Please upload or capture a crop image first.");
      return;
    }

    setAnalyzing(true);
    setReport(null);

    try {
      console.log("--> Calling Supabase Edge Function: diagnose-crop");

      const response = await supabase.functions.invoke("diagnose-crop", {
        body: {
          imageBase64,
          imageMediaType,
          crop: selectedCrop,
        },
      });

      console.log("--> Edge function raw response:", response);

      // If Supabase client caught an HTTP error, extract context
      if (response.error) {
        let extractedMsg = response.error.message;
        try {
          if ((response.error as any).context) {
            const bodyText = await (response.error as any).context.json();
            console.error("--> Extracted server error body:", bodyText);
            extractedMsg = bodyText.error || extractedMsg;
          }
        } catch (_) {}
        throw new Error(extractedMsg);
      }

      const data = response.data;

      if (data?.error) {
        console.error("--> Anthropic Rejection Details:", data.details || data.error);
        throw new Error(data.error);
      }

      if (data?.disease_name) {
        setReport(data);
        toast.success("Crop diagnosis generated successfully!");
      } else {
        throw new Error("Invalid report response format.");
      }
    } catch (err: any) {
      console.error("DIAGNOSIS_FAILED:", err);
      toast.error(err.message || "Failed to generate diagnosis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      case "High":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "Moderate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Neural Vision Pathologist
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Visual Crop Diagnostic Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Autonomous disease, pathogen, and nutrient deficiency recognition calibrated for South African agriculture.
          </p>
        </div>

        {report && (
          <button
            onClick={() => {
              setSelectedImage(null);
              setImageBase64(null);
              setReport(null);
            }}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> New Inspection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Ingestion */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-700/70 bg-[#161d26]/90 p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                1. Select Target Crop
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
              >
                {COMMON_CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                2. Capture or Upload Field Photo
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/40 relative overflow-hidden min-h-[260px] group ${
                  selectedImage ? "border-emerald-500/50" : "border-slate-700 hover:border-emerald-500/60"
                }`}
              >
                {selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Crop specimen"
                      className="max-h-60 w-full object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition backdrop-blur-xs">
                      <span className="text-xs font-bold text-white bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700">
                        Click to Change Photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Tap to browse or take leaf photo</p>
                      <p className="text-[11px] text-slate-500 mt-1">High-resolution close-ups of lesions perform best</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <button
              onClick={handleRunDiagnosis}
              disabled={analyzing || !selectedImage}
              className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Analyzing Specimen with Claude Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Run Deep Crop Diagnosis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Diagnosis Report */}
        <div className="lg:col-span-7">
          {report ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-3xl border border-slate-700/80 bg-[#161d26]/95 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Diagnostic Verdict
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                        report.severity
                      )}`}
                    >
                      {report.severity} Severity
                    </span>
                    <span className="text-[11px] font-semibold bg-slate-900 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
                      {report.confidence}% Confidence
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {report.disease_name}
                  </h2>
                  <p className="text-xs italic text-slate-400 mt-0.5 font-mono">
                    {report.scientific_name} • {report.pathogen_type}
                  </p>
                </div>

                {/* Symptoms Breakdown */}
                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Observed Visual Signatures
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {report.symptoms_observed.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs text-slate-300"
                      >
                        • {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Treatments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Leaf className="h-4 w-4" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">Organic Protocol</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.organic_treatment}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <FlaskConical className="h-4 w-4" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">Chemical Regimen</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.chemical_treatment}
                  </p>
                </div>
              </div>

              {/* Prevention */}
              <div className="rounded-2xl border border-slate-700/80 bg-[#161d26]/80 p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">Preventative Measures</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {report.preventative_measures}
                </p>
              </div>

              {/* Safety */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Agricultural Safety Notice: </strong>
                  {report.safety_note}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-800 bg-[#121822]/40 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                <Layers className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-sm text-slate-300">Diagnostic Monitor Idle</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Upload or photograph a leaf specimen on the left and select the target crop to trigger autonomous pathology inspection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}