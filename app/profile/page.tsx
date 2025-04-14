"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ComputerIcon as Steam, Eye, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data - in a real app, this would come from your database
const mockUser = {
  id: "user123",
  name: "YourUsername",
  avatarUrl: "/placeholder.svg?height=100&width=100",
  country: "United States",
  joined: "2022-05-15",
  totalRuns: 845,
  worldRecords: 3,
  sensitivity: "2.2",
  dpi: "800",
  preferredStyles: ["Normal", "W-Only"],
  isLoggedIn: false,
}

const mockRecords = [
  { map: "bhop_eazy", style: "Normal", rank: 3, time: "00:13.456", date: "2023-04-15", hasReplay: true },
  { map: "bhop_arcane", style: "W-Only", rank: 1, time: "00:25.678", date: "2023-03-22", hasReplay: true },
  { map: "bhop_exodus", style: "Normal", rank: 5, time: "00:32.012", date: "2023-05-01", hasReplay: false },
]

const countries = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
  { value: "br", label: "Brazil" },
]

export default function ProfilePage() {
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(mockUser.isLoggedIn)
  const [profileData, setProfileData] = useState({
    sensitivity: mockUser.sensitivity,
    dpi: mockUser.dpi,
    country: "us",
  })

  const handleLogin = () => {
    // In a real app, this would redirect to Steam authentication
    toast({
      title: "Steam Login",
      description: "In a real app, this would redirect to Steam authentication.",
    })

    // For demo purposes, we'll just set the user as logged in
    setIsLoggedIn(true)
  }

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login with your Steam account to view and edit your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleLogin} className="flex items-center space-x-2">
              <Steam className="h-5 w-5" />
              <span>Login with Steam</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">View and edit your profile information</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={mockUser.avatarUrl || "/placeholder.svg"} alt={mockUser.name} />
                    <AvatarFallback>{mockUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-center">{mockUser.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-24">Country:</span>
                    <span>{mockUser.country}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-24">Joined:</span>
                    <span>{mockUser.joined}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-24">Total Runs:</span>
                    <span>{mockUser.totalRuns}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-24">World Records:</span>
                    <span>{mockUser.worldRecords}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-24">Sensitivity:</span>
                    <span>
                      {mockUser.sensitivity} @ {mockUser.dpi} DPI
                    </span>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Preferred Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {mockUser.preferredStyles.map((style) => (
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
                <CardTitle>Your Records</CardTitle>
                <CardDescription>Your top records across all maps and styles</CardDescription>
              </CardHeader>
              <CardContent>
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
                        <TableCell>{record.map}</TableCell>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Customize your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={profileData.country}
                    onValueChange={(value) => setProfileData({ ...profileData, country: value })}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensitivity">Sensitivity</Label>
                  <Input
                    id="sensitivity"
                    type="text"
                    value={profileData.sensitivity}
                    onChange={(e) => setProfileData({ ...profileData, sensitivity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dpi">DPI</Label>
                  <Input
                    id="dpi"
                    type="text"
                    value={profileData.dpi}
                    onChange={(e) => setProfileData({ ...profileData, dpi: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferred Styles</CardTitle>
              <CardDescription>Select your preferred gameplay styles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Normal", "A-Only", "W-Only", "Sideways", "Half-Sideways"].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`style-${style}`}
                      className="h-4 w-4 rounded border-gray-300"
                      defaultChecked={mockUser.preferredStyles.includes(style)}
                    />
                    <Label htmlFor={`style-${style}`}>{style}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
