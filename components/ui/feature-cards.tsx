"use client"

import * as React from "react"
import Link from "next/link"
import { BarChart4, Share2, CheckSquare, PenSquare } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const pollFeatures = [
  {
    title: "Create Polls",
    href: "/create-poll",
    description: "Create custom polls with multiple options and share them with others.",
    icon: <PenSquare className="h-6 w-6 text-primary" />
  },
  {
    title: "Vote",
    href: "/polls",
    description: "Vote on polls created by you and others in the community.",
    icon: <CheckSquare className="h-6 w-6 text-primary" />
  },
  {
    title: "Results",
    href: "/polls",
    description: "View real-time results with beautiful charts and detailed analytics.",
    icon: <BarChart4 className="h-6 w-6 text-primary" />
  },
  {
    title: "Share",
    href: "/polls",
    description: "Share your polls with friends, colleagues, or the public.",
    icon: <Share2 className="h-6 w-6 text-primary" />
  },
]

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {pollFeatures.map((feature) => (
        <Link href={feature.href} key={feature.title} className="block group">
          <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}