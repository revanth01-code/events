from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from database import Database
from models import EventCreate, Event, EventResponse, APIResponse, EventFilters, EventReview
from auth import get_current_user_optional, get_current_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=APIResponse)
async def get_events(
    search: Optional[str] = Query(None, description="Search in title, description, category, or location"),
    category: Optional[str] = Query(None, description="Filter by event category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating filter"),
    max_distance: Optional[float] = Query(25, ge=1, le=100, description="Maximum distance in miles"),
    user_lat: Optional[float] = Query(None, ge=-90, le=90, description="User latitude for distance calculation"),
    user_lng: Optional[float] = Query(None, ge=-180, le=180, description="User longitude for distance calculation"),
    sort_by: str = Query("distance", description="Sort by: distance, date, rating, price"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results")
):
    """Get events with optional filtering and sorting"""
    
    try:
        events = await Database.get_events_with_filters(
            search=search,
            category=category,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            max_distance=max_distance,
            user_lat=user_lat,
            user_lng=user_lng,
            sort_by=sort_by,
            limit=limit
        )
        
        return APIResponse(
            data=events,
            message=f"Found {len(events)} events"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching events: {str(e)}"
        )

@router.get("/{event_id}", response_model=APIResponse)
async def get_event_by_id(
    event_id: str,
    user_lat: Optional[float] = Query(None, ge=-90, le=90, description="User latitude for distance calculation"),
    user_lng: Optional[float] = Query(None, ge=-180, le=180, description="User longitude for distance calculation"),
):
    """Get a specific event by ID"""
    
    try:
        event = await Database.get_event_by_id(event_id, user_lat, user_lng)
        
        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )
        
        return APIResponse(
            data=event,
            message="Event retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching event: {str(e)}"
        )

@router.post("/", response_model=APIResponse)
async def create_event(
    event: EventCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new event (requires authentication)"""
    
    try:
        # Verify that the organizer exists
        organizer = await Database.get_organizer_by_id(event.organizer_id)
        if not organizer:
            raise HTTPException(
                status_code=404,
                detail="Organizer not found"
            )
        
        # Create event with generated ID
        event_dict = event.dict()
        event_dict["id"] = str(uuid.uuid4())
        event_dict["attendees"] = 0
        event_dict["rating"] = 5.0
        event_dict["reviews"] = []
        
        created_event = await Database.create_event(event_dict)
        
        # Update user's created events
        user_created_events = current_user.get("createdEvents", [])
        user_created_events.append(created_event["id"])
        await Database.update_user(current_user["id"], {"createdEvents": user_created_events})
        
        # Update organizer's total events count
        await Database.update_organizer(
            event.organizer_id,
            {"totalEvents": organizer.get("totalEvents", 0) + 1}
        )
        
        return APIResponse(
            data=created_event,
            message="Event created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating event: {str(e)}"
        )

@router.post("/{event_id}/reviews", response_model=APIResponse)
async def add_event_review(
    event_id: str,
    rating: int = Query(..., ge=1, le=5, description="Rating from 1 to 5"),
    comment: str = Query(..., min_length=1, max_length=1000, description="Review comment"),
    current_user: dict = Depends(get_current_user)
):
    """Add a review to an event (requires authentication)"""
    
    try:
        # Check if event exists
        event = await Database.get_event_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )
        
        # Create review
        review = EventReview(
            user=current_user["name"],
            rating=rating,
            comment=comment,
            date=datetime.utcnow()
        )
        
        # Add review to event
        success = await Database.add_event_review(event_id, review.dict())
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to add review"
            )
        
        return APIResponse(
            data=review.dict(),
            message="Review added successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error adding review: {str(e)}"
        )

@router.post("/{event_id}/rsvp", response_model=APIResponse)
async def rsvp_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """RSVP to an event (requires authentication)"""
    
    try:
        # Check if event exists
        event = await Database.get_event_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )
        
        # Update event attendees count
        current_attendees = event.get("attendees", 0)
        await Database.update_event(event_id, {"attendees": current_attendees + 1})
        
        return APIResponse(
            data={"event_id": event_id, "attendees": current_attendees + 1},
            message="RSVP successful"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing RSVP: {str(e)}"
        )

@router.post("/{event_id}/save", response_model=APIResponse)
async def save_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Save an event to user's saved events (requires authentication)"""
    
    try:
        # Check if event exists
        event = await Database.get_event_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )
        
        # Update user's saved events
        saved_events = current_user.get("savedEvents", [])
        
        if event_id in saved_events:
            # Remove from saved events
            saved_events.remove(event_id)
            message = "Event removed from saved events"
            action = "removed"
        else:
            # Add to saved events
            saved_events.append(event_id)
            message = "Event saved successfully"
            action = "saved"
        
        await Database.update_user(current_user["id"], {"savedEvents": saved_events})
        
        return APIResponse(
            data={"event_id": event_id, "action": action, "saved_events_count": len(saved_events)},
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving event: {str(e)}"
        )

@router.get("/similar/{event_id}", response_model=APIResponse)
async def get_similar_events(
    event_id: str,
    user_lat: Optional[float] = Query(None, ge=-90, le=90, description="User latitude"),
    user_lng: Optional[float] = Query(None, ge=-180, le=180, description="User longitude"),
    limit: int = Query(3, ge=1, le=10, description="Number of similar events to return")
):
    """Get similar events based on category and location"""
    
    try:
        # Get the original event
        event = await Database.get_event_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )
        
        # Find similar events (same category, different event)
        similar_events = await Database.get_events_with_filters(
            category=event["category"],
            max_distance=50,
            user_lat=user_lat,
            user_lng=user_lng,
            sort_by="distance",
            limit=limit + 5  # Get extra in case we need to filter out the original
        )
        
        # Remove the original event from results
        similar_events = [e for e in similar_events if e["id"] != event_id]
        
        # Limit results
        similar_events = similar_events[:limit]
        
        return APIResponse(
            data=similar_events,
            message=f"Found {len(similar_events)} similar events"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error finding similar events: {str(e)}"
        )