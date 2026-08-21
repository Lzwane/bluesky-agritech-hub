import { createFileRoute } from "@tanstack/react-router";

import { LibraryExplorer } from "@/components/library/LibraryExplorer";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/app/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{t("nav.library")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reference cards for crops, pests, diseases and nutrient deficiencies.
        </p>
      </header>
      <LibraryExplorer />
    </div>
  );
}
