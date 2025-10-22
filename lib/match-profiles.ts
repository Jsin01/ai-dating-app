// Mock match profiles with detailed characteristics

export interface MatchProfile {
  id: string
  name: string
  age: number
  ethnicity: string
  appearance: string // For Veo 3.1 prompts
  occupation: string
  location: string
  bio: string // DEPRECATED - kept for Veo prompts only
  interests: string[]
  personality: string[]
  dealbreakers: string[]
  lookingFor: string
  conversationStyle: string
  // What his AI matchmaker would share about him (friend-of-friend style)
  matchmakerInsights: string[]
}

export const MATCH_PROFILES: MatchProfile[] = [
  {
    id: "match_1",
    name: "Marcus",
    age: 37,
    ethnicity: "Black",
    appearance: "a 37-year-old Black man with short fade haircut, warm smile, athletic build, casual-professional style",
    occupation: "Software Engineer at a startup",
    location: "Santa Monica, CA",
    bio: "Tech lead by day, coffee snob by weekend. I debug code and brew the perfect pour-over. Looking for someone who appreciates deep conversations and spontaneous adventures.",
    interests: ["specialty coffee", "hiking", "live music", "cooking", "tech", "photography"],
    personality: ["thoughtful", "curious", "adventurous", "good listener", "witty"],
    dealbreakers: ["smoking", "lack of ambition"],
    lookingFor: "Someone intellectually curious who enjoys both quiet mornings and spontaneous road trips",
    conversationStyle: "Asks thoughtful questions, shares personal stories, uses humor, discusses ideas and experiences",
    matchmakerInsights: [
      "his matchmaker says he's a total coffee nerd - like, he has three different pour-over setups",
      "apparently he loves live music and goes to shows constantly - especially electronic and indie",
      "his matchmaker mentioned he's really thoughtful - asks deep questions, actually listens",
      "she told me the cutest thing - he loves spontaneous road trips, just picks a direction and goes",
      "he's super into hiking but also values quiet mornings with good coffee and a book",
      "his matchmaker says he can't stand when people aren't curious or ambitious about life"
    ]
  },
  {
    id: "match_2",
    name: "David",
    age: 34,
    ethnicity: "Asian",
    appearance: "a 34-year-old Asian man with styled black hair, glasses, lean build, modern casual style",
    occupation: "Product Designer",
    location: "Venice, CA",
    bio: "Design thinking meets real life. I create beautiful interfaces and enjoy finding beauty in everyday moments. Equally happy at an art gallery or trying new street food.",
    interests: ["design", "art galleries", "street food", "yoga", "indie films", "vintage shops"],
    personality: ["creative", "empathetic", "detail-oriented", "calm", "culturally curious"],
    dealbreakers: ["closed-mindedness", "always being late"],
    lookingFor: "A creative spirit who appreciates art, good design, and authentic connections",
    conversationStyle: "Observant, asks about feelings and perspectives, visual storyteller, appreciates aesthetics",
    matchmakerInsights: [
      "his matchmaker told me the cutest thing - he finds beauty in everyday moments, like morning light through coffee steam",
      "apparently he's super into art and design - loves wandering through galleries and vintage shops",
      "his matchmaker says he's really empathetic and asks thoughtful questions about how people feel",
      "she mentioned he does yoga regularly - values that calm, centered energy",
      "he's obsessed with trying new street food - his matchmaker says food is like art to him",
      "his matchmaker warned he can't stand lateness or closed-mindedness - values respect and openness"
    ]
  },
  {
    id: "match_3",
    name: "James",
    age: 36,
    ethnicity: "Latino",
    appearance: "a 36-year-old Latino man with wavy dark hair, athletic build, bright smile, casual-sporty style",
    occupation: "Physical Therapist",
    location: "Culver City, CA",
    bio: "Helping people move better by day, moving to the rhythm by night. Dance is my therapy. Looking for someone who isn't afraid to be silly and try new things.",
    interests: ["salsa dancing", "beach volleyball", "cooking Latin food", "live music", "fitness", "travel"],
    personality: ["energetic", "warm", "optimistic", "physical", "family-oriented"],
    dealbreakers: ["negativity", "not taking care of health"],
    lookingFor: "Someone active and positive who loves to laugh and isn't afraid to dance",
    conversationStyle: "Enthusiastic, expressive, talks about experiences and feelings, encouraging, playful",
    matchmakerInsights: [
      "his matchmaker says he's pure energy - helps people move better as a physical therapist",
      "apparently dance is his therapy - loves salsa and just moving to music",
      "his matchmaker told me he's super warm and optimistic, always makes people laugh",
      "she says he's really physical and active - beach volleyball, fitness, the whole thing",
      "he's big on family and positive energy - can't stand negativity",
      "his matchmaker says he values people who take care of themselves and aren't afraid to be silly"
    ]
  },
  {
    id: "match_4",
    name: "Ryan",
    age: 33,
    ethnicity: "White",
    appearance: "a 33-year-old White man with sandy brown hair, trimmed beard, casual-outdoorsy style, relaxed build",
    occupation: "Environmental Scientist",
    location: "Manhattan Beach, CA",
    bio: "Ocean advocate and weekend surfer. I study climate change and catch waves. Looking for someone who cares about the planet and isn't afraid to get sandy.",
    interests: ["surfing", "environmental activism", "documentaries", "farmers markets", "camping", "craft beer"],
    personality: ["passionate", "laid-back", "intelligent", "authentic", "nature-loving"],
    dealbreakers: ["materialism", "not caring about the environment"],
    lookingFor: "An authentic person who values experiences over things and cares about making a difference",
    conversationStyle: "Passionate about causes, shares knowledge, asks about values, relaxed and genuine",
    matchmakerInsights: [
      "his matchmaker says he's all about the ocean - surfs every weekend and studies climate change",
      "apparently he's super passionate about environmental stuff but also really laid-back",
      "his matchmaker told me he values experiences over things - camping, farmers markets, that vibe",
      "she says he's genuinely authentic and intelligent, asks deep questions about values",
      "he can't stand materialism or people who don't care about the planet",
      "his matchmaker says he's looking for someone real who wants to make a difference"
    ]
  },
  {
    id: "match_5",
    name: "Alex",
    age: 35,
    ethnicity: "Middle Eastern",
    appearance: "a 35-year-old Middle Eastern man with dark curly hair, expressive eyes, fitted casual style, medium build",
    occupation: "Chef/Restaurant Owner",
    location: "Downtown LA",
    bio: "I create experiences through food. My restaurant is my canvas. Looking for someone who treats meals as adventures and isn't afraid of bold flavors.",
    interests: ["cooking", "wine tasting", "food travel", "music", "hosting dinner parties", "farmers markets"],
    personality: ["passionate", "generous", "creative", "confident", "sensual"],
    dealbreakers: ["picky eaters", "being judgemental"],
    lookingFor: "A foodie partner in crime who loves trying new flavors and cultures",
    conversationStyle: "Passionate, sensory descriptions, tells stories through food, asks about preferences and experiences",
    matchmakerInsights: [
      "his matchmaker says he's a chef and restaurant owner - food is literally his art form",
      "apparently he's super passionate and creative - loves creating experiences through food",
      "his matchmaker told me he's generous and confident, loves hosting dinner parties",
      "she says he's all about bold flavors and food travel - treats meals like adventures",
      "he can't stand picky eaters or judgmental people",
      "his matchmaker says he wants a foodie partner who loves trying new things and exploring cultures"
    ]
  },
]

// Get a random match for glimpse generation
export function getRandomMatch(): MatchProfile {
  return MATCH_PROFILES[Math.floor(Math.random() * MATCH_PROFILES.length)]
}

// Get match by ID
export function getMatchById(id: string): MatchProfile | undefined {
  return MATCH_PROFILES.find(m => m.id === id)
}

// Get match by name
export function getMatchByName(name: string): MatchProfile | undefined {
  return MATCH_PROFILES.find(m => m.name.toLowerCase() === name.toLowerCase())
}
