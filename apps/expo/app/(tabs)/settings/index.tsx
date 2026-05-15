import { View, Text, Pressable } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  return (
    <AppShell>
      <View className="flex-1 bg-bg-base p-8">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-content-muted text-lg">⚙</Text>
          <Text className="text-content-primary text-2xl font-semibold">Settings</Text>
        </View>
        {user && <Text className="text-content-secondary text-sm mb-4">{user.email}</Text>}
        <Text className="text-content-muted text-sm mb-8">More settings coming in Phase 7.</Text>
        <Pressable
          onPress={signOut}
          className="items-center justify-center bg-bg-elevated border border-border rounded-xl h-12 active:opacity-70"
        >
          <Text className="text-danger font-medium text-base">Sign Out</Text>
        </Pressable>
      </View>
    </AppShell>
  );
}
