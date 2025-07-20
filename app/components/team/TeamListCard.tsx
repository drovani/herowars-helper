// ABOUTME: Team list card component for displaying team summary information
// ABOUTME: Shows team name, hero count, last modified date with edit/delete actions

import { Link } from "react-router"
import { MoreHorizontalIcon, PencilIcon, TrashIcon, UsersIcon } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import type { TeamWithHeroes } from "~/repositories/types"

interface TeamListCardProps {
  team: TeamWithHeroes
  onEdit: (teamId: string) => void
  onDelete: (teamId: string) => void
  isDeleting?: boolean
}

export function TeamListCard({ team, onEdit, onDelete, isDeleting = false }: TeamListCardProps) {
  const heroCount = team.heroes.length
  const isComplete = heroCount === 5
  const lastModified = team.updated_at ? new Date(team.updated_at) : new Date(team.created_at || '')

  const formatLastModified = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    onEdit(team.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    onDelete(team.id)
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">
            <Link 
              to={`/player/teams/${team.id}`}
              className="hover:text-primary transition-colors"
            >
              {team.name}
            </Link>
          </CardTitle>
          {team.description && (
            <CardDescription className="text-sm">
              {team.description}
            </CardDescription>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isDeleting}
            >
              <MoreHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Open team menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Team
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
              disabled={isDeleting}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete Team'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {heroCount} of 5 heroes
            </span>
            {isComplete && (
              <Badge variant="success" className="text-xs">
                Complete
              </Badge>
            )}
            {heroCount === 0 && (
              <Badge variant="outline" className="text-xs">
                Empty
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {formatLastModified(lastModified)}
          </div>
        </div>
        
        {/* Hero preview - show first few hero names */}
        {heroCount > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap gap-1">
              {team.heroes.slice(0, 3).map((teamHero) => (
                <Badge key={teamHero.id} variant="secondary" className="text-xs">
                  {teamHero.hero.name}
                </Badge>
              ))}
              {heroCount > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{heroCount - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}