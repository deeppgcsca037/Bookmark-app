import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            } catch (error) {
              // Silently fail cookie setting in edge cases
              console.warn('Failed to set cookie:', error)
            }
          },
        },
      }
    )

    // Refresh session if needed
    await supabase.auth.getUser()
  } catch (error) {
    console.error('Middleware error:', error)
    // Return response even if middleware fails
  }

  return response
}

