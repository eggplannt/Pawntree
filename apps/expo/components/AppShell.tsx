import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Library',  href: '/(tabs)/library'  as const, icon: '⬡' },
  { label: 'Review',   href: '/(tabs)/review'   as const, icon: '◷' },
  { label: 'Settings', href: '/(tabs)/settings' as const, icon: '⚙' },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View className="flex-1 flex-row bg-bg-base">
      <Sidebar />
      <View className="flex-1">{children}</View>
    </View>
  );
}

function Sidebar() {
  const router = useRouter();
  const segments = useSegments();
  const { user, signOut } = useAuth();
  const currentTab = segments[1];

  return (
    <View className="w-56 bg-bg-surface border-r border-border py-6 flex-col">
      <View className="px-5 mb-8">
        <Text className="text-accent text-2xl font-bold">Pawntree</Text>
      </View>

      <View className="flex-1 px-3 gap-0.5">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = href.includes(String(currentTab));
          return (
            <Pressable
              key={label}
              onPress={() => router.push(href)}
              className={`flex-row items-center gap-3 px-3 py-2.5 rounded-lg ${active ? 'bg-bg-elevated' : 'active:bg-bg-elevated'}`}
            >
              <Text className={`text-base ${active ? 'text-accent' : 'text-content-muted'}`}>{icon}</Text>
              <Text className={`text-sm font-medium flex-1 ${active ? 'text-content-primary' : 'text-content-secondary'}`}>
                {label}
              </Text>
              {active && <View className="w-1 h-4 rounded-full bg-accent" />}
            </Pressable>
          );
        })}
      </View>

      {user && (
        <View className="px-3 pt-4 border-t border-border mt-4 gap-1">
          <Text className="text-content-muted text-xs px-3 pb-1" numberOfLines={1}>{user.email}</Text>
          <Pressable onPress={signOut} className="flex-row items-center gap-3 px-3 py-2.5 rounded-lg active:bg-bg-elevated">
            <Text className="text-content-muted">↩</Text>
            <Text className="text-content-secondary text-sm">Sign out</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
