"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Download, Check, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Mock data - in a real app, this would come from your database
const mockMaps = [
  { id: "bhop_eazy", name: "bhop_eazy" },
  { id: "bhop_arcane", name: "bhop_arcane" },
  { id: "bhop_exodus", name: "bhop_exodus" },
  { id: "bhop_badges", name: "bhop_badges" },
]

const mockStyles = [
  { id: "normal", name: "Normal" },
  { id: "a-only", name: "A-Only" },
  { id: "w-only", name: "W-Only" },
  { id: "sideways", name: "Sideways" },
  { id: "half-sideways", name: "Half-Sideways" },
]

const mockRecords = [
  { rank: 1, player: "fastbunny", time: "00:12.345", date: "2023-04-15", hasReplay: true },
  { rank: 2, player: "hopperman", time: "00:12.678", date: "2023-03-22", hasReplay: true },
  { rank: 3, player: "jumpking", time: "00:13.012", date: "2023-05-01", hasReplay: true },
  { rank: 4, player: "airstrafe", time: "00:13.456", date: "2023-04-28", hasReplay: false },
  { rank: 5, player: "bhopgod", time: "00:13.789", date: "2023-02-14", hasReplay: true },
]

export default function RecordsPage() {
  const [open, setOpen] = useState(false)
  const [selectedMap, setSelectedMap] = useState("bhop_eazy")

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Records</h1>
        <p className="text-muted-foreground">Browse world records for maps across different styles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Records</CardTitle>
          <CardDescription>Select a map and style to view the leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="map" className="text-sm font-medium">
                Map
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedMap ? mockMaps.find((map) => map.id === selectedMap)?.name : "Type to search..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search maps..." />
                    <CommandList>
                      <CommandEmpty>No map found.</CommandEmpty>
                      <CommandGroup>
                        {mockMaps.map((map) => (
                          <CommandItem
                            key={map.id}
                            value={map.id}
                            onSelect={(currentValue) => {
                              setSelectedMap(currentValue === selectedMap ? "" : currentValue)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", selectedMap === map.id ? "opacity-100" : "opacity-0")}
                            />
                            {map.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label htmlFor="style" className="text-sm font-medium">
                Style
              </label>
              <Select defaultValue="normal">
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {mockStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>bhop_eazy - Normal</CardTitle>
          <CardDescription>Top 5 times for this map and style</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecords.map((record) => (
                <TableRow key={record.rank}>
                  <TableCell className="font-medium">{record.rank}</TableCell>
                  <TableCell>
                    <Link href={`/players/${record.player}`} className="text-primary hover:underline">
                      {record.player}
                    </Link>
                  </TableCell>
                  <TableCell>{record.time}</TableCell>
                  <TableCell>{record.date}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
