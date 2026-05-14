import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
  const { user, signOut } = useAuth();

  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-content-primary text-2xl font-semibold mb-2">Settings</h1>
        {user && (
          <p className="text-content-secondary text-sm mb-4">{user.email}</p>
        )}
        <p className="text-content-muted text-sm mb-8">More settings coming in Phase 7.</p>
        <button
          onClick={signOut}
          className="text-sm text-content-secondary hover:text-content-primary border border-border rounded-lg px-4 py-2 transition-colors"
        >
          Sign out
        </button>
      </div>
    </AppShell>
  );
}
