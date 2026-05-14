import { View, Text } from 'react-native';
import { AppShell } from '@/components/AppShell';

export default function LibraryScreen() {
  return (
    <AppShell>
      <View className="flex-1 bg-bg-base p-8">
        <Text className="text-content-primary text-2xl font-semibold mb-2">Library</Text>
        <Text className="text-content-secondary text-sm">Coming in Phase 3</Text>
      </View>
    </AppShell>
  );
}
