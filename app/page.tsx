'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BookmarkManager from '@/components/BookmarkManager'
import SignOutButton from '@/components/SignOutButton'

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth')
      } else {
        setUserId(data.user.id)
      }
      setCheckingAuth(false)
    })
  }, [router])

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          <SignOutButton />
        </div>
        <BookmarkManager userId={userId} />
      </div>
    </main>
  )
}


