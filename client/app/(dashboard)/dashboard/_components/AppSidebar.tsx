"use client"

import * as React from "react"
import {
  Split,
  Banknote,
  Bell,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  Package,
  RefreshCcw,
  ScrollText,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./NavMain"
import { NavProjects } from "./NavProjects"
import { NavUser } from "./NavUser"
import { TeamSwitcher } from "./TeamSwitcher"

// This is sample data.
const data = {
  teams: [
    {
      name: "Branches",
      logo: Split,
      link: "/branches"
    },
    {
      name: "Staffs",
      logo: Users,
      link: "/staffs"
    },
    {
      name: "Settings",
      logo: Settings,
      link: "/settings"
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Sales",
      url: "/sales",
      icon: ShoppingBag
    },
    {
      title: "Refunds",
      url: "/refunds",
      icon: RefreshCcw
    },
    {
      title: "Products",
      url: "/products",
      icon: Package
    },
    {
      title: "Staffs",
      url: "/staffs",
      icon: Users
    },
    {
      title: "Customers",
      url: "/customers",
      icon: CircleUserRound
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: ScrollText,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: Banknote
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell
    },
    {
      title: "Reports",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Sales",
          url: "/reports/sales",
        },
        {
          title: "Invoices",
          url: "/reports/invoices",
        },
        {
          title: "Expenses",
          url: "/reports/expenses",
        }
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
