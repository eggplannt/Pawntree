import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  InteractionManager,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNodes, buildTree } from '@/lib/openings';
import { Chessboard } from '@/components/Chessboard';
import { colorTheme } from '@/hooks/useColorTheme';
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

export default function OpeningDetailScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string; color?: string }>();
  const id = params.id;
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  // Opening metadata passed from library — avoids a separate query
  const [opening] = useState<Opening>(() => ({
    id,
    user_id: '',
    name: params.name ?? 'Opening',
    color: (params.color as 'white' | 'black') ?? 'white',
    description: null,
    created_at: '',
  }));

  const [tree, setTree] = useState<Node | null>(null);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [forwardStack, setForwardStack] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [treeReady, setTreeReady] = useState(false);
  const moveListRef = useRef<ScrollView>(null);

  const parentMap = useMemo(
    () => (tree ? buildParentMap(tree) : new Map<string, Node>()),
    [tree],
  );

  const nodeMap = useMemo(() => {
    if (!tree) return new Map<string, Node>();
    const map = new Map<string, Node>();
    function walk(node: Node) {
      map.set(node.id, node);
      for (const child of node.children ?? []) walk(child);
    }
    walk(tree);
    return map;
  }, [tree]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setTreeReady(false);
      try {
        // Single query — opening data already passed via params
        const nodes = await getNodes(id);
        if (cancelled) return;
        const t = buildTree(nodes);
        setTree(t);
        setCurrentNode(t);
        setForwardStack([]);
        setLoading(false);
        InteractionManager.runAfterInteractions(() => {
          if (!cancelled) setTreeReady(true);
        });
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  const selectNode = useCallback((nodeId: string) => {
    const node = nodeMap.get(nodeId);
    if (node) {
      setCurrentNode(node);
      setForwardStack([]);
    }
  }, [nodeMap]);

  const goNext = useCallback(() => {
    if (!currentNode) return;
    if (forwardStack.length > 0) {
      let idx = -1;
      for (let i = forwardStack.length - 1; i >= 0; i--) {
        if (parentMap.get(forwardStack[i].id) === currentNode) { idx = i; break; }
      }
      if (idx >= 0) {
        setCurrentNode(forwardStack[idx]);
        setForwardStack(forwardStack.slice(0, idx));
        return;
      }
    }
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

  const hasNext = !!(currentNode?.children?.length);
  const hasPrev = !!(currentNode && parentMap.has(currentNode.id));
  const boardSize = screenWidth - 24;
  const selectedId = currentNode?.id ?? null;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-base items-center justify-center">
        <ActivityIndicator color={colorTheme.accent.default} />
      </SafeAreaView>
    );
  }

  if (!tree) {
    if (!loading) {
      return (
        <SafeAreaView className="flex-1 bg-bg-base p-6">
          <Text className="text-content-muted">Opening not found.</Text>
          <Pressable onPress={() => router.back()} className="mt-2">
            <Text className="text-accent text-sm">Back to Library</Text>
          </Pressable>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView className="flex-1 bg-bg-base items-center justify-center">
        <ActivityIndicator color={colorTheme.accent.default} />
      </SafeAreaView>
    );
  }

  const isWhite = opening.color === 'white';
  const boardFen = currentNode?.fen ?? tree.fen;

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="w-8 h-8 items-center justify-center rounded-lg active:bg-bg-elevated"
        >
          <Text className="text-content-muted text-lg">←</Text>
        </Pressable>
        <Text className={`text-lg ${isWhite ? 'text-gold' : 'text-accent'}`}>
          {isWhite ? '♔' : '♚'}
        </Text>
        <Text className="text-content-primary text-base font-semibold flex-1" numberOfLines={1}>
          {opening.name}
        </Text>
      </View>

      {/* Board */}
      <View className="items-center px-3">
        <View style={{ width: boardSize, maxWidth: 500 }}>
          <Chessboard fen={boardFen} orientation={opening.color} />
        </View>
      </View>

      {/* Nav controls */}
      <View className="flex-row items-center justify-center gap-2 py-2">
        <NavButton onPress={goToStart} disabled={!hasPrev} label="⏮" />
        <NavButton onPress={goPrev} disabled={!hasPrev} label="◀" />
        <NavButton onPress={goNext} disabled={!hasNext} label="▶" />
        <NavButton onPress={goToEnd} disabled={!hasNext} label="⏭" />
      </View>

      {/* Current move + annotation */}
      {currentNode?.move_san && (
        <View className="px-4 py-1">
          <Text className="text-gold text-base font-semibold text-center">
            {movePrefix(currentNode, true)}{currentNode.move_san}
          </Text>
        </View>
      )}
      {currentNode?.annotation && (
        <View className="mx-4 mb-1 bg-bg-surface border border-border rounded-lg px-3 py-2">
          <Text className="text-content-secondary text-sm">{currentNode.annotation}</Text>
        </View>
      )}

      {/* Move tree — deferred until board is visible */}
      <View className="flex-1 border-t border-border mt-1">
        <View className="flex-row items-center gap-2 px-4 py-2 border-b border-border">
          <Text className="text-accent text-xs">♟</Text>
          <Text className="text-content-secondary text-xs font-medium uppercase tracking-wider">
            Moves
          </Text>
        </View>
        {treeReady ? (
          <ScrollView ref={moveListRef} className="flex-1 p-3">
            <MoveTree root={tree} selectedId={selectedId} onSelect={selectNode} />
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color={colorTheme.accent.default} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const NavButton = memo(function NavButton({
  onPress,
  disabled,
  label,
}: {
  onPress: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'w-12 h-10 items-center justify-center rounded-xl bg-bg-surface border border-border',
        disabled ? 'opacity-30' : 'active:bg-accent/5 active:border-accent/40',
      ].join(' ')}
    >
      <Text className={disabled ? 'text-content-muted' : 'text-content-secondary'}>
        {label}
      </Text>
    </Pressable>
  );
});

// ── Move Tree Renderer ──────────────────────────────────────────────────────

function collectMainRun(start: Node): Node[] {
  const run: Node[] = [start];
  let cur = start;
  while (cur.children && cur.children.length === 1) {
    cur = cur.children[0];
    run.push(cur);
  }
  return run;
}

const MoveTree = memo(function MoveTree({
  root,
  selectedId,
  onSelect,
}: {
  root: Node;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (!root.children?.length) {
    return <Text className="text-content-muted text-sm">No moves yet.</Text>;
  }
  return <MoveLine nodes={root.children} selectedId={selectedId} onSelect={onSelect} />;
});

const MoveLine = memo(function MoveLine({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: Node[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (nodes.length === 0) return null;
  const [main, ...alts] = nodes;
  const mainRun = collectMainRun(main);
  const lastInRun = mainRun[mainRun.length - 1];
  const branchesAfterRun = lastInRun.children ?? [];

  return (
    <>
      <View className="flex-row flex-wrap items-baseline" style={{ gap: 2 }}>
        {mainRun.map((node, i) => (
          <MoveButton
            key={node.id}
            node={node}
            selected={selectedId === node.id}
            onSelect={onSelect}
            forceNumber={i === 0}
          />
        ))}
      </View>

      {alts.map((alt) => (
        <VariationBlock
          key={alt.id}
          node={alt}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}

      {branchesAfterRun.length > 0 && (
        <MoveLine nodes={branchesAfterRun} selectedId={selectedId} onSelect={onSelect} />
      )}
    </>
  );
});

const VariationBlock = memo(function VariationBlock({
  node,
  selectedId,
  onSelect,
}: {
  node: Node;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const run = collectMainRun(node);
  const lastInRun = run[run.length - 1];
  const branchesAfterRun = lastInRun.children ?? [];
  const isLong = run.length > 4 || branchesAfterRun.length > 0;

  return (
    <View
      className="my-0.5 ml-1 pl-2"
      style={{ borderLeftWidth: 2, borderLeftColor: colorTheme.gold.dim + '40' }}
    >
      <View className="flex-row flex-wrap items-baseline" style={{ gap: 2 }}>
        {isLong && (
          <Pressable onPress={() => setCollapsed(!collapsed)} className="mr-0.5">
            <Text className="text-accent/50 text-xs">{collapsed ? '▶' : '▼'}</Text>
          </Pressable>
        )}
        {collapsed ? (
          <>
            <MoveButton
              node={run[0]}
              selected={selectedId === run[0].id}
              onSelect={onSelect}
              forceNumber
            />
            <Text className="text-content-muted text-xs">...</Text>
          </>
        ) : (
          run.map((n, i) => (
            <MoveButton
              key={n.id}
              node={n}
              selected={selectedId === n.id}
              onSelect={onSelect}
              forceNumber={i === 0}
            />
          ))
        )}
      </View>

      {!collapsed && branchesAfterRun.length > 0 && (
        <MoveLine nodes={branchesAfterRun} selectedId={selectedId} onSelect={onSelect} />
      )}
    </View>
  );
});

const MoveButton = memo(function MoveButton({
  node,
  selected,
  onSelect,
  forceNumber,
}: {
  node: Node;
  selected: boolean;
  onSelect: (id: string) => void;
  forceNumber: boolean;
}) {
  const prefix = movePrefix(node, forceNumber);
  const white = isWhiteMove(node);
  const handlePress = useCallback(() => onSelect(node.id), [onSelect, node.id]);

  return (
    <View className="flex-row items-baseline">
      {prefix ? (
        <Text className="text-content-muted text-xs font-mono mr-0.5">{prefix}</Text>
      ) : null}
      <Pressable
        onPress={handlePress}
        className={[
          'px-1.5 py-0.5 rounded-md',
          selected ? 'bg-gold/20' : '',
        ].join(' ')}
        style={selected ? { borderWidth: 1, borderColor: colorTheme.gold.default + '60' } : undefined}
      >
        <Text
          className={[
            'text-sm font-mono',
            selected
              ? 'text-gold'
              : white
                ? 'text-content-primary'
                : 'text-content-secondary',
          ].join(' ')}
        >
          {node.move_san}
        </Text>
      </Pressable>
    </View>
  );
});
