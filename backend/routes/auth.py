from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from datetime import timedelta
from database import Database
from models import UserCreate, UserLogin, User, APIResponse
from auth import (
    hash_password, 
    create_access_token, 
    authenticate_user,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    security
)
import uuid

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=APIResponse)
async def register_user(user: UserCreate):
    """Register a new user"""
    
    try:
        # Check if user already exists
        existing_user = await Database.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Create user with hashed password
        user_dict = user.dict()
        user_dict["id"] = str(uuid.uuid4())
        user_dict["password"] = hash_password(user.password)
        user_dict["savedEvents"] = []
        user_dict["createdEvents"] = []
        
        created_user = await Database.create_user(user_dict)
        
        # Remove password from response
        created_user.pop("password", None)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": created_user["id"]}, 
            expires_delta=access_token_expires
        )
        
        return APIResponse(
            data={
                "user": created_user,
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
            },
            message="User registered successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error registering user: {str(e)}"
        )

@router.post("/login", response_model=APIResponse)
async def login_user(user: UserLogin):
    """Authenticate user and return access token"""
    
    try:
        # Authenticate user
        authenticated_user = await authenticate_user(user.email, user.password)
        
        if not authenticated_user:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": authenticated_user["id"]}, 
            expires_delta=access_token_expires
        )
        
        # Remove password from response
        authenticated_user.pop("password", None)
        
        return APIResponse(
            data={
                "user": authenticated_user,
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
            },
            message="Login successful"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error logging in: {str(e)}"
        )

@router.get("/me", response_model=APIResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    
    try:
        # Remove password from response
        user_info = current_user.copy()
        user_info.pop("password", None)
        
        return APIResponse(
            data=user_info,
            message="User information retrieved successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user information: {str(e)}"
        )

@router.put("/me", response_model=APIResponse)
async def update_current_user(
    user_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update current user information"""
    
    try:
        # Don't allow updating certain fields
        forbidden_fields = ["id", "email", "password", "created_at"]
        for field in forbidden_fields:
            user_update.pop(field, None)
        
        # Update user
        success = await Database.update_user(current_user["id"], user_update)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to update user"
            )
        
        # Get updated user
        updated_user = await Database.get_user_by_id(current_user["id"])
        updated_user.pop("password", None)
        
        return APIResponse(
            data=updated_user,
            message="User updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating user: {str(e)}"
        )

@router.get("/me/saved-events", response_model=APIResponse)
async def get_user_saved_events(
    current_user: dict = Depends(get_current_user),
    user_lat: float = None,
    user_lng: float = None
):
    """Get current user's saved events"""
    
    try:
        saved_events = await Database.get_user_saved_events(
            current_user["id"], 
            user_lat, 
            user_lng
        )
        
        return APIResponse(
            data=saved_events,
            message=f"Found {len(saved_events)} saved events"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving saved events: {str(e)}"
        )

@router.post("/refresh", response_model=APIResponse)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Refresh access token"""
    
    try:
        # Verify current token and get user
        from auth import verify_token
        user = await verify_token(credentials)
        
        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["id"]}, 
            expires_delta=access_token_expires
        )
        
        return APIResponse(
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
            },
            message="Token refreshed successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Error refreshing token: {str(e)}"
        )

@router.post("/logout", response_model=APIResponse)
async def logout_user(current_user: dict = Depends(get_current_user)):
    """Logout user (invalidate token)"""
    
    # Note: In a production environment, you might want to maintain a blacklist 
    # of invalidated tokens. For now, this is just a placeholder endpoint.
    
    return APIResponse(
        data={"user_id": current_user["id"]},
        message="Logout successful"
    )