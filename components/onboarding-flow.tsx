"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Sparkles, Heart, Brain, Compass, Users, MessageCircle, Trophy, Star, Target } from "lucide-react"
import { useRouter } from "next/navigation"

export function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)
  const [traits, setTraits] = useState({
    introvert: 50,
    planner: 50,
    empath: 50,
    chill: 50,
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [xp, setXp] = useState(0)
  const [showXpGain, setShowXpGain] = useState(false)
  const router = useRouter()

  const totalSteps = 8
  const progress = (step / totalSteps) * 100
  const aiLevel = Math.floor(xp / 100) + 1

  const intents = [
    { id: "meaningful", label: "Meaningful Connection", subtext: "Looking for something real and lasting", xp: 15 },
    { id: "curious", label: "Curiosity & Discovery", subtext: "Open to seeing where things go", xp: 15 },
    { id: "exploring", label: "Just Exploring", subtext: "Taking it slow, no pressure", xp: 15 },
    { id: "unsure", label: "Not Sure Yet", subtext: "Still figuring it out", xp: 15 },
  ]

  const interests = [
    "Music",
    "Film",
    "Travel",
    "Philosophy",
    "Fitness",
    "Art",
    "Food",
    "Books",
    "Tech",
    "Nature",
    "Fashion",
    "Gaming",
  ]

  const gainXp = (amount: number) => {
    setXp((prev) => prev + amount)
    setShowXpGain(true)
    setTimeout(() => setShowXpGain(false), 2000)
  }

  const handleComplete = () => {
    router.push("/")
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      const newInterests = prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
      if (newInterests.length > prev.length) {
        gainXp(5)
      }
      return newInterests
    })
  }

  const handleStepComplete = (xpAmount: number) => {
    gainXp(xpAmount)
    setTimeout(() => setStep(step + 1), 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[var(--cream)]/20 to-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-rose-blush flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Glimpse</p>
                <p className="text-sm font-bold">Level {aiLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--rose)]" />
              <span className="text-sm font-bold">{xp} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-rose-blush transition-all duration-500 shadow-lg shadow-[var(--rose)]/20"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              {step}/{totalSteps}
            </div>
          </div>
        </div>
      </div>

      {showXpGain && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
          <div className="px-6 py-3 rounded-full gradient-rose-blush text-white font-bold shadow-2xl flex items-center gap-2">
            <Star className="w-5 h-5" />
            <span>+{xp % 100} XP</span>
          </div>
        </div>
      )}

      <div className="container max-w-lg mx-auto px-6 pt-32 pb-16 min-h-screen flex flex-col justify-center">
        {step === 0 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-rose-blush mb-4 shadow-2xl shadow-[var(--rose)]/30 animate-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-balance leading-tight">Meet Glimpse</h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                Train your personal AI matchmaker to find your perfect match. The more you teach Glimpse, the smarter it
                gets.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--rose)]/10 to-[var(--blush)]/10 border border-[var(--rose)]/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-rose-blush flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">Your Mission</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Complete 8 training modules to teach Glimpse about your preferences, personality, and ideal match
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--blush)]/10 to-[var(--cream)]/10 border border-[var(--blush)]/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--blush)] flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">Earn XP & Level Up</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every answer makes Glimpse smarter. Watch it level up as you train it to find better matches
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg group"
              onClick={() => setStep(1)}
            >
              Start Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-rose-blush mb-4 shadow-xl shadow-[var(--rose)]/20">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rose)]/10 text-sm font-medium text-[var(--rose)] mb-2">
                <Target className="w-4 h-4" />
                Module 1 of 8
              </div>
              <h1 className="text-5xl font-bold text-balance leading-tight">What brings you here?</h1>
              {/* Help Echo understand your intentions */}
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                Help Glimpse understand your intentions
              </p>
            </div>

            <div className="space-y-4">
              {intents.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => setSelectedIntent(intent.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                    selectedIntent === intent.id
                      ? "border-[var(--rose)] bg-[var(--rose)]/5 shadow-lg shadow-[var(--rose)]/10"
                      : "border-border bg-card hover:border-[var(--blush)] hover:shadow-md"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-lg">{intent.label}</p>
                      <div className="flex items-center gap-1 text-xs font-medium text-[var(--rose)]">
                        <Star className="w-3 h-3" />+{intent.xp} XP
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{intent.subtext}</p>
                  </div>
                </button>
              ))}
            </div>

            <Button
              size="lg"
              disabled={!selectedIntent}
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg disabled:opacity-50 group"
              onClick={() => handleStepComplete(15)}
            >
              Continue Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--rose)]/10 mb-4">
                <Brain className="w-10 h-10 text-[var(--rose)]" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rose)]/10 text-sm font-medium text-[var(--rose)] mb-2">
                <Target className="w-4 h-4" />
                Module 2 of 8
              </div>
              <h1 className="text-5xl font-bold text-balance leading-tight">Your personality</h1>
              {/* Teach Echo what makes you, you */}
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                Teach Glimpse what makes you, you
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Introverted</span>
                  <span>Extroverted</span>
                </div>
                <Slider
                  value={[traits.introvert]}
                  onValueChange={(value) => setTraits({ ...traits, introvert: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Planner</span>
                  <span>Spontaneous</span>
                </div>
                <Slider
                  value={[traits.planner]}
                  onValueChange={(value) => setTraits({ ...traits, planner: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Empath</span>
                  <span>Analyst</span>
                </div>
                <Slider
                  value={[traits.empath]}
                  onValueChange={(value) => setTraits({ ...traits, empath: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Chill</span>
                  <span>Driven</span>
                </div>
                <Slider
                  value={[traits.chill]}
                  onValueChange={(value) => setTraits({ ...traits, chill: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[var(--rose)]/5 border border-[var(--rose)]/20 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--rose)]">
                  <Star className="w-4 h-4" />
                  +20 XP on completion
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg group"
              onClick={() => handleStepComplete(20)}
            >
              Continue Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--rose)]/10 mb-4">
                <Heart className="w-10 h-10 text-[var(--rose)]" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rose)]/10 text-sm font-medium text-[var(--rose)] mb-2">
                <Target className="w-4 h-4" />
                Module 3 of 8
              </div>
              <h1 className="text-5xl font-bold text-balance leading-tight">Your emotional world</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                Share what matters most to you in relationships
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  What makes you feel most seen in a relationship?
                </label>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="min-h-32 rounded-2xl text-base border-2 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">What do you value most in a partner?</label>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="min-h-32 rounded-2xl text-base border-2 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">How do you handle conflict?</label>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="min-h-32 rounded-2xl text-base border-2 resize-none"
                />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg group"
              onClick={() => handleStepComplete(10)}
            >
              Continue Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--rose)]/10 mb-4">
                <Compass className="w-10 h-10 text-[var(--rose)]" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rose)]/10 text-sm font-medium text-[var(--rose)] mb-2">
                <Target className="w-4 h-4" />
                Module 4 of 8
              </div>
              <h1 className="text-5xl font-bold text-balance leading-tight">Your lifestyle</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                Tell us about your day-to-day preferences
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-6 rounded-2xl border-2 border-border bg-card hover:border-[var(--rose)] hover:bg-[var(--rose)]/5 transition-all text-center space-y-2">
                  <div className="text-3xl">🏠</div>
                  <p className="font-medium text-sm">Night In</p>
                </button>
                <button className="p-6 rounded-2xl border-2 border-border bg-card hover:border-[var(--rose)] hover:bg-[var(--rose)]/5 transition-all text-center space-y-2">
                  <div className="text-3xl">🌃</div>
                  <p className="font-medium text-sm">Night Out</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="p-6 rounded-2xl border-2 border-border bg-card hover:border-[var(--rose)] hover:bg-[var(--rose)]/5 transition-all text-center space-y-2">
                  <div className="text-3xl">🏖️</div>
                  <p className="font-medium text-sm">Beach</p>
                </button>
                <button className="p-6 rounded-2xl border-2 border-border bg-card hover:border-[var(--rose)] hover:bg-[var(--rose)]/5 transition-all text-center space-y-2">
                  <div className="text-3xl">🏙️</div>
                  <p className="font-medium text-sm">City</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="p-6 rounded-2xl border-2 border-border bg-card hover:border-[var(--rose)] hover:bg-[var(--rose)]/5 transition-all text-center space-y-2">
                  <div className="text-3xl">🌅</div>
                  <p className="font-medium text-sm">Early Bird</p>
                </button>
                <button className="p-6 rounded-2xl border-2 border-border bg-card hover:border-[var(--rose)] hover:bg-[var(--rose)]/5 transition-all text-center space-y-2">
                  <div className="text-3xl">🌙</div>
                  <p className="font-medium text-sm">Night Owl</p>
                </button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg group"
              onClick={() => handleStepComplete(10)}
            >
              Continue Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--rose)]/10 mb-4">
                <Sparkles className="w-10 h-10 text-[var(--rose)]" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rose)]/10 text-sm font-medium text-[var(--rose)] mb-2">
                <Target className="w-4 h-4" />
                Module 5 of 8
              </div>
              <h1 className="text-5xl font-bold text-balance leading-tight">Your interests</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                Select topics that light you up (+5 XP each)
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-6 py-3 rounded-full border-2 transition-all duration-300 font-medium ${
                    selectedInterests.includes(interest)
                      ? "border-[var(--rose)] bg-[var(--rose)] text-white shadow-lg shadow-[var(--rose)]/20"
                      : "border-border bg-card hover:border-[var(--blush)]"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[var(--rose)]/5 border border-[var(--rose)]/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Interests selected</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--rose)]">{selectedInterests.length}</span>
                  <span className="text-sm text-muted-foreground">({selectedInterests.length * 5} XP earned)</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              disabled={selectedInterests.length === 0}
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg disabled:opacity-50 group"
              onClick={() => handleStepComplete(10)}
            >
              Continue Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-rose-blush mb-4 shadow-xl shadow-[var(--rose)]/20">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rose)]/10 text-sm font-medium text-[var(--rose)] mb-2">
                <Target className="w-4 h-4" />
                Module 6 of 8
              </div>
              <h1 className="text-5xl font-bold text-balance leading-tight">Train your AI</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                Describe your ideal match in your own words
              </p>
            </div>

            <div className="space-y-6">
              <Textarea
                placeholder="Tell us about your ideal match... What qualities matter most? What kind of connection are you looking for?"
                className="min-h-48 rounded-2xl text-base border-2 resize-none"
              />

              <div className="p-4 rounded-2xl bg-[var(--rose)]/5 border border-[var(--rose)]/20">
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-rose-blush flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Glimpse is listening...</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The more you share, the better we can understand what you're looking for
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg group"
              onClick={() => handleStepComplete(10)}
            >
              Continue Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--rose)]/10 mb-4">
                <Users className="w-10 h-10 text-[var(--rose)]" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rose)]/10 text-sm font-medium text-[var(--rose)] mb-2">
                <Target className="w-4 h-4" />
                Module 7 of 8
              </div>
              <h1 className="text-5xl font-bold text-balance leading-tight">Social energy</h1>
              {/* Help Echo understand your social comfort zone */}
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                Help Glimpse understand your social comfort zone
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <p className="font-semibold">At a party, you're usually the...</p>
                <div className="space-y-3">
                  {[
                    "Life of the party",
                    "Engaged conversationalist",
                    "Observing from the sidelines",
                    "Looking for the exit",
                  ].map((option) => (
                    <button
                      key={option}
                      className="w-full p-4 rounded-2xl border-2 border-border bg-card hover:border-[var(--rose)] hover:bg-[var(--rose)]/5 transition-all text-left"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-semibold">How do you prefer to meet people?</p>
                <div className="space-y-3">
                  {[
                    "Through mutual friends",
                    "At social events",
                    "Through shared activities",
                    "Online first, then in person",
                  ].map((option) => (
                    <button
                      key={option}
                      className="w-full p-4 rounded-2xl border-2 border-border bg-card hover:border-[var(--rose)] hover:bg-[var(--rose)]/5 transition-all text-left"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg group"
              onClick={() => handleStepComplete(10)}
            >
              Continue Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-rose-blush mb-4 shadow-2xl shadow-[var(--rose)]/30 animate-pulse">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rose)] text-sm font-bold text-white mb-2">
                <Sparkles className="w-4 h-4" />
                Training Complete!
              </div>
              <h1 className="text-5xl font-bold text-balance leading-tight">Glimpse is ready</h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                You've trained Glimpse to Level {aiLevel}. It's ready to find your perfect match.
              </p>
            </div>

            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-[var(--rose)] via-[var(--blush)] to-[var(--cream)] p-1 overflow-hidden shadow-2xl">
              <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--rose)]/20 animate-pulse" />
                  <div className="absolute inset-8 rounded-full border-4 border-[var(--blush)]/30 animate-pulse delay-100" />
                  <div className="absolute inset-16 rounded-full border-4 border-[var(--cream)]/40 animate-pulse delay-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="text-6xl font-bold gradient-rose-blush bg-clip-text text-transparent">
                        {aiLevel}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">AI Level</p>
                      <div className="flex items-center gap-1 justify-center text-[var(--rose)]">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold">{xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border text-center space-y-1">
                <p className="text-2xl font-bold text-[var(--rose)]">{selectedInterests.length}</p>
                <p className="text-xs text-muted-foreground">Interests</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border text-center space-y-1">
                <p className="text-2xl font-bold text-[var(--rose)]">4</p>
                <p className="text-xs text-muted-foreground">Traits</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border text-center space-y-1">
                <p className="text-2xl font-bold text-[var(--rose)]">{totalSteps}</p>
                <p className="text-xs text-muted-foreground">Modules</p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg group"
              onClick={handleComplete}
            >
              Start Matching
              <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
