export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/95 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} PhishLens AI. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
