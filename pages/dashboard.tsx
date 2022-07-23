import { GetServerSideProps } from "next"
import { destroyCookie } from "nookies"
import React from "react"
import { useAuth } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { AuthTokenError } from "../services/errors/AuthTokenError"
import { withSSRAuth } from "../utils/withSSRAuth"

const Dashboard = () => {
  const { user } = useAuth()
  return <div>Dashboard: {user?.email}</div>
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)

  const response = await apiClient.get("/me")
  console.log(response.data)

  return {
    props: {},
  }
})

export default Dashboard
