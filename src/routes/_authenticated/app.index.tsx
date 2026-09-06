import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ScanLine,
  BookOpen,
  Store,
  MessageSquare,
  Bot,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();
  const rawMeta = (user as any)?.user_metadata;
  const userName: string =
    rawMeta?.display_name || user?.email?.split("@")[0] || "Farmer";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-300">
            <Sparkles className="h-3 w-3" /> Field Command Console
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {userName}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your agronomic diagnostic suite is online. Monitor crop health, run rapid vision diagnostics, and access targeted disease regimens.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/app/diagnosis"
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
            >
              <ScanLine className="h-4 w-4" /> Run Quick Diagnosis
            </Link>
            <Link
              to="/app/advisor"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <Bot className="h-4 w-4 text-indigo-400" /> Agronomist AI
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111720]/80 p-4">
          <span className="text-[11px] text-slate-400 font-medium">Scans Completed</span>
          <p className="mt-1 text-2xl font-bold text-white">14</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> 100% resolution
          </span>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#111720]/80 p-4">
          <span className="text-[11px] text-slate-400 font-medium">Pathogen Threat</span>
          <p className="mt-1 text-2xl font-bold text-amber-400">Moderate</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Maize rust reported</span>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#111720]/80 p-4">
          <span className="text-[11px] text-slate-400 font-medium">Active Community</span>
          <p className="mt-1 text-2xl font-bold text-white">1,240+</p>
          <span className="text-[10px] text-cyan-400 mt-1 block">SA Farmers online</span>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#111720]/80 p-4">
          <span className="text-[11px] text-slate-400 font-medium">System Health</span>
          <p className="mt-1 text-2xl font-bold text-emerald-400">99.8%</p>
          <span className="text-[10px] text-slate-400 mt-1 block">AI Vision Model v2</span>
        </div>
      </div>

      {/* Applications Hub */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" /> System Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/app/diagnosis"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-5 hover:border-emerald-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
                <ScanLine className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition">AI Diagnosis</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Visual symptom detection with customized organic & chemical cures.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Launch Scanner</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/app/library"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-5 hover:border-cyan-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition">Pathology Library</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Indexed library of crop pests, deficiencies, and treatments.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Browse Diseases</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/app/advisor"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-5 hover:border-indigo-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">Agronomist Assistant</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Consult on soil chemistry, spray schedules, and seasonal preparations.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-400">
              <span>Open Chat</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/app/marketplace"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-5 hover:border-amber-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition">Marketplace</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Approved fungicides, fertilizers, bio-stimulants & spray kits.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>View Products</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/app/forum"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-5 hover:border-rose-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-rose-400 transition">Farmer Forum</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Connect with local growers and report regional outbreaks.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-rose-400">
              <span>Join Discussion</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}