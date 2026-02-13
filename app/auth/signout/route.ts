import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  
  // Sign out from Supabase - this should clear all session cookies automatically
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    // Return error response if sign out failed
    return new Response(JSON.stringify({ error: 'Sign out failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
  
  redirect('/auth')
}

