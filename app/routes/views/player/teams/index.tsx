// ABOUTME: Team management index page showing user's teams with create/edit/delete actions
// ABOUTME: Main team list view with grid layout and team creation capabilities

import { useState } from "react"
import { useFetcher, useLoaderData } from "react-router"
import { PlusIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { TeamListCard } from "~/components/team/TeamListCard"
import { formatTitle } from "~/config/site"
import { useAuth } from "~/contexts/AuthContext"
import { getAuthenticatedUser, requireAuthenticatedUser } from "~/lib/auth/utils"
import { PlayerTeamRepository } from "~/repositories/PlayerTeamRepository"
import type { Route } from "./+types/index"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user } = await getAuthenticatedUser(request)
  
  if (!user) {
    throw new Response("Authentication required", { status: 401 })
  }

  const teamRepo = new PlayerTeamRepository(request)
  const teamsResult = await teamRepo.findByUserId(user.id)

  if (teamsResult.error) {
    throw new Response("Failed to load teams", { status: 500 })
  }

  return { teams: teamsResult.data || [] }
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
      
      const result = await teamRepo.createTeam(user.id, {
        name: name || '', // Will auto-generate if empty
        description: description || undefined
      })

      if (result.error) {
        return { error: result.error.message }
      }

      return { 
        success: true, 
        message: `Team "${result.data!.name}" created successfully`,
        teamId: result.data!.id
      }
    }

    case 'deleteTeam': {
      const teamId = formData.get('teamId') as string
      
      if (!teamId) {
        return { error: 'Team ID is required' }
      }

      const result = await teamRepo.deleteTeam(teamId, user.id)

      if (result.error) {
        return { error: result.error.message }
      }

      return { 
        success: true, 
        message: 'Team deleted successfully'
      }
    }

    default:
      return { error: 'Invalid action' }
  }
}

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle('Team Management') }]
}

export default function TeamsIndex({ loaderData }: Route.ComponentProps) {
  const { teams } = loaderData
  const { user, isLoading: authLoading } = useAuth()
  const fetcher = useFetcher()
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null)

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Loading your teams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to manage your teams.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleCreateTeam = () => {
    fetcher.submit(
      { action: 'createTeam', name: '', description: '' },
      { method: 'POST' }
    )
  }

  const handleEditTeam = (teamId: string) => {
    // Navigate to edit page
    window.location.href = `/player/teams/${teamId}/edit`
  }

  const handleDeleteTeam = (teamId: string) => {
    setDeleteTeamId(teamId)
  }

  const confirmDeleteTeam = () => {
    if (deleteTeamId) {
      fetcher.submit(
        { action: 'deleteTeam', teamId: deleteTeamId },
        { method: 'POST' }
      )
      setDeleteTeamId(null)
    }
  }

  const isCreatingTeam = fetcher.state === 'submitting' && fetcher.formData?.get('action') === 'createTeam'
  const isDeletingTeam = fetcher.state === 'submitting' && fetcher.formData?.get('action') === 'deleteTeam'
  const deletingTeamId = isDeletingTeam ? fetcher.formData?.get('teamId') as string : null

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Create and manage your Hero Wars teams. Each team can have up to 5 heroes.
          </p>
        </div>
        
        <Button 
          onClick={handleCreateTeam}
          disabled={isCreatingTeam}
          className="mt-4 sm:mt-0"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          {isCreatingTeam ? 'Creating...' : 'Create Team'}
        </Button>
      </div>

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team: any) => (
            <TeamListCard
              key={team.id}
              team={team}
              onEdit={handleEditTeam}
              onDelete={handleDeleteTeam}
              isDeleting={deletingTeamId === team.id}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-6xl text-muted-foreground/50">
                🏆
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Teams Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first team to start organizing your heroes for battle.
                </p>
                <Button 
                  onClick={handleCreateTeam}
                  disabled={isCreatingTeam}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  {isCreatingTeam ? 'Creating...' : 'Create Your First Team'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTeamId !== null} onOpenChange={() => setDeleteTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
              All heroes will be removed from the team and returned to your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTeamId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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