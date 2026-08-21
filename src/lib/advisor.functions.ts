import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
  language: z.string().max(10).default("en"),
});

export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, message: "The AI advisor is not configured yet." };
    }

    const systemPrompt = [
      "You are the AI Farm Advisor for BlueSky AgriTech's AI Crop Detective, built for South African farmers.",
      "Give practical, localised guidance on planting schedules, irrigation, fertilisation, pest and disease management, and harvest timing.",
      "Assume South African seasons (summer rainfall Highveld, winter rainfall Western Cape), rand pricing and locally available inputs.",
      "Keep answers under 200 words, use short paragraphs or bullet points, and always give a concrete next step.",
      "If a question needs a lab test or extension officer, say so plainly.",
      `Reply in the user's selected language (ISO code: ${data.language}). If unsure, reply in English.`,
    ].join(" ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...data.messages],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("AI advisor error", response.status, detail);
      if (response.status === 429) {
        return {
          ok: false as const,
          message: "The advisor is busy right now. Please try again in a moment.",
        };
      }
      if (response.status === 402 || response.status === 403) {
        return {
          ok: false as const,
          message: "AI usage is currently unavailable for this workspace.",
        };
      }
      return { ok: false as const, message: "The advisor could not answer that. Please retry." };
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = payload.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { ok: false as const, message: "The advisor returned an empty answer." };
    }
    return { ok: true as const, reply };
  });
