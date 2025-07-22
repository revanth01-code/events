from database import Database
from models import (
    Organizer, Event, User, Location, Contact, PriceRange, EventReview,
    EventCategory, UserPreferences
)
from auth import hash_password
import asyncio
from datetime import datetime, timedelta
import random

# Sample data for seeding
SAMPLE_LOCATIONS = [
    {"name": "Golden Gate Park", "address": "Golden Gate Park, San Francisco, CA", "lat": 37.7694, "lng": -122.4862, "city": "San Francisco", "state": "CA"},
    {"name": "WeWork SOMA", "address": "535 Mission St, San Francisco, CA", "lat": 37.7879, "lng": -122.3972, "city": "San Francisco", "state": "CA"},
    {"name": "Crissy Field", "address": "Crissy Field, San Francisco, CA", "lat": 37.8024, "lng": -122.4662, "city": "San Francisco", "state": "CA"},
    {"name": "Dolores Park", "address": "Dolores Park, San Francisco, CA", "lat": 37.7596, "lng": -122.4269, "city": "San Francisco", "state": "CA"},
    {"name": "Union Square", "address": "Union Square, San Francisco, CA", "lat": 37.7880, "lng": -122.4074, "city": "San Francisco", "state": "CA"},
    {"name": "The Fillmore", "address": "1805 Geary Blvd, San Francisco, CA", "lat": 37.7849, "lng": -122.4326, "city": "San Francisco", "state": "CA"},
]

SAMPLE_ORGANIZERS = [
    {
        "name": "SF Events Co.",
        "description": "Premier event organizing company specializing in music festivals and cultural events.",
        "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        "categories": [EventCategory.MUSIC, EventCategory.ENTERTAINMENT, EventCategory.COMMUNITY],
        "contact": {"email": "hello@sfevents.com", "phone": "(555) 123-4567"},
        "rating": 4.8,
        "totalEvents": 23
    },
    {
        "name": "TechConnect SF",
        "description": "Building bridges in the tech community through networking events and workshops.",
        "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
        "categories": [EventCategory.NETWORKING, EventCategory.BUSINESS, EventCategory.EDUCATION],
        "contact": {"email": "connect@techconnectsf.com", "phone": "(555) 987-6543"},
        "rating": 4.5,
        "totalEvents": 18
    },
    {
        "name": "Bay Area Foodies",
        "description": "Celebrating the diverse culinary scene of the Bay Area through food events and tastings.",
        "photo": "https://images.unsplash.com/photo-1494790108755-2616b332c00b?w=200",
        "categories": [EventCategory.FOOD_DRINK, EventCategory.COMMUNITY],
        "contact": {"email": "taste@bayareafoodies.com", "phone": "(555) 456-7890"},
        "rating": 4.7,
        "totalEvents": 31
    },
    {
        "name": "Zen Wellness",
        "description": "Promoting wellness and mindfulness through yoga, meditation, and holistic health events.",
        "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
        "categories": [EventCategory.HEALTH_WELLNESS, EventCategory.COMMUNITY],
        "contact": {"email": "info@zenwellness.com", "phone": "(555) 234-5678"},
        "rating": 4.9,
        "totalEvents": 15
    },
    {
        "name": "Creative Collective",
        "description": "Supporting local artists and creatives through exhibitions, workshops, and community events.",
        "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
        "categories": [EventCategory.ARTS_CULTURE, EventCategory.EDUCATION, EventCategory.COMMUNITY],
        "contact": {"email": "hello@creativecollective.com", "phone": "(555) 345-6789"},
        "rating": 4.6,
        "totalEvents": 27
    }
]

