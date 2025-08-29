"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"
import { FeatureCards } from "./feature-cards"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ListItem } from "@/components/ui/list-item"

const pollFeatures: { title: string; href: string; description: string }[] = [
  {
    title: "Create Polls",
    href: "/create-poll",
    description:
      "Create custom polls with multiple options and share them with others.",
  },
  {
    title: "Vote",
    href: "/polls",
    description:
      "Vote on polls created by you and others in the community.",
  },
  {
    title: "Results",
    href: "/polls",
    description:
      "View real-time results with beautiful charts and detailed analytics.",
  },
  {
    title: "Share",
    href: "/polls",
    description: "Share your polls with friends, colleagues, or the public.",
  },
]

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      ALX Polly
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Create, share, and analyze polls with ease.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/create-poll" title="Create Poll">
                Start creating your own custom polls in seconds.
              </ListItem>
              <ListItem href="/polls" title="My Polls">
                View and manage all your created polls.
              </ListItem>
              <ListItem href="/auth/signup" title="Sign Up">
                Create an account to save and track your polls.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Polls</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 w-[800px]">
              <FeatureCards />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/polls" className={navigationMenuTriggerStyle()}>
              Browse Polls
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}