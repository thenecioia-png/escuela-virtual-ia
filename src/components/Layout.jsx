import { useState } from 'react';
import { BookOpen, Home, Trophy, Users, Menu, X } from 'lucide-react';

export default function Layout({ children, currentView, onNavigate, profile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Mi Espacio', icon: Home },
    { id: 'learn', label: 'Aprender', icon: BookOpen },
    { id: 'progress', label: 'Logros', icon: Trophy },
    { id: 'parent', label: 'Papá/Mamá', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-[8%] text-2xl animate-float" style={{ animationDelay: '0s' }}>⭐</div>
        <div className="absolute top-32 left-[20%] text-xl animate-float" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="absolute top-20 right-[12%] text-2xl animate-float" style={{ animationDelay: '2s' }}>✨</div>
        <div className="absolute bottom-24 left-[15%] text-xl animate-float" style={{ animationDelay: '1.5s' }}>🦋</div>
        <div className="absolute bottom-32 right-[10%] text-2xl animate-float" style={{ animationDelay: '0.5s' }}>🌈</div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-forest-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦉</span>
          <h1 className="font-black text-forest-700 text-lg tracking-tight">Escuela Virtual Inteligente</h1>
        </div>
        {profile?.name && (
          <div className="flex items-center gap-2 bg-forest-50 rounded-full px-3 py-1">
            <span className="text-lg">{profile.avatar}</span>
            <span className="text-sm font-bold text-forest-700 hidden sm:inline">{profile.name}</span>
          </div>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl hover:bg-forest-50 transition-colors md:hidden">
          {menuOpen ? <X size={22} className="text-forest-700" /> : <Menu size={22} className="text-forest-700" />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden relative z-10 bg-white/95 backdrop-blur-md border-b border-forest-100 px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                currentView === item.id
                  ? 'bg-forest-500 text-white shadow-lg shadow-forest-500/20'
                  : 'text-forest-600 hover:bg-forest-50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Desktop nav + content */}
      <div className="flex flex-1 relative z-0">
        <nav className="hidden md:flex flex-col w-64 bg-white/60 backdrop-blur-sm border-r border-forest-100 p-4 gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                currentView === item.id
                  ? 'bg-forest-500 text-white shadow-lg shadow-forest-500/20'
                  : 'text-forest-600 hover:bg-forest-50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
