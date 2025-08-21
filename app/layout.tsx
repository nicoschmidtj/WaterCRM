import "./globals.css";
import Link from "next/link";

export const metadata = { 
  title: "WaterCRM", 
  description: "Minimal CRM local para clientes, gestiones y hitos" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <div className="bg-noise">
          <div className="mx-auto max-w-7xl px-4 py-6 relative z-10">
            <header className="mb-8 flex items-center justify-between">
              <div className="text-xl md:text-2xl font-medium tracking-wide">WaterCRM</div>
              <nav className="flex items-center gap-4">
                <Link className="text-sm text-ink-muted hover:text-ink transition-colors" href="/">
                  Dashboard
                </Link>
                <Link className="text-sm text-ink-muted hover:text-ink transition-colors" href="/clientes">
                  Clientes
                </Link>
                <Link className="text-sm text-ink-muted hover:text-ink transition-colors" href="/gestiones">
                  Gestiones
                </Link>
                <Link className="text-sm text-ink-muted hover:text-ink transition-colors" href="/hitos">
                  Hitos
                </Link>
              </nav>
            </header>
            {children}
            <footer className="mt-12 text-sm text-ink-muted text-center">
              Local • sin login • UF/CLP opcional
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
