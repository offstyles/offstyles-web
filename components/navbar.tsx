"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Trophy, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Records",
      href: "/records",
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      name: "Search",
      href: "/players",
      icon: <Search className="h-4 w-4" />,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="h-4 w-4" />,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden">
      <div className="flex h-14 items-center px-2 sm:px-4 w-full">
        <Link href="/" className="flex items-center space-x-2 font-bold whitespace-nowrap shrink-0 mr-2">
          <span className="text-xl hidden md:inline">Offstyles DB</span>
          <span className="text-xl md:hidden">ODB</span>
        </Link>
        <nav className="flex items-center space-x-2 mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center px-1.5 sm:px-2 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent shrink-0",
                pathname === item.href 
                  ? "bg-accent text-accent-foreground min-w-[32px] w-auto max-w-[120px]" 
                  : "text-muted-foreground w-8 md:w-auto md:px-3",
              )}
            >
              {item.icon}
              <span className={cn(
                "ml-2 transition-opacity truncate",
                pathname === item.href 
                  ? "opacity-100 inline-block" 
                  : "opacity-0 hidden md:inline-block md:opacity-100"
              )}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild className="whitespace-nowrap hidden md:inline-flex">
            <Link href="/profile">Login with Steam</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="whitespace-nowrap md:hidden">
            <Link href="/profile">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
