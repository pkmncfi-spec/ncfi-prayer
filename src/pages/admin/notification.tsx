import Layout from "~/components/layout/sidebar"
import { SidebarTrigger } from "~/components/ui/sidebar"

export default function Notification() {
  return (
    <Layout>
            <SidebarTrigger />
      <h1>This is notification page</h1>
    </Layout>
  )
}