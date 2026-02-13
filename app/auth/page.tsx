'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SignInButton from '@/components/SignInButton'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace('/')
      }
    })
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
          Smart Bookmark
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in with your Google account to manage your bookmarks
        </p>
        <SignInButton />
      </div>
    </main>
  )
}


