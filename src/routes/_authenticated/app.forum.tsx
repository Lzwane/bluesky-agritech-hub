import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Heart,
  MessageSquare,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Send,
  X,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/forum")({
  component: ForumPage,
});

const CATEGORIES = [
  "All",
  "Maize",
  "Citrus",
  "Vegetables",
  "Soybeans",
  "Avocado",
  "Pest Control",
  "Soil & Nutrition",
  "Irrigation",
  "General",
];

interface ForumPostItem {
  id: string;
  author_id?: string;
  author_name: string;
  location: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  initialLikes?: number;
  initialReplies?: { author_name: string; body: string; created_at: string }[];
}

const SEED_FORUM_POSTS: ForumPostItem[] = [
  {
    id: "seed-1",
    author_name: "Sipho Khumalo",
    location: "Brits, North West",
    category: "Maize",
    title: "Heavy Fall Armyworm pressure after recent heat spell",
    body: "Noticed significant whorl feeding damage across 45 hectares of late-planted maize. Scouting revealed second-instar larvae down in the central whorl funnels. Calibrated drop nozzles to 220 L/ha using registered Chlorantraniliprole. What follow-up scouting intervals are fellow North West growers recommending?",
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-2",
    author_name: "Annelize Botha",
    location: "Nelspruit, Mpumalanga",
    category: "Citrus",
    title: "Citrus Black Spot preventative spray timing before forecast rains",
    body: "Examining the upcoming 7-day rainfall outlook for the Lowveld basin. Petal drop concluded on our Valencia blocks. Applying Mancozeb mixed with Strobilurins on export parcels. Remember to check spray water pH to maintain an acid buffer between 5.5 and 6.0 for full fungicide stability.",
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-3",
    author_name: "Mandla Ndlovu",
    location: "Polokwane, Limpopo",
    category: "Vegetables",
    title: "Drip fertigation ratios for indeterminate tomatoes during fruit swelling",
    body: "Transitioning from high nitrogen vegetative mixes to potassium-heavy regimes now that cluster three has set. Targeting a 1:2 N to K balance with soluble calcium nitrate fed via separate injector lines to avoid blossom end rot. What EC targets are greenhouse growers running in high temperatures?",
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-4",
    author_name: "Willem Coetzee",
    location: "Bethlehem, Free State",
    category: "Soybeans",
    title: "Early nodulation checks and Bradyrhizobium inoculant efficacy",
    body: "Dug up root specimens across three pivot circles to inspect active nodule formation. Taproot nodules are showing a distinct active pink interior indicating atmospheric nitrogen fixation. Sandy soils experienced minor delay due to dry seedbeds, but recent precipitation assisted.",
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-5",
    author_name: "Dineo Moloi",
    location: "Tzaneen, Limpopo",
    category: "Avocado",
    title: "Phytophthora root rot trunk injection timing for Hass orchards",
    body: "Preparing our seasonal root flush trunk injection program. Using 20% buffered potassium phosphite. A critical note for avocado growers: ensure the spring vegetative flush leaves have fully hardened before injecting, so active compounds translocate downward to roots.",
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-6",
    author_name: "Carel Venter",
    location: "Ceres, Western Cape",
    category: "Pest Control",
    title: "Codling moth mating disruption dispenser densities in apple blocks",
    body: "Hanging pheromone disruption ties across our pome orchards this week. Installing 400 dispensers per hectare placed in the top third of tree canopies. Don't overlook border reinforcement along external windbreaks where wild hosts provide refuge.",
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-7",
    author_name: "Kobus van der Merwe",
    location: "Delmas, Mpumalanga",
    category: "Vegetables",
    title: "Managing early blight pressure on irrigated potato tubers",
    body: "Noticing concentric target-board lesions on lower canopy foliage following three days of overcast morning fog. Alternating Chlorothalonil with Difenoconazole to prevent resistance development. Ensure spray rigs deliver minimum 3 bar pressure for canopy penetration.",
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-8",
    author_name: "Precious Sithole",
    location: "Malelane, Mpumalanga",
    category: "Pest Control",
    title: "Yellow sugarcane aphid outbreaks along ratoon crop margins",
    body: "Scouting discovered yellow sugarcane aphid colonies developing underneath lower leaves on ratoon four. Leaf yellowing and sooty mold are starting along furrow borders. Has anyone tested biocontrol ladybird conservation before applying chemical drenches?",
    created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-9",
    author_name: "Pieter Du Plessis",
    location: "Bothaville, Free State",
    category: "Soil & Nutrition",
    title: "LAN top-dress timing relative to upcoming rain front",
    body: "Maize stand is currently at V6 growth stage. Preparing to top-dress Limestone Ammonium Nitrate at 160 kg/ha. With a cold front and scattered showers forecasted for Thursday, is it safer to apply 24 hours ahead or immediately prior to reduce volatile losses?",
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
  {
    id: "seed-10",
    author_name: "Thabo Mokoena",
    location: "Marble Hall, Limpopo",
    category: "Vegetables",
    title: "Diamondback moth resistance monitoring on cabbage plantings",
    body: "Encountered surviving larvae after standard pyrethroid treatment on hybrid cabbage heads. Switching over to Bacillus thuringiensis and Spinosad to break resistance patterns. Be certain to add a high-quality non-ionic wetting agent due to waxy leaf surfaces.",
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    initialLikes: 0,
    initialReplies: [],
  },
];

export function ForumPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postCategory, setPostCategory] = useState("Maize");
  const [location, setLocation] = useState("Pretoria, Gauteng");

  // Interaction states
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [localReplies, setLocalReplies] = useState<
    Record<string, { author_name: string; body: string; created_at: string }[]>
  >({});

  // Local state array for newly created posts (guarantees they display at the top)
  const [userCreatedPosts, setUserCreatedPosts] = useState<ForumPostItem[]>(() => {
    try {
      const saved = localStorage.getItem("bluesky-user-forum-posts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("bluesky-user-forum-posts", JSON.stringify(userCreatedPosts));
  }, [userCreatedPosts]);

  const rawMeta = (user as any)?.user_metadata;
  const displayName = useMemo(() => {
    return (
      rawMeta?.full_name ||
      rawMeta?.display_name ||
      rawMeta?.name ||
      user?.email?.split("@")[0] ||
      "Farmer"
    );
  }, [rawMeta, user]);

  // Query Database Posts
  const postsQuery = useQuery({
    queryKey: ["forum-posts"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("forum_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data as ForumPostItem[];
      } catch {
        return [];
      }
    },
  });

  // Query Likes / Votes
  const likesQuery = useQuery({
    queryKey: ["forum-votes"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("forum_votes")
          .select("post_id, user_id");
        if (error || !data) return [];
        return data as { post_id: string; user_id: string }[];
      } catch {
        return [];
      }
    },
  });

  // Query Comments
  const commentsQuery = useQuery({
    queryKey: ["forum-comments"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("forum_comments")
          .select("*")
          .order("created_at", { ascending: true });
        if (error || !data) return [];
        return data as any[];
      } catch {
        return [];
      }
    },
  });

  // Merge: User-Created Posts on top, then Database Posts, then Seed Posts
  const allPosts = useMemo(() => {
    const dbPosts = postsQuery.data ?? [];
    
    // Deduplicate between user-created and database posts
    const userPostIds = new Set(userCreatedPosts.map((p) => String(p.id)));
    const dbFiltered = dbPosts.filter((p) => !userPostIds.has(String(p.id)));

    // Deduplicate seeds
    const existingIds = new Set([
      ...userCreatedPosts.map((p) => String(p.id)),
      ...dbPosts.map((p) => String(p.id)),
    ]);
    const seedsFiltered = SEED_FORUM_POSTS.filter((s) => !existingIds.has(s.id));

    // Combine and sort descending by timestamp
    return [...userCreatedPosts, ...dbFiltered, ...seedsFiltered].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime() || 0;
      const timeB = new Date(b.created_at).getTime() || 0;
      return timeB - timeA;
    });
  }, [userCreatedPosts, postsQuery.data]);

  // Filter based on active category & search
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title?.toLowerCase().includes(q) ||
        post.body?.toLowerCase().includes(q) ||
        post.author_name?.toLowerCase().includes(q) ||
        post.location?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  // Create Post Mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || title.trim().length < 5) {
        throw new Error("Please enter a descriptive title (at least 5 characters).");
      }
      if (!body.trim() || body.trim().length < 10) {
        throw new Error("Please provide more details in your post.");
      }

      const postTimestamp = new Date().toISOString();
      const newPostPayload: ForumPostItem = {
        id: `post-${Date.now()}`,
        ...(user?.id ? { author_id: user.id } : {}),
        author_name: displayName,
        location: location.trim() || "South Africa",
        title: title.trim().slice(0, 150),
        body: body.trim().slice(0, 3000),
        category: postCategory,
        created_at: postTimestamp,
        initialLikes: 0,
        initialReplies: [],
      };

      // 1. Immediately pin to the top of the userCreatedPosts buffer
      setUserCreatedPosts((prev) => [newPostPayload, ...prev]);

      // 2. Persist in Supabase in the background
      try {
        const { data } = await (supabase as any)
          .from("forum_posts")
          .insert({
            author_id: user?.id || null,
            author_name: displayName,
            location: location.trim() || "South Africa",
            title: title.trim().slice(0, 150),
            body: body.trim().slice(0, 3000),
            category: postCategory,
            created_at: postTimestamp,
          })
          .select()
          .single();

        if (data?.id) {
          // Update the ID to the real database ID
          setUserCreatedPosts((prev) =>
            prev.map((p) => (p.id === newPostPayload.id ? { ...p, id: data.id } : p))
          );
        }
      } catch (err) {
        console.warn("Could not save to Supabase, retained in local feed:", err);
      }

      return newPostPayload;
    },
    onSuccess: () => {
      setTitle("");
      setBody("");
      setComposerOpen(false);
      toast.success("Your post has been published to the top of the feed!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish post.");
    },
  });

  // Toggle Like Mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const isCurrentlyLiked =
        userLiked[postId] ??
        likesQuery.data?.some((v) => v.post_id === postId && v.user_id === user?.id);

      if (isCurrentlyLiked) {
        setUserLiked((prev) => ({ ...prev, [postId]: false }));
        setLocalLikes((prev) => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 1) - 1) }));

        if (user?.id) {
          await (supabase as any)
            .from("forum_votes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);
        }
      } else {
        setUserLiked((prev) => ({ ...prev, [postId]: true }));
        setLocalLikes((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));

        if (user?.id) {
          await (supabase as any)
            .from("forum_votes")
            .insert({ post_id: postId, user_id: user.id });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-votes"] });
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (postId: string) => {
      const text = (replyText[postId] || "").trim();
      if (!text) throw new Error("Please write a reply before submitting.");

      const newCommentPayload = {
        post_id: postId,
        author_id: user?.id || null,
        author_name: displayName,
        body: text,
        created_at: new Date().toISOString(),
      };

      setLocalReplies((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newCommentPayload],
      }));
      setReplyText((prev) => ({ ...prev, [postId]: "" }));

      await (supabase as any).from("forum_comments").insert(newCommentPayload);
    },
    onSuccess: () => {
      toast.success("Reply posted!");
      queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post reply.");
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> South African Farmer Network
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Community Field Exchange
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect with local growers. Share real-time disease outbreaks, spray recommendations, soil questions, and practical solutions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions, symptoms, grower names, or regional alerts..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-800 bg-[#111720]/90 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="h-3.5 w-3.5 text-emerald-400" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "bg-[#111720] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-[#131922]/50 p-12 text-center space-y-3">
            <MessageSquare className="h-8 w-8 text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-200">No community posts match your search</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or switch categories to "All" to browse all discussions.
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const dbLikes = (likesQuery.data ?? []).filter((v) => v.post_id === post.id);
            const isLiked =
              userLiked[post.id] ??
              (user?.id ? dbLikes.some((v) => v.user_id === user.id) : false);

            const totalLikes =
              localLikes[post.id] !== undefined
                ? localLikes[post.id]
                : (dbLikes.length || post.initialLikes || 0);

            const dbComments = (commentsQuery.data ?? []).filter((c) => c.post_id === post.id);
            const allComments = [
              ...(post.initialReplies || []),
              ...dbComments,
              ...(localReplies[post.id] || []),
            ];

            const isExpanded = openPostId === post.id;
            const currentDraft = replyText[post.id] || "";

            return (
              <div
                key={post.id}
                className="rounded-3xl border border-slate-800/90 bg-[#131922] p-6 shadow-xl space-y-4 transition hover:border-slate-700/80"
              >
                {/* Author Metadata Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0 shadow-inner">
                      {post.author_name?.slice(0, 2).toUpperCase() || "SA"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {post.author_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1a2332] text-emerald-400 border border-emerald-500/20">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        {post.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-emerald-400" /> {post.location}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {new Date(post.created_at).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.body}
                  </p>
                </div>

                {/* Footer Controls with Heart Reaction */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    {/* Love Reaction Button */}
                    <button
                      type="button"
                      onClick={() => toggleLikeMutation.mutate(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 font-bold transition active:scale-90 px-3 py-1.5 rounded-xl border",
                        isLiked
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-xs"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700",
                      )}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isLiked && "fill-rose-500 stroke-rose-500 scale-110",
                        )}
                      />
                      <span>{totalLikes}</span>
                    </button>

                    {/* Replies Toggle */}
                    <button
                      type="button"
                      onClick={() => setOpenPostId(isExpanded ? null : post.id)}
                      className="flex items-center gap-1.5 font-semibold text-slate-400 hover:text-white transition active:scale-95"
                    >
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      <span>{allComments.length} Replies</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Post link copied to clipboard");
                    }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>

                {/* Expandable Replies Thread */}
                {isExpanded && (
                  <div className="pt-4 space-y-3 border-t border-slate-800/60 animate-in fade-in duration-200">
                    {allComments.length > 0 ? (
                      <div className="space-y-2.5">
                        {allComments.map((reply, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3.5 rounded-2xl bg-[#0f151d] border border-slate-800/80 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span className="font-bold text-slate-200">
                                {reply.author_name}
                              </span>
                              <span>
                                {new Date(reply.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{reply.body}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-1">
                        No replies yet. Be the first farmer to share insights.
                      </p>
                    )}

                    {/* Quick Reply Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={currentDraft}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCommentMutation.mutate(post.id);
                          }
                        }}
                        placeholder="Write a field recommendation or answer…"
                        className="flex-1 h-10 px-4 rounded-xl border border-slate-800 bg-[#0f151d] text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        disabled={!currentDraft.trim() || addCommentMutation.isPending}
                        onClick={() => addCommentMutation.mutate(post.id)}
                        className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition disabled:opacity-40 flex items-center gap-1 shrink-0"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog: Create New Post */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-700 bg-[#161d26] p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> New Discussion
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  Share with Farmers
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createPostMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Crop Category</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-[#111720] text-xs text-white focus:border-emerald-500 focus:outline-none transition font-medium"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Location / Region</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Brits, North West"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-[#111720] text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Title / Main Question</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Leaf discoloration after heavy morning fog on tomatoes"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-[#111720] text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition font-medium"
                  maxLength={140}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Field Details & Context</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Describe observed plant symptoms, chemical applications used, soil moisture, or what you've tried..."
                  className="w-full p-3.5 rounded-xl border border-slate-800 bg-[#111720] text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition resize-none leading-relaxed"
                  maxLength={3000}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{createPostMutation.isPending ? "Publishing…" : "Publish to Feed"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}