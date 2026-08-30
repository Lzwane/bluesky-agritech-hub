import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  Camera,
  Bot,
  User,
  Sparkles,
  X,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CornerDownRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/advisor")({
  component: AdvisorPage,
});

export interface AttachedImageState {
  file: File;
  base64: string;
  mediaType: string;
  previewUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  imagePreviewUrl?: string;
  suggestedFollowUps?: string[];
  timestamp: string;
}

const DEFAULT_STARTER_PROMPTS = [
  "Calculate my LAN top-dress dosage for 50ha maize based on 180kg N target.",
  "What is the recommended tank-mix compatibility for Azoxystrobin and foliar Zinc?",
  "Review my soil analysis results and prescribe a corrective lime regimen.",
  "Interpret Fall Armyworm thresholding and schedule a rotation spray plan.",
];

function AdvisorPage() {
  const { user } = useAuth();

  const farmerName = useMemo(() => {
    const meta = (user as any)?.user_metadata;
    if (meta?.full_name?.trim()) return meta.full_name.trim();
    if (meta?.display_name?.trim()) return meta.display_name.trim();
    if (meta?.name?.trim()) return meta.name.trim();
    if (meta?.first_name?.trim()) {
      return `${meta.first_name} ${meta.last_name || ""}`.trim();
    }
    if (user?.email) {
      const parts = user.email.split("@");
      const prefix = parts[0] ?? "";
      if (prefix) {
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }
    return "Farmer";
  }, [user]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "advisor",
      text: `Good day, ${farmerName}. I am your Senior Field Agronomist and Pathology Advisor.\n\nI am calibrated for commercial and smallholder agriculture across South Africa. Feel free to ask any question about crop nutrition, soil analysis, spray schedules, or upload a photo of your crops for a field diagnosis.\n\nHow can I assist your farm today?`,
      suggestedFollowUps: [
        "What fertilizer should I apply at planting for maize?",
        "How do I scout and control Fall Armyworm?",
        "What is the best irrigation timing for citrus?",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImageState | null>(null);

  // Voice State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-ZA";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Speak your crop question.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast.error("Could not capture audio. Please check microphone permissions.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const toggleSpeak = (messageId: string, rawText: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Audio playback is not supported in this browser.");
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanSpokenText = rawText
      .replace(/[#*_`>]/g, "")
      .replace(/\[.*?\]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-ZA";

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Photo size must be under 20MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = typeof reader.result === "string" ? reader.result : "";
      const base64Clean =
        (base64String.includes(",") ? base64String.split(",")[1] : base64String) || "";

      setAttachedImage({
        file,
        base64: base64Clean,
        mediaType: file.type || "image/jpeg",
        previewUrl: URL.createObjectURL(file),
      });
      toast.success(`Photo attached: ${file.name}`);
    };

    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() && !attachedImage) {
      return;
    }

    const currentImage = attachedImage;
    const userMsgId = `user-${Date.now()}`;

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend.trim(),
      ...(currentImage?.previewUrl ? { imagePreviewUrl: currentImage.previewUrl } : {}),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setAttachedImage(null);
    setIsTyping(true);

    try {
      const historyContext = messages
        .slice(-6)
        .map((m) => `${m.sender === "user" ? farmerName : "ADVISOR"}: ${m.text}`)
        .join("\n\n");

      const promptToSend = `Farmer Name: ${farmerName}

Conversation History:
${historyContext}

Latest message or question from ${farmerName}:
${textToSend || "Please examine this attached crop leaf photo and advise."}`;

      const { data, error } = await supabase.functions.invoke("diagnose-crop", {
        body: {
          crop: "General Agronomy",
          imageBase64: currentImage?.base64 || "",
          imageMediaType: currentImage?.mediaType || "image/jpeg",
          customPrompt: promptToSend,
          farmerName,
        },
      });

      let advisorReply = "";
      let dynamicFollowUps: string[] = [];

      if (!error && data) {
        if (data.response) {
          advisorReply = data.response;
          dynamicFollowUps = Array.isArray(data.followUps) ? data.followUps : [];
        } else if (data.text) {
          advisorReply = data.text;
        } else if (typeof data === "string") {
          advisorReply = data;
        }
      }

      if (!advisorReply) {
        const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good day)/i.test(textToSend.trim());
        if (isGreeting) {
          advisorReply = `Hello ${farmerName}. Let me know what crop, soil issue, or spray challenge you want to address today.`;
          dynamicFollowUps = [
            "Calculate fertilizer dosage for my maize field",
            "Identify disease symptoms on my tomato crop",
            "What is the best spray protocol for Fall Armyworm?",
          ];
        } else {
          advisorReply = `For this issue, check your target crop phenology, ensure spray equipment is calibrated to at least 200 liters per hectare, and apply registered Act 36 remedies under favorable weather windows.`;
          dynamicFollowUps = [
            "What is the recommended application rate per hectare?",
            "What pre-harvest withholding period applies?",
            "Can this be tank-mixed with foliar micronutrients?",
          ];
        }
      }

      const cleanReply = advisorReply
        .replace(/[*_#`>]/g, "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const advisorMsgId = `advisor-${Date.now()}`;
      const advisorMessage: ChatMessage = {
        id: advisorMsgId,
        sender: "advisor",
        text: cleanReply,
        suggestedFollowUps: dynamicFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, advisorMessage]);
    } catch (err: any) {
      console.error("Advisor Error:", err);
      toast.error("Could not complete query. Please retry.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "advisor",
        text: `Consultation log cleared. What field challenge, soil fertility calculation, or spray program can we work on, ${farmerName}?`,
        suggestedFollowUps: [
          "What fertilizer should I apply at planting for maize?",
          "How do I scout and control Fall Armyworm?",
          "What is the best irrigation timing for citrus?",
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    toast.info("Session reset.");
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col font-sans pb-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-3xl border border-slate-800/80 bg-[#161d26]/90 backdrop-blur-xl shadow-xl shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                BlueSky Agronomist AI
              </h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Senior Field Specialist • Direct Voice & Visual Diagnosis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 pr-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";
          const isCurrentlySpeaking = speakingMessageId === msg.id;
          const isLatestAdvisorMsg = !isUser && index === messages.length - 1;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-2 max-w-4xl ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-md ${
                    isUser
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                      : "bg-slate-900 border border-slate-700 text-indigo-400"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={`rounded-3xl p-5 text-xs sm:text-sm leading-relaxed border shadow-xl ${
                    isUser
                      ? "bg-gradient-to-br from-emerald-950/70 to-teal-950/70 border-emerald-500/30 text-emerald-100 rounded-tr-sm"
                      : "bg-[#161d26]/95 border-slate-800 text-slate-200 rounded-tl-sm space-y-3"
                  }`}
                >
                  {msg.imagePreviewUrl && (
                    <div className="mb-3 rounded-2xl overflow-hidden border border-slate-700/80 max-w-xs">
                      <img
                        src={msg.imagePreviewUrl}
                        alt="Crop specimen"
                        className="w-full h-44 object-cover"
                      />
                    </div>
                  )}

                  <div className="whitespace-pre-line leading-relaxed text-slate-200">
                    {msg.text}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 select-none">
                    {!isUser ? (
                      <button
                        type="button"
                        onClick={() => toggleSpeak(msg.id, msg.text)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                          isCurrentlySpeaking
                            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 animate-pulse"
                            : "bg-slate-900 border border-slate-700/70 text-slate-400 hover:text-white"
                        }`}
                      >
                        {isCurrentlySpeaking ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5" /> Stop Voice
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" /> Read Aloud
                          </>
                        )}
                      </button>
                    ) : (
                      <span />
                    )}
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Follow-up Question Chips */}
              {!isUser && isLatestAdvisorMsg && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="ml-11 flex flex-wrap gap-2 pt-1 animate-in fade-in duration-200">
                  {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleSendMessage(suggestion)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-[#121822] text-[11px] text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-slate-800 transition active:scale-95 shadow-sm"
                    >
                      <CornerDownRight className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 max-w-xl mr-auto animate-in fade-in duration-200">
            <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-3xl rounded-tl-sm p-4 bg-[#161d26] border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Agronomist AI preparing response...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Starter Chips on Initial Load */}
      {messages.length <= 1 && (
        <div className="py-2 px-1 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
          {DEFAULT_STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-[#161d26]/80 text-[11px] text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 whitespace-nowrap transition active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-2 shrink-0 space-y-2">
        {attachedImage && (
          <div className="flex items-center justify-between p-2.5 px-4 rounded-2xl bg-[#161d26] border border-emerald-500/40 text-xs shadow-lg animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={attachedImage.previewUrl}
                alt="Leaf thumbnail"
                className="h-8 w-8 rounded-lg object-cover border border-slate-700"
              />
              <span className="text-white font-medium truncate">{attachedImage.file.name}</span>
              <span className="text-[10px] text-slate-400">
                ({(attachedImage.file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="relative flex items-center gap-2 rounded-3xl border border-slate-700/80 bg-[#161d26]/95 p-2 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/80 transition">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Crop Photo"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition active:scale-95 shrink-0"
          >
            <Camera className="h-4 w-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Stop Voice Recording" : "Speak Question (Voice to Text)"}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition active:scale-95 shrink-0 ${
              isListening
                ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50"
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <textarea
            value={inputMessage}
            rows={1}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask an agronomic question, dosage calculation, or attach a leaf photo..."
            className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none resize-none max-h-32"
          />

          <button
            type="button"
            disabled={isTyping || (!inputMessage.trim() && !attachedImage)}
            onClick={() => handleSendMessage()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-40 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}