"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Star,
  Sparkles,
  Coffee,
  Wine,
  Music,
  Utensils,
  Film,
  Palette,
  Gift,
  Lock,
  Check,
  TrendingUp,
} from "lucide-react"

interface Experience {
  id: string
  title: string
  venue: string
  description: string
  xpCost: number
  category: string
  icon: any
  image: string
  featured?: boolean
  locked?: boolean
  requiredLevel?: number
}

export function RewardsMarketplace() {
  const [userXp, setUserXp] = useState(285) // Example XP from onboarding + activities
  const [userLevel, setUserLevel] = useState(3)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [redeemedExperiences, setRedeemedExperiences] = useState<string[]>([])

  const categories = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "coffee", label: "Coffee", icon: Coffee },
    { id: "dining", label: "Dining", icon: Utensils },
    { id: "drinks", label: "Drinks", icon: Wine },
    { id: "culture", label: "Culture", icon: Palette },
    { id: "entertainment", label: "Entertainment", icon: Film },
  ]

  const experiences: Experience[] = [
    {
      id: "1",
      title: "Coffee Date Voucher",
      venue: "Blue Bottle Coffee",
      description: "Two specialty drinks of your choice at any location",
      xpCost: 50,
      category: "coffee",
      icon: Coffee,
      image: "/cozy-coffee-shop.png",
      featured: true,
    },
    {
      id: "2",
      title: "Wine Tasting for Two",
      venue: "The Wine Room",
      description: "Curated wine flight with cheese pairing",
      xpCost: 150,
      category: "drinks",
      icon: Wine,
      image: "/wine-tasting.png",
      featured: true,
    },
    {
      id: "3",
      title: "Museum Admission",
      venue: "MoMA",
      description: "Two tickets to explore world-class contemporary art",
      xpCost: 100,
      category: "culture",
      icon: Palette,
      image: "/modern-art-museum.png",
    },
    {
      id: "4",
      title: "Dinner Experience",
      venue: "Osteria Morini",
      description: "Three-course Italian dinner for two with wine pairing",
      xpCost: 300,
      category: "dining",
      icon: Utensils,
      image: "/italian-restaurant-exterior.png",
      locked: true,
      requiredLevel: 5,
    },
    {
      id: "5",
      title: "Jazz Night",
      venue: "Blue Note",
      description: "Premium seating for two at an intimate jazz performance",
      xpCost: 200,
      category: "entertainment",
      icon: Music,
      image: "/dimly-lit-jazz-club.png",
    },
    {
      id: "6",
      title: "Movie Night",
      venue: "Alamo Drafthouse",
      description: "Two tickets plus popcorn and drinks",
      xpCost: 75,
      category: "entertainment",
      icon: Film,
      image: "/classic-movie-theater.png",
    },
    {
      id: "7",
      title: "Rooftop Cocktails",
      venue: "230 Fifth",
      description: "Two signature cocktails with skyline views",
      xpCost: 125,
      category: "drinks",
      icon: Wine,
      image: "/rooftop-bar.png",
    },
    {
      id: "8",
      title: "Cooking Class",
      venue: "Sur La Table",
      description: "Hands-on cooking class for two with dinner included",
      xpCost: 250,
      category: "dining",
      icon: Utensils,
      image: "/cooking-class.png",
      locked: true,
      requiredLevel: 4,
    },
  ]

  const filteredExperiences =
    selectedCategory === "all" ? experiences : experiences.filter((exp) => exp.category === selectedCategory)

  const handleRedeem = (experience: Experience) => {
    if (userXp >= experience.xpCost && !experience.locked) {
      setUserXp(userXp - experience.xpCost)
      setRedeemedExperiences([...redeemedExperiences, experience.id])
    }
  }

  const canAfford = (cost: number) => userXp >= cost

  return (
    <div className="h-full bg-gradient-to-br from-background via-[var(--cream)]/20 to-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Rewards</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Your Balance</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[var(--rose)] fill-current" />
                  <span className="text-2xl font-bold">{userXp}</span>
                  <span className="text-sm text-muted-foreground">XP</span>
                </div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Level</p>
                <div className="text-2xl font-bold gradient-rose-blush bg-clip-text text-transparent">{userLevel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-rose-blush mb-4 shadow-xl shadow-[var(--rose)]/20">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-balance leading-tight">Rewards Marketplace</h1>
          <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
            Spend your XP on real date experiences. The more you train your AI, the more you unlock.
          </p>
        </div>

        {/* XP Earning Tips */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--rose)]/10 to-[var(--blush)]/10 border border-[var(--rose)]/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-rose-blush flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-lg">Earn More XP</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--rose)]" />
                  <span>Complete daily check-ins (+10 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--rose)]" />
                  <span>Chat with your AI (+5 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--rose)]" />
                  <span>Update your profile (+15 XP)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 whitespace-nowrap font-medium ${
                  selectedCategory === category.id
                    ? "border-[var(--rose)] bg-[var(--rose)] text-white shadow-lg shadow-[var(--rose)]/20"
                    : "border-border bg-card hover:border-[var(--blush)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            )
          })}
        </div>

        {/* Featured Experiences */}
        {selectedCategory === "all" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--rose)]" />
              <h2 className="text-2xl font-bold">Featured Experiences</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiences
                .filter((exp) => exp.featured)
                .map((experience) => {
                  const Icon = experience.icon
                  const isRedeemed = redeemedExperiences.includes(experience.id)
                  const affordable = canAfford(experience.xpCost)

                  return (
                    <div
                      key={experience.id}
                      className="group relative rounded-2xl border-2 border-border bg-card overflow-hidden hover:border-[var(--rose)] hover:shadow-xl transition-all duration-300"
                    >
                      <div className="aspect-[2/1] relative overflow-hidden">
                        <img
                          src={experience.image || "/placeholder.svg"}
                          alt={experience.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-white font-bold">
                          <Star className="w-4 h-4 fill-current" />
                          {experience.xpCost} XP
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--rose)]/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-[var(--rose)]" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg leading-tight">{experience.title}</h3>
                                <p className="text-sm text-muted-foreground">{experience.venue}</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{experience.description}</p>
                        </div>

                        {isRedeemed ? (
                          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 text-green-600 font-semibold">
                            <Check className="w-5 h-5" />
                            Redeemed
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleRedeem(experience)}
                            disabled={!affordable}
                            className={`w-full h-12 rounded-xl font-semibold ${
                              affordable
                                ? "gradient-rose-blush text-white shadow-lg hover:shadow-xl"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                          >
                            {affordable ? "Redeem Now" : `Need ${experience.xpCost - userXp} more XP`}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* All Experiences */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {selectedCategory === "all"
              ? "All Experiences"
              : `${categories.find((c) => c.id === selectedCategory)?.label} Experiences`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExperiences
              .filter((exp) => !exp.featured || selectedCategory !== "all")
              .map((experience) => {
                const Icon = experience.icon
                const isRedeemed = redeemedExperiences.includes(experience.id)
                const affordable = canAfford(experience.xpCost)
                const isLocked = experience.locked && userLevel < (experience.requiredLevel || 0)

                return (
                  <div
                    key={experience.id}
                    className={`group relative rounded-2xl border-2 bg-card overflow-hidden transition-all duration-300 ${
                      isLocked ? "border-border opacity-60" : "border-border hover:border-[var(--rose)] hover:shadow-xl"
                    }`}
                  >
                    <div className="aspect-[2/1] relative overflow-hidden">
                      <img
                        src={experience.image || "/placeholder.svg"}
                        alt={experience.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isLocked ? "grayscale" : "group-hover:scale-105"
                        }`}
                      />
                      <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-white font-bold">
                        {isLocked ? (
                          <>
                            <Lock className="w-4 h-4" />
                            Level {experience.requiredLevel}
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 fill-current" />
                            {experience.xpCost} XP
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--rose)]/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-[var(--rose)]" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg leading-tight">{experience.title}</h3>
                              <p className="text-sm text-muted-foreground">{experience.venue}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{experience.description}</p>
                      </div>

                      {isLocked ? (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-muted text-muted-foreground font-semibold">
                          <Lock className="w-5 h-5" />
                          Unlock at Level {experience.requiredLevel}
                        </div>
                      ) : isRedeemed ? (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 text-green-600 font-semibold">
                          <Check className="w-5 h-5" />
                          Redeemed
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleRedeem(experience)}
                          disabled={!affordable}
                          className={`w-full h-12 rounded-xl font-semibold ${
                            affordable
                              ? "gradient-rose-blush text-white shadow-lg hover:shadow-xl"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          {affordable ? "Redeem Now" : `Need ${experience.xpCost - userXp} more XP`}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
