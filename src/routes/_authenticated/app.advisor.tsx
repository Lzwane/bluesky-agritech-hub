import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { askAdvisor } from "@/lib/advisor.functions";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/advisor")({
  component: AdvisorPage,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PROMPTS = [
  "When should I plant maize in Mpumalanga this season?",
  "How much water does my tomato tunnel need per week?",
  "My soil test shows low phosphorus — what do I apply?",
  "How do I know my white maize is ready to harvest?",
];

function AdvisorPage() {
  const { t, language } = useLanguage();
  const ask = useServerFn(askAdvisor);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Sawubona! I'm your AI Farm Advisor. Tell me your crop, province and what you're planning, and I'll give you a practical next step.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || pending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const result = await ask({
        data: {
          messages: next.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          language,
        },
      });
      if (result.ok) {
        setMessages([...next, { role: "assistant", content: result.reply }]);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Could not reach the advisor. Check your connection and try again.");
    } finally {
      setPending(false);
      requestAnimationFrame(() => scroller.current?.scrollTo({ top: 999999 }));
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{t("nav.advisor")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalised guidance on planting schedules, irrigation, nutrition and harvest timing.
        </p>
      </header>

      <Card className="border-border/70 shadow-card">
        <CardContent className="pt-6">
          <div ref={scroller} className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "")}
              >
                {message.role === "assistant" ? (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-leaf text-primary-foreground">
                    <Bot className="h-4 w-4" aria-hidden />
                  </div>
                ) : null}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {pending ? (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-leaf text-primary-foreground">
                  <Bot className="h-4 w-4" aria-hidden />
                </div>
                <div className="w-2/3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <Input
              value={input}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about planting, irrigation, spraying or harvest…"
              aria-label="Ask the AI Farm Advisor"
            />
            <Button type="submit" disabled={pending || !input.trim()} className="shrink-0">
              <Send className="mr-2 h-4 w-4" aria-hidden />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => void send(prompt)}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
