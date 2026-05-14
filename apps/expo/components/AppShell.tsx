import { SafeAreaView } from 'react-native-safe-area-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  return <SafeAreaView className="flex-1 bg-bg-base">{children}</SafeAreaView>;
}
