import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/AppShell';
import { listOpenings, createOpening, deleteOpening, type ImportProgress } from '@/lib/openings';
import { colorTheme } from '@/hooks/useColorTheme';
import type { Opening } from '@/types';

type Tab = 'white' | 'black';
type OpeningWithStats = Opening & { nodeCount: number; dueCount: number };

export default function LibraryScreen() {
  const [tab, setTab] = useState<Tab>('white');
  const [openings, setOpenings] = useState<OpeningWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const loadOpenings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listOpenings();
      setOpenings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpenings();
  }, [loadOpenings]);

  const filtered = openings.filter((o) => o.color === tab);

  return (
    <AppShell>
      <View className="flex-1 bg-bg-base">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-accent text-lg">♟</Text>
            <Text className="text-content-primary text-2xl font-semibold">Library</Text>
          </View>
          <Pressable
            onPress={() => setShowCreate(true)}
            className="flex-row items-center gap-1.5 bg-accent px-4 py-2.5 rounded-xl active:opacity-80"
          >
            <Text className="text-bg-base text-lg leading-none">+</Text>
            <Text className="text-bg-base font-medium text-sm">New</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-1 bg-bg-surface rounded-xl p-1 mx-5 mb-4 border border-border-subtle">
          {(['white', 'black'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={[
                'flex-1 py-2.5 rounded-lg items-center',
                tab === t
                  ? t === 'white'
                    ? 'bg-gold/15'
                    : 'bg-accent/15'
                  : '',
              ].join(' ')}
            >
              <Text
                className={[
                  'text-sm font-medium',
                  tab === t
                    ? t === 'white'
                      ? 'text-gold'
                      : 'text-accent'
                    : 'text-content-muted',
                ].join(' ')}
              >
                {t === 'white' ? '♔ White' : '♚ Black'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colorTheme.accent.default} />
          </View>
        ) : filtered.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-5xl mb-4 opacity-30">
              {tab === 'white' ? '♔' : '♚'}
            </Text>
            <Text className="text-content-muted text-lg mb-2">
              No {tab} openings yet
            </Text>
            <Text className="text-content-muted text-sm text-center">
              Create one to start building your repertoire.
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 20 }}>
            <View className="gap-3">
              {filtered.map((opening) => (
                <OpeningCard
                  key={opening.id}
                  opening={opening}
                  onPress={() => router.push(`/opening/${opening.id}`)}
                  onDelete={async () => {
                    await deleteOpening(opening.id);
                    loadOpenings();
                  }}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {showCreate && (
        <CreateOpeningModal
          defaultColor={tab}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadOpenings();
          }}
        />
      )}
    </AppShell>
  );
}

