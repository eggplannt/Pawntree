import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/hooks/useAppTheme';

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
    <View className="flex-1 flex-row bg-bg-base">

      {/* Left panel — branding */}
      <View className="flex-1 bg-bg-surface border-r border-border items-center justify-center p-16" style={{ minWidth: 360 }}>
        <View style={{ maxWidth: 400, width: '100%' }}>
          <Text className="text-accent text-5xl font-bold mb-4">Pawntree</Text>
          <Text className="text-content-secondary text-xl leading-8 mb-12">
            Build your opening repertoire. Train with spaced repetition. Never forget a line again.
          </Text>
          <View className="gap-4">
            {[
              'Import or build opening trees from PGN',
              'Depth-first practice drills',
              'Anki-style daily review sessions',
            ].map((f) => (
              <View key={f} className="flex-row items-start gap-3">
                <Text className="text-accent mt-0.5">✦</Text>
                <Text className="text-content-secondary text-base flex-1">{f}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Right panel — sign in form */}
      <View className="flex-1 items-center justify-center p-10" style={{ minWidth: 320 }}>
        <View style={{ width: '100%', maxWidth: 380 }}>
          <Text className="text-content-primary text-3xl font-semibold mb-2">Sign in</Text>
          <Text className="text-content-secondary text-sm mb-8 leading-6">
            Continue with your Google account to access your repertoire.
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.accent.default} />
          ) : (
            <Pressable
              onPress={handleLogin}
              className="flex-row items-center justify-center gap-3 bg-bg-elevated border border-border rounded-lg px-5 h-12 active:opacity-80"
            >
              <Text className="text-lg">G</Text>
              <Text className="text-content-primary font-medium text-base">Continue with Google</Text>
            </Pressable>
          )}

          <Text className="text-content-muted text-xs text-center mt-8 leading-5">
            By signing in you agree to the terms of service.{'\n'}Your data stays on your instance.
          </Text>
        </View>
      </View>
    </View>
  );
}
