// Native deep link: pawntree://auth/callback?code=<pkce-code>
// openAuthSessionAsync in useAuth captures the redirect and calls
// supabase.auth.exchangeCodeForSession() before this screen renders.
// This screen only appears briefly and shows a spinner.
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colorTheme } from '@/hooks/useColorTheme';

export default function AuthCallbackScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colorTheme.accent.default} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorTheme.bg.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
