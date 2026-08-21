import { createFileRoute, Link } from "@tanstack/react-router";

import { Logo } from "@/components/Logo";
import { LibraryExplorer } from "@/components/library/LibraryExplorer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Crop Disease & Pest Library — BlueSky AgriTech" },
      {
        name: "description",
        content:
          "Browse a searchable South African encyclopedia of crop diseases, pests and nutrient deficiencies with symptoms plus organic and chemical remedies.",
      },
      { property: "og:title", content: "Crop Disease & Pest Library" },
      {
        property: "og:description",
        content:
          "Symptoms, organic remedies and chemical treatments for the crop problems South African farmers face most.",
      },
    ],
  }),
  component: PublicLibrary,
});

function PublicLibrary() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 lg:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Launch app</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Explore the library
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Crop disease, pest & deficiency library
          </h1>
          <p className="mt-3 text-sm/6 text-muted-foreground">
            A free reference for South African growers. Search by crop or symptom, then compare
            organic and chemical treatment options side by side.
          </p>
        </div>

        <div className="mt-8">
          <LibraryExplorer />
        </div>
      </div>
    </div>
  );
}
