from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums
class EventCategory(str, Enum):
    MUSIC = "Music"
    FOOD_DRINK = "Food & Drink"
    NETWORKING = "Networking"
    HEALTH_WELLNESS = "Health & Wellness"
    ARTS_CULTURE = "Arts & Culture"
    SPORTS_RECREATION = "Sports & Recreation"
    EDUCATION = "Education"
    BUSINESS = "Business"
    COMMUNITY = "Community"
    ENTERTAINMENT = "Entertainment"

class PriceRange(BaseModel):
    min: float = Field(default=0, ge=0)
    max: float = Field(default=0, ge=0)
    currency: str = Field(default="USD")

class Location(BaseModel):
    name: str
    address: str
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    city: Optional[str] = None
    state: Optional[str] = None

class Contact(BaseModel):
    email: EmailStr
    phone: Optional[str] = None

# Organizer Models
class OrganizerBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(max_length=500)
    photo: Optional[str] = None
    location: Location
    categories: List[EventCategory] = Field(default=[])
    contact: Contact

class OrganizerCreate(OrganizerBase):
    pass

class Organizer(OrganizerBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rating: float = Field(default=5.0, ge=0, le=5)
    totalEvents: int = Field(default=0, ge=0)
    recentEvents: List[str] = Field(default=[])
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Event Models
class EventReview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(max_length=1000)
    date: datetime = Field(default_factory=datetime.utcnow)

class EventBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(max_length=2000)
    date: str  # ISO date string
    time: str  # Time string in HH:MM format
    location: Location
    category: EventCategory
    price: PriceRange
    image: Optional[str] = None
    organizer_id: str

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    attendees: int = Field(default=0, ge=0)
    rating: float = Field(default=5.0, ge=0, le=5)
    reviews: List[EventReview] = Field(default=[])
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# User Models
class UserPreferences(BaseModel):
    categories: List[EventCategory] = Field(default=[])
    maxDistance: int = Field(default=25, ge=1, le=100)
    priceRange: PriceRange = Field(default=PriceRange())

class UserBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    photo: Optional[str] = None
    location: Optional[Location] = None
    preferences: UserPreferences = Field(default=UserPreferences())

class UserCreate(UserBase):
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    savedEvents: List[str] = Field(default=[])
    createdEvents: List[str] = Field(default=[])
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Response Models
class EventResponse(Event):
    organizer: Optional[Organizer] = None
    distance: Optional[float] = None

class OrganizerResponse(Organizer):
    distance: Optional[float] = None

# Search and Filter Models
class EventFilters(BaseModel):
    search: Optional[str] = None
    category: Optional[EventCategory] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    max_distance: Optional[float] = Field(default=25)
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    sort_by: Optional[str] = Field(default="distance")  # distance, date, rating, price

class OrganizerFilters(BaseModel):
    search: Optional[str] = None
    categories: Optional[List[EventCategory]] = None
    min_rating: Optional[float] = None
    max_distance: Optional[float] = Field(default=25)
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    sort_by: Optional[str] = Field(default="distance")  # distance, rating, events, name

# API Response Models
class APIResponse(BaseModel):
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None
    error: Optional[str] = None

class PaginatedResponse(BaseModel):
    success: bool = True
    message: str = "Success"
    data: List[Any] = []
    total: int = 0
    page: int = 1
    per_page: int = 10
    total_pages: int = 1