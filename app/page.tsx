import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Search, User } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-12 py-8">
      <div className="text-center space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">Offstyles Database</h1>
        <p className="text-xl text-muted-foreground">
          Track and compare speedrun times across different gameplay styles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <Trophy className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>World Records</CardTitle>
            <CardDescription>View and track world records</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse through all world records, filter by style, and see who holds the top spots.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/records">View Records</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <Search className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Player Lookup</CardTitle>
            <CardDescription>Find players and view their achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Search for players by name and view their personal records, favorite styles, and statistics.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/players">Find Players</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <User className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Customize your profile and track your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set your country flag, in-game sensitivity, and other preferences. Track your personal bests.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/profile">View Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">About Offstyles</h2>
        <p className="text-muted-foreground">
          gang shit
        </p>
      </div>
    </div>
  )
}
