import { Link } from "@tanstack/react-router";

import logo from "@/assets/bluesky-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  to = "/",
  showWordmark = true,
}: {
  className?: string;
  to?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link to={to} className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <img
        src={logo.url}
        alt="BlueSky AgriTech"
        width={40}
        height={40}
        className="h-9 w-9 shrink-0 rounded-xl object-cover"
        style={{ objectPosition: "50% 32%" }}
      />
      {showWordmark ? (
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-display text-sm font-extrabold tracking-tight">
            BlueSky AgriTech
          </span>
          <span className="block truncate text-[11px] font-medium text-muted-foreground">
            AI Crop Detective
          </span>
        </span>
      ) : null}
    </Link>
  );
}
