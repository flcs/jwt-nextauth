import React from "react"
import { Can } from "../components/Can"
import { useAuth } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"

const Dashboard = () => {
  const { user, signout } = useAuth()

  return (
    <div>
      <div>Dashboard: {user?.email}</div>

      <Can permissions={["metrics.list"]}>
        <div>You can see metrics</div>
      </Can>
      <button onClick={signout}>Sign Out</button>
    </div>
  )
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
