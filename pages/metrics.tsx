import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"
import decode from "jwt-decode"

const Metrics = () => {
  return (
    <div>
      <div>Metrics</div>
    </div>
  )
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx)

    await apiClient.get("/me")

    return {
      props: {},
    }
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
)

export default Metrics
