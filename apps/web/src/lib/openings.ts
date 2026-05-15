import { supabase } from './supabase';
import { flattenTree, parsePgn } from './pgn-tree';
import type { Opening, Node } from '@/types';

// ── Openings ────────────────────────────────────────────────────────────────

export async function listOpenings() {
  const { data, error } = await supabase
    .from('openings')
    .select('*, nodes(count)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get due counts via review_cards → nodes → openings
  const { data: dueCards } = await supabase
    .from('review_cards')
    .select('node_id, due_date, nodes!inner(opening_id)')
    .lte('due_date', new Date().toISOString().slice(0, 10));

  const dueCounts = new Map<string, number>();
  for (const card of dueCards ?? []) {
    const openingId = (card.nodes as any)?.opening_id;
    if (openingId) dueCounts.set(openingId, (dueCounts.get(openingId) ?? 0) + 1);
  }

  return (data ?? []).map((o) => {
    const nodeCount = (o.nodes as any)?.[0]?.count ?? 0;
    const dueCount = dueCounts.get(o.id) ?? 0;
    return { ...o, nodeCount, dueCount } as Opening & {
      nodeCount: number;
      dueCount: number;
    };
  });
}

export async function getOpening(id: string) {
  const { data, error } = await supabase
    .from('openings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Opening;
}

export interface ImportProgress {
  phase: 'parsing' | 'importing';
  current: number;
  total: number;
}

export async function createOpening(
  name: string,
  color: 'white' | 'black',
  pgn: string | null,
  onProgress?: (p: ImportProgress) => void,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: opening, error } = await supabase
    .from('openings')
    .insert({ name, color, user_id: user.id })
    .select()
    .single();

  if (error) throw error;

  // Always insert a root node (starting position)
  if (pgn && pgn.trim()) {
    await importPgnToOpening(opening.id, pgn, onProgress);
  } else {
    await supabase.from('nodes').insert({
      opening_id: opening.id,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      sort_order: 0,
    });
  }

  return opening as Opening;
}

export async function updateOpening(
  id: string,
  updates: { name?: string; description?: string | null },
) {
  const { data, error } = await supabase
    .from('openings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Opening;
}

export async function deleteOpening(id: string) {
  // Nodes cascade-delete via FK
  const { error } = await supabase.from('openings').delete().eq('id', id);
  if (error) throw error;
}

// ── Nodes ───────────────────────────────────────────────────────────────────

export async function getNodes(openingId: string): Promise<Node[]> {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('opening_id', openingId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as Node[];
}

/** Build a tree structure from flat nodes. */
export function buildTree(nodes: Node[]): Node | null {
  if (nodes.length === 0) return null;

  const map = new Map<string, Node>();
  for (const n of nodes) {
    map.set(n.id, { ...n, children: [] });
  }

  let root: Node | null = null;
  for (const n of nodes) {
    const node = map.get(n.id)!;
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children!.push(node);
    } else {
      root = node;
    }
  }

  return root;
}

// ── PGN Import ──────────────────────────────────────────────────────────────

async function importPgnToOpening(
  openingId: string,
  pgn: string,
  onProgress?: (p: ImportProgress) => void,
) {
  onProgress?.({ phase: 'parsing', current: 0, total: 0 });
  const tree = parsePgn(pgn);
  const flat = flattenTree(tree);
  const total = flat.length;

  onProgress?.({ phase: 'importing', current: 0, total });

  // Insert root first to get its real ID
  const rootFlat = flat.find((n) => n._parentTempId === null)!;
  const { data: rootRow, error: rootErr } = await supabase
    .from('nodes')
    .insert({
      opening_id: openingId,
      fen: rootFlat.fen,
      move_san: rootFlat.move_san,
      move_uci: rootFlat.move_uci,
      annotation: rootFlat.annotation,
      sort_order: rootFlat.sort_order,
    })
    .select()
    .single();

  if (rootErr) throw rootErr;

  // Map temp IDs to real IDs
  const idMap = new Map<number, string>();
  idMap.set(rootFlat._tempId, rootRow.id);

  // Insert remaining nodes in order (parents before children due to sort_order)
  const rest = flat.filter((n) => n._parentTempId !== null);
  for (let i = 0; i < rest.length; i++) {
    const node = rest[i];
    const parentId = idMap.get(node._parentTempId!);
    if (!parentId) continue;

    const { data: row, error } = await supabase
      .from('nodes')
      .insert({
        opening_id: openingId,
        parent_id: parentId,
        fen: node.fen,
        move_san: node.move_san,
        move_uci: node.move_uci,
        annotation: node.annotation,
        sort_order: node.sort_order,
      })
      .select()
      .single();

    if (error) throw error;
    idMap.set(node._tempId, row.id);

    // Report progress every 5 nodes to avoid excessive re-renders
    if (i % 5 === 0 || i === rest.length - 1) {
      onProgress?.({ phase: 'importing', current: i + 2, total });
    }
  }
}
