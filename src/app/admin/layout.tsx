import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { PageContent } from "@/components/page"
import type { PropsWithChildren } from "react"

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await auth()
  if (!session?.user) redirect("/sign-in?from=/admin")

  if (!session.user.isAdmin) redirect("/")

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col h-full">
        <SiteHeader />
        <div className="flex flex-1 h-full">
          <AppSidebar />
          <div className="flex-1 overflow-auto font-sans">
            <div className="mx-auto w-full px-4 sm:px-4 lg:px-6 bg-gray-50">
              <PageContent>{children}</PageContent>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}
