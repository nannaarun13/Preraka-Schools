import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { onAuthStateChanged, User, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

import { isUserAdmin } from "@/utils/authUtils"
import { canViewDashboard } from "@/utils/roleUtils"

import { useToast } from "@/hooks/use-toast"

import SessionTimeoutWarning from "@/components/security/SessionTimeoutWarning"

import { Shield } from "lucide-react"

const RouteProtection = ({ children }: { children: React.ReactNode }) => {

  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [loading,setLoading] = useState(true)
  const [user,setUser] = useState<User | null>(null)
  const [role,setRole] = useState<string | null>(null)

  /* ---------------- AUTH LISTENER ---------------- */

  useEffect(()=>{

    const unsubscribe = onAuthStateChanged(
      auth,
      async(firebaseUser)=>{

        try{

          if(firebaseUser){

            const adminData = await isUserAdmin(firebaseUser.uid)

            if(adminData){

              setUser(firebaseUser)
              setRole(adminData.role || "admin")

            }else{

              setUser(null)
              setRole(null)

            }

          }else{

            setUser(null)
            setRole(null)

          }

        }catch(error){

          console.error("Auth check failed:",error)

          setUser(null)
          setRole(null)

        }finally{

          setLoading(false)

        }

      }
    )

    return ()=>unsubscribe()

  },[])

  /* ---------------- ROUTE GUARD ---------------- */

  useEffect(()=>{

    if(loading) return

    const path = location.pathname

    const isAdminRoute = path.startsWith("/admin")
    const isAuthPage =
      path === "/login" ||
      path === "/admin/register"

    /* USER NOT LOGGED IN */

    if(!user){

      if(isAdminRoute && !isAuthPage){

        navigate("/login",{ replace:true })

      }

      return

    }

    /* USER LOGGED BUT NOT APPROVED ADMIN */

    if(user && !role){

      toast({
        title:"Access Denied",
        description:"Your admin account is pending approval.",
        variant:"destructive"
      })

      signOut(auth)

      navigate("/login",{ replace:true })

      return

    }

    /* ROLE PERMISSION */

    if(role && !canViewDashboard(role)){

      toast({
        title:"Access Denied",
        description:"You do not have permission to access this page.",
        variant:"destructive"
      })

      navigate("/",{ replace:true })

      return

    }

    /* PREVENT LOGIN LOOP */

    if(isAuthPage){

      navigate("/admin",{ replace:true })

    }

  },[user,role,loading,location.pathname,navigate,toast])

  /* ---------------- LOADING SCREEN ---------------- */

  if(loading){

    return(

      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <div className="text-center">

          <Shield
            className="h-16 w-16 text-school-blue mx-auto mb-4 animate-pulse"
          />

          <p className="text-gray-600 font-medium">
            Verifying security status...
          </p>

        </div>

      </div>

    )

  }

  /* ---------------- RENDER ---------------- */

  return(

    <>
      {children}

      {user && <SessionTimeoutWarning />}
    </>

  )

}

export default RouteProtection
