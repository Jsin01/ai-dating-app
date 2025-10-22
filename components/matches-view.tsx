"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Send, Sparkles, Coffee, Music, Palette, Mountain, Leaf, UtensilsCrossed, ChevronLeft } from "lucide-react"
import { MATCH_PROFILES } from "@/lib/match-profiles"

// AI-discovered connection points for each match
const matchConnections = {
  Marcus: {
    points: ["☕ coffee culture obsessed", "🎵 live music lovers", "📸 weekend photographers"],
    aiNote: "okay so Marcus is a total coffee nerd like Alice... and they'd definitely vibe at the same concerts. plus he's thoughtful AND spontaneous? that's her sweet spot",
    icon: Coffee,
  },
  David: {
    points: ["🎨 design appreciation", "🎭 indie film fans", "✨ notice the details"],
    aiNote: "David gets it. like really GETS it. they both see beauty in the small things... gallery dates would be perfection, trust me on this",
    icon: Palette,
  },
  James: {
    points: ["💃 love to move", "🌮 Latin food fanatics", "✈️ travel enthusiasts"],
    aiNote: "James has that energy Alice needs. he'll get her out of her comfort zone but in the BEST way. dance lessons? exploring new places? yes please",
    icon: Music,
  },
  Ryan: {
    points: ["🌍 planet warriors", "🏕️ nature seekers", "🎬 documentary buffs"],
    aiNote: "Ryan cares about what matters, you know? Alice would love how authentic he is. beach cleanups, farmers markets... they'd change the world together",
    icon: Leaf,
  },
  Alex: {
    points: ["🍷 total foodies", "🎉 love hosting", "🌏 cultural explorers"],
    aiNote: "Alex and Alice would create EXPERIENCES together. dinner parties, wine tastings, food adventures... they both believe meals are meant to be savored",
    icon: UtensilsCrossed,
  },
}

// Create matches from actual database with sample messages
const matches = MATCH_PROFILES.map((profile, index) => ({
  id: profile.id,
  name: profile.name,
  age: profile.age,
  bio: profile.bio,
  interests: profile.interests,
  connections: matchConnections[profile.name as keyof typeof matchConnections],
  lastMessage: index === 0
    ? "I'd love to grab coffee and chat about tech!"
    : index === 1
    ? "Have you checked out the new gallery downtown?"
    : index === 2
    ? "Want to try that new Latin fusion place?"
    : index === 3
    ? "Down for a beach cleanup this weekend?"
    : "I'm hosting a dinner party, you should come!",
  time: index === 0 ? "5m ago" : index === 1 ? "1h ago" : index === 2 ? "2h ago" : index === 3 ? "5h ago" : "1d ago",
  unread: index === 0,
}))

