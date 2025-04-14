import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app, this would come from your database
const mockPlayers = [
  { id: "fastbunny", name: "fastbunny", country: "US", records: 12, bestMap: "bhop_eazy" },
  { id: "hopperman", name: "hopperman", country: "DE", records: 8, bestMap: "bhop_arcane" },
  { id: "jumpking", name: "jumpking", country: "UK", records: 5, bestMap: "bhop_exodus" },
  { id: "airstrafe", name: "airstrafe", country: "FR", records: 3, bestMap: "bhop_badges" },
]

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Player Lookup</h1>
        <p className="text-muted-foreground">Find players and view their achievements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Players</CardTitle>
          <CardDescription>Enter a player name to find their profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" placeholder="Player name" />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Players</CardTitle>
          <CardDescription>Players with the most world records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockPlayers.map((player) => (
              <Link key={player.id} href={`/players/${player.id}`} className="block">
                <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold">{player.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{player.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {player.records} world records • Best map: {player.bestMap}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
