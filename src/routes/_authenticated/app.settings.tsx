import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sun, Moon, User, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const rawMeta = (user as any)?.user_metadata;
  const initialName: string = rawMeta?.display_name || user?.email?.split("@")[0] || "";
  const initialLang: string = rawMeta?.preferred_language || "en";

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [displayName, setDisplayName] = useState(initialName);
  const [language, setLanguage] = useState(initialLang);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "dark");
  }, []);

  const toggleTheme = (mode: "dark" | "light") => {
    setTheme(mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(`Theme switched to ${mode} mode`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName, preferred_language: language },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile settings updated successfully!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile & Preferences</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your interface appearance, personal credentials, and language preferences.
        </p>
      </div>

      {/* Theme Box */}
      <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-4 w-4 text-emerald-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
          Interface Theme
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => toggleTheme("dark")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition ${
              theme === "dark"
                ? "border-emerald-500 bg-slate-900/90 text-white shadow-lg shadow-emerald-950/40"
                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Moon className="h-6 w-6 text-emerald-400 mb-2" />
            <span className="text-xs font-bold">Blackboard Dark</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Recommended</span>
          </button>

          <button
            type="button"
            onClick={() => toggleTheme("light")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition ${
              theme === "light"
                ? "border-emerald-500 bg-slate-800/90 text-white shadow-lg"
                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Sun className="h-6 w-6 text-amber-400 mb-2" />
            <span className="text-xs font-bold">Daylight Mode</span>
            <span className="text-[10px] text-slate-400 mt-0.5">High Contrast</span>
          </button>
        </div>
      </div>

      {/* Account Info Form */}
      <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-400" /> Farmer Account Details
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Email Address</label>
            <input
              type="text"
              disabled
              value={user?.email || ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Primary Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="zu">isiZulu</option>
              <option value="xh">isiXhosa</option>
              <option value="af">Afrikaans</option>
              <option value="nso">Sepedi</option>
              <option value="st">Sesotho</option>
              <option value="ts">Xitsonga</option>
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-5 text-xs font-bold text-white transition active:scale-95"
          >
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}