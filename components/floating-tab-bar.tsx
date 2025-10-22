"use client"

import { usePathname, useRouter } from "next/navigation"
import { MessageCircle, Sparkles, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function FloatingTabBar() {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    {
      name: "Chat",
      icon: MessageCircle,
      path: "/ai-chat",
      active: pathname === "/ai-chat",
    },
    {
      name: "Matches",
      icon: Users,
      path: "/matches",
      active: pathname === "/matches" || pathname === "/match-reveal",
    },
    {
      name: "Glimpses",
      icon: Sparkles,
      path: "/rewards",
      active: pathname === "/rewards",
    },
    {
      name: "Profile",
      icon: User,
      path: "/profile",
      active: pathname === "/profile",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom pb-3">
      <div className="mx-3 mb-2">
        <div className="floating rounded-[28px] transition-smooth">
          <div className="px-2 py-2">
            <div className="flex items-center justify-around">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.path}
                    onClick={() => router.push(tab.path)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-6 py-2 rounded-[20px] transition-swift min-w-[72px]",
                      tab.active
                        ? "bg-gradient-to-br from-[var(--mesh-pink)] to-[var(--mesh-rose)] text-white elevation-2"
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-smooth",
                        tab.active && "drop-shadow-sm"
                      )}
                    />
                    <span className="text-[10px] font-medium">{tab.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
