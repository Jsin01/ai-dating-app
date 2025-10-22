"use client"

import { Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface XpWalletProps {
  xp: number
  level: number
  showDetails?: boolean
}

export function XpWallet({ xp, level, showDetails = false }: XpWalletProps) {
  const xpToNextLevel = level * 100 - (xp % 100)
  const progressToNextLevel = ((xp % 100) / 100) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-rose-blush flex items-center justify-center shadow-lg">
            <Star className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{xp}</span>
              <span className="text-sm text-muted-foreground">XP</span>
            </div>
            <p className="text-xs text-muted-foreground">Level {level}</p>
          </div>
        </div>
        <Link href="/rewards">
          <Button size="sm" variant="outline" className="gap-2 bg-transparent">
            <TrendingUp className="w-4 h-4" />
            Spend XP
          </Button>
        </Link>
      </div>

      {showDetails && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to Level {level + 1}</span>
            <span>{xpToNextLevel} XP needed</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-rose-blush transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
