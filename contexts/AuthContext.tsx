import Router, { useRouter } from "next/router"
import { createContext, useContext, useEffect, useState } from "react"
import { setCookie, parseCookies, destroyCookie } from "nookies"
import { api } from "../services/api"

interface Credentials {
  email: string
  password: string
}

interface AuthContextData {
  signIn(credentials: Credentials): Promise<void>
  isAuthenticated: boolean
  user?: User
}
interface AuthContextProps {
  children: React.ReactNode
}

interface User {
  email: string
  permissions: string[]
  roles: string[]
}

const AuthContext = createContext({} as AuthContextData)
export const signout = () => {
  destroyCookie(undefined, "nextauth.token")
  destroyCookie(undefined, "nextauth.refreshToken")
  Router.push("/")
}
export const AuthProvider: React.FC<AuthContextProps> = ({ children }) => {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user
  const router = useRouter()

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies()
    if (token && token != "undefined") {
      console.log("oi")

      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data
          setUser({ email, permissions, roles })
        })
        .catch(() => {
          signout()
        })
    }
  }, [])

  const signIn = async ({ email, password }: Credentials) => {
    try {
      await api
        .post("/sessions", {
          email,
          password,
        })
        .then(({ data }) => {
          const { token, refreshToken, permissions, roles } = data
          setCookie(undefined, "nextauth.token", token, {
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          })
          setCookie(undefined, "nextauth.refreshToken", refreshToken, {
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          })

          setUser({
            email,
            permissions,
            roles,
          })
          api.defaults.headers.common["Authorization"] = token
          router.push("/dashboard")
        })
    } catch (error) {}
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
