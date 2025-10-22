"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock } from "lucide-react"

const events = [
  {
    id: 1,
    title: "Coffee & Conversation",
    date: "Tomorrow, 10:00 AM",
    location: "Blue Bottle Coffee, Hayes Valley",
    attendees: 12,
    category: "Coffee",
    image: "from-amber-100 to-orange-100",
  },
  {
    id: 2,
    title: "Sunset Hike at Lands End",
    date: "Saturday, 5:00 PM",
    location: "Lands End Trail, SF",
    attendees: 8,
    category: "Outdoor",
    image: "from-blue-100 to-purple-100",
  },
  {
    id: 3,
    title: "Wine Tasting Social",
    date: "Sunday, 3:00 PM",
    location: "The Cavalier, Union Square",
    attendees: 15,
    category: "Social",
    image: "from-rose-100 to-pink-100",
  },
  {
    id: 4,
    title: "Museum Night",
    date: "Next Friday, 7:00 PM",
    location: "SFMOMA",
    attendees: 20,
    category: "Culture",
    image: "from-purple-100 to-indigo-100",
  },
]

export function EventsView() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-4xl mx-auto px-6 py-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{"Discover Events"}</h1>
            <p className="text-muted-foreground">{"Meet your matches in person at curated experiences"}</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["All", "Coffee", "Outdoor", "Social", "Culture"].map((filter) => (
            <Button
              key={filter}
              variant={filter === "All" ? "default" : "outline"}
              className={`rounded-full ${filter === "All" ? "gradient-rose-blush text-white border-0" : ""}`}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Event Image */}
              <div className={`aspect-video bg-gradient-to-br ${event.image} relative`}>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 backdrop-blur-sm text-foreground border-0">{event.category}</Badge>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold group-hover:text-[var(--rose)] transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{`${event.attendees} attending`}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full rounded-xl gradient-rose-blush text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  {"Reserve Spot"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
