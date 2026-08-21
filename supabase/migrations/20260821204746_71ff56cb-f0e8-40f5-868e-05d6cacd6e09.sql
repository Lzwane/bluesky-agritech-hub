-- PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Farmer',
  farm_name TEXT,
  province TEXT,
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Farmer'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FORUM POSTS
CREATE TABLE public.forum_posts (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Farmer',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_posts TO authenticated;
GRANT ALL ON public.forum_posts TO service_role;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read posts" ON public.forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can create posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update posts" ON public.forum_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete posts" ON public.forum_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- FORUM COMMENTS
CREATE TABLE public.forum_comments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Farmer',
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_comments TO authenticated;
GRANT ALL ON public.forum_comments TO service_role;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read comments" ON public.forum_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can create comments" ON public.forum_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update comments" ON public.forum_comments FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete comments" ON public.forum_comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- VOTES
CREATE TABLE public.forum_votes (
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.forum_votes TO authenticated;
GRANT ALL ON public.forum_votes TO service_role;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read votes" ON public.forum_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can vote" ON public.forum_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can remove their vote" ON public.forum_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- MARKETPLACE
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Seeds',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'each',
  vendor_name TEXT NOT NULL DEFAULT 'Vendor',
  contact TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT 'Gauteng',
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can browse listings" ON public.marketplace_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can create listings" ON public.marketplace_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update listings" ON public.marketplace_listings FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete listings" ON public.marketplace_listings FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- DIAGNOSES
CREATE TABLE public.diagnoses (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  issue TEXT NOT NULL,
  severity INTEGER NOT NULL DEFAULT 50,
  confidence NUMERIC(5,2) NOT NULL DEFAULT 90,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnoses TO authenticated;
GRANT ALL ON public.diagnoses TO service_role;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own diagnoses" ON public.diagnoses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED CONTENT
INSERT INTO public.forum_posts (author_name, title, body, category) VALUES
('Thabo M.', 'Grey leaf spot spreading fast in Mpumalanga maize', 'We had heavy rain for two weeks and now the lower leaves are covered in long tan lesions. The app flagged grey leaf spot at 87% confidence. Has anyone had success with a strobilurin spray this late in the season?', 'Maize'),
('Nomsa K.', 'Best organic aphid control for spinach tunnels?', 'I run three tunnels near Polokwane and the aphids come back every three weeks. Neem oil works but I have to reapply constantly. What else is working for you?', 'Pest Control'),
('Pieter van Zyl', 'Citrus leaves yellowing between the veins', 'Interveinal chlorosis on my Valencia block, worst on the sandy patch. Soil test shows low zinc. Would a foliar zinc chelate be enough or must I correct the soil first?', 'Citrus'),
('Lerato S.', 'Co-op bulk fertiliser buying - who is in?', 'Our co-op in the Free State is putting together a bulk LAN order for the next planting window. Cheaper per ton if we hit 40 tons. Comment if you want in.', 'Marketplace');

INSERT INTO public.marketplace_listings (title, description, category, price, unit, vendor_name, contact, province, verified) VALUES
('Certified PAN 6479 maize seed', 'Drought-tolerant white maize hybrid, treated and certified. Available in 25kg bags.', 'Seeds', 1850.00, '25kg bag', 'Highveld Seed Supply', 'sales@highveldseed.co.za', 'Free State', true),
('LAN 28% nitrogen fertiliser', 'Limestone ammonium nitrate, 50kg bags. Bulk discount from 20 bags.', 'Fertilizer', 620.00, '50kg bag', 'AgriGrow Distributors', '+27 12 555 0148', 'Gauteng', true),
('Neem oil concentrate (5L)', 'Cold-pressed neem oil for organic pest control. Dilutes to 500L of spray.', 'Crop Protection', 745.00, '5L', 'Organic Farm Solutions', 'orders@organicfarm.co.za', 'Western Cape', true),
('Knapsack sprayer 20L', 'Manual pressure knapsack sprayer with brass nozzle set and spare seals.', 'Equipment', 890.00, 'each', 'Boland Farm Tools', '+27 21 555 0932', 'Western Cape', false),
('Drip irrigation starter kit', 'Covers 1000 m2 - mainline, dripline, filter and pressure regulator included.', 'Irrigation', 3450.00, 'kit', 'AquaField Irrigation', 'info@aquafield.co.za', 'KwaZulu-Natal', true),
('Second-hand 60hp tractor', '2014 model, 4200 hours, full service history, new tyres. Viewing by appointment.', 'Machinery', 285000.00, 'each', 'Mpumalanga Machinery', '+27 13 555 0277', 'Mpumalanga', false),
('Soybean seed - certified', 'High-protein soybean cultivar suited to summer rainfall regions.', 'Seeds', 1240.00, '25kg bag', 'Highveld Seed Supply', 'sales@highveldseed.co.za', 'North West', true),
('Compost - screened, 1m3', 'Fully matured screened compost, delivered within 80km.', 'Fertilizer', 480.00, 'm3', 'Green Earth Compost', '+27 51 555 0611', 'Free State', true);