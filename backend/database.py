from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any
import os
from datetime import datetime
import math

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'nearme_events')]

# Collections
users_collection = db.users
events_collection = db.events
organizers_collection = db.organizers

class Database:
    @staticmethod
    async def create_indexes():
        """Create database indexes for better performance"""
        # Users indexes
        await users_collection.create_index("email", unique=True)
        await users_collection.create_index([("location.lat", 1), ("location.lng", 1)])
        
        # Events indexes
        await events_collection.create_index([("location.lat", 1), ("location.lng", 1)])
        await events_collection.create_index("organizer_id")
        await events_collection.create_index("category")
        await events_collection.create_index("date")
        await events_collection.create_index("rating")
        await events_collection.create_index([("title", "text"), ("description", "text")])
        
        # Organizers indexes
        await organizers_collection.create_index([("location.lat", 1), ("location.lng", 1)])
        await organizers_collection.create_index("categories")
        await organizers_collection.create_index("rating")
        await organizers_collection.create_index("totalEvents")
        await organizers_collection.create_index([("name", "text"), ("description", "text")])

    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in miles using Haversine formula"""
        R = 3959  # Earth's radius in miles
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(dlon/2) * math.sin(dlon/2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        return round(distance, 1)

    # User operations
    @staticmethod
    async def create_user(user_data: dict) -> dict:
        """Create a new user"""
        user_data['created_at'] = datetime.utcnow()
        user_data['updated_at'] = datetime.utcnow()
        
        result = await users_collection.insert_one(user_data)
        user_data['_id'] = str(result.inserted_id)
        return user_data

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email"""
        user = await users_collection.find_one({"email": email})
        if user:
            user['_id'] = str(user['_id'])
        return user

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[dict]:
        """Get user by ID"""
        user = await users_collection.find_one({"id": user_id})
        if user:
            user['_id'] = str(user['_id'])
        return user

    @staticmethod
    async def update_user(user_id: str, update_data: dict) -> bool:
        """Update user data"""
        update_data['updated_at'] = datetime.utcnow()
        result = await users_collection.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        return result.modified_count > 0

    # Organizer operations
    @staticmethod
    async def create_organizer(organizer_data: dict) -> dict:
        """Create a new organizer"""
        organizer_data['created_at'] = datetime.utcnow()
        organizer_data['updated_at'] = datetime.utcnow()
        
        result = await organizers_collection.insert_one(organizer_data)
        organizer_data['_id'] = str(result.inserted_id)
        return organizer_data

    @staticmethod
    async def get_organizer_by_id(organizer_id: str) -> Optional[dict]:
        """Get organizer by ID"""
        organizer = await organizers_collection.find_one({"id": organizer_id})
        if organizer:
            organizer['_id'] = str(organizer['_id'])
        return organizer

    @staticmethod
    async def get_organizers_with_filters(
        search: Optional[str] = None,
        categories: Optional[List[str]] = None,
        min_rating: Optional[float] = None,
        max_distance: Optional[float] = None,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        sort_by: str = "distance",
        limit: int = 50
    ) -> List[dict]:
        """Get organizers with filters and distance calculation"""
        
        # Build query
        query = {}
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"categories": {"$in": [search]}}
            ]
        
        if categories:
            query["categories"] = {"$in": categories}
        
        if min_rating:
            query["rating"] = {"$gte": min_rating}
        
        # Execute query
        cursor = organizers_collection.find(query)
        organizers = await cursor.to_list(length=None)
        
        # Calculate distances and filter by max_distance
        result_organizers = []
        
        for organizer in organizers:
            organizer['_id'] = str(organizer['_id'])
            
            # Calculate distance if user location provided
            if user_lat is not None and user_lng is not None:
                distance = Database.calculate_distance(
                    user_lat, user_lng,
                    organizer['location']['lat'], organizer['location']['lng']
                )
                organizer['distance'] = distance
                
                # Filter by max distance
                if max_distance and distance > max_distance:
                    continue
            
            result_organizers.append(organizer)
        
        # Sort results
        if sort_by == "distance" and user_lat is not None:
            result_organizers.sort(key=lambda x: x.get('distance', float('inf')))
        elif sort_by == "rating":
            result_organizers.sort(key=lambda x: x.get('rating', 0), reverse=True)
        elif sort_by == "events":
            result_organizers.sort(key=lambda x: x.get('totalEvents', 0), reverse=True)
        elif sort_by == "name":
            result_organizers.sort(key=lambda x: x.get('name', ''))
        
        return result_organizers[:limit]

    @staticmethod
    async def update_organizer(organizer_id: str, update_data: dict) -> bool:
        """Update organizer data"""
        update_data['updated_at'] = datetime.utcnow()
        result = await organizers_collection.update_one(
            {"id": organizer_id},
            {"$set": update_data}
        )
        return result.modified_count > 0

    # Event operations
    @staticmethod
    async def create_event(event_data: dict) -> dict:
        """Create a new event"""
        event_data['created_at'] = datetime.utcnow()
        event_data['updated_at'] = datetime.utcnow()
        
        result = await events_collection.insert_one(event_data)
        event_data['_id'] = str(result.inserted_id)
        return event_data

    @staticmethod
    async def get_event_by_id(event_id: str, user_lat: Optional[float] = None, user_lng: Optional[float] = None) -> Optional[dict]:
        """Get event by ID with optional distance calculation"""
        event = await events_collection.find_one({"id": event_id})
        
        if event:
            event['_id'] = str(event['_id'])
            
            # Calculate distance if user location provided
            if user_lat is not None and user_lng is not None:
                distance = Database.calculate_distance(
                    user_lat, user_lng,
                    event['location']['lat'], event['location']['lng']
                )
                event['distance'] = distance
            
            # Get organizer data
            organizer = await Database.get_organizer_by_id(event['organizer_id'])
            if organizer:
                event['organizer'] = organizer
        
        return event

    @staticmethod
    async def get_events_with_filters(
        search: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        max_distance: Optional[float] = None,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        sort_by: str = "distance",
        limit: int = 50
    ) -> List[dict]:
        """Get events with filters and distance calculation"""
        
        # Build query
        query = {}
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}},
                {"location.name": {"$regex": search, "$options": "i"}}
            ]
        
        if category:
            query["category"] = category
        
        if min_rating:
            query["rating"] = {"$gte": min_rating}
        
        # Price filtering
        price_query = {}
        if min_price is not None:
            price_query["price.min"] = {"$gte": min_price}
        if max_price is not None:
            price_query["price.max"] = {"$lte": max_price}
        if price_query:
            query.update(price_query)
        
        # Execute query
        cursor = events_collection.find(query)
        events = await cursor.to_list(length=None)
        
        # Calculate distances, get organizer data, and filter by max_distance
        result_events = []
        
        for event in events:
            event['_id'] = str(event['_id'])
            
            # Calculate distance if user location provided
            if user_lat is not None and user_lng is not None:
                distance = Database.calculate_distance(
                    user_lat, user_lng,
                    event['location']['lat'], event['location']['lng']
                )
                event['distance'] = distance
                
                # Filter by max distance
                if max_distance and distance > max_distance:
                    continue
            
            # Get organizer data
            organizer = await Database.get_organizer_by_id(event['organizer_id'])
            if organizer:
                event['organizer'] = organizer
            
            result_events.append(event)
        
        # Sort results
        if sort_by == "distance" and user_lat is not None:
            result_events.sort(key=lambda x: x.get('distance', float('inf')))
        elif sort_by == "date":
            result_events.sort(key=lambda x: x.get('date', ''))
        elif sort_by == "rating":
            result_events.sort(key=lambda x: x.get('rating', 0), reverse=True)
        elif sort_by == "price":
            result_events.sort(key=lambda x: x.get('price', {}).get('min', 0))
        
        return result_events[:limit]

    @staticmethod
    async def update_event(event_id: str, update_data: dict) -> bool:
        """Update event data"""
        update_data['updated_at'] = datetime.utcnow()
        result = await events_collection.update_one(
            {"id": event_id},
            {"$set": update_data}
        )
        return result.modified_count > 0

    @staticmethod
    async def add_event_review(event_id: str, review_data: dict) -> bool:
        """Add a review to an event"""
        result = await events_collection.update_one(
            {"id": event_id},
            {
                "$push": {"reviews": review_data},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            # Recalculate event rating
            await Database.recalculate_event_rating(event_id)
            return True
        
        return False

    @staticmethod
    async def recalculate_event_rating(event_id: str) -> bool:
        """Recalculate event rating based on reviews"""
        event = await events_collection.find_one({"id": event_id})
        
        if event and event.get('reviews'):
            reviews = event['reviews']
            total_rating = sum(review['rating'] for review in reviews)
            avg_rating = round(total_rating / len(reviews), 1)
            
            result = await events_collection.update_one(
                {"id": event_id},
                {"$set": {"rating": avg_rating, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        
        return False

    @staticmethod
    async def get_events_by_organizer(organizer_id: str) -> List[dict]:
        """Get all events by organizer"""
        cursor = events_collection.find({"organizer_id": organizer_id})
        events = await cursor.to_list(length=None)
        
        for event in events:
            event['_id'] = str(event['_id'])
        
        return events

    @staticmethod
    async def get_user_saved_events(user_id: str, user_lat: Optional[float] = None, user_lng: Optional[float] = None) -> List[dict]:
        """Get user's saved events"""
        user = await Database.get_user_by_id(user_id)
        if not user or not user.get('savedEvents'):
            return []
        
        saved_event_ids = user['savedEvents']
        cursor = events_collection.find({"id": {"$in": saved_event_ids}})
        events = await cursor.to_list(length=None)
        
        # Add distance calculation and organizer data
        result_events = []
        for event in events:
            event['_id'] = str(event['_id'])
            
            # Calculate distance if user location provided
            if user_lat is not None and user_lng is not None:
                distance = Database.calculate_distance(
                    user_lat, user_lng,
                    event['location']['lat'], event['location']['lng']
                )
                event['distance'] = distance
            
            # Get organizer data
            organizer = await Database.get_organizer_by_id(event['organizer_id'])
            if organizer:
                event['organizer'] = organizer
            
            result_events.append(event)
        
        return result_events

# Initialize database on import
async def init_database():
    """Initialize database indexes"""
    await Database.create_indexes()