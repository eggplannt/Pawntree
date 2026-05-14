import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { storeToken } from '@/lib/api';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }

    storeToken(token as string).then(() => {
      // Reload so AuthProvider re-runs fetchMe with the new token
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      } else {
        router.replace('/(tabs)/library');
      }
    });
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#c8a96e" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', justifyContent: 'center', alignItems: 'center' },
});
