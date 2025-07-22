from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from database import Database
from models import OrganizerCreate, Organizer, OrganizerResponse, APIResponse, EventCategory
from auth import get_current_user_optional, get_current_user
import uuid

router = APIRouter(prefix="/organizers", tags=["organizers"])

@router.get("/", response_model=APIResponse)
async def get_organizers(
    search: Optional[str] = Query(None, description="Search in organizer name or description"),
    categories: Optional[str] = Query(None, description="Comma-separated list of categories to filter by"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating filter"),
    max_distance: Optional[float] = Query(25, ge=1, le=100, description="Maximum distance in miles"),
    user_lat: Optional[float] = Query(None, ge=-90, le=90, description="User latitude for distance calculation"),
    user_lng: Optional[float] = Query(None, ge=-180, le=180, description="User longitude for distance calculation"),
    sort_by: str = Query("distance", description="Sort by: distance, rating, events, name"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results")
):
    """Get organizers with optional filtering and sorting"""
    
    try:
        # Parse categories if provided
        category_list = None
        if categories:
            category_list = [cat.strip() for cat in categories.split(",") if cat.strip()]
        
        organizers = await Database.get_organizers_with_filters(
            search=search,
            categories=category_list,
            min_rating=min_rating,
            max_distance=max_distance,
            user_lat=user_lat,
            user_lng=user_lng,
            sort_by=sort_by,
            limit=limit
        )
        
        return APIResponse(
            data=organizers,
            message=f"Found {len(organizers)} organizers"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching organizers: {str(e)}"
        )

@router.get("/{organizer_id}", response_model=APIResponse)
async def get_organizer_by_id(
    organizer_id: str,
    user_lat: Optional[float] = Query(None, ge=-90, le=90, description="User latitude for distance calculation"),
    user_lng: Optional[float] = Query(None, ge=-180, le=180, description="User longitude for distance calculation"),
):
    """Get a specific organizer by ID"""
    
    try:
        organizer = await Database.get_organizer_by_id(organizer_id)
        
        if not organizer:
            raise HTTPException(
                status_code=404,
                detail="Organizer not found"
            )
        
        # Calculate distance if user location provided
        if user_lat is not None and user_lng is not None:
            distance = Database.calculate_distance(
                user_lat, user_lng,
                organizer['location']['lat'], organizer['location']['lng']
            )
            organizer['distance'] = distance
        
        return APIResponse(
            data=organizer,
            message="Organizer retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching organizer: {str(e)}"
        )

@router.post("/", response_model=APIResponse)
async def create_organizer(
    organizer: OrganizerCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new organizer (requires authentication)"""
    
    try:
        # Create organizer with generated ID
        organizer_dict = organizer.dict()
        organizer_dict["id"] = str(uuid.uuid4())
        organizer_dict["rating"] = 5.0
        organizer_dict["totalEvents"] = 0
        organizer_dict["recentEvents"] = []
        
        created_organizer = await Database.create_organizer(organizer_dict)
        
        return APIResponse(
            data=created_organizer,
            message="Organizer created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating organizer: {str(e)}"
        )

@router.get("/{organizer_id}/events", response_model=APIResponse)
async def get_organizer_events(
    organizer_id: str,
    user_lat: Optional[float] = Query(None, ge=-90, le=90, description="User latitude for distance calculation"),
    user_lng: Optional[float] = Query(None, ge=-180, le=180, description="User longitude for distance calculation"),
):
    """Get all events by a specific organizer"""
    
    try:
        # Check if organizer exists
        organizer = await Database.get_organizer_by_id(organizer_id)
        if not organizer:
            raise HTTPException(
                status_code=404,
                detail="Organizer not found"
            )
        
        # Get events by organizer
        events = await Database.get_events_by_organizer(organizer_id)
        
        # Add distance calculation if user location provided
        if user_lat is not None and user_lng is not None:
            for event in events:
                distance = Database.calculate_distance(
                    user_lat, user_lng,
                    event['location']['lat'], event['location']['lng']
                )
                event['distance'] = distance
            
            # Sort by distance
            events.sort(key=lambda x: x.get('distance', float('inf')))
        
        return APIResponse(
            data=events,
            message=f"Found {len(events)} events by {organizer['name']}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching organizer events: {str(e)}"
        )

@router.get("/categories/list", response_model=APIResponse)
async def get_organizer_categories():
    """Get list of all available organizer categories"""
    
    try:
        categories = [category.value for category in EventCategory]
        
        return APIResponse(
            data=categories,
            message="Categories retrieved successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching categories: {str(e)}"
        )

@router.get("/nearby/top", response_model=APIResponse)
async def get_top_nearby_organizers(
    user_lat: float = Query(..., ge=-90, le=90, description="User latitude"),
    user_lng: float = Query(..., ge=-180, le=180, description="User longitude"),
    max_distance: float = Query(25, ge=1, le=100, description="Maximum distance in miles"),
    limit: int = Query(5, ge=1, le=20, description="Number of top organizers to return")
):
    """Get top-rated organizers near user location"""
    
    try:
        organizers = await Database.get_organizers_with_filters(
            min_rating=4.0,
            max_distance=max_distance,
            user_lat=user_lat,
            user_lng=user_lng,
            sort_by="rating",
            limit=limit
        )
        
        return APIResponse(
            data=organizers,
            message=f"Found {len(organizers)} top organizers nearby"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching top organizers: {str(e)}"
        )

@router.put("/{organizer_id}", response_model=APIResponse)
async def update_organizer(
    organizer_id: str,
    organizer_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update organizer information (requires authentication)"""
    
    try:
        # Check if organizer exists
        organizer = await Database.get_organizer_by_id(organizer_id)
        if not organizer:
            raise HTTPException(
                status_code=404,
                detail="Organizer not found"
            )
        
        # Update organizer
        success = await Database.update_organizer(organizer_id, organizer_update)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to update organizer"
            )
        
        # Get updated organizer
        updated_organizer = await Database.get_organizer_by_id(organizer_id)
        
        return APIResponse(
            data=updated_organizer,
            message="Organizer updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating organizer: {str(e)}"
        )