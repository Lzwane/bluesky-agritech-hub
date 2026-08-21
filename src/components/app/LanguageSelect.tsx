import { Languages } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";
import { cn } from "@/lib/utils";

export function LanguageSelect({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as LanguageCode)}>
      <SelectTrigger
        aria-label="Select language"
        className={cn("h-9 w-[150px] bg-card text-sm", className)}
      >
        <Languages className="mr-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="font-medium">{lang.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">{lang.english}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
