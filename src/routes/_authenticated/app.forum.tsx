import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowBigUp, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useProfile } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/forum")({
  component: ForumPage,
});

const CATEGORIES = [
  "General",
  "Maize",
  "Citrus",
  "Vegetables",
  "Pest Control",
  "Soil & Nutrition",
  "Irrigation",
  "Marketplace",
];

function ForumPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("All");
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postCategory, setPostCategory] = useState("General");
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const posts = useQuery({
    queryKey: ["forum-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const votes = useQuery({
    queryKey: ["forum-votes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("forum_votes").select("post_id, user_id");
      if (error) throw error;
      return data;
    },
  });

  const comments = useQuery({
    queryKey: ["forum-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_comments")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createPost = useMutation({
    mutationFn: async () => {
      if (title.trim().length < 6) throw new Error("Give your question a clearer title.");
      if (body.trim().length < 15) throw new Error("Add a little more detail to your post.");
      const { error } = await supabase.from("forum_posts").insert({
        author_id: user!.id,
        author_name: profile?.display_name ?? "Farmer",
        title: title.trim().slice(0, 140),
        body: body.trim().slice(0, 2000),
        category: postCategory,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setBody("");
      setComposerOpen(false);
      toast.success("Posted to the community");
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not post"),
  });

  const toggleVote = useMutation({
    mutationFn: async (postId: string) => {
      const mine = votes.data?.some((v) => v.post_id === postId && v.user_id === user!.id);
      if (mine) {
        const { error } = await supabase
          .from("forum_votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("forum_votes")
          .insert({ post_id: postId, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-votes"] }),
    onError: () => toast.error("Could not register your vote"),
  });

  const addComment = useMutation({
    mutationFn: async (postId: string) => {
      if (comment.trim().length < 2) throw new Error("Write a reply first.");
      const { error } = await supabase.from("forum_comments").insert({
        post_id: postId,
        author_id: user!.id,
        author_name: profile?.display_name ?? "Farmer",
        body: comment.trim().slice(0, 1000),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not reply"),
  });

  const filtered = (posts.data ?? []).filter(
    (post) => category === "All" || post.category === category,
  );

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{t("nav.forum")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask questions, share what worked and learn from growers across South Africa.
          </p>
        </div>
        <Button onClick={() => setComposerOpen((open) => !open)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          New post
        </Button>
      </header>

      {composerOpen ? (
        <Card className="border-primary/30 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Start a discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="postTitle">Title</Label>
              <Input
                id="postTitle"
                value={title}
                maxLength={140}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Yellow spots spreading on my cabbage — what is it?"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postBody">Details</Label>
              <Textarea
                id="postBody"
                value={body}
                maxLength={2000}
                rows={5}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe the crop, the weather, what you have tried so far…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={postCategory} onValueChange={setPostCategory}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createPost.mutate()} disabled={createPost.isPending}>
                Publish post
              </Button>
              <Button variant="ghost" onClick={() => setComposerOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((option) => (
          <button
            key={option}
            onClick={() => setCategory(option)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              category === option
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {posts.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => {
            const postVotes = (votes.data ?? []).filter((v) => v.post_id === post.id);
            const mine = postVotes.some((v) => v.user_id === user?.id);
            const postComments = (comments.data ?? []).filter((c) => c.post_id === post.id);
            const expanded = openPost === post.id;

            return (
              <Card key={post.id} className="border-border/70 shadow-card">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <button
                      onClick={() => toggleVote.mutate(post.id)}
                      aria-label="Upvote post"
                      className={cn(
                        "flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-xl border text-xs font-bold transition-colors",
                        mine
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-muted/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <ArrowBigUp className="h-5 w-5" aria-hidden />
                      {postVotes.length}
                    </button>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        <span className="text-xs font-medium text-muted-foreground">
                          {post.author_name} ·{" "}
                          {new Date(post.created_at).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold">{post.title}</h3>
                      <p className="text-sm whitespace-pre-line text-muted-foreground">
                        {post.body}
                      </p>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2"
                        onClick={() => setOpenPost(expanded ? null : post.id)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
                        {postComments.length} {postComments.length === 1 ? "reply" : "replies"}
                      </Button>

                      {expanded ? (
                        <div className="space-y-3 border-l-2 border-primary-soft pl-4">
                          {postComments.map((c) => (
                            <div key={c.id} className="text-sm">
                              <p className="font-semibold">{c.author_name}</p>
                              <p className="text-muted-foreground">{c.body}</p>
                            </div>
                          ))}
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                              value={comment}
                              maxLength={1000}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Share your experience…"
                              aria-label="Write a reply"
                            />
                            <Button
                              onClick={() => addComment.mutate(post.id)}
                              disabled={addComment.isPending}
                              className="shrink-0"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