SAMPLE_EVENTS = [
    {
        "title": "Summer Music Festival",
        "description": "Join us for an amazing outdoor music festival featuring local and international artists. Food trucks, craft beer, and great vibes! This annual festival brings together music lovers from all over the Bay Area for a day of incredible performances.",
        "date": "2025-07-25",
        "time": "18:00",
        "category": EventCategory.MUSIC,
        "price": {"min": 25, "max": 75, "currency": "USD"},
        "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        "attendees": 342,
        "rating": 4.6
    },
    {
        "title": "Tech Startup Networking Mixer",
        "description": "Connect with fellow entrepreneurs, investors, and tech professionals in the heart of downtown. This monthly mixer provides a casual environment for meaningful connections and collaborations.",
        "date": "2025-07-28",
        "time": "19:00",
        "category": EventCategory.NETWORKING,
        "price": {"min": 0, "max": 0, "currency": "USD"},
        "image": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        "attendees": 156,
        "rating": 4.3
    },
    {
        "title": "Weekend Food Truck Rally",
        "description": "Discover the best food trucks in the Bay Area at our weekend rally. Live music and family-friendly activities! Over 20 food trucks serving everything from gourmet burgers to artisanal ice cream.",
        "date": "2025-07-30",
        "time": "11:00",
        "category": EventCategory.FOOD_DRINK,
        "price": {"min": 0, "max": 20, "currency": "USD"},
        "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        "attendees": 289,
        "rating": 4.8
    },
    {
        "title": "Morning Yoga in the Park",
        "description": "Start your day with peaceful yoga sessions led by certified instructors. All levels welcome! Connect with nature while improving your flexibility and mindfulness in a beautiful outdoor setting.",
        "date": "2025-08-02",
        "time": "08:00",
        "category": EventCategory.HEALTH_WELLNESS,
        "price": {"min": 15, "max": 15, "currency": "USD"},
        "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
        "attendees": 67,
        "rating": 4.9
    },
    {
        "title": "Art Gallery Opening Night",
        "description": "Celebrate local artists at our monthly gallery opening featuring contemporary works from emerging Bay Area creators. Wine, light appetizers, and inspiring conversations.",
        "date": "2025-08-05",
        "time": "19:30",
        "category": EventCategory.ARTS_CULTURE,
        "price": {"min": 20, "max": 35, "currency": "USD"},
        "image": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
        "attendees": 94,
        "rating": 4.4
    },
    {
        "title": "Sustainable Living Workshop",
        "description": "Learn practical tips for eco-friendly living in this hands-on workshop. Topics include zero waste, urban gardening, and sustainable fashion. Take home your own starter kit!",
        "date": "2025-08-08",
        "time": "14:00",
        "category": EventCategory.EDUCATION,
        "price": {"min": 30, "max": 30, "currency": "USD"},
        "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
        "attendees": 45,
        "rating": 4.7
    }
]

SAMPLE_REVIEWS = [
    {"user": "Alex Chen", "rating": 5, "comment": "Amazing experience! Great lineup and perfect weather."},
    {"user": "Sarah Johnson", "rating": 4, "comment": "Good event, a bit crowded but worth it."},
    {"user": "Mike Rodriguez", "rating": 5, "comment": "Fantastic organization and incredible atmosphere."},
    {"user": "Emily Davis", "rating": 4, "comment": "Really enjoyed the event. Well worth the price."},
    {"user": "David Kim", "rating": 5, "comment": "One of the best events I've been to this year!"},
    {"user": "Jessica Brown", "rating": 4, "comment": "Great venue and good variety of activities."},
    {"user": "Ryan Wilson", "rating": 5, "comment": "Exceeded my expectations. Will definitely attend again."},
    {"user": "Lisa Thompson", "rating": 4, "comment": "Fun event with a great community vibe."}
]

SAMPLE_USERS = [
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "photo": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
    },
    {
        "name": "Jane Smith",
        "email": "jane@example.com", 
        "password": "password123",
        "photo": "https://images.unsplash.com/photo-1494790108755-2616b332c00b?w=200"
    },
    {
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "password": "password123",
        "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"
    }
]

