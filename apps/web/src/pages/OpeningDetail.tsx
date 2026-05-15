import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { AppShell } from '@/components/AppShell';
import { getOpening, getNodes, buildTree } from '@/lib/openings';
import { useColorTheme } from '@/hooks/useColorTheme';
import type { Opening, Node } from '@/types';

// ── Helpers ─────────────────────────────────────────────────────────────────

function fenInfo(fen: string) {
  const parts = fen.split(' ');
  return { isWhite: parts[1] === 'w', moveNum: parseInt(parts[5] ?? '1', 10) };
}

function movePrefix(node: Node, forceNumber: boolean): string {
  const { moveNum, isWhite } = fenInfo(node.fen);
  if (isWhite) return forceNumber ? `${moveNum - 1}...` : '';
  return `${moveNum}.`;
}

function isWhiteMove(node: Node): boolean {
  return !fenInfo(node.fen).isWhite;
}

/** Build a map from node id → parent node for fast traversal. */
function buildParentMap(root: Node): Map<string, Node> {
  const map = new Map<string, Node>();
  function walk(node: Node) {
    for (const child of node.children ?? []) {
      map.set(child.id, node);
      walk(child);
    }
  }
  walk(root);
  return map;
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function OpeningDetail() {
  const { id } = useParams<{ id: string }>();
  const [opening, setOpening] = useState<Opening | null>(null);
  const [tree, setTree] = useState<Node | null>(null);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [forwardStack, setForwardStack] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const moveListRef = useRef<HTMLDivElement>(null);
  const { colors } = useColorTheme();

  const parentMap = useMemo(() => (tree ? buildParentMap(tree) : new Map<string, Node>()), [tree]);

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  async function loadData(openingId: string) {
    setLoading(true);
    try {
      const [o, nodes] = await Promise.all([getOpening(openingId), getNodes(openingId)]);
      setOpening(o);
      const t = buildTree(nodes);
      setTree(t);
      setCurrentNode(t);
      setForwardStack([]);
    } finally {
      setLoading(false);
    }
  }

  // Direct click on a move — set position and clear forward stack
  const selectNode = useCallback((node: Node) => {
    setCurrentNode(node);
    setForwardStack([]);
  }, []);

  // Navigation — back pushes to forward stack, forward pops from it
  const goToStart = useCallback(() => {
    if (tree) {
      setCurrentNode(tree);
      setForwardStack([]);
    }
  }, [tree]);

  const goToEnd = useCallback(() => {
    if (!currentNode) return;
    let node = currentNode;
    while (node.children && node.children.length > 0) node = node.children[0];
    setCurrentNode(node);
    setForwardStack([]);
  }, [currentNode]);

  const goNext = useCallback(() => {
    if (!currentNode) return;
    // Check if forward stack has a node whose parent is the current node
    if (forwardStack.length > 0) {
      const next = forwardStack[forwardStack.length - 1];
      if (parentMap.get(next.id) === currentNode || next.id === currentNode.id) {
        // The top of the stack might be the current node itself if we just went back to it
        // Find the right entry: the one whose parent is currentNode
        let idx = -1;
        for (let i = forwardStack.length - 1; i >= 0; i--) {
          if (parentMap.get(forwardStack[i].id) === currentNode) { idx = i; break; }
        }
        if (idx >= 0) {
          const next = forwardStack[idx];
          setCurrentNode(next);
          setForwardStack(forwardStack.slice(0, idx));
          return;
        }
      }
    }
    // Default: go to first child
    if (currentNode.children?.length) {
      setCurrentNode(currentNode.children[0]);
      setForwardStack([]);
    }
  }, [currentNode, forwardStack, parentMap]);

  const goPrev = useCallback(() => {
    if (!currentNode || !parentMap.has(currentNode.id)) return;
    setForwardStack((prev) => [...prev, currentNode]);
    setCurrentNode(parentMap.get(currentNode.id)!);
  }, [currentNode, parentMap]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); goNext(); break;
        case 'ArrowLeft': e.preventDefault(); goPrev(); break;
        case 'Home': e.preventDefault(); goToStart(); break;
        case 'End': e.preventDefault(); goToEnd(); break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, goToStart, goToEnd]);

  // Auto-scroll selected move into view
  useEffect(() => {
    if (!currentNode || !moveListRef.current) return;
    // Wait for DOM to update before scrolling
    requestAnimationFrame(() => {
      const el = moveListRef.current?.querySelector(`[data-node-id="${currentNode.id}"]`);
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }, [currentNode]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!opening || !tree) {
    return (
      <AppShell>
        <div className="flex-1 p-8">
          <p className="text-content-muted">Opening not found.</p>
          <Link to="/library" className="text-accent text-sm mt-2 inline-block hover:underline">
            Back to Library
          </Link>
        </div>
      </AppShell>
    );
  }

  const boardFen = currentNode?.fen ?? tree.fen;
  const boardOrientation = opening.color === 'white' ? 'white' : 'black';
  const hasNext = !!(currentNode?.children?.length);
  const hasPrev = !!(currentNode && parentMap.has(currentNode.id));

  return (
    <AppShell>
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* ── Board column ── */}
        {/* On mobile: board fills width, capped by viewport height so it doesn't overflow.
            On desktop: board fills available height (minus title + nav), capped by column width. */}
        <div className="flex flex-col items-center shrink-0 p-3 lg:flex-1 lg:p-6 lg:justify-center lg:overflow-hidden">
          {/* Title bar */}
          <div className="w-full flex items-center gap-2 mb-2 min-w-0">
            <Link
              to={`/library${opening.color === 'black' ? '?color=black' : ''}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-content-muted hover:text-content-primary hover:bg-bg-elevated transition-colors shrink-0"
              title="Back to Library"
            >
              ←
            </Link>
            <span className={`text-lg shrink-0 ${opening.color === 'white' ? 'text-gold' : 'text-accent'}`}>
              {opening.color === 'white' ? '♔' : '♚'}
            </span>
            <h1 className="text-content-primary text-lg font-semibold truncate">{opening.name}</h1>
          </div>

          {/* Board — scales to fill available space
              Mobile: width = 100vw - padding, height capped so moves panel is visible
              Desktop: sized by the smaller of available width or height */}
          <div className="w-full aspect-square max-h-[calc(100vh-220px)] max-w-[calc(100vh-220px)]">
            <Chessboard
              options={{
                position: boardFen,
                boardOrientation: boardOrientation,
                allowDragging: false,
                animationDurationInMs: 200,
                boardStyle: {
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                },
                darkSquareStyle: { backgroundColor: colors.board.dark },
                lightSquareStyle: { backgroundColor: colors.board.light },
              }}
            />
          </div>

          {/* Nav controls */}
          <div className="flex items-center gap-1 mt-2">
            <NavButton onClick={goToStart} disabled={!hasPrev} title="Start (Home)">⏮</NavButton>
            <NavButton onClick={goPrev} disabled={!hasPrev} title="Previous (←)">◀</NavButton>
            <NavButton onClick={goNext} disabled={!hasNext} title="Next (→)">▶</NavButton>
            <NavButton onClick={goToEnd} disabled={!hasNext} title="End (End)">⏭</NavButton>
          </div>

          {/* Annotation */}
          {currentNode?.annotation && (
            <div className="w-full mt-2 bg-bg-surface border border-border rounded-lg px-3 py-2">
              <p className="text-content-secondary text-sm">{currentNode.annotation}</p>
            </div>
          )}
        </div>

        {/* ── Move tree panel (scrolls independently) ── */}
        <div className="border-t lg:border-t-0 lg:border-l border-border bg-bg-surface flex flex-col shrink-0 min-h-0 max-h-[40vh] lg:max-h-none lg:w-80 xl:w-96">
          <div className="px-4 py-3 border-b border-border shrink-0 flex items-center gap-2">
            <span className="text-accent text-xs">♟</span>
            <h2 className="text-content-secondary text-xs font-medium uppercase tracking-wider">Moves</h2>
          </div>
          <div ref={moveListRef} className="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0">
            <MoveTree root={tree} selected={currentNode} onSelect={selectNode} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function NavButton({ onClick, disabled, title, children }: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-surface border border-border text-content-secondary hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all disabled:opacity-30 disabled:hover:text-content-secondary disabled:hover:border-border disabled:hover:bg-bg-surface"
    >
      {children}
    </button>
  );
}

// ── Move Tree Renderer ──────────────────────────────────────────────────────
// Renders like standard PGN: main line flows inline, variations are shown
// as indented blocks with a left border. No left-margin nesting — variations
// always start at the same indent level (one step in) so they don't get
// crushed in narrow panels.

function collectMainRun(start: Node): Node[] {
  const run: Node[] = [start];
  let cur = start;
  while (cur.children && cur.children.length === 1) {
    cur = cur.children[0];
    run.push(cur);
  }
  return run;
}

function MoveTree({ root, selected, onSelect }: {
  root: Node;
  selected: Node | null;
  onSelect: (n: Node) => void;
}) {
  if (!root.children?.length) {
    return <p className="text-content-muted text-sm">No moves yet.</p>;
  }
  return <MoveLine nodes={root.children} selected={selected} onSelect={onSelect} />;
}

function MoveLine({ nodes, selected, onSelect }: {
  nodes: Node[];
  selected: Node | null;
  onSelect: (n: Node) => void;
}) {
  if (nodes.length === 0) return null;
  const [main, ...alts] = nodes;
  const mainRun = collectMainRun(main);
  const lastInRun = mainRun[mainRun.length - 1];
  const branchesAfterRun = lastInRun.children ?? [];

  return (
    <>
      {/* Main line moves inline */}
      <div className="flex flex-wrap items-baseline gap-x-0.5 gap-y-0.5">
        {mainRun.map((node, i) => (
          <MoveButton key={node.id} node={node} selected={selected?.id === node.id} onSelect={onSelect} forceNumber={i === 0} />
        ))}
      </div>

      {/* Variations — always one level of indent, no progressive nesting */}
      {alts.map((alt) => (
        <VariationBlock key={alt.id} node={alt} selected={selected} onSelect={onSelect} />
      ))}

      {/* Continue main line after branch point */}
      {branchesAfterRun.length > 0 && (
        <MoveLine nodes={branchesAfterRun} selected={selected} onSelect={onSelect} />
      )}
    </>
  );
}

function VariationBlock({ node, selected, onSelect }: {
  node: Node;
  selected: Node | null;
  onSelect: (n: Node) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const run = collectMainRun(node);
  const lastInRun = run[run.length - 1];
  const branchesAfterRun = lastInRun.children ?? [];
  const isLong = run.length > 4 || branchesAfterRun.length > 0;

  return (
    <div className="border-l-2 border-gold/25 pl-2 my-0.5 ml-1">
      <div className="flex flex-wrap items-baseline gap-x-0.5 gap-y-0.5">
        {/* Collapse toggle for long variations */}
        {isLong && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-accent/50 hover:text-accent text-xs mr-0.5 select-none transition-colors"
            title={collapsed ? 'Expand variation' : 'Collapse variation'}
          >
            {collapsed ? '▶' : '▼'}
          </button>
        )}
        {collapsed ? (
          // Show just the first move when collapsed
          <MoveButton node={run[0]} selected={selected?.id === run[0].id} onSelect={onSelect} forceNumber />
        ) : (
          run.map((n, i) => (
            <MoveButton key={n.id} node={n} selected={selected?.id === n.id} onSelect={onSelect} forceNumber={i === 0} />
          ))
        )}
        {collapsed && <span className="text-content-muted text-xs select-none">...</span>}
      </div>

      {!collapsed && branchesAfterRun.length > 0 && (
        <MoveLine nodes={branchesAfterRun} selected={selected} onSelect={onSelect} />
      )}
    </div>
  );
}

function MoveButton({ node, selected, onSelect, forceNumber }: {
  node: Node;
  selected: boolean;
  onSelect: (n: Node) => void;
  forceNumber: boolean;
}) {
  const prefix = movePrefix(node, forceNumber);
  const white = isWhiteMove(node);

  return (
    <span className="inline-flex items-baseline" data-node-id={node.id}>
      {prefix && (
        <span className="text-content-muted text-xs font-mono mr-0.5 select-none">{prefix}</span>
      )}
      <button
        onClick={() => onSelect(node)}
        className={[
          'px-1.5 py-0.5 rounded-md text-sm font-mono transition-all',
          selected
            ? 'bg-gold/20 text-gold ring-1 ring-gold/40'
            : white
              ? 'text-content-primary hover:bg-bg-elevated'
              : 'text-content-secondary hover:bg-bg-elevated',
        ].join(' ')}
      >
        {node.move_san}
      </button>
    </span>
  );
}
