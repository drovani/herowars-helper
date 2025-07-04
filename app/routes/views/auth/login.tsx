import { type ActionFunctionArgs, Link, redirect } from 'react-router'
import { LoginForm } from '~/components/auth/LoginForm'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card'
import { createClient } from '~/lib/supabase/client'

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = createClient(request)

  const formData = await request.formData()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }

  // If redirectTo is provided (from modal), return success with headers
  // The modal will handle the page reload
  if (redirectTo) {
    return Response.json({ success: true, redirectTo }, { headers })
  }
  
  // Otherwise, redirect to account page (for dedicated login page)
  return redirect('/account', { headers })
}

export default function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <div className="mt-4 text-center text-sm">
                <Link
                  to="/forgot-password"
                  className="inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link to="/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
