import { View, Text } from 'react-native';
import { AppShell } from '@/components/AppShell';

export default function ReviewScreen() {
  return (
    <AppShell>
      <View className="flex-1 bg-bg-base p-8">
        <Text className="text-content-primary text-2xl font-semibold mb-2">Review</Text>
        <Text className="text-content-secondary text-sm">Coming in Phase 6</Text>
      </View>
    </AppShell>
  );
}
