import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Library',  to: '/library',  icon: '⊞' },
  { label: 'Review',   to: '/review',   icon: '◷' },
  { label: 'Settings', to: '/settings', icon: '⚙' },
] as const;

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      {/* Desktop: sidebar layout (lg+) */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile: header + bottom nav */}
      <div className="flex lg:hidden flex-col h-full">
        <MobileHeader />
        <main className="flex-1 overflow-auto">{children}</main>
        <BottomNav />
      </div>
    </>
  );
}

function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-56 flex flex-col bg-bg-surface border-r border-border py-6 shrink-0">
      <div className="px-5 mb-8">
        <span className="text-accent text-[22px] font-bold tracking-tight">Pawntree</span>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-bg-elevated text-content-primary'
                  : 'text-content-secondary hover:bg-bg-elevated hover:text-content-primary',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-base leading-none">{icon}</span>
                <span className="flex-1">{label}</span>
                {isActive && (
                  <span className="w-1 h-4 rounded-sm bg-accent shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="px-5 pt-4 border-t border-border flex flex-col gap-2">
          <span className="text-content-muted text-xs truncate">{user.email}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-content-secondary text-sm hover:text-content-primary transition-colors py-1"
          >
            <span>↩</span>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

function MobileHeader() {
  return (
    <header className="h-13 bg-bg-surface border-b border-border flex items-center px-4 shrink-0">
      <span className="text-accent text-lg font-bold">Pawntree</span>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="bg-bg-surface border-t border-border flex shrink-0">
      {NAV_ITEMS.map(({ label, to, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive ? 'text-accent' : 'text-content-muted',
            ].join(' ')
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
