import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Phone, Plus, Search } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/marketplace")({
  component: MarketplacePage,
});

const CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Crop Protection",
  "Equipment",
  "Irrigation",
  "Machinery",
];

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

const rand = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });

function MarketplacePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(300000);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Seeds",
    price: "",
    unit: "each",
    contact: "",
    province: "Gauteng",
  });

  const listings = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const price = Number(form.price);
      if (form.title.trim().length < 4) throw new Error("Add a clear product title.");
      if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price in rand.");
      if (form.contact.trim().length < 5) throw new Error("Add a phone number or email.");
      const { error } = await supabase.from("marketplace_listings").insert({
        seller_id: user!.id,
        title: form.title.trim().slice(0, 120),
        description: form.description.trim().slice(0, 1000),
        category: form.category,
        price,
        unit: form.unit.trim().slice(0, 30) || "each",
        vendor_name: profile?.farm_name || profile?.display_name || "Farmer",
        contact: form.contact.trim().slice(0, 120),
        province: form.province,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing published");
      setFormOpen(false);
      setForm({
        title: "",
        description: "",
        category: "Seeds",
        price: "",
        unit: "each",
        contact: "",
        province: "Gauteng",
      });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not create listing"),
  });

  const results = (listings.data ?? []).filter((listing) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      listing.title.toLowerCase().includes(q) ||
      listing.description.toLowerCase().includes(q) ||
      listing.vendor_name.toLowerCase().includes(q);
    const matchesCategory = category === "All" || listing.category === category;
    const matchesPrice = Number(listing.price) <= maxPrice;
    return matchesQuery && matchesCategory && matchesPrice;
  });

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{t("nav.marketplace")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified seeds, fertiliser, crop protection and machinery from local suppliers.
          </p>
        </div>
        <Button onClick={() => setFormOpen((open) => !open)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          List item
        </Button>
      </header>

      {formOpen ? (
        <Card className="border-primary/30 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create a listing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="listingTitle">Product title</Label>
              <Input
                id="listingTitle"
                value={form.title}
                maxLength={120}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Certified white maize seed, 25kg"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="listingDesc">Description</Label>
              <Textarea
                id="listingDesc"
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="listingPrice">Price (ZAR)</Label>
              <Input
                id="listingPrice"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="listingUnit">Unit</Label>
              <Input
                id="listingUnit"
                value={form.unit}
                maxLength={30}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
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
            <div className="space-y-1.5">
              <Label>Province</Label>
              <Select
                value={form.province}
                onValueChange={(value) => setForm({ ...form, province: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="listingContact">Contact (phone or email)</Label>
              <Input
                id="listingContact"
                value={form.contact}
                maxLength={120}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                Publish listing
              </Button>
              <Button variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            maxLength={80}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products or vendors"
            aria-label="Search marketplace"
            className="h-11 pl-9"
          />
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Max price</span>
            <span>{rand.format(maxPrice)}</span>
          </div>
          <Slider
            className="mt-3"
            value={[maxPrice]}
            min={500}
            max={300000}
            step={500}
            onValueChange={([value]) => setMaxPrice(value ?? 300000)}
            aria-label="Maximum price"
          />
        </div>
      </div>

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

      {listings.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      ) : results.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No listings match those filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((listing) => (
            <Card key={listing.id} className="flex flex-col border-border/70 shadow-card">
              <CardContent className="flex flex-1 flex-col gap-3 pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{listing.category}</Badge>
                  {listing.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                      Verified vendor
                    </span>
                  ) : null}
                </div>
                <h3 className="text-base font-bold">{listing.title}</h3>
                <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {listing.description}
                </p>
                <p className="text-lg font-extrabold text-primary">
                  {rand.format(Number(listing.price))}
                  <span className="ml-1 text-xs font-semibold text-muted-foreground">
                    / {listing.unit}
                  </span>
                </p>
                <div className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">{listing.vendor_name}</p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {listing.province}
                  </p>
                  <p className="flex items-center gap-1.5 break-all">
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {listing.contact}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
