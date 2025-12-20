"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconCamera,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUserCircle,
  IconBriefcase,
  IconPlus,
  IconUserCheck,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { User } from "@/lib/auth/user"

// Navigation items for jobseekers
const jobseekerNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "My Profile",
    url: "/dashboard/profile",
    icon: IconUserCircle,
  },
  {
    title: "Find Jobs",
    url: "/jobs",
    icon: IconListDetails,
  },
  {
    title: "My Applications",
    url: "/dashboard/applications",
    icon: IconFileDescription,
  },
  {
    title: "Saved Jobs",
    url: "/dashboard/saved",
    icon: IconFolder,
  },
];

// Navigation items for employers
const employerNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "My Profile",
    url: "/dashboard/profile",
    icon: IconUserCircle,
  },
  {
    title: "Post a Job",
    url: "/dashboard/jobs/post",
    icon: IconPlus,
  },
  {
    title: "Manage Jobs",
    url: "/dashboard/jobs",
    icon: IconBriefcase,
  },
  {
    title: "Applications",
    url: "/dashboard/applications",
    icon: IconFileDescription,
  },
  {
    title: "Candidates",
    url: "/dashboard/candidates",
    icon: IconUserCheck,
  },
];

const data = {
  navMain: jobseekerNavItems, // Default, will be overridden based on user type
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ 
  user,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  user?: User | null
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">JobPortal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain 
          items={
            user?.userType === "employer" 
              ? employerNavItems 
              : jobseekerNavItems
          } 
        />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || null} />
      </SidebarFooter>
    </Sidebar>
  )
}
