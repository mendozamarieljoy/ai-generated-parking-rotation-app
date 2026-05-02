export function Footer() {
  return (
    <footer className="w-full bg-zinc-200 px-6 py-4 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Mariel Joy Mendoza • Built with AI
          assistance
        </p>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
