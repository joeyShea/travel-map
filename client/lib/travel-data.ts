export interface Activity {
  id: string
  title: string
  description: string
  image: string
  lat: number
  lng: number
}

export interface TravelReview {
  id: string
  title: string
  thumbnail: string
  author: string
  date: string
  lat: number
  lng: number
  summary: string
  description: string
  activities: Activity[]
}

export const travelReviews: TravelReview[] = [
  {
    id: "kyoto",
    title: "Kyoto, Japan",
    thumbnail: "/images/kyoto-thumb.jpg",
    author: "Mika Tanaka",
    date: "March 2025",
    lat: 35.0116,
    lng: 135.7681,
    summary:
      "Ancient temples, cherry blossoms, and serene gardens make Kyoto an unforgettable cultural immersion.",
    description:
      "Kyoto is the cultural heart of Japan. Spending ten days here let us experience everything from dawn meditation sessions at Zen temples to evening strolls through geisha districts illuminated by paper lanterns. The city moves at a pace that rewards patience. Each neighborhood has its own personality: the artistic energy of Higashiyama, the quiet refinement of Arashiyama, and the spiritual depth of Fushimi. We visited during peak cherry blossom season, and the entire city transformed into a pink and white dreamscape. The food alone is worth the trip. Multi-course kaiseki dinners, freshly made matcha in centuries-old tea houses, and the best ramen I have ever eaten at a tiny seven-seat counter. Kyoto teaches you to slow down and notice the details that other cities rush past.",
    activities: [
      {
        id: "kyoto-bamboo",
        title: "Arashiyama Bamboo Grove",
        description:
          "Walking through the towering bamboo is surreal. Get there before 7AM to avoid crowds and hear the wind rustle through the stalks.",
        image: "/images/kyoto-bamboo.jpg",
        lat: 35.0170,
        lng: 135.6713,
      },
      {
        id: "kyoto-fushimi",
        title: "Fushimi Inari Shrine",
        description:
          "Thousands of vermillion torii gates wind up the mountainside. The full hike takes about two hours and gets progressively quieter the higher you climb.",
        image: "/images/kyoto-fushimi.jpg",
        lat: 34.9671,
        lng: 135.7727,
      },
      {
        id: "kyoto-kinkaku",
        title: "Kinkaku-ji Golden Pavilion",
        description:
          "The gold-leaf covered temple reflected in the mirror pond is one of the most photographed scenes in Japan. Worth visiting in both sun and rain for different moods.",
        image: "/images/kyoto-kinkaku.jpg",
        lat: 35.0394,
        lng: 135.7292,
      },
    ],
  },
  {
    id: "santorini",
    title: "Santorini, Greece",
    thumbnail: "/images/santorini-thumb.jpg",
    author: "Elena Papadopoulos",
    date: "June 2025",
    lat: 36.3932,
    lng: 25.4615,
    summary:
      "White-washed cliffs, blazing sunsets, and incredible Mediterranean cuisine on a volcanic island paradise.",
    description:
      "Santorini exceeds every postcard image you have ever seen. The caldera views from Oia at sunset genuinely left us speechless. We spent a week exploring the island, splitting time between the popular northern villages and the quieter southern beaches. The volcanic landscape creates a dramatic contrast: stark white architecture against deep blue sea and jet-black sand beaches. Every meal was exceptional. Fresh-caught seafood, local fava dip, cherry tomatoes that taste like candy, and the crisp Assyrtiko wines grown in the volcanic soil. The island rewards those who wander. Some of our best moments were stumbling onto hidden chapels, empty swimming spots, and family-run tavernas away from the tourist paths. Late September proved to be the perfect time: warm enough to swim, fewer crowds, and the golden light photographers dream about.",
    activities: [
      {
        id: "santorini-oia",
        title: "Oia Sunset Walk",
        description:
          "The famous Santorini sunset from Oia castle ruins. Arrive at least an hour early to claim a spot. The walk from Fira to Oia along the caldera rim is unforgettable.",
        image: "/images/santorini-oia.jpg",
        lat: 36.4618,
        lng: 25.3753,
      },
      {
        id: "santorini-beach",
        title: "Red Beach",
        description:
          "A short hike down to this dramatic volcanic beach with towering red cliffs. The contrast of red rock, black sand, and turquoise water is stunning.",
        image: "/images/santorini-beach.jpg",
        lat: 36.3484,
        lng: 25.3955,
      },
      {
        id: "santorini-wine",
        title: "Venetsanos Winery",
        description:
          "Perched on the caldera edge, this winery offers incredible tastings of local Assyrtiko with unbeatable views. The volcanic soil gives the wine a unique mineral character.",
        image: "/images/santorini-wine.jpg",
        lat: 36.3871,
        lng: 25.4332,
      },
    ],
  },
  {
    id: "patagonia",
    title: "Patagonia, Chile",
    thumbnail: "/images/patagonia-thumb.jpg",
    author: "Carlos Mendez",
    date: "January 2025",
    lat: -51.0,
    lng: -73.0,
    summary:
      "Raw wilderness at the end of the world. Glaciers, granite towers, and some of the best trekking on the planet.",
    description:
      "Patagonia is nature at its most dramatic and unapologetic. We spent twelve days trekking through Torres del Paine National Park and exploring the surrounding region. The scale of the landscape is hard to convey in words or photos. Granite spires rise thousands of feet above turquoise lakes. Glaciers the size of cities calve massive chunks of ice into milky water. The wind is relentless and the weather changes by the hour, but that is part of the magic. On a single day you might experience all four seasons. The W Trek was the highlight: five days of diverse terrain from dense forests to exposed ridgelines with views that stopped us in our tracks. The remoteness is part of the appeal. Limited cell service, simple refugios, and the constant reminder that nature is in charge here. We returned home physically exhausted but deeply recharged.",
    activities: [
      {
        id: "patagonia-glacier",
        title: "Grey Glacier",
        description:
          "A massive glacier you can approach by boat or on foot. The ice is electric blue and the sound of calving echoes across the valley. Utterly humbling in scale.",
        image: "/images/patagonia-glacier.jpg",
        lat: -51.0167,
        lng: -73.2167,
      },
      {
        id: "patagonia-trail",
        title: "W Trek Base Camp",
        description:
          "The iconic viewpoint of the three Torres granite towers. The final push is a steep boulder scramble but the reward is one of the most dramatic landscapes on Earth.",
        image: "/images/patagonia-trail.jpg",
        lat: -50.9423,
        lng: -72.9655,
      },
      {
        id: "patagonia-lake",
        title: "Lake Pehoe Viewpoint",
        description:
          "Impossibly turquoise water surrounded by granite peaks and glaciers. The light changes constantly and every angle reveals a new composition.",
        image: "/images/patagonia-lake.jpg",
        lat: -51.1000,
        lng: -73.1000,
      },
    ],
  },
  {
    id: "marrakech",
    title: "Marrakech, Morocco",
    thumbnail: "/images/marrakech-thumb.jpg",
    author: "Amina Belhaj",
    date: "October 2025",
    lat: 31.6295,
    lng: -7.9811,
    summary:
      "A sensory overload of spice markets, ornate palaces, and the most vibrant street culture you will ever encounter.",
    description:
      "Marrakech is controlled chaos in the best possible way. The medina is a labyrinth of narrow alleys that open into unexpected courtyards, each one more beautiful than the last. We stayed in a traditional riad tucked behind an unremarkable wooden door that opened into a paradise of zellige tiles, carved cedar, and a courtyard pool surrounded by orange trees. The souks are overwhelming at first but quickly become addictive. You learn to navigate by scent: leather tanneries, fresh mint, baking bread, and the ever-present cumin and saffron. Moroccan hospitality is genuine and warm. Strangers invited us for tea, shop owners shared family recipes, and our riad host treated us like old friends. The food is extraordinary: tagines slow-cooked in earthenware, fresh flatbread pulled from wood-fired ovens, and pastilla that somehow combines sweet and savory perfectly. Marrakech is not a place you visit. It is a place you experience.",
    activities: [
      {
        id: "marrakech-jardin",
        title: "Jardin Majorelle",
        description:
          "Yves Saint Laurent's cobalt blue garden retreat. The vivid colors and exotic plant collection create a tranquil oasis from the chaotic medina. Visit early morning for near-empty paths.",
        image: "/images/marrakech-jardin.jpg",
        lat: 31.6418,
        lng: -8.0033,
      },
      {
        id: "marrakech-square",
        title: "Jemaa el-Fnaa",
        description:
          "The beating heart of Marrakech. By day it is a market, by night it transforms into an open-air food festival with storytellers, musicians, and performers. Go with an empty stomach.",
        image: "/images/marrakech-square.jpg",
        lat: 31.6258,
        lng: -7.9891,
      },
      {
        id: "marrakech-palace",
        title: "Bahia Palace",
        description:
          "A masterpiece of Moroccan architecture with intricate zellige tilework and carved stucco. The scale and detail are breathtaking. Budget at least two hours to properly explore.",
        image: "/images/marrakech-palace.jpg",
        lat: 31.6217,
        lng: -7.9830,
      },
    ],
  },
  {
    id: "iceland",
    title: "Iceland Ring Road",
    thumbnail: "/images/iceland-thumb.jpg",
    author: "Erik Johansson",
    date: "September 2025",
    lat: 64.9631,
    lng: -19.0208,
    summary:
      "Otherworldly landscapes of fire and ice. Waterfalls, glaciers, geothermal pools, and the northern lights in a single road trip.",
    description:
      "Driving the Ring Road around Iceland is the closest you can get to visiting another planet while still on Earth. In ten days we circled the entire island, and every hour brought a landscape so different from the last that it felt like teleporting between worlds. Black sand deserts gave way to lush green valleys, which opened into vast lava fields stretching to the horizon. The waterfalls alone are worth the trip: dozens of them, each unique, most of them free and accessible right from the road. What surprised us most was the light. In September, the days are long enough to explore but short enough to catch the northern lights dancing overhead at night. The geothermal activity is everywhere: steam rising from hillsides, hot springs hidden in remote valleys, and the iconic Blue Lagoon. Iceland is expensive but the experience is priceless. We camped several nights to keep costs down and woke up to views that no hotel window could match.",
    activities: [
      {
        id: "iceland-waterfall",
        title: "Skogafoss Waterfall",
        description:
          "A thundering 60-meter waterfall that produces a constant rainbow in its spray. Climb the stairs to the top for a view along the river valley that stretches to the horizon.",
        image: "/images/iceland-waterfall.jpg",
        lat: 63.5321,
        lng: -19.5113,
      },
      {
        id: "iceland-lagoon",
        title: "Blue Lagoon",
        description:
          "The milky-blue geothermal spa surrounded by jet-black lava fields. Book the earliest time slot for the most serene experience. The silica mud masks are oddly satisfying.",
        image: "/images/iceland-lagoon.jpg",
        lat: 63.8803,
        lng: -22.4495,
      },
      {
        id: "iceland-glacier",
        title: "Jokulsarlon Glacier Lagoon",
        description:
          "Icebergs float silently in this glacial lagoon before drifting out to sea. Visit the adjacent Diamond Beach where chunks of ice wash up on black sand like scattered jewels.",
        image: "/images/iceland-glacier.jpg",
        lat: 64.0784,
        lng: -16.2306,
      },
    ],
  },
]