export function MatchesView() {
  const [selectedMatch, setSelectedMatch] = useState<typeof matches[0] | null>(null)
  const [message, setMessage] = useState("")

  // 4-way conversation: Alice + Alice's AI (Glimpse) + Match + Match's AI
  const getMessagesForMatch = (matchName: string) => {
    switch (matchName) {
      case "Marcus":
        return [
          { sender: "ai-alice", content: "okay alice, i've been telling you about Marcus for WEEKS. he's finally ready to meet you! 🎉", time: "10:28 AM" },
          { sender: "ai-match", content: "Marcus, this is Alice. remember i said she's the one who gets your coffee thing?", time: "10:29 AM" },
          { sender: "them", content: "hey alice! yeah i may have a slight coffee obsession haha. have you tried verve in santa monica?", time: "10:30 AM" },
          { sender: "me", content: "not yet! but i've heard amazing things about their single origins", time: "10:32 AM" },
          { sender: "ai-alice", content: "SEE Marcus knows the baristas there by name 😄", time: "10:33 AM" },
          { sender: "ai-match", content: "don't expose me like that 😂", time: "10:33 AM" },
          { sender: "them", content: "guilty as charged. alice, I'd love to take you there if you're down?", time: "10:35 AM" },
          { sender: "me", content: "that sounds perfect actually", time: "10:36 AM" },
          { sender: "ai-alice", content: "omg this is going SO well", time: "10:37 AM" },
          { sender: "ai-match", content: "we're basically professional matchmakers at this point", time: "10:37 AM" },
        ]
      case "David":
        return [
          { sender: "ai-match", content: "David! remember that girl i told you about who appreciates good design?", time: "11:00 AM" },
          { sender: "ai-alice", content: "Alice this is David. he designed that app you use every day btw", time: "11:01 AM" },
          { sender: "them", content: "haha which app? now i'm curious", time: "11:02 AM" },
          { sender: "me", content: "wait which one? i need to know!", time: "11:03 AM" },
          { sender: "ai-match", content: "can't say, NDA and all that. but trust me, his eye for aesthetics is *chef's kiss*", time: "11:04 AM" },
          { sender: "them", content: "you're making me blush. alice, i heard you notice the little details too?", time: "11:05 AM" },
          { sender: "me", content: "i do! everywhere i go, i'm analyzing the design choices", time: "11:06 AM" },
          { sender: "ai-alice", content: "SEE! told you they'd vibe", time: "11:07 AM" },
          { sender: "ai-match", content: "there's a new gallery downtown opening this weekend... just saying 👀", time: "11:08 AM" },
        ]
      case "James":
        return [
          { sender: "ai-match", content: "James, remember how you said you wanted to meet someone who wants to learn salsa?", time: "9:00 AM" },
          { sender: "ai-alice", content: "alice has been saying she wants to learn to dance for MONTHS", time: "9:01 AM" },
          { sender: "them", content: "oh really? that's perfect! hi alice 👋", time: "9:02 AM" },
          { sender: "me", content: "hi! yeah i've always wanted to but i'm so uncoordinated haha", time: "9:03 AM" },
          { sender: "ai-alice", content: "she's being modest. she just needs the right teacher", time: "9:04 AM" },
          { sender: "them", content: "that's what everyone says! i teach thursdays at this studio in culver city. you should come", time: "9:05 AM" },
          { sender: "me", content: "i'd love that but fair warning, i might step on your feet", time: "9:06 AM" },
          { sender: "ai-match", content: "James is super patient. he taught ME and i have two left feet 😂", time: "9:07 AM" },
          { sender: "them", content: "you'll be great alice, i promise. and after we can try that new Latin fusion place?", time: "9:08 AM" },
          { sender: "ai-alice", content: "SAY YES", time: "9:08 AM" },
          { sender: "ai-match", content: "seriously say yes", time: "9:08 AM" },
        ]
      case "Ryan":
        return [
          { sender: "ai-alice", content: "alice, ryan is the environmental scientist i told you about", time: "2:00 PM" },
          { sender: "ai-match", content: "ryan, alice actually CARES about the planet. like really cares", time: "2:01 PM" },
          { sender: "them", content: "that's rare. hi alice!", time: "2:02 PM" },
          { sender: "me", content: "hi! what exactly do you do?", time: "2:03 PM" },
          { sender: "them", content: "i study climate change, mostly ocean temps and coral reefs. noticed you care about this stuff too?", time: "2:04 PM" },
          { sender: "me", content: "it's so important to me. we need more people who actually do something about it", time: "2:05 PM" },
          { sender: "ai-match", content: "ryan does a beach cleanup every weekend", time: "2:06 PM" },
          { sender: "ai-alice", content: "alice loves the beach. ryan this is literally perfect", time: "2:07 PM" },
          { sender: "them", content: "want to join me this weekend? manhattan beach, 8am?", time: "2:08 PM" },
          { sender: "me", content: "8am is early but for the planet... i'm in", time: "2:09 PM" },
          { sender: "ai-match", content: "WE DID IT", time: "2:09 PM" },
          { sender: "ai-alice", content: "🌍💚", time: "2:09 PM" },
        ]
      case "Alex":
        return [
          { sender: "ai-match", content: "alex finally agreed to meet someone. this is historic", time: "7:00 PM" },
          { sender: "ai-alice", content: "alice is a TOTAL foodie. like she travels for food", time: "7:01 PM" },
          { sender: "them", content: "okay now i'm interested. hi alice", time: "7:02 PM" },
          { sender: "me", content: "hi! so what kind of restaurant do you have?", time: "7:03 PM" },
          { sender: "them", content: "modern middle eastern. lots of bold flavors, spices, family recipes reimagined", time: "7:04 PM" },
          { sender: "ai-alice", content: "alice tell him your comfort food thing", time: "7:05 PM" },
          { sender: "me", content: "honestly? a perfectly made pasta carbonara", time: "7:06 PM" },
          { sender: "them", content: "respect. simple done right is everything. i'm hosting a dinner party saturday, you should come", time: "7:07 PM" },
          { sender: "ai-match", content: "he NEVER invites people to his dinner parties", time: "7:08 PM" },
          { sender: "ai-alice", content: "SAY YES ALICE", time: "7:08 PM" },
          { sender: "me", content: "i'd love to come", time: "7:09 PM" },
          { sender: "ai-match", content: "mission accomplished 🎯", time: "7:09 PM" },
        ]
      default:
        return [
          { sender: "ai-alice", content: "hey alice, i want you to meet someone special", time: "10:00 AM" },
          { sender: "ai-match", content: "hey! i think you two will really hit it off", time: "10:01 AM" },
          { sender: "them", content: "Hi! Great to match with you", time: "10:02 AM" },
          { sender: "me", content: "Hi! Nice to meet you too", time: "10:03 AM" },
        ]
    }
  }

  const messages = selectedMatch ? getMessagesForMatch(selectedMatch.name) : []

  // Show conversation view if a match is selected, otherwise show matches list
  if (selectedMatch) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedMatch(null)}
              className="w-10 h-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-[var(--rose)]" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--blush)] to-[var(--cream)]" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold">{`${selectedMatch.name}, ${selectedMatch.age}`}</h2>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedMatch.connections.points.slice(0, 2).map((point, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--rose)]/10 text-[var(--rose)]"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Matchmaker Note */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--rose)]/5 to-[var(--blush)]/5 border border-[var(--rose)]/10">
            <div className="flex gap-2 items-start">
              <Sparkles className="w-3.5 h-3.5 text-[var(--rose)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {selectedMatch.connections.aiNote}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((msg, index) => {
            const isAiMessage = msg.sender === "ai-alice" || msg.sender === "ai-match"
            const isAliceAi = msg.sender === "ai-alice"
            const isMatchAi = msg.sender === "ai-match"

            return (
              <div key={index} className={`flex ${msg.sender === "me" ? "justify-end" : isAiMessage ? "justify-center" : "justify-start"}`}>
                <div className={`${isAiMessage ? "max-w-[85%]" : "max-w-[70%]"} space-y-1`}>
                  {isAliceAi && (
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Sparkles className="w-3 h-3 text-[var(--rose)]" />
                      <span className="text-[10px] font-medium text-[var(--rose)]">Glimpse (yours)</span>
                    </div>
                  )}
                  {isMatchAi && (
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Sparkles className="w-3 h-3 text-[var(--blush)]" />
                      <span className="text-[10px] font-medium text-[var(--blush)]">{selectedMatch.name}'s Glimpse</span>
                    </div>
                  )}
                  <div
                    className={`
                      rounded-2xl px-3.5 py-2.5 text-pretty leading-relaxed text-sm
                      ${msg.sender === "me"
                        ? "gradient-rose-blush text-white"
                        : isAliceAi
                        ? "bg-gradient-to-br from-[var(--rose)]/10 to-[var(--blush)]/10 border border-[var(--rose)]/20 text-foreground italic"
                        : isMatchAi
                        ? "bg-gradient-to-br from-[var(--blush)]/10 to-[var(--cream)]/10 border border-[var(--blush)]/20 text-foreground italic"
                        : "bg-card border border-border"}
                    `}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-muted-foreground ${msg.sender === "me" ? "text-right" : isAiMessage ? "text-center" : "text-left"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-11 rounded-xl"
            />
            <Button size="lg" className="h-11 w-11 rounded-xl gradient-rose-blush text-white p-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Matches List View
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="w-6 h-6 text-[var(--rose)]" fill="var(--rose)" />
          {"Matches"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {matches.map((match) => (
          <button
            key={match.id}
            onClick={() => setSelectedMatch(match)}
            className="w-full p-4 border-b border-border text-left transition-colors active:bg-muted"
          >
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--blush)] to-[var(--cream)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{`${match.name}, ${match.age}`}</h3>
                  <span className="text-xs text-muted-foreground">{match.time}</span>
                </div>
                <p
                  className={`text-sm truncate ${match.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}
                >
                  {match.lastMessage}
                </p>
              </div>
              {match.unread && <div className="w-2 h-2 rounded-full bg-[var(--rose)] mt-2" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
