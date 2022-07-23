import axios, { AxiosError } from "axios"
import { GetServerSidePropsContext } from "next"
import { parseCookies, setCookie } from "nookies"
import { signout } from "../contexts/AuthContext"
import { AuthTokenError } from "./errors/AuthTokenError"
interface failedRequest {
  onSuccess: (data: string) => void
  onFailure: (error: any) => void
}

let isRefreshing = false
let failedRequestsQueue: failedRequest[] = []

export function setupAPIClient(
  ctx: GetServerSidePropsContext | undefined = undefined
) {
  let cookies = parseCookies(ctx)
  const api = axios.create({
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
          cookies = parseCookies(ctx)
          const { "nextauth.refreshToken": refreshToken } = cookies
          const defaultConfig = error.config
          if (!isRefreshing) {
            isRefreshing = true
            api
              .post("/refresh", { refreshToken })
              .then((response) => {
                console.log("res", response)
                const { token } = response?.data || {}
                setCookie(ctx, "nextauth.token", token, {
                  path: "/",
                  maxAge: 60 * 60 * 24 * 30,
                })
                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response?.data?.refreshToken,
                  {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 30,
                  }
                )
                api.defaults.headers.common.Authorization = token

                failedRequestsQueue.forEach((request) =>
                  request.onSuccess(token)
                )
                failedRequestsQueue = []
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) => request.onFailure(err))
                failedRequestsQueue = []
                if (typeof window !== "undefined") {
                  signout()
                }
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
          if (typeof window !== "undefined") {
            signout()
          } else {
            return Promise.reject(new AuthTokenError())
          }
        }
      }
      return Promise.reject(error)
    }
  )
  return api
}
