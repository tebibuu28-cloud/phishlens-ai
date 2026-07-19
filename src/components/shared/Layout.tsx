import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
