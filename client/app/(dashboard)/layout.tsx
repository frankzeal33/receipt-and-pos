"use client"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./dashboard/_components/AppSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { DarkMode } from "../_components/DarkMode"
 
export default function Layout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()

  // Split path: "/pos/sales/123" → ["pos", "sales", "123"]
  const segments = pathname.split("/").filter(Boolean)

  // Helper: capitalize first letter
  const formatSegment = (seg: string) => seg.charAt(0).toUpperCase() + seg.slice(1)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div>
          <header className="flex justify-between px-4 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />

              <Breadcrumb>
                <BreadcrumbList>
                  {/* Always start with Dashboard */}
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>

                  {segments.map((seg, idx) => {
                    const href = "/" + segments.slice(0, idx + 1).join("/")
                    const isLast = idx === segments.length - 1

                    return (
                      <div key={href} className="flex items-center">
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage>{formatSegment(seg)}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={href}>
                              {formatSegment(seg)}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </div>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div>
              <DarkMode/>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 px-4 pb-4 w-full">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
