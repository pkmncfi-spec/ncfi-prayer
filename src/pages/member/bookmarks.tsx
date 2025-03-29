import Layout from "~/components/layout/sidebar-member"
import { SidebarTrigger } from "~/components/ui/sidebar"

export default function Bookmarks() {
  return (
    <Layout>
      <SidebarTrigger />
      <h1>This is bookmarks page</h1>
    </Layout>
  )
}