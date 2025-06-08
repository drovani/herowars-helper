import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Route } from "./+types/_index";

const recentUpdates = {
  asof: new Date("2025-5-20"),
  updates: [
    "Added equipment database for gray, green, blue, violet, and orange items with crafting trees",
    "Began inputting some hero information",
    "Improved mission browser with equipment drop locations",
    "Added Titan guide with upgrade priorities",
  ],
}
const roadmapSparkles = recentUpdates.asof > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

export default function Index(_: Route.ComponentProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Hero Wars: Alliance Helper</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your comprehensive companion for managing heroes, equipment, missions, and more in Hero Wars: Alliance
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">About the Game</TabsTrigger>
          <TabsTrigger value="app">About this App</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap
            {roadmapSparkles &&
              <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 ml-0.5" />
            }
          </TabsTrigger>
        </TabsList>

        {/* About the Game Tab */}
        <TabsContent value="about" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>What is Hero Wars: Alliance?</CardTitle>
              <CardDescription>
                A mobile RPG game with deep team-building mechanics and strategic combat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Hero Wars: Alliance is a popular mobile RPG where players collect heroes, upgrade their skills and equipment,
                and battle through campaigns, arena matches, and special events. The game features:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Card className="bg-muted/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Heroes Collection</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    Collect and evolve over 50 unique heroes with different abilities, classes, and factions
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Deep Equipment System</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    Craft and upgrade equipment to enhance your heroes' stats and abilities
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Strategic Combat</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    Build synergistic teams that combine different heroes' strengths and abilities
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Guild Gameplay</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    Join guilds to take on powerful Titans and participate in Guild Wars
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About this App Tab */}
        <TabsContent value="app" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>About the Helper App</CardTitle>
              <CardDescription>
                Your companion for optimizing hero builds and progression
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This application was created to help Hero Wars: Alliance players optimize their gameplay experience by providing:
              </p>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Hero Information Database</h3>
                    <p className="text-muted-foreground">Detailed profiles of all heroes with their stats, abilities, and optimal builds</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Equipment Tracker</h3>
                    <p className="text-muted-foreground">Track equipment sources, crafting requirements, and hero-specific gear</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Mission Guide</h3>
                    <p className="text-muted-foreground">Campaign mission information including rewards, bosses, and farming recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Titan Strategy</h3>
                    <p className="text-muted-foreground">Titan upgrade priorities and optimization guidance</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center mt-4">
                <Link
                  to="/heroes"
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                  Browse Heroes
                </Link>
                <Link
                  to="/equipment"
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                  View Equipment
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Development Roadmap</CardTitle>
              <CardDescription>
                Upcoming features and enhancements planned for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">Current Development</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Data Loader</span>
                        <p className="text-muted-foreground">Get the equipment, heroes, and missions data directly from the game files instead of hand keying everything.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Team Builder</span>
                        <p className="text-muted-foreground">Create and save custom team compositions with synergy analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Resource Calculator</span>
                        <p className="text-muted-foreground">Calculate resources needed to upgrade heroes and equipment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <span className="font-medium">User Accounts & Progress Tracking</span>
                        <p className="text-muted-foreground">Save your hero collection and track progression</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Future Plans</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Consumable Chest Advisor</span>
                        <p className="text-muted-foreground">Calculate how many artifact or stone skin chests you should open to get the number of resources you need.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">PvP Meta Analysis</span>
                        <p className="text-muted-foreground">Current Arena and Grand Arena meta teams and counters</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Hero Stats Calculator</span>
                        <p className="text-muted-foreground">Interactive calculator showing exact stats at different levels and equipment tiers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Interactive Guild War Planner</span>
                        <p className="text-muted-foreground">Collaborative tool for planning guild war attacks and defenses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t">
                <p className="text-center text-sm text-muted-foreground">
                  Have feature suggestions or feedback? Submit them on <a href="https://github.com/drovani/herowars-helper/issues" className="text-primary hover:underline">GitHub</a>!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Updates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Updates
            <Badge variant="outline" className="ml-2">{recentUpdates.asof.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentUpdates.updates.map((update, index) => (
              <li key={index} className="flex items-center gap-2">
                <Badge className="h-1.5 w-1.5 rounded-full p-0 bg-green-500" />
                {update}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground pt-4">
        <p>
          Hero Wars: Alliance Helper is a fan-made project and is not affiliated with or endorsed by the game developers.
        </p>
        <p className="mt-1">
          Created with 💜 by <a href="https://rovani.net" className="text-primary hover:underline">Rovani.net</a>
        </p>
      </footer>
    </div>
  );
}