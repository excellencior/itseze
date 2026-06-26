-- ═══════════════════════════════════════════════════════════════
--  itseze Supabase Schema Migration
--  Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- 1. Create enums
CREATE TYPE page_status AS ENUM ('coming_soon', 'draft', 'published');
CREATE TYPE version_type AS ENUM ('draft_save', 'publish');

-- 2. Create pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT UNIQUE NOT NULL,
  url_path TEXT UNIQUE NOT NULL,
  status page_status NOT NULL DEFAULT 'draft',
  current_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create page_versions table
CREATE TABLE page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  meta JSONB NOT NULL DEFAULT '{}',
  blocks JSONB NOT NULL DEFAULT '[]',
  version_type version_type NOT NULL DEFAULT 'draft_save',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Add FK constraint for current_version_id
ALTER TABLE pages
  ADD CONSTRAINT fk_current_version
  FOREIGN KEY (current_version_id) REFERENCES page_versions(id)
  ON DELETE SET NULL;

-- 5. Create indexes
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_url_path ON pages(url_path);
CREATE INDEX idx_versions_page_id ON page_versions(page_id);
CREATE INDEX idx_versions_created_at ON page_versions(created_at DESC);

-- 6. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
--  Row Level Security
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

-- Public: can read published & coming_soon pages
CREATE POLICY "Public can read published pages"
  ON pages FOR SELECT
  USING (status IN ('published', 'coming_soon'));

-- Public: can read the current version of published pages
CREATE POLICY "Public can read published versions"
  ON page_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_versions.page_id
      AND pages.current_version_id = page_versions.id
      AND pages.status = 'published'
    )
  );

-- Authenticated admins: full access to all pages
CREATE POLICY "Admins full access on pages"
  ON pages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated admins: full access to all versions
CREATE POLICY "Admins full access on versions"
  ON page_versions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
--  Note: Admin email checking is done application-side via
--  the VITE_ADMIN_EMAILS env var in AuthGuard.jsx.
--  The RLS policies above allow any authenticated user to
--  read/write. For stricter security, you can add email
--  checks in the policies using:
--    auth.jwt() ->> 'email' = 'your-admin@gmail.com'
-- ═══════════════════════════════════════════════════════════════
