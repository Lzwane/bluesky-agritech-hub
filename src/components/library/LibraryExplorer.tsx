import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CROP_FILTERS, LIBRARY, type EntryType, type LibraryEntry } from "@/data/library";
import { cn } from "@/lib/utils";

const TYPES: (EntryType | "All")[] = ["All", "Disease", "Pest", "Deficiency"];

const severityTone: Record<LibraryEntry["severity"], string> = {
  Low: "bg-primary-soft text-primary",
  Moderate: "bg-warning/20 text-warning-foreground",
  High: "bg-warning/30 text-warning-foreground",
  Severe: "bg-destructive/15 text-destructive",
};

export function LibraryExplorer() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<EntryType | "All">("All");
  const [crop, setCrop] = useState<string | null>(null);
  const [selected, setSelected] = useState<LibraryEntry | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LIBRARY.filter((entry) => {
      const matchesQuery =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        entry.scientific.toLowerCase().includes(q) ||
        entry.summary.toLowerCase().includes(q) ||
        entry.crops.some((c) => c.toLowerCase().includes(q));
      const matchesType = type === "All" || entry.type === type;
      const matchesCrop = !crop || entry.crops.includes(crop);
      return matchesQuery && matchesType && matchesCrop;
    });
  }, [query, type, crop]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crops, pests, diseases or symptoms"
            aria-label="Search the plant and disease library"
            className="h-11 pl-9"
            maxLength={80}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPES.map((option) => (
            <button
              key={option}
              onClick={() => setType(option)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                type === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCrop(null)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              crop === null ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            All crops
          </button>
          {CROP_FILTERS.map((option) => (
            <button
              key={option}
              onClick={() => setCrop(option === crop ? null : option)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                crop === option
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No entries match that search yet. Try a different crop or symptom.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((entry) => (
            <Card
              key={entry.id}
              className="group overflow-hidden border-border/70 p-0 shadow-card transition-shadow hover:shadow-lift"
            >
              <img
                src={entry.image}
                alt={`${entry.name} on ${entry.crops[0]}`}
                loading="lazy"
                width={900}
                height={700}
                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{entry.type}</Badge>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                      severityTone[entry.severity],
                    )}
                  >
                    {entry.severity} risk
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold">{entry.name}</h3>
                  <p className="text-xs italic text-muted-foreground">{entry.scientific}</p>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">{entry.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.crops.map((c) => (
                    <span key={c} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
                <Button variant="secondary" className="w-full" onClick={() => setSelected(entry)}>
                  View symptoms & remedies
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription className="italic">{selected.scientific}</DialogDescription>
              </DialogHeader>
              <img
                src={selected.image}
                alt={selected.name}
                loading="lazy"
                width={900}
                height={700}
                className="h-52 w-full rounded-xl object-cover"
              />
              <p className="text-sm text-muted-foreground">{selected.summary}</p>

              <Section title="Symptoms to look for" items={selected.symptoms} />
              <Section title="Organic remedies" items={selected.organic} tone="primary" />
              <Section title="Chemical remedies" items={selected.chemical} tone="sky" />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  items,
  tone = "muted",
}: {
  title: string;
  items: string[];
  tone?: "muted" | "primary" | "sky";
}) {
  const dot =
    tone === "primary" ? "bg-primary" : tone === "sky" ? "bg-sky" : "bg-muted-foreground/60";
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
