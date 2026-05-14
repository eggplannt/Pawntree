import { View, Text, Pressable } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  return (
    <AppShell>
      <View className="flex-1 bg-bg-base p-8">
        <Text className="text-content-primary text-2xl font-semibold mb-2">Settings</Text>
        {user && <Text className="text-content-secondary text-sm mb-4">{user.email}</Text>}
        <Text className="text-content-muted text-sm mb-8">More settings coming in Phase 7.</Text>
        <Pressable
          onPress={signOut}
          className="items-center justify-center bg-bg-elevated border border-border rounded-lg h-12 active:opacity-70"
        >
          <Text className="text-red-400 font-medium text-base">Sign Out</Text>
        </Pressable>
      </View>
    </AppShell>
  );
}
