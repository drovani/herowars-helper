import { type ActionFunctionArgs, redirect } from 'react-router'
import log from 'loglevel'
import { createClient } from '~/lib/supabase/client'

export async function loader({ request }: ActionFunctionArgs) {
  const { supabase, headers } = createClient(request)

  const { error } = await supabase.auth.signOut()

  if (error) {
    log.error('Logout error:', error)
    return { success: false, error: error.message }
  }

  // Redirect to dashboard or home page after successful sign-in
  return redirect('/', { headers })
}
