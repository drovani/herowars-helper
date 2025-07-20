// ABOUTME: Team builder component for team creation and editing
// ABOUTME: Handles hero selection from user collection with search/filter and team validation

import { useState } from "react"
import { SearchIcon, PlusIcon } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import { TeamHeroDisplay } from "./TeamHeroDisplay"
import type { PlayerTeamHero, Hero, PlayerHeroWithDetails } from "~/repositories/types"

interface TeamBuilderProps {
  teamName: string
  teamDescription: string
  teamHeroes: Array<PlayerTeamHero & { hero: Hero }>
  availableHeroes: PlayerHeroWithDetails[]
  onTeamNameChange: (name: string) => void
  onTeamDescriptionChange: (description: string) => void
  onAddHero: (heroSlug: string) => void
  onRemoveHero: (heroSlug: string) => void
  addingHeroSlug?: string
  removingHeroSlug?: string
  isSubmitting?: boolean
}

export function TeamBuilder({
  teamName,
  teamDescription,
  teamHeroes,
  availableHeroes,
  onTeamNameChange,
  onTeamDescriptionChange,
  onAddHero,
  onRemoveHero,
  addingHeroSlug,
  removingHeroSlug,
  isSubmitting = false
}: TeamBuilderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [factionFilter, setFactionFilter] = useState("all")

  const teamHeroSlugs = new Set(teamHeroes.map(th => th.hero_slug))
  const isTeamComplete = teamHeroes.length >= 5

  // Filter available heroes
  const filteredHeroes = availableHeroes.filter(playerHero => {
    // Exclude heroes already in team
    if (teamHeroSlugs.has(playerHero.hero_slug)) return false
    
    // Search filter
    if (searchTerm && !playerHero.hero.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Class filter
    if (classFilter !== "all" && playerHero.hero.class !== classFilter) {
      return false
    }
    
    // Faction filter
    if (factionFilter !== "all" && playerHero.hero.faction !== factionFilter) {
      return false
    }
    
    return true
  })

  // Get unique classes and factions for filters
  const uniqueClasses = [...new Set(availableHeroes.map(h => h.hero.class))].sort()
  const uniqueFactions = [...new Set(availableHeroes.map(h => h.hero.faction))].sort()

  const handleAddHero = (heroSlug: string) => {
    if (!isTeamComplete && !addingHeroSlug) {
      onAddHero(heroSlug)
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Details */}
      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
          <CardDescription>
            Set your team name and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              placeholder="Enter team name (e.g., Team 1)"
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="team-description">Description (Optional)</Label>
            <Textarea
              id="team-description"
              value={teamDescription}
              onChange={(e) => onTeamDescriptionChange(e.target.value)}
              placeholder="Describe your team strategy..."
              maxLength={500}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Formation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Team Formation
            <Badge variant={isTeamComplete ? "success" : "outline"}>
              {teamHeroes.length}/5 Heroes
            </Badge>
          </CardTitle>
          <CardDescription>
            Heroes are automatically ordered by rank (highest to lowest, left to right)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamHeroDisplay
            teamHeroes={teamHeroes}
            onRemoveHero={onRemoveHero}
            removingHeroSlug={removingHeroSlug}
            className="justify-center"
          />
          
          {isTeamComplete && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800 font-medium">
                ✓ Team Complete!
              </div>
              <div className="text-sm text-green-700">
                Your team has 5 heroes and is ready for battle.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hero Selection */}
      {!isTeamComplete && (
        <Card>
          <CardHeader>
            <CardTitle>Add Heroes</CardTitle>
            <CardDescription>
              Select heroes from your collection to add to the team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search heroes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map(cls => (
                    <SelectItem key={cls} value={cls} className="capitalize">
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={factionFilter} onValueChange={setFactionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by faction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Factions</SelectItem>
                  {uniqueFactions.map(faction => (
                    <SelectItem key={faction} value={faction} className="capitalize">
                      {faction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            {/* Available Heroes List */}
            <ScrollArea className="h-60 w-full">
              <div className="space-y-2">
                {filteredHeroes.length > 0 ? (
                  filteredHeroes.map((playerHero) => (
                    <div
                      key={playerHero.hero_slug}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="font-medium">{playerHero.hero.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <span className="capitalize">{playerHero.hero.class}</span>
                            {" • "}
                            <span className="capitalize">{playerHero.hero.faction}</span>
                            {" • "}
                            Rank: {playerHero.hero.order_rank}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {playerHero.stars}★
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            Level {playerHero.equipment_level}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleAddHero(playerHero.hero_slug)}
                        disabled={addingHeroSlug === playerHero.hero_slug}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        {addingHeroSlug === playerHero.hero_slug ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {availableHeroes.length === 0 ? (
                      <div>
                        <div className="font-medium">No Heroes Available</div>
                        <div className="text-sm">
                          Add heroes to your collection first.
                        </div>
                      </div>
                    ) : teamHeroSlugs.size === availableHeroes.length ? (
                      <div>
                        <div className="font-medium">All Heroes Added</div>
                        <div className="text-sm">
                          All your heroes are already in teams.
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">No Heroes Match Filters</div>
                        <div className="text-sm">
                          Try adjusting your search or filter criteria.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}