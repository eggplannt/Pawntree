import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const FEATURES = [
  'Import or build opening trees from PGN',
  'Depth-first practice drills',
  'Anki-style daily review sessions',
];

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setLoading(true);
    signInWithGoogle(); // full page redirect — never returns
  }

  return (
    <div className="h-full flex bg-bg-base">

      {/* Left panel — branding */}
      <div className="flex-1 hidden md:flex bg-bg-surface border-r border-border items-center justify-center p-16">
        <div className="max-w-sm w-full">
          <h1 className="text-accent text-5xl font-bold mb-4">Pawntree</h1>
          <p className="text-content-secondary text-xl leading-8 mb-12">
            Build your opening repertoire. Train with spaced repetition. Never forget a line again.
          </p>
          <ul className="flex flex-col gap-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="text-accent mt-1 leading-none">✦</span>
                <span className="text-content-secondary text-base">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — sign in */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <h1 className="text-accent text-4xl font-bold mb-2 md:hidden">Pawntree</h1>

          <h2 className="text-content-primary text-3xl font-semibold mb-2">Sign in</h2>
          <p className="text-content-secondary text-sm mb-8 leading-6">
            Continue with your Google account to access your repertoire.
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-bg-elevated border border-border rounded-lg px-5 h-12 text-content-primary font-medium text-base hover:bg-bg-surface transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          <p className="text-content-muted text-xs text-center mt-8 leading-5">
            By signing in you agree to the terms of service.
            <br />
            Your data stays on your instance.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
