// ABOUTME: Team edit page with team builder interface for existing teams
// ABOUTME: Allows users to modify team details and hero composition

import { ArrowLeftIcon, SaveIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useFetcher, useNavigate } from "react-router"
import { TeamBuilder } from "~/components/team/TeamBuilder"
import { Button } from "~/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { formatTitle } from "~/config/site"
import { useAuth } from "~/contexts/AuthContext"
import { getAuthenticatedUser, requireAuthenticatedUser } from "~/lib/auth/utils"
import { PlayerHeroRepository } from "~/repositories/PlayerHeroRepository"
import { PlayerTeamRepository } from "~/repositories/PlayerTeamRepository"
import type { Route } from "./+types/$teamId.edit"

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { user } = await getAuthenticatedUser(request)

  if (!user) {
    throw new Response("Authentication required", { status: 401 })
  }

  const teamId = params.teamId
  if (!teamId) {
    throw new Response("Team ID is required", { status: 400 })
  }

  const teamRepo = new PlayerTeamRepository(request)
  const playerHeroRepo = new PlayerHeroRepository(request)

  // Load the team with its heroes
  const teamResult = await teamRepo.findTeamWithHeroes(teamId, user.id)
  if (teamResult.error || !teamResult.data) {
    throw new Response("Team not found", { status: 404 })
  }

  // Load user's hero collection for team building
  const collectionResult = await playerHeroRepo.findWithHeroDetails(user.id)
  if (collectionResult.error) {
    throw new Response("Failed to load hero collection", { status: 500 })
  }

  return {
    team: teamResult.data,
    userHeroes: collectionResult.data || []
  }
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireAuthenticatedUser(request)
  const teamId = params.teamId!
  const formData = await request.formData()
  const action = formData.get('action')

  const teamRepo = new PlayerTeamRepository(request)

  switch (action) {
    case 'updateTeam': {
      const name = formData.get('name') as string
      const description = formData.get('description') as string

      // Update team details
      const updateResult = await teamRepo.updateTeam(teamId, user.id, {
        name: name || undefined,
        description: description || undefined
      })

      if (updateResult.error) {
        return { error: updateResult.error.message }
      }

      return {
        success: true,
        message: `Team "${updateResult.data!.name}" updated successfully`
      }
    }

    case 'addHero': {
      const heroSlug = formData.get('heroSlug') as string

      if (!heroSlug) {
        return { error: 'Hero slug is required' }
      }

      const result = await teamRepo.addHeroToTeam(teamId, user.id, { hero_slug: heroSlug })

      if (result.error) {
        return { error: result.error.message }
      }

      return {
        success: true,
        message: 'Hero added to team'
      }
    }

    case 'removeHero': {
      const heroSlug = formData.get('heroSlug') as string

      if (!heroSlug) {
        return { error: 'Hero slug is required' }
      }

      const result = await teamRepo.removeHeroFromTeam(teamId, user.id, heroSlug)

      if (result.error) {
        return { error: result.error.message }
      }

      return {
        success: true,
        message: 'Hero removed from team'
      }
    }

    default:
      return { error: 'Invalid action' }
  }
}

export const meta = ({ data }: Route.MetaArgs) => {
  const teamName = data?.team?.name || 'Team'
  return [{ title: formatTitle(`Edit ${teamName}`) }]
}

export default function TeamEdit({ loaderData }: Route.ComponentProps) {
  const { team, userHeroes } = loaderData
  const { user, isLoading: authLoading } = useAuth()
  const fetcher = useFetcher()
  const navigate = useNavigate()

  const [teamName, setTeamName] = useState(team.name)
  const [teamDescription, setTeamDescription] = useState(team.description || "")
  const [addingHeroSlug, setAddingHeroSlug] = useState<string | undefined>(undefined)
  const [removingHeroSlug, setRemovingHeroSlug] = useState<string | undefined>(undefined)

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Loading team editor.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to edit teams.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleAddHero = (heroSlug: string) => {
    setAddingHeroSlug(heroSlug)
    fetcher.submit(
      { action: 'addHero', heroSlug },
      { method: 'POST' }
    )
  }

  const handleRemoveHero = (heroSlug: string) => {
    setRemovingHeroSlug(heroSlug)
    fetcher.submit(
      { action: 'removeHero', heroSlug },
      { method: 'POST' }
    )
  }

  const handleUpdateTeam = () => {
    fetcher.submit(
      {
        action: 'updateTeam',
        name: teamName,
        description: teamDescription
      },
      { method: 'POST' }
    )
  }

  const handleGoBack = () => {
    navigate('/player/teams')
  }

  // Reset loading states when fetcher completes
  useEffect(() => {
    if (fetcher.state === 'idle') {
      setAddingHeroSlug(undefined)
      setRemovingHeroSlug(undefined)
    }
  }, [fetcher.state])

  const isSubmitting = fetcher.state === 'submitting'
  const hasChanges = teamName !== team.name || teamDescription !== (team.description || "")

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Team</h1>
            <p className="text-muted-foreground">
              Modify your team composition and details
            </p>
          </div>
        </div>

        <Button
          onClick={handleUpdateTeam}
          disabled={!hasChanges || isSubmitting}
        >
          <SaveIcon className="mr-2 h-4 w-4" />
          {isSubmitting && fetcher.formData?.get('action') === 'updateTeam'
            ? 'Saving...'
            : 'Save Changes'
          }
        </Button>
      </div>

      {/* Team Builder */}
      <TeamBuilder
        teamName={teamName}
        teamDescription={teamDescription}
        teamHeroes={team.heroes}
        availableHeroes={userHeroes}
        onTeamNameChange={setTeamName}
        onTeamDescriptionChange={setTeamDescription}
        onAddHero={handleAddHero}
        onRemoveHero={handleRemoveHero}
        addingHeroSlug={addingHeroSlug}
        removingHeroSlug={removingHeroSlug}
        isSubmitting={isSubmitting}
      />

      {/* Action feedback */}
      {fetcher.data?.error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
          {fetcher.data.error}
        </div>
      )}

      {fetcher.data?.success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          {fetcher.data.message}
        </div>
      )}
    </div>
  )
}