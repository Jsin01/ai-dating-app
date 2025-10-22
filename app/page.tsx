"use client"

import { useState, useEffect } from "react"
import { AIChatInterface } from "@/components/ai-chat-interface"
import { ProfileSettings } from "@/components/profile-settings"
import { ExperiencesMarketplace } from "@/components/experiences-marketplace"
import { MatchesView } from "@/components/matches-view"
import { Sparkles, User, MessageCircle, Ticket, Wifi, Battery } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"chat" | "matches" | "profile" | "experiences">("chat")

  // Listen for experience match request events
  useEffect(() => {
    const handleSwitchToEchoTab = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.reason === 'experience_match') {
        setActiveTab("chat")
      }
    }

    window.addEventListener('switch-to-echo-tab', handleSwitchToEchoTab)

    return () => {
      window.removeEventListener('switch-to-echo-tab', handleSwitchToEchoTab)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black flex justify-center">
      {/* Mobile Container - constrained to iPhone width */}
      <div className="w-full max-w-[430px] flex flex-col relative">
        {/* iPhone Status Bar */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="h-11 px-6 flex items-center justify-between text-sm">
            {/* Time */}
            <span className="font-semibold">9:41</span>

            {/* Right Icons */}
            <div className="flex items-center gap-1.5">
              {/* Signal Bars */}
              <div className="flex items-end gap-[2px] h-3">
                <div className="w-[3px] h-[4px] bg-foreground rounded-sm"></div>
                <div className="w-[3px] h-[6px] bg-foreground rounded-sm"></div>
                <div className="w-[3px] h-[8px] bg-foreground rounded-sm"></div>
                <div className="w-[3px] h-[10px] bg-foreground rounded-sm"></div>
              </div>

              {/* WiFi */}
              <Wifi className="w-4 h-4" strokeWidth={2.5} />

              {/* Battery */}
              <Battery className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && <AIChatInterface />}
          {activeTab === "matches" && <MatchesView />}
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "experiences" && <ExperiencesMarketplace />}
        </div>

        {/* Bottom Tab Navigation */}
        <div className="border-t border-border bg-card/95 backdrop-blur-md sticky bottom-0 z-50 shadow-2xl">
          <div className="px-6 py-3">
            <div className="flex items-center justify-around gap-2">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex flex-col items-center gap-1.5 py-2 px-4 rounded-xl transition-all duration-300 ${
                  activeTab === "chat" ? "text-[var(--rose)]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`relative ${activeTab === "chat" ? "scale-110" : ""} transition-transform duration-300`}>
                  <Sparkles className="w-6 h-6" />
                  {activeTab === "chat" && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--rose)]" />
                  )}
                </div>
                <span className={`text-xs font-medium ${activeTab === "chat" ? "font-bold" : ""}`}>Glimpse</span>
              </button>

              <button
                onClick={() => setActiveTab("matches")}
                className={`flex flex-col items-center gap-1.5 py-2 px-4 rounded-xl transition-all duration-300 ${
                  activeTab === "matches" ? "text-[var(--rose)]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`relative ${activeTab === "matches" ? "scale-110" : ""} transition-transform duration-300`}
                >
                  <MessageCircle className="w-6 h-6" />
                  {activeTab === "matches" && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--rose)]" />
                  )}
                </div>
                <span className={`text-xs font-medium ${activeTab === "matches" ? "font-bold" : ""}`}>Matches</span>
              </button>

              <button
                onClick={() => setActiveTab("experiences")}
                className={`flex flex-col items-center gap-1.5 py-2 px-4 rounded-xl transition-all duration-300 ${
                  activeTab === "experiences" ? "text-[var(--rose)]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`relative ${activeTab === "experiences" ? "scale-110" : ""} transition-transform duration-300`}
                >
                  <Ticket className="w-6 h-6" />
                  {activeTab === "experiences" && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--rose)]" />
                  )}
                </div>
                <span className={`text-xs font-medium ${activeTab === "experiences" ? "font-bold" : ""}`}>Experiences</span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`flex flex-col items-center gap-1.5 py-2 px-4 rounded-xl transition-all duration-300 ${
                  activeTab === "profile" ? "text-[var(--rose)]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`relative ${activeTab === "profile" ? "scale-110" : ""} transition-transform duration-300`}
                >
                  <User className="w-6 h-6" />
                  {activeTab === "profile" && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--rose)]" />
                  )}
                </div>
                <span className={`text-xs font-medium ${activeTab === "profile" ? "font-bold" : ""}`}>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
