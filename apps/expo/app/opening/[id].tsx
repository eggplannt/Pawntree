import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOpening, getNodes, buildTree } from '@/lib/openings';
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [opening, setOpening] = useState<Opening | null>(null);
  const [tree, setTree] = useState<Node | null>(null);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [forwardStack, setForwardStack] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const moveListRef = useRef<ScrollView>(null);

  const parentMap = useMemo(
    () => (tree ? buildParentMap(tree) : new Map<string, Node>()),
    [tree],
  );

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  async function loadData(openingId: string) {
    setLoading(true);
    try {
      const [o, nodes] = await Promise.all([
        getOpening(openingId),
        getNodes(openingId),
      ]);
      setOpening(o);
      const t = buildTree(nodes);
      setTree(t);
      setCurrentNode(t);
      setForwardStack([]);
    } finally {
      setLoading(false);
    }
  }

  const selectNode = useCallback((node: Node) => {
    setCurrentNode(node);
    setForwardStack([]);
  }, []);

  const goNext = useCallback(() => {
    if (!currentNode) return;
    if (forwardStack.length > 0) {
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
  const boardSize = screenWidth - 24; // 12px padding each side

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-base items-center justify-center">
        <ActivityIndicator color={colorTheme.accent.default} />
      </SafeAreaView>
    );
  }

  if (!opening || !tree) {
    return (
      <SafeAreaView className="flex-1 bg-bg-base p-6">
        <Text className="text-content-muted">Opening not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-2">
          <Text className="text-accent text-sm">Back to Library</Text>
        </Pressable>
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

      {/* Board — central focus */}
      <View className="items-center px-3">
        <View style={{ width: boardSize, maxWidth: 500 }}>
          <Chessboard
            fen={boardFen}
            orientation={opening.color}
          />
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

      {/* Move tree — fills remaining space */}
      <View className="flex-1 border-t border-border mt-1">
        <View className="flex-row items-center gap-2 px-4 py-2 border-b border-border">
          <Text className="text-accent text-xs">♟</Text>
          <Text className="text-content-secondary text-xs font-medium uppercase tracking-wider">
            Moves
          </Text>
        </View>
        <ScrollView ref={moveListRef} className="flex-1 p-3">
          <MoveTree root={tree} selected={currentNode} onSelect={selectNode} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function NavButton({
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
}

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

function MoveTree({
  root,
  selected,
  onSelect,
}: {
  root: Node;
  selected: Node | null;
  onSelect: (n: Node) => void;
}) {
  if (!root.children?.length) {
    return <Text className="text-content-muted text-sm">No moves yet.</Text>;
  }
  return <MoveLine nodes={root.children} selected={selected} onSelect={onSelect} />;
}

function MoveLine({
  nodes,
  selected,
  onSelect,
}: {
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
      <View className="flex-row flex-wrap items-baseline" style={{ gap: 2 }}>
        {mainRun.map((node, i) => (
          <MoveButton
            key={node.id}
            node={node}
            selected={selected?.id === node.id}
            onSelect={onSelect}
            forceNumber={i === 0}
          />
        ))}
      </View>

      {alts.map((alt) => (
        <VariationBlock
          key={alt.id}
          node={alt}
          selected={selected}
          onSelect={onSelect}
        />
      ))}

      {branchesAfterRun.length > 0 && (
        <MoveLine nodes={branchesAfterRun} selected={selected} onSelect={onSelect} />
      )}
    </>
  );
}

function VariationBlock({
  node,
  selected,
  onSelect,
}: {
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
              selected={selected?.id === run[0].id}
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
              selected={selected?.id === n.id}
              onSelect={onSelect}
              forceNumber={i === 0}
            />
          ))
        )}
      </View>

      {!collapsed && branchesAfterRun.length > 0 && (
        <MoveLine nodes={branchesAfterRun} selected={selected} onSelect={onSelect} />
      )}
    </View>
  );
}

function MoveButton({
  node,
  selected,
  onSelect,
  forceNumber,
}: {
  node: Node;
  selected: boolean;
  onSelect: (n: Node) => void;
  forceNumber: boolean;
}) {
  const prefix = movePrefix(node, forceNumber);
  const white = isWhiteMove(node);

  return (
    <View className="flex-row items-baseline">
      {prefix ? (
        <Text className="text-content-muted text-xs font-mono mr-0.5">{prefix}</Text>
      ) : null}
      <Pressable
        onPress={() => onSelect(node)}
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
}
