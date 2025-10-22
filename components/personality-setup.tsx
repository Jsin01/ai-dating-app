"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Heart, Coffee, Music, Book, Plane, Dumbbell, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

const interests = [
  { icon: Heart, label: "Romance", color: "var(--rose)" },
  { icon: Coffee, label: "Coffee", color: "var(--rose)" },
  { icon: Music, label: "Music", color: "var(--blush)" },
  { icon: Book, label: "Reading", color: "var(--blush)" },
  { icon: Plane, label: "Travel", color: "var(--accent)" },
  { icon: Dumbbell, label: "Fitness", color: "var(--accent)" },
]

const traits = [
  { label: "Introverted", opposite: "Extroverted" },
  { label: "Spontaneous", opposite: "Planned" },
  { label: "Homebody", opposite: "Adventurer" },
  { label: "Deep Talks", opposite: "Light & Fun" },
]

export function PersonalitySetup() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [traitValues, setTraitValues] = useState<Record<string, number>>({})
  const router = useRouter()

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]))
  }

  const handleComplete = () => {
    router.push("/ai-chat")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-12">
          <div className="space-y-3 animate-in fade-in duration-500">
            <h1 className="text-4xl font-bold text-balance">{"What makes you, you?"}</h1>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              {"Share your interests and personality traits so our AI can find your perfect matches"}
            </p>
          </div>

          {/* Interests */}
          <div className="space-y-6 animate-in fade-in duration-500 delay-100">
            <h2 className="text-2xl font-semibold">{"Your Interests"}</h2>
            <div className="grid grid-cols-3 gap-4">
              {interests.map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  onClick={() => toggleInterest(label)}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300
                    ${
                      selectedInterests.includes(label)
                        ? "border-[var(--rose)] bg-[var(--rose)]/10 scale-105"
                        : "border-border hover:border-[var(--blush)] hover:scale-105"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Icon
                      className="w-8 h-8"
                      style={{ color: selectedInterests.includes(label) ? color : "currentColor" }}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Personality Traits */}
          <div className="space-y-8 animate-in fade-in duration-500 delay-200">
            <h2 className="text-2xl font-semibold">{"Your Personality"}</h2>
            {traits.map(({ label, opposite }) => (
              <div key={label} className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-muted-foreground">{opposite}</span>
                </div>
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={(value) => setTraitValues((prev) => ({ ...prev, [label]: value[0] }))}
                />
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg rounded-xl gradient-rose-blush text-white"
            onClick={handleComplete}
          >
            {"Meet Your AI Companion"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
