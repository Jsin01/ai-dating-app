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
  Ticket,
  Check,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react"

interface Experience {
  id: string
  title: string
  venue: string
  location: string
  description: string
  price: number  // Actual price in dollars
  xpDiscount: number  // How much XP can reduce the price
  category: string
  icon: any
  image: string
  featured?: boolean
  duration?: string
}

export function ExperiencesMarketplace() {
  const [userXp, setUserXp] = useState(285) // Example XP from onboarding + activities
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [bookedExperiences, setBookedExperiences] = useState<string[]>([])

  const categories = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "coffee", label: "Coffee", icon: Coffee },
    { id: "dining", label: "Dining", icon: Utensils },
    { id: "drinks", label: "Drinks", icon: Wine },
    { id: "culture", label: "Culture", icon: Palette },
    { id: "entertainment", label: "Entertainment", icon: Film },
    { id: "music", label: "Music", icon: Music },
  ]

  // Real LA experiences with actual pricing
  const experiences: Experience[] = [
    {
      id: "1",
      title: "Coffee & Pastry Date",
      venue: "Verve Coffee Roasters",
      location: "West Hollywood",
      description: "Specialty coffee drinks and fresh pastries at this popular LA roaster",
      price: 25,
      xpDiscount: 100, // 100 XP = $10 off
      category: "coffee",
      icon: Coffee,
      image: "/cozy-coffee-shop.png",
      featured: true,
      duration: "1 hour",
    },
    {
      id: "2",
      title: "Wine Tasting Experience",
      venue: "Esters Wine Shop & Bar",
      location: "Santa Monica",
      description: "Curated wine flight with artisan cheese board in a cozy setting",
      price: 65,
      xpDiscount: 150,
      category: "drinks",
      icon: Wine,
      image: "/wine-tasting.png",
      featured: true,
      duration: "1.5 hours",
    },
    {
      id: "3",
      title: "Getty Center Visit",
      venue: "The Getty",
      location: "Brentwood",
      description: "World-class art museum with stunning architecture and city views (admission free, parking $20)",
      price: 20,
      xpDiscount: 50,
      category: "culture",
      icon: Palette,
      image: "/modern-art-museum.png",
      duration: "2-3 hours",
    },
    {
      id: "4",
      title: "Italian Dinner for Two",
      venue: "Bestia",
      location: "Arts District",
      description: "Modern Italian cuisine in an industrial-chic space - one of LA's hottest restaurants",
      price: 120,
      xpDiscount: 300,
      category: "dining",
      icon: Utensils,
      image: "/italian-restaurant-exterior.png",
      duration: "2 hours",
    },
    {
      id: "5",
      title: "Jazz Night at The Blue Whale",
      venue: "The Blue Whale",
      location: "Little Tokyo",
      description: "Intimate jazz club featuring world-class musicians in a speakeasy atmosphere",
      price: 40,
      xpDiscount: 200,
      category: "music",
      icon: Music,
      image: "/dimly-lit-jazz-club.png",
      duration: "2-3 hours",
    },
    {
      id: "6",
      title: "Outdoor Movie Night",
      venue: "Cinespia at Hollywood Forever",
      location: "Hollywood",
      description: "Classic films under the stars at the historic Hollywood Forever Cemetery",
      price: 35,
      xpDiscount: 75,
      category: "entertainment",
      icon: Film,
      image: "/classic-movie-theater.png",
      duration: "3 hours",
    },
    {
      id: "7",
      title: "Rooftop Sunset Drinks",
      venue: "Perch LA",
      location: "Downtown LA",
      description: "French-inspired rooftop bar with panoramic city views and craft cocktails",
      price: 50,
      xpDiscount: 125,
      category: "drinks",
      icon: Wine,
      image: "/rooftop-bar.png",
      duration: "2 hours",
    },
    {
      id: "8",
      title: "Brunch at Republique",
      venue: "Republique",
      location: "Mid-Wilshire",
      description: "French bistro in a stunning space - famous for their pastries and weekend brunch",
      price: 55,
      xpDiscount: 150,
      category: "dining",
      icon: Utensils,
      image: "/cooking-class.png",
      duration: "1.5 hours",
    },
    {
      id: "9",
      title: "Comedy Show Tickets",
      venue: "The Comedy Store",
      location: "West Hollywood",
      description: "Legendary comedy club on the Sunset Strip - see tomorrow's stars and today's legends",
      price: 45,
      xpDiscount: 100,
      category: "entertainment",
      icon: Ticket,
      image: "/classic-movie-theater.png",
      duration: "2 hours",
    },
    {
      id: "10",
      title: "Griffith Observatory Evening",
      venue: "Griffith Observatory",
      location: "Griffith Park",
      description: "Star gazing and planetarium show with stunning LA views (free admission, parking $10/hr)",
      price: 15,
      xpDiscount: 30,
      category: "culture",
      icon: Sparkles,
      image: "/modern-art-museum.png",
      duration: "2-3 hours",
    },
  ]

  const filteredExperiences =
    selectedCategory === "all" ? experiences : experiences.filter((exp) => exp.category === selectedCategory)

  const calculateDiscount = (xpDiscount: number) => {
    // 100 XP = $10, so xpDiscount / 10 = max dollar discount
    const maxDiscount = xpDiscount / 10
    const userDiscount = Math.min((userXp / 100) * 10, maxDiscount)
    return Math.floor(userDiscount)
  }

  const calculateFinalPrice = (price: number, xpDiscount: number) => {
    const discount = calculateDiscount(xpDiscount)
    return Math.max(price - discount, 0)
  }

  const handleBook = (experience: Experience) => {
    if (!bookedExperiences.includes(experience.id)) {
      const discount = calculateDiscount(experience.xpDiscount)
      const xpUsed = Math.min(userXp, (discount / 10) * 100)
      setUserXp(userXp - xpUsed)
      setBookedExperiences([...bookedExperiences, experience.id])
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-background via-[var(--cream)]/10 to-background overflow-y-auto pb-24">
      {/* Header with XP Wallet */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Experiences</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Book dates with XP</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[var(--rose)]/10 to-[var(--blush)]/10 border border-[var(--rose)]/20">
              <Star className="w-4 h-4 text-[var(--rose)] fill-current" />
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{userXp}</span>
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-none">≈ ${Math.floor((userXp / 100) * 10)} credit</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section - Improved */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--rose)]/5 via-[var(--blush)]/5 to-[var(--cream)]/5 border border-[var(--rose)]/10 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--rose)]/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--blush)]/5 rounded-full blur-3xl -z-10" />

          <div className="text-center space-y-4 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-rose-blush mb-2 shadow-lg shadow-[var(--rose)]/20 animate-bounce-subtle">
              <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              Date Experiences
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed max-w-xl mx-auto">
              Book real LA experiences with your XP. Every conversation earns you credits towards amazing dates.
            </p>
          </div>
        </div>

        {/* XP Info Card - Enhanced */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--rose)]/10 via-[var(--blush)]/10 to-[var(--rose)]/5 border border-[var(--rose)]/20 p-5 sm:p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--rose)]/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-rose-blush flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base sm:text-lg mb-1">How Credits Work</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Earn XP through conversations, spend on experiences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-full bg-[var(--rose)]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[var(--rose)]" />
                </div>
                <span className="font-medium">100 XP = $10 credit</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-full bg-[var(--rose)]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[var(--rose)]" />
                </div>
                <span className="font-medium">Use XP to reduce price</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-full bg-[var(--rose)]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[var(--rose)]" />
                </div>
                <span className="font-medium">AI can book for you</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter - Enhanced */}
        <div className="relative">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border-2 transition-all duration-300 whitespace-nowrap font-medium text-sm ${
                    selectedCategory === category.id
                      ? "border-[var(--rose)] bg-[var(--rose)] text-white shadow-lg shadow-[var(--rose)]/30 scale-105"
                      : "border-border bg-card hover:border-[var(--rose)]/30 hover:bg-[var(--rose)]/5 active:scale-95"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              )
            })}
          </div>
          {/* Fade effect for scrollable area */}
          <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* Featured Experiences */}
        {selectedCategory === "all" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--rose)]" />
              <h2 className="text-2xl font-bold">Featured This Week</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiences
                .filter((exp) => exp.featured)
                .map((experience) => {
                  const Icon = experience.icon
                  const isBooked = bookedExperiences.includes(experience.id)
                  const discount = calculateDiscount(experience.xpDiscount)
                  const finalPrice = calculateFinalPrice(experience.price, experience.xpDiscount)

                  return (
                    <div
                      key={experience.id}
                      className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-[var(--rose)]/50 hover:shadow-2xl shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="aspect-[2/1] relative overflow-hidden bg-gradient-to-br from-[var(--rose)]/5 to-[var(--blush)]/5">
                        <img
                          src={experience.image || "/placeholder.svg"}
                          alt={experience.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        {/* Gradient overlay for better text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white font-bold text-sm shadow-lg">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{experience.price}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--rose)] backdrop-blur-md text-white font-bold text-xs shadow-lg animate-pulse-subtle">
                              <Star className="w-3 h-3 fill-current" />
                              <span>${discount} off</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-[var(--rose)]/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-[var(--rose)]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg leading-tight">{experience.title}</h3>
                                <p className="text-sm text-muted-foreground truncate">{experience.venue}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {experience.location}
                            </div>
                            {experience.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {experience.duration}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{experience.description}</p>
                        </div>

                        {isBooked ? (
                          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 text-green-600 font-semibold border border-green-500/20">
                            <Check className="w-5 h-5" />
                            <span>Booked</span>
                          </div>
                        ) : (
                          <div className="space-y-2.5 sm:space-y-3">
                            {discount > 0 && (
                              <div className="flex items-center justify-between text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-br from-[var(--rose)]/5 to-[var(--blush)]/5 border border-[var(--rose)]/10">
                                <span className="text-muted-foreground font-medium">With your credits:</span>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <span className="line-through text-muted-foreground text-xs">${experience.price}</span>
                                  <span className="font-bold text-base sm:text-lg text-[var(--rose)]">${finalPrice}</span>
                                </div>
                              </div>
                            )}
                            <Button
                              onClick={() => handleBook(experience)}
                              className="w-full h-11 sm:h-12 rounded-xl font-semibold gradient-rose-blush text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              Book for ${finalPrice}
                            </Button>
                          </div>
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
                const isBooked = bookedExperiences.includes(experience.id)
                const discount = calculateDiscount(experience.xpDiscount)
                const finalPrice = calculateFinalPrice(experience.price, experience.xpDiscount)

                return (
                  <div
                    key={experience.id}
                    className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-[var(--rose)]/50 hover:shadow-2xl shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-[2/1] relative overflow-hidden bg-gradient-to-br from-[var(--rose)]/5 to-[var(--blush)]/5">
                      <img
                        src={experience.image || "/placeholder.svg"}
                        alt={experience.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      {/* Gradient overlay for better text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white font-bold text-sm shadow-lg">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{experience.price}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--rose)] backdrop-blur-md text-white font-bold text-xs shadow-lg animate-pulse-subtle">
                            <Star className="w-3 h-3 fill-current" />
                            <span>${discount} off</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-[var(--rose)]/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-[var(--rose)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg leading-tight">{experience.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{experience.venue}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {experience.location}
                          </div>
                          {experience.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {experience.duration}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{experience.description}</p>
                      </div>

                      {isBooked ? (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 text-green-600 font-semibold border border-green-500/20">
                          <Check className="w-5 h-5" />
                          <span>Booked</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5 sm:space-y-3">
                          {discount > 0 && (
                            <div className="flex items-center justify-between text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-br from-[var(--rose)]/5 to-[var(--blush)]/5 border border-[var(--rose)]/10">
                              <span className="text-muted-foreground font-medium">With your credits:</span>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="line-through text-muted-foreground text-xs">${experience.price}</span>
                                <span className="font-bold text-base sm:text-lg text-[var(--rose)]">${finalPrice}</span>
                              </div>
                            </div>
                          )}
                          <Button
                            onClick={() => handleBook(experience)}
                            className="w-full h-11 sm:h-12 rounded-xl font-semibold gradient-rose-blush text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            Book for ${finalPrice}
                          </Button>
                        </div>
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
