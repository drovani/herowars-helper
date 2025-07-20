// ABOUTME: Team creation page with team builder interface
// ABOUTME: Allows users to create new teams with name, description, and hero selection

import { useState } from "react"
import { useFetcher, useLoaderData, useNavigate } from "react-router"
import { ArrowLeftIcon, SaveIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { TeamBuilder } from "~/components/team/TeamBuilder"
import { formatTitle } from "~/config/site"
import { useAuth } from "~/contexts/AuthContext"
import { getAuthenticatedUser, requireAuthenticatedUser } from "~/lib/auth/utils"
import { PlayerTeamRepository } from "~/repositories/PlayerTeamRepository"
import { PlayerHeroRepository } from "~/repositories/PlayerHeroRepository"
import type { Route } from "./+types/new"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user } = await getAuthenticatedUser(request)
  
  if (!user) {
    throw new Response("Authentication required", { status: 401 })
  }

  // Load user's hero collection for team building
  const playerHeroRepo = new PlayerHeroRepository(request)
  const collectionResult = await playerHeroRepo.findWithHeroDetails(user.id)

  if (collectionResult.error) {
    throw new Response("Failed to load hero collection", { status: 500 })
  }

  return { 
    userHeroes: collectionResult.data || []
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await requireAuthenticatedUser(request)
  const formData = await request.formData()
  const action = formData.get('action')
  
  const teamRepo = new PlayerTeamRepository(request)

  switch (action) {
    case 'createTeam': {
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const heroSlugs = formData.getAll('heroSlugs') as string[]
      
      // Create the team first
      const teamResult = await teamRepo.createTeam(user.id, {
        name: name || '', // Will auto-generate if empty
        description: description || undefined
      })

      if (teamResult.error) {
        return { error: teamResult.error.message }
      }

      const teamId = teamResult.data!.id

      // Add heroes to the team
      if (heroSlugs.length > 0) {
        for (const heroSlug of heroSlugs) {
          const addResult = await teamRepo.addHeroToTeam(teamId, user.id, { hero_slug: heroSlug })
          if (addResult.error) {
            // If adding heroes fails, we should probably clean up the team
            await teamRepo.deleteTeam(teamId, user.id)
            return { error: `Failed to add hero ${heroSlug}: ${addResult.error.message}` }
          }
        }
      }

      return { 
        success: true, 
        teamId,
        message: `Team "${teamResult.data!.name}" created successfully`,
        redirect: `/player/teams`
      }
    }

    default:
      return { error: 'Invalid action' }
  }
}

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle('Create Team') }]
}

export default function TeamNew({ loaderData }: Route.ComponentProps) {
  const { userHeroes } = loaderData
  const { user, isLoading: authLoading } = useAuth()
  const fetcher = useFetcher()
  const navigate = useNavigate()
  
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([])

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Loading team creation interface.
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
              You must be logged in to create teams.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleAddHero = (heroSlug: string) => {
    if (selectedHeroes.length < 5 && !selectedHeroes.includes(heroSlug)) {
      setSelectedHeroes([...selectedHeroes, heroSlug])
    }
  }

  const handleRemoveHero = (heroSlug: string) => {
    setSelectedHeroes(selectedHeroes.filter(slug => slug !== heroSlug))
  }

  const handleSubmit = () => {
    const formData = new FormData()
    formData.append('action', 'createTeam')
    formData.append('name', teamName)
    formData.append('description', teamDescription)
    
    selectedHeroes.forEach(heroSlug => {
      formData.append('heroSlugs', heroSlug)
    })

    fetcher.submit(formData, { method: 'POST' })
  }

  const handleGoBack = () => {
    navigate('/player/teams')
  }

  // Convert selected hero slugs to team hero format for display
  const teamHeroes = selectedHeroes.map(heroSlug => {
    const playerHero = userHeroes.find((ph: any) => ph.hero_slug === heroSlug)
    if (!playerHero) return null
    
    return {
      id: `temp-${heroSlug}`,
      team_id: 'temp',
      hero_slug: heroSlug,
      created_at: new Date().toISOString(),
      hero: playerHero.hero
    }
  }).filter(Boolean) as any[]

  const isSubmitting = fetcher.state === 'submitting'
  const canSave = teamName.trim() !== '' || selectedHeroes.length > 0

  // Handle successful creation
  if (fetcher.data?.success && fetcher.data?.redirect) {
    navigate(fetcher.data.redirect)
  }

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
            <h1 className="text-2xl font-bold">Create New Team</h1>
            <p className="text-muted-foreground">
              Build your perfect team of up to 5 heroes
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={!canSave || isSubmitting}
        >
          <SaveIcon className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Creating...' : 'Create Team'}
        </Button>
      </div>

      {/* Team Builder */}
      <TeamBuilder
        teamName={teamName}
        teamDescription={teamDescription}
        teamHeroes={teamHeroes}
        availableHeroes={userHeroes}
        onTeamNameChange={setTeamName}
        onTeamDescriptionChange={setTeamDescription}
        onAddHero={handleAddHero}
        onRemoveHero={handleRemoveHero}
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