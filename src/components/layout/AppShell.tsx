import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Timer,
  Hand,
  Settings,
  Moon,
  Sun,
  Keyboard,
  Volume2,
  VolumeX,
  Anchor,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useSound } from '@/hooks/useSound';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/belajar', label: 'Kurikulum', icon: GraduationCap },
  { to: '/home-row', label: 'Home Row', sublabel: 'Posisi Dasar Jari Tangan', icon: Anchor },
  { to: '/tes', label: 'Tes Kecepatan', icon: Timer },
  { to: '/panduan', label: 'Panduan Jari', icon: Hand },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { soundTheme, changeSoundTheme } = useSound();

  const toggleSound = () => {
    changeSoundTheme(soundTheme === 'off' ? 'mechanical' : 'off');
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background text-foreground transition-colors">
      {/* Sidebar Desktop */}
      <aside className="border-b border-border bg-card/70 backdrop-blur-md md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center justify-between gap-2 p-4 md:p-6 border-b md:border-b-0 border-border">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                <Keyboard className="h-5 w-5" />
              </span>
              <div>
                <span className="text-lg font-bold tracking-tight block">asailmu</span>
                <span className="text-xs text-muted-foreground block font-medium">Master 10 Jari</span>
              </div>
            </Link>

            {/* Quick action buttons for mobile */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={toggleSound}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                aria-label="Toggle Sound"
              >
                {soundTheme === 'off' ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:px-4 md:py-2">
            {navItems.map(({ to, label, sublabel, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                title={sublabel ? `${label}: ${sublabel}` : label}
                className={({ isActive }) =>
                  `flex shrink-0 items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 text-left">
                        <span className="block truncate leading-tight">{label}</span>
                        {sublabel && (
                          <span
                            className={`hidden md:block text-[10px] truncate leading-tight mt-0.5 ${
                              isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }`}
                          >
                            {sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                    {sublabel && (
                      <span
                        className={`hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ml-1 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        Dasar
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer controls on desktop */}
        <div className="hidden md:flex flex-col gap-2 p-4 border-t border-border">
          {/* Sound button */}
          <button
            onClick={toggleSound}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              {soundTheme === 'off' ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
              <span>Efek Suara</span>
            </span>
            <span className="capitalize font-mono opacity-80">{soundTheme}</span>
          </button>

          {/* Theme button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
              <span>Mode Tampilan</span>
            </span>
            <span className="capitalize opacity-80">{isDark ? 'Gelap' : 'Terang'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-12 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
