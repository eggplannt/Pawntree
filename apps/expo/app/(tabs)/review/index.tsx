import { View, Text } from 'react-native';
import { AppShell } from '@/components/AppShell';

export default function ReviewScreen() {
  return (
    <AppShell>
      <View className="flex-1 bg-bg-base p-8">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-gold text-lg">⚔</Text>
          <Text className="text-content-primary text-2xl font-semibold">Review</Text>
        </View>
        <Text className="text-content-secondary text-sm">Coming in Phase 6</Text>
      </View>
    </AppShell>
  );
}
