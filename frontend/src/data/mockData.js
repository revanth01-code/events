// Mock data for the Local Event Finder & Planner app

// Mock user location (can be overridden by actual geolocation)
export const mockUserLocation = {
  lat: 37.7749,
  lng: -122.4194,
  city: "San Francisco",
  state: "CA",
  country: "USA"
};

// Mock events data
export const mockEvents = [
  {
    id: "evt-1",
    title: "Summer Music Festival",
    description: "Join us for an amazing outdoor music festival featuring local and international artists. Food trucks, craft beer, and great vibes!",
    date: "2025-07-25",
    time: "18:00",
    location: {
      name: "Golden Gate Park",
      address: "Golden Gate Park, San Francisco, CA",
      lat: 37.7694,
      lng: -122.4862
    },
    category: "Music",
    price: { min: 25, max: 75, currency: "USD" },
    organizer: {
      id: "org-1",
      name: "SF Events Co.",
      rating: 4.8,
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
    },
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    attendees: 342,
    rating: 4.6,
    reviews: [
      {
        id: "rev-1",
        user: "Alex Chen",
        rating: 5,
        comment: "Amazing experience! Great lineup and perfect weather.",
        date: "2025-07-10"
      },
      {
        id: "rev-2", 
        user: "Sarah Johnson",
        rating: 4,
        comment: "Good event, a bit crowded but worth it.",
        date: "2025-07-08"
      }
    ]
  },
  {
    id: "evt-2",
    title: "Tech Startup Networking Mixer",
    description: "Connect with fellow entrepreneurs, investors, and tech professionals in the heart of downtown.",
    date: "2025-07-28",
    time: "19:00",
    location: {
      name: "WeWork SOMA",
      address: "535 Mission St, San Francisco, CA",
      lat: 37.7879,
      lng: -122.3972
    },
    category: "Networking",
    price: { min: 0, max: 0, currency: "USD" },
    organizer: {
      id: "org-2",
      name: "TechConnect SF",
      rating: 4.5,
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
    },
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
    attendees: 156,
    rating: 4.3,
    reviews: []
  },
  {
    id: "evt-3",
    title: "Weekend Food Truck Rally",
    description: "Discover the best food trucks in the Bay Area at our weekend rally. Live music and family-friendly activities!",
    date: "2025-07-30",
    time: "11:00",
    location: {
      name: "Crissy Field",
      address: "Crissy Field, San Francisco, CA",
      lat: 37.8024,
      lng: -122.4662
    },
    category: "Food & Drink",
    price: { min: 0, max: 20, currency: "USD" },
    organizer: {
      id: "org-3",
      name: "Bay Area Foodies",
      rating: 4.7,
      photo: "https://images.unsplash.com/photo-1494790108755-2616b332c00b?w=100"
    },
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    attendees: 289,
    rating: 4.8,
    reviews: []
  },
  {
    id: "evt-4",
    title: "Morning Yoga in the Park",
    description: "Start your day with peaceful yoga sessions led by certified instructors. All levels welcome!",
    date: "2025-08-02",
    time: "08:00",
    location: {
      name: "Dolores Park",
      address: "Dolores Park, San Francisco, CA",
      lat: 37.7596,
      lng: -122.4269
    },
    category: "Health & Wellness",
    price: { min: 15, max: 15, currency: "USD" },
    organizer: {
      id: "org-4",
      name: "Zen Wellness",
      rating: 4.9,
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
    },
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    attendees: 67,
    rating: 4.9,
    reviews: []
  }
];

// Mock organizers data
export const mockOrganizers = [
  {
    id: "org-1",
    name: "SF Events Co.",
    description: "Premier event organizing company specializing in music festivals and cultural events.",
    rating: 4.8,
    totalEvents: 23,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    location: {
      lat: 37.7849,
      lng: -122.4094,
      city: "San Francisco"
    },
    categories: ["Music", "Festivals", "Entertainment"],
    contact: {
      email: "hello@sfevents.com",
      phone: "(555) 123-4567"
    },
    recentEvents: ["Summer Music Festival", "Jazz Night", "Rock Concert"]
  },
  {
    id: "org-2",
    name: "TechConnect SF",
    description: "Building bridges in the tech community through networking events and workshops.",
    rating: 4.5,
    totalEvents: 18,
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    location: {
      lat: 37.7879,
      lng: -122.3972,
      city: "San Francisco"
    },
    categories: ["Networking", "Technology", "Business"],
    contact: {
      email: "connect@techconnectsf.com",
      phone: "(555) 987-6543"
    },
    recentEvents: ["Startup Mixer", "AI Workshop", "Founder's Dinner"]
  },
  {
    id: "org-3",
    name: "Bay Area Foodies",
    description: "Celebrating the diverse culinary scene of the Bay Area through food events and tastings.",
    rating: 4.7,
    totalEvents: 31,
    photo: "https://images.unsplash.com/photo-1494790108755-2616b332c00b?w=200",
    location: {
      lat: 37.8024,
      lng: -122.4662,
      city: "San Francisco"
    },
    categories: ["Food & Drink", "Culinary", "Community"],
    contact: {
      email: "taste@bayareafoodies.com",
      phone: "(555) 456-7890"
    },
    recentEvents: ["Food Truck Rally", "Wine Tasting", "Chef's Table"]
  }
];

// Mock user data
export const mockUser = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  location: {
    lat: 37.7749,
    lng: -122.4194,
    city: "San Francisco",
    state: "CA"
  },
  savedEvents: ["evt-1", "evt-3"],
  createdEvents: [],
  preferences: {
    categories: ["Music", "Food & Drink"],
    maxDistance: 25,
    priceRange: { min: 0, max: 50 }
  }
};

// Mock nearby events function
export const getNearbyEvents = (userLat, userLng, maxDistance = 25) => {
  return mockEvents.map(event => {
    const distance = calculateDistance(
      userLat, userLng, 
      event.location.lat, event.location.lng
    );
    return {
      ...event,
      distance: distance.toFixed(1)
    };
  }).filter(event => parseFloat(event.distance) <= maxDistance)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};

// Mock nearby organizers function
export const getNearbyOrganizers = (userLat, userLng, maxDistance = 25) => {
  return mockOrganizers.map(organizer => {
    const distance = calculateDistance(
      userLat, userLng,
      organizer.location.lat, organizer.location.lng
    );
    return {
      ...organizer,
      distance: distance.toFixed(1)
    };
  }).filter(org => parseFloat(org.distance) <= maxDistance)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};

// Helper function to calculate distance between two points
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Categories
export const eventCategories = [
  "Music",
  "Food & Drink", 
  "Networking",
  "Health & Wellness",
  "Arts & Culture",
  "Sports & Recreation",
  "Education",
  "Business",
  "Community",
  "Entertainment"
];

// Price ranges for filtering
export const priceRanges = [
  { label: "Free", min: 0, max: 0 },
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100+", min: 100, max: 999999 }
];