function OpeningCard({
  opening,
  onPress,
  onDelete,
}: {
  opening: OpeningWithStats;
  onPress: () => void;
  onDelete: () => void;
}) {
  const isWhite = opening.color === 'white';

  function handleLongPress() {
    Alert.alert(
      'Delete Opening',
      `Delete "${opening.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      className="bg-bg-surface border border-border rounded-xl overflow-hidden active:opacity-80"
    >
      {/* Color stripe */}
      <View className={`h-1 ${isWhite ? 'bg-gold' : 'bg-accent'}`} />

      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Text className={`text-lg ${isWhite ? 'text-gold' : 'text-accent'}`}>
            {isWhite ? '♔' : '♚'}
          </Text>
          <Text className="text-content-primary font-medium flex-1">{opening.name}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="bg-bg-elevated px-2 py-1 rounded-md">
            <Text className="text-content-muted text-xs">{opening.nodeCount} moves</Text>
          </View>
          {opening.dueCount > 0 && (
            <View className="bg-gold/15 px-2 py-1 rounded-md">
              <Text className="text-gold text-xs font-medium">{opening.dueCount} due</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ── Create Opening Modal ────────────────────────────────────────────────────

function CreateOpeningModal({
  defaultColor,
  onClose,
  onCreated,
}: {
  defaultColor: Tab;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<'white' | 'black'>(defaultColor);
  const [pgn, setPgn] = useState('');
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    setProgress(null);
    setError(null);
    try {
      await createOpening(name.trim(), color, pgn.trim() || null, setProgress);
      onCreated();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create opening');
      setSaving(false);
      setProgress(null);
    }
  }

  const progressPct =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <Modal visible animationType="slide" transparent>
      <Pressable
        className="flex-1 bg-black/60 justify-end"
        onPress={saving ? undefined : onClose}
      >
        <Pressable
          className="bg-bg-surface border-t border-border rounded-t-2xl"
          onPress={() => {}} // prevent close on inner press
        >
          {/* Header stripe */}
          <View className="flex-row gap-1 px-6 pt-6 mb-4">
            <View className="h-1 flex-1 rounded-full bg-accent" />
            <View className="h-1 flex-1 rounded-full bg-gold" />
            <View className="h-1 flex-1 rounded-full bg-accent-dim" />
          </View>

          <View className="px-6 pb-8">
            <Text className="text-content-primary text-lg font-semibold mb-4">
              New Opening
            </Text>

            {saving ? (
              <View className="py-6 gap-3">
                <Text className="text-content-secondary text-sm text-center">
                  {progress?.phase === 'parsing'
                    ? 'Parsing PGN...'
                    : progress
                      ? `Importing moves... ${progress.current} / ${progress.total}`
                      : 'Creating...'}
                </Text>
                <View className="bg-bg-elevated rounded-full h-2 overflow-hidden">
                  {progress?.phase === 'importing' && progress.total > 0 ? (
                    <View
                      className="bg-accent h-full rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  ) : (
                    <View className="bg-gold h-full rounded-full w-full opacity-60" />
                  )}
                </View>
              </View>
            ) : (
              <View className="gap-4">
                {/* Name */}
                <View>
                  <Text className="text-content-secondary text-sm mb-1">Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Sicilian Najdorf"
                    placeholderTextColor={colorTheme.content.muted}
                    className="bg-bg-elevated border border-border rounded-xl px-3 py-3 text-content-primary text-sm"
                    autoFocus
                  />
                </View>

                {/* Color */}
                <View>
                  <Text className="text-content-secondary text-sm mb-1">Color</Text>
                  <View className="flex-row gap-2">
                    {(['white', 'black'] as const).map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setColor(c)}
                        className={[
                          'flex-1 py-2.5 rounded-xl items-center border',
                          color === c
                            ? c === 'white'
                              ? 'border-gold bg-gold/10'
                              : 'border-accent bg-accent/10'
                            : 'border-border',
                        ].join(' ')}
                      >
                        <Text
                          className={[
                            'text-sm font-medium',
                            color === c
                              ? c === 'white'
                                ? 'text-gold'
                                : 'text-accent'
                              : 'text-content-muted',
                          ].join(' ')}
                        >
                          {c === 'white' ? '♔ White' : '♚ Black'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* PGN */}
                <View>
                  <Text className="text-content-secondary text-sm mb-1">
                    PGN{' '}
                    <Text className="text-content-muted">(optional)</Text>
                  </Text>
                  <TextInput
                    value={pgn}
                    onChangeText={setPgn}
                    placeholder={"Paste one or multiple games."}
                    placeholderTextColor={colorTheme.content.muted}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    className="bg-bg-elevated border border-border rounded-xl px-3 py-3 text-content-primary text-sm font-mono min-h-[120px]"
                  />
                </View>

                {error && <Text className="text-danger text-sm">{error}</Text>}

                {/* Actions */}
                <View className="flex-row gap-3 justify-end mt-2">
                  <Pressable onPress={onClose} className="px-4 py-2.5 active:opacity-70">
                    <Text className="text-content-secondary text-sm">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!name.trim()}
                    className="px-5 py-2.5 bg-accent rounded-xl active:opacity-80 disabled:opacity-50"
                  >
                    <Text className="text-bg-base text-sm font-medium">Create</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
