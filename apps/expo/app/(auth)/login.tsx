import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { colorTheme } from '@/hooks/useColorTheme';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-bg-base px-8">
      <View style={{ width: '100%', maxWidth: 380 }}>
        <Text className="text-accent text-4xl font-bold mb-3">Pawntree</Text>
        <Text className="text-content-secondary text-base leading-6 mb-10">
          Build your opening repertoire. Train with spaced repetition.
        </Text>

        {loading ? (
          <ActivityIndicator color={colorTheme.accent.default} />
        ) : (
          <Pressable
            onPress={handleLogin}
            className="flex-row items-center justify-center gap-3 bg-bg-elevated border border-border rounded-lg px-5 h-12 active:opacity-70"
          >
            <Text className="text-lg">G</Text>
            <Text className="text-content-primary font-medium text-base">
              Continue with Google
            </Text>
          </Pressable>
        )}

        <Text className="text-content-muted text-xs text-center mt-8 leading-5">
          By signing in you agree to the terms of service.{'\n'}
          Your data stays on your instance.
        </Text>
      </View>
    </View>
  );
}