class SeedDatabase:
    @staticmethod
    async def seed_organizers():
        """Seed organizers data"""
        print("🌱 Seeding organizers...")
        
        organizers = []
        for i, org_data in enumerate(SAMPLE_ORGANIZERS):
            location_data = SAMPLE_LOCATIONS[i % len(SAMPLE_LOCATIONS)]
            
            organizer = Organizer(
                name=org_data["name"],
                description=org_data["description"],
                photo=org_data["photo"],
                location=Location(**location_data),
                categories=org_data["categories"],
                contact=Contact(**org_data["contact"]),
                rating=org_data["rating"],
                totalEvents=org_data["totalEvents"],
                recentEvents=[]
            )
            
            await Database.create_organizer(organizer.dict())
            organizers.append(organizer)
            print(f"  ✅ Created organizer: {organizer.name}")
        
        return organizers

    @staticmethod
    async def seed_events(organizers):
        """Seed events data"""
        print("🌱 Seeding events...")
        
        events = []
        for i, event_data in enumerate(SAMPLE_EVENTS):
            location_data = SAMPLE_LOCATIONS[i % len(SAMPLE_LOCATIONS)]
            organizer = organizers[i % len(organizers)]
            
            # Add some sample reviews
            reviews = []
            num_reviews = random.randint(1, 4)
            sample_reviews = random.sample(SAMPLE_REVIEWS, num_reviews)
            
            for review_data in sample_reviews:
                review = EventReview(
                    user=review_data["user"],
                    rating=review_data["rating"],
                    comment=review_data["comment"],
                    date=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                reviews.append(review.dict())
            
            event = Event(
                title=event_data["title"],
                description=event_data["description"],
                date=event_data["date"],
                time=event_data["time"],
                location=Location(**location_data),
                category=event_data["category"],
                price=PriceRange(**event_data["price"]),
                image=event_data["image"],
                organizer_id=organizer.id,
                attendees=event_data["attendees"],
                rating=event_data["rating"],
                reviews=reviews
            )
            
            await Database.create_event(event.dict())
            events.append(event)
            print(f"  ✅ Created event: {event.title}")
        
        return events

    @staticmethod
    async def seed_users():
        """Seed users data"""
        print("🌱 Seeding users...")
        
        users = []
        for user_data in SAMPLE_USERS:
            # Random location around SF
            lat = 37.7749 + random.uniform(-0.05, 0.05)
            lng = -122.4194 + random.uniform(-0.05, 0.05)
            
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                photo=user_data["photo"],
                location=Location(
                    name="Home",
                    address=f"{random.randint(100, 999)} Main St, San Francisco, CA",
                    lat=lat,
                    lng=lng,
                    city="San Francisco",
                    state="CA"
                ),
                preferences=UserPreferences(
                    categories=[EventCategory.MUSIC, EventCategory.FOOD_DRINK],
                    maxDistance=25
                ),
                savedEvents=[],
                createdEvents=[]
            )
            
            # Hash password
            user_dict = user.dict()
            user_dict["password"] = hash_password(user_data["password"])
            
            await Database.create_user(user_dict)
            users.append(user)
            print(f"  ✅ Created user: {user.name}")
        
        return users

    @staticmethod
    async def seed_all():
        """Seed all data"""
        print("🚀 Starting database seeding...")
        
        try:
            # Clear existing data (optional)
            # await Database.clear_all_collections()
            
            # Seed data in order
            organizers = await SeedDatabase.seed_organizers()
            events = await SeedDatabase.seed_events(organizers)
            users = await SeedDatabase.seed_users()
            
            print(f"\n🎉 Database seeding completed successfully!")
            print(f"  📊 Created {len(organizers)} organizers")
            print(f"  🎫 Created {len(events)} events") 
            print(f"  👥 Created {len(users)} users")
            
        except Exception as e:
            print(f"❌ Error seeding database: {str(e)}")
            raise e

async def main():
    """Main function to run seeding"""
    await SeedDatabase.seed_all()

if __name__ == "__main__":
    asyncio.run(main())