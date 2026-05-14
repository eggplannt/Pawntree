import { View, Text } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { user } = useAuth();
  return (
    <AppShell>
      <View className="flex-1 bg-bg-base p-8">
        <Text className="text-content-primary text-2xl font-semibold mb-2">Settings</Text>
        {user && <Text className="text-content-secondary text-sm mb-4">{user.email}</Text>}
        <Text className="text-content-muted text-sm">More settings coming in Phase 7.</Text>
      </View>
    </AppShell>
  );
}
