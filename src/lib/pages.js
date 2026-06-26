import { supabase } from './supabase';

/* ═══════════════════════════════════════════
 *  Pages API
 * ═══════════════════════════════════════════ */

/**
 * Fetch ALL pages (admin view — includes drafts, published, coming_soon).
 * Joins current version data for meta info.
 */
export async function fetchAllPages() {
  const { data, error } = await supabase
    .from('pages')
    .select(`
      id, route, url_path, status, current_version_id, created_at, updated_at,
      current_version:page_versions!fk_current_version (
        id, meta, version_type, created_at
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch published + coming_soon pages (public sidebar/navigation).
 * Joins current version for meta (title, category, subcategory).
 */
export async function fetchPublishedPages() {
  const { data, error } = await supabase
    .from('pages')
    .select(`
      id, route, url_path, status, created_at, updated_at,
      current_version:page_versions!fk_current_version (
        id, meta, created_at
      )
    `)
    .in('status', ['published', 'coming_soon'])
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single page by its public URL path (for rendering published pages).
 * Returns page + full current version (meta + blocks).
 */
export async function fetchPageByUrlPath(urlPath) {
  const { data, error } = await supabase
    .from('pages')
    .select(`
      id, route, url_path, status, current_version_id, created_at, updated_at,
      current_version:page_versions!fk_current_version (
        id, meta, blocks, version_type, created_at
      )
    `)
    .eq('url_path', urlPath)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data;
}

/**
 * Fetch a single page by ID (for editor).
 * Returns page + full current version (meta + blocks).
 */
export async function fetchPageById(pageId) {
  const { data, error } = await supabase
    .from('pages')
    .select(`
      id, route, url_path, status, current_version_id, created_at, updated_at,
      current_version:page_versions!fk_current_version (
        id, meta, blocks, version_type, created_at
      )
    `)
    .eq('id', pageId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new page with its initial version.
 * Returns { page, version }.
 */
export async function createPage({ route, urlPath, status = 'draft', meta, blocks = [] }) {
  // 1. Insert the page row (no current_version_id yet)
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .insert({ route, url_path: urlPath, status })
    .select()
    .single();

  if (pageError) throw pageError;

  // 2. Insert the first version
  const { data: version, error: versionError } = await supabase
    .from('page_versions')
    .insert({
      page_id: page.id,
      meta,
      blocks,
      version_type: status === 'published' ? 'publish' : 'draft_save',
    })
    .select()
    .single();

  if (versionError) throw versionError;

  // 3. Link the page to its first version
  const { error: updateError } = await supabase
    .from('pages')
    .update({ current_version_id: version.id })
    .eq('id', page.id);

  if (updateError) throw updateError;

  return { page: { ...page, current_version_id: version.id }, version };
}

/**
 * Update a page's status (coming_soon → draft → published).
 */
export async function updatePageStatus(pageId, status) {
  const { data, error } = await supabase
    .from('pages')
    .update({ status })
    .eq('id', pageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a page and all its versions (CASCADE).
 */
export async function deletePage(pageId) {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) throw error;
}

/* ═══════════════════════════════════════════
 *  Versions API
 * ═══════════════════════════════════════════ */

/**
 * Save a new draft version for a page.
 * Creates a version row and updates the page's current_version_id.
 */
export async function saveDraft(pageId, meta, blocks) {
  // 1. Create the version
  const { data: version, error: versionError } = await supabase
    .from('page_versions')
    .insert({
      page_id: pageId,
      meta,
      blocks,
      version_type: 'draft_save',
    })
    .select()
    .single();

  if (versionError) throw versionError;

  // 2. Update the page to point to this version
  const { error: updateError } = await supabase
    .from('pages')
    .update({
      current_version_id: version.id,
      status: 'draft',  // ensure it's at least draft status
    })
    .eq('id', pageId);

  if (updateError) throw updateError;

  return version;
}

/**
 * Publish a page: creates a publish version, updates page status.
 */
export async function publishPage(pageId, meta, blocks) {
  // 1. Create the publish version
  const { data: version, error: versionError } = await supabase
    .from('page_versions')
    .insert({
      page_id: pageId,
      meta,
      blocks,
      version_type: 'publish',
    })
    .select()
    .single();

  if (versionError) throw versionError;

  // 2. Update the page
  const { error: updateError } = await supabase
    .from('pages')
    .update({
      current_version_id: version.id,
      status: 'published',
    })
    .eq('id', pageId);

  if (updateError) throw updateError;

  return version;
}

/**
 * Fetch all versions for a page, newest first.
 */
export async function fetchVersionHistory(pageId) {
  const { data, error } = await supabase
    .from('page_versions')
    .select('id, page_id, meta, version_type, created_at')
    .eq('page_id', pageId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single version's full data (meta + blocks).
 */
export async function fetchVersion(versionId) {
  const { data, error } = await supabase
    .from('page_versions')
    .select('id, page_id, meta, blocks, version_type, created_at')
    .eq('id', versionId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a version row.
 * Cannot delete the version that is currently live (current_version_id).
 */
export async function deleteVersion(versionId) {
  // Check if this version is the current version for its page
  const { data: pages, error: checkError } = await supabase
    .from('pages')
    .select('id')
    .eq('current_version_id', versionId);

  if (checkError) throw checkError;

  if (pages && pages.length > 0) {
    throw new Error('Cannot delete the current live version. Restore a different version first.');
  }

  const { error } = await supabase
    .from('page_versions')
    .delete()
    .eq('id', versionId);

  if (error) throw error;
}

/**
 * Restore a version: creates a NEW version row with the same data,
 * then makes it the current version. Preserves full history.
 */
export async function restoreVersion(pageId, versionId) {
  // 1. Fetch the version to restore
  const source = await fetchVersion(versionId);
  if (!source) throw new Error('Version not found');

  // 2. Create a new version with the same data
  const { data: newVersion, error: insertError } = await supabase
    .from('page_versions')
    .insert({
      page_id: pageId,
      meta: source.meta,
      blocks: source.blocks,
      version_type: 'draft_save',
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // 3. Update the page to point to the new version
  const { error: updateError } = await supabase
    .from('pages')
    .update({ current_version_id: newVersion.id })
    .eq('id', pageId);

  if (updateError) throw updateError;

  return newVersion;
}
