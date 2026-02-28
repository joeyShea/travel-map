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
    id: "nyc",
    title: "New York City, NY",
    thumbnail: "/images/nyc.jpg",
    author: "Jordan Rivera",
    date: "November 2025",
    lat: 40.7128,
    lng: -74.006,
    summary:
      "Five boroughs, infinite neighborhoods, and an energy unlike anywhere else on Earth. New York never stops surprising you.",
    description:
      "New York City operates on a frequency all its own. After a week exploring all five boroughs, I came away convinced that no other city on Earth packs this much texture into a single square mile, let alone across dozens of distinct neighborhoods. Manhattan gets all the attention but the real discoveries happen in Brooklyn's quiet side streets, in the food markets of Queens, and along the waterfront in the Bronx. The food scene alone justifies the trip cost: hand-pulled noodles in Flushing, century-old delis in the East Village, and a $2 slice of pizza that beats most fancy restaurants I have been to anywhere. Central Park in late autumn is genuinely one of the most beautiful urban landscapes in the world. The leaves turn gold and orange and the city sounds fade behind the tree line in a way that feels impossible given the skyline looming overhead. New York is exhausting in the best sense. You sleep well because you have actually lived a full day.",
    activities: [
      {
        id: "nyc-centralpark",
        title: "Central Park in Fall",
        description:
          "Eight hundred acres of green in the middle of Manhattan. Rent a bike to cover ground, but leave time to wander. The Ramble and Bethesda Fountain are the highlights.",
        image: "/images/central_park_crop.jpg",
        lat: 40.7851,
        lng: -73.9683,
      },
      {
        id: "nyc-brooklyn-bridge",
        title: "Brooklyn Bridge Walk",
        description:
          "Walk from Manhattan to Brooklyn for the best skyline view in the city. Go early morning on a weekday to have the pedestrian path mostly to yourself and catch the light hitting the towers.",
        image: "/images/bk-bridge.jpg",
        lat: 40.7061,
        lng: -73.9969,
      },
    ],
  },
  {
    id: "yellowstone",
    title: "Yellowstone National Park, WY",
    thumbnail: "/images/yellow.jpg",
    author: "Sam Okafor",
    date: "July 2025",
    lat: 44.428,
    lng: -110.5885,
    summary:
      "The world's first national park still delivers. Geysers, bison herds, prismatic hot springs, and skies full of stars.",
    description:
      "Yellowstone sits on top of one of the largest volcanic systems on the planet and it makes no effort to hide that fact. The geothermal activity is everywhere: the ground hisses, pools of water boil in neon colors, and Old Faithful erupts on a schedule that makes you feel like the earth is performing for an audience. We spent five days driving the figure-eight loop and barely scratched the surface. The wildlife density is extraordinary by any measure. Within the first afternoon we had spotted a bison herd crossing the road, a black bear with cubs in the treeline, and a wolf pack moving across an open meadow in the Lamar Valley. The Grand Prismatic Spring is the single most otherworldly thing I have ever seen in person. The colors shift from deep blue at the center to green, yellow, and flame orange at the edges in a way that photographs simply cannot capture at full scale. Camp inside the park if you can. The night sky with no light pollution overhead is the kind of dark that reminds you how bright the stars actually are.",
    activities: [
      {
        id: "yellowstone-oldfaithful",
        title: "Old Faithful Geyser",
        description:
          "The most famous geyser in the world erupts roughly every 90 minutes, shooting boiling water up to 180 feet in the air. Watch from the boardwalk and stay for a second eruption to truly appreciate the scale.",
        image: "/images/faithful.jpg",
        lat: 44.4605,
        lng: -110.8281,
      },
      {
        id: "yellowstone-prismatic",
        title: "Grand Prismatic Spring",
        description:
          "The largest hot spring in the US and the most visually stunning. The overlook trail above it gives you the full rainbow effect that you cannot see from the boardwalk level. Worth the short steep climb.",
        image: "/images/prismatic.jpg",
        lat: 44.5251,
        lng: -110.8382,
      }
    ],
  },
  {
    id: "lincoln-ne",
    title: "Lincoln, NE",
    thumbnail: "/images/lincoln.jpg",
    author: "Jordan Rivera",
    date: "February 2026",
    lat: 40.8136,
    lng: -96.7026,
    summary:
      "A college town with genuine character. Great food scene, beautiful trails, and the kind of Midwest warmth that is hard to find anywhere else.",
    description:
      "Lincoln surprises people who write it off as flyover country. The city has a creative, unpretentious energy driven largely by the University of Nebraska, and the downtown Haymarket district is one of the most walkable and genuinely fun neighborhoods I have spent time in. The food scene punches well above its weight for a city this size. Excellent craft breweries, farm-to-table restaurants sourcing from the surrounding prairie, and a Saturday farmers market that draws the whole city. Robber's Cave is one of those local secrets that feels like it belongs in another era entirely. Memorial Stadium on game day is a religious experience in the truest sense — 90,000 people dressed in red and louder than anything you have heard. Sunsets here are legitimately world class. The flat horizon in every direction means the sky puts on a full show, and in summer the lightning storms rolling in across the prairie are something you will not forget.",
    activities: [
      {
        id: "lincoln-stadium",
        title: "Memorial Stadium",
        description:
          "On game day this place becomes the third-largest city in Nebraska. The sea of red and the noise level are unlike any other college football experience. Even an empty stadium tour is worth it.",
        image: "/images/memorial-stadium.webp",
        lat: 40.8208,
        lng: -96.7057,
      },
      {
        id: "lincoln-robberscave",
        title: "Robber's Cave",
        description:
          "A sandstone cave system beneath the south part of the city with a surprisingly deep history — used by outlaws, bootleggers, and brewers at various points. Tours run on weekends and fill up fast.",
        image: "/images/robberscave.jpeg",
        lat: 40.7983,
        lng: -96.6889,
      },
      {
        id: "lincoln-dish",
        title: "The Dish",
        description:
          "One of Lincoln's most beloved local spots. Relaxed atmosphere, creative menu, and the kind of place where the staff actually knows the regulars. Go for brunch if you can.",
        image: "/images/dish-resturant.jpg",
        lat: 40.8172,
        lng: -96.6997,
      },
    ],
  },
]
