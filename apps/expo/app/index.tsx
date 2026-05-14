import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/hooks/useAppTheme';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-base">
        <ActivityIndicator color={colors.accent.default} size="large" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)/library' : '/(auth)/login'} />;
}
