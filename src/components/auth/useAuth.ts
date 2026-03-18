import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  email: string | null
  uid: string | null
}

export const useAuth = (): AuthState => {

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {

      if (firebaseUser) {

        setUser(firebaseUser)

      } else {

        setUser(null)

      }

      setLoading(false)

    })

    return () => unsubscribe()

  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    email: user?.email || null,
    uid: user?.uid || null
  }
}
