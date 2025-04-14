import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Flag, Trophy, Clock, Settings, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data - in a real app, this would come from your database
const mockPlayer = {
  id: "fastbunny",
  name: "fastbunny",
  avatarUrl: "/placeholder.svg?height=100&width=100",
  country: "United States",
  joined: "2022-05-15",
  totalRuns: 1245,
  worldRecords: 12,
  sensitivity: "2.5",
  dpi: "800",
  preferredStyles: ["Normal", "A-Only"],
}

const mockRecords = [
  { map: "bhop_eazy", style: "Normal", rank: 1, time: "00:12.345", date: "2023-04-15", hasReplay: true },
  { map: "bhop_arcane", style: "Normal", rank: 2, time: "00:23.678", date: "2023-03-22", hasReplay: true },
  { map: "bhop_exodus", style: "A-Only", rank: 1, time: "00:31.012", date: "2023-05-01", hasReplay: true },
  { map: "bhop_badges", style: "Normal", rank: 3, time: "00:18.456", date: "2023-04-28", hasReplay: false },
]

export default function PlayerPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the player data based on the ID
  const player = mockPlayer

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{player.name}'s Profile</h1>
        <p className="text-muted-foreground">View player stats and records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={player.avatarUrl || "/placeholder.svg"} alt={player.name} />
                <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-center">{player.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Flag className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{player.country}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Joined {player.joined}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{player.worldRecords} World Records</span>
              </div>
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  Sensitivity: {player.sensitivity} @ {player.dpi} DPI
                </span>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Preferred Styles</h3>
                <div className="flex flex-wrap gap-2">
                  {player.preferredStyles.map((style) => (
                    <Badge key={style} variant="secondary">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
            <CardDescription>Records and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="records">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="records">Top Records</TabsTrigger>
                <TabsTrigger value="recent">Recent Runs</TabsTrigger>
              </TabsList>
              <TabsContent value="records" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Map</TableHead>
                      <TableHead>Style</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Link href={`/records?map=${record.map}`} className="text-primary hover:underline">
                            {record.map}
                          </Link>
                        </TableCell>
                        <TableCell>{record.style}</TableCell>
                        <TableCell>
                          {record.rank === 1 ? (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">{record.rank}</Badge>
                          ) : (
                            <Badge variant="outline">{record.rank}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="icon" title="Watch Replay">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {record.hasReplay && (
                              <Button variant="outline" size="icon" title="Download Replay">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="recent" className="pt-4">
                <div className="text-center py-8 text-muted-foreground">Recent runs will be displayed here</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
