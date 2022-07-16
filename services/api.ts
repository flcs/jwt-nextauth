import axios, { AxiosError } from "axios"
import { parseCookies, setCookie } from "nookies"
import { signout } from "../contexts/AuthContext"
interface failedRequest {
  onSuccess: (data: string) => void
  onFailure: (error: any) => void
}
let cookies = parseCookies()
let isRefreshing = false
let failedRequestsQueue: failedRequest[] = []

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
})
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response?.status == 401) {
      if (error?.response.data?.code == "token.expired") {
        cookies = parseCookies()

        const { "nextauth.refreshToken": refreshToken } = cookies
        const defaultConfig = error.config

        if (!isRefreshing) {
          isRefreshing = true
          api
            .post("/refresh", { refreshToken })
            .then((response) => {
              console.log("res", response)
              const { token } = response?.data || {}
              setCookie(null, "nextauth.token", token, {
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
              })
              setCookie(
                null,
                "nextauth.refreshToken",
                response?.data?.refreshToken,
                {
                  path: "/",
                  maxAge: 60 * 60 * 24 * 30,
                }
              )
              api.defaults.headers.common.Authorization = token

              failedRequestsQueue.forEach((request) => request.onSuccess(token))
              failedRequestsQueue = []
            })
            .catch((err) => {
              failedRequestsQueue.forEach((request) => request.onFailure(err))
              failedRequestsQueue = []
            })
            .finally(() => {
              isRefreshing = false
            })
        }
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              defaultConfig.headers["Authorization"] = `Bearer ${token}`
              resolve(api(defaultConfig))
            },
            onFailure: (err: AxiosError) => {
              reject(err)
            },
          })
        })
      } else {
        signout()

        //Logout
      }
    }
    return Promise.reject(error)
  }
)
