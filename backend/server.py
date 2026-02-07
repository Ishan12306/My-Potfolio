from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random
import string
from passlib.context import CryptContext
from jose import jwt, JWTError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'tm-real-estate-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# MSG91 settings
MSG91_AUTHKEY = os.environ.get('MSG91_AUTHKEY', '')
MSG91_TEMPLATE_ID = os.environ.get('MSG91_TEMPLATE_ID', '')

# Admin credentials
ADMIN_ID = "Admin@TM_"
ADMIN_PASSWORD_HASH = pwd_context.hash(os.environ.get('ADMIN_PASSWORD', 'B!ueSk&y44#Tree'))

# Security
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI(title="TM Real Estate API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    property_type: str  # flat, house, plot, shop, office, pg
    listing_type: str  # buy, rent, pg
    price: int
    deposit: Optional[int] = None
    area_sqft: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    furnishing: str = "unfurnished"  # unfurnished, semi-furnished, fully-furnished
    parking: Optional[str] = None
    floor: Optional[str] = None
    total_floors: Optional[int] = None
    facing: Optional[str] = None
    property_age: Optional[str] = None
    availability: Optional[str] = None
    description: str
    amenities: List[str] = []
    images: List[str] = []
    location: str
    sector: str
    city: str = "Navi Mumbai"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_featured: bool = False
    is_published: bool = True
    views: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    title: str
    property_type: str
    listing_type: str
    price: int
    deposit: Optional[int] = None
    area_sqft: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    furnishing: str = "unfurnished"
    parking: Optional[str] = None
    floor: Optional[str] = None
    total_floors: Optional[int] = None
    facing: Optional[str] = None
    property_age: Optional[str] = None
    availability: Optional[str] = None
    description: str
    amenities: List[str] = []
    images: List[str] = []
    location: str
    sector: str
    city: str = "Navi Mumbai"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_featured: bool = False
    is_published: bool = True

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    name: Optional[str] = None
    email: Optional[str] = None
    favorites: List[str] = []
    saved_searches: List[Dict] = []
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OTPRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    otp_code: str
    attempts: int = 0
    max_attempts: int = 3
    expires_at: datetime
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ListingRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requester_type: str  # owner, agent, builder, buyer-tenant
    intent: str  # sell, rent-lease, pg
    property_type: str
    city: str
    area: str
    sector: Optional[str] = None
    society: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqft: Optional[int] = None
    furnishing: Optional[str] = None
    availability: Optional[str] = None
    expected_price: Optional[int] = None
    rent_amount: Optional[int] = None
    deposit_amount: Optional[int] = None
    is_negotiable: bool = False
    contact_name: str
    contact_phone: str
    additional_notes: Optional[str] = None
    images: List[str] = []
    quality_score: int = 0
    status: str = "pending"  # pending, reviewed, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Enquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    property_id: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = None
    message: str
    source: str = "contact"  # contact, property, whatsapp, buy, rent, general, sell
    enquiry_type: str = "general"  # general, buy, rent, property, sell
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    preferred_location: Optional[str] = None
    bedrooms: Optional[str] = None
    preferred_contact_time: Optional[str] = None
    status: str = "new"  # new, accepted, rejected, contacted, closed
    admin_response: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RentalProperty(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    flat_no: str
    society_name: str
    contact_number: str
    agreement_start_date: str  # ISO date string YYYY-MM-DD
    agreement_end_date: str    # ISO date string YYYY-MM-DD
    remarks: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RentalPropertyCreate(BaseModel):
    flat_no: str
    society_name: str
    contact_number: str
    agreement_start_date: str
    agreement_end_date: str
    remarks: Optional[str] = None

class RentalPropertyUpdate(BaseModel):
    flat_no: Optional[str] = None
    society_name: Optional[str] = None
    contact_number: Optional[str] = None
    agreement_start_date: Optional[str] = None
    agreement_end_date: Optional[str] = None
    remarks: Optional[str] = None

# ============== REQUEST/RESPONSE MODELS ==============

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp_code: str

class AdminLoginRequest(BaseModel):
    admin_id: str
    password: str

class EnquiryCreate(BaseModel):
    property_id: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = None
    message: str
    source: str = "contact"
    enquiry_type: str = "general"
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    preferred_location: Optional[str] = None
    bedrooms: Optional[str] = None
    preferred_contact_time: Optional[str] = None

class ListingRequestCreate(BaseModel):
    requester_type: str
    intent: str
    property_type: str
    city: str
    area: str
    sector: Optional[str] = None
    society: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqft: Optional[int] = None
    furnishing: Optional[str] = None
    availability: Optional[str] = None
    expected_price: Optional[int] = None
    rent_amount: Optional[int] = None
    deposit_amount: Optional[int] = None
    is_negotiable: bool = False
    contact_name: str
    contact_phone: str
    additional_notes: Optional[str] = None
    images: List[str] = []

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str
    user_id: str

# ============== HELPER FUNCTIONS ==============

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user_type = payload.get("user_type")
        if user_id is None:
            return None
        return {"user_id": user_id, "user_type": user_type}
    except JWTError:
        return None

async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

async def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if not user or user.get("user_type") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def calculate_quality_score(data: dict) -> int:
    score = 0
    # Basic info (40 points)
    if data.get("property_type"): score += 10
    if data.get("city"): score += 5
    if data.get("area"): score += 10
    if data.get("sector"): score += 5
    if data.get("contact_name"): score += 5
    if data.get("contact_phone"): score += 5
    
    # Details (30 points)
    if data.get("bedrooms"): score += 5
    if data.get("bathrooms"): score += 5
    if data.get("area_sqft"): score += 10
    if data.get("furnishing"): score += 5
    if data.get("availability"): score += 5
    
    # Pricing (15 points)
    if data.get("expected_price") or data.get("rent_amount"): score += 10
    if data.get("deposit_amount"): score += 5
    
    # Photos (15 points)
    images = data.get("images", [])
    if len(images) >= 5: score += 15
    elif len(images) >= 3: score += 10
    elif len(images) >= 1: score += 5
    
    return min(score, 100)

# ============== AUTH ROUTES ==============

@api_router.post("/auth/send-otp")
async def send_otp(request: SendOTPRequest):
    phone = request.phone.strip()
    if not phone or len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")
    
    # Check rate limiting
    existing_otp = await db.otp_requests.find_one({
        "phone": phone,
        "is_verified": False,
        "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
    })
    
    if existing_otp:
        created_at = datetime.fromisoformat(existing_otp['created_at'])
        if (datetime.now(timezone.utc) - created_at).seconds < 60:
            raise HTTPException(status_code=429, detail="Please wait before requesting a new OTP")
    
    # Generate OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Send OTP via MSG91 (if configured)
    if MSG91_AUTHKEY:
        try:
            async with httpx.AsyncClient() as http_client:
                # Using MSG91 OTP API
                response = await http_client.get(
                    "https://control.msg91.com/api/v5/otp",
                    params={
                        "authkey": MSG91_AUTHKEY,
                        "mobile": phone,
                        "template_id": MSG91_TEMPLATE_ID,
                        "otp": otp_code,
                    }
                )
                if response.status_code != 200:
                    logger.error(f"MSG91 error: {response.text}")
        except Exception as e:
            logger.error(f"MSG91 request failed: {e}")
    else:
        # Demo mode - log OTP for testing
        logger.info(f"Demo OTP for {phone}: {otp_code}")
    
    # Store OTP in database
    otp_request = OTPRequest(
        phone=phone,
        otp_code=otp_code,
        expires_at=expires_at
    )
    doc = otp_request.model_dump()
    doc['expires_at'] = doc['expires_at'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.otp_requests.insert_one(doc)
    
    return {"message": "OTP sent successfully", "expires_in": 600}

@api_router.post("/auth/verify-otp", response_model=TokenResponse)
async def verify_otp(request: VerifyOTPRequest):
    phone = request.phone.strip()
    otp_code = request.otp_code.strip()
    
    # Find valid OTP
    otp_doc = await db.otp_requests.find_one({
        "phone": phone,
        "is_verified": False,
        "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
    }, sort=[("created_at", -1)])
    
    if not otp_doc:
        raise HTTPException(status_code=400, detail="No valid OTP found. Please request a new one.")
    
    # Check attempts
    if otp_doc.get("attempts", 0) >= otp_doc.get("max_attempts", 3):
        raise HTTPException(status_code=429, detail="Maximum verification attempts exceeded")
    
    # Verify OTP
    if otp_doc["otp_code"] != otp_code:
        await db.otp_requests.update_one(
            {"id": otp_doc["id"]},
            {"$inc": {"attempts": 1}}
        )
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    # Mark OTP as verified
    await db.otp_requests.update_one(
        {"id": otp_doc["id"]},
        {"$set": {"is_verified": True}}
    )
    
    # Get or create user
    user_doc = await db.users.find_one({"phone": phone}, {"_id": 0})
    if not user_doc:
        user = User(phone=phone, is_verified=True)
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        user_doc = doc
    else:
        await db.users.update_one(
            {"phone": phone},
            {"$set": {"is_verified": True}}
        )
    
    # Generate token
    access_token = create_access_token({
        "user_id": user_doc["id"],
        "phone": phone,
        "user_type": "user"
    })
    
    return TokenResponse(
        access_token=access_token,
        user_type="user",
        user_id=user_doc["id"]
    )

@api_router.post("/auth/admin-login", response_model=TokenResponse)
async def admin_login(request: AdminLoginRequest):
    if request.admin_id != ADMIN_ID:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(request.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({
        "user_id": "admin",
        "user_type": "admin"
    })
    
    return TokenResponse(
        access_token=access_token,
        user_type="admin",
        user_id="admin"
    )

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(require_auth)):
    if user["user_type"] == "admin":
        return {"id": "admin", "user_type": "admin", "name": "TM Real Estate Admin"}
    
    user_doc = await db.users.find_one({"id": user["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {**user_doc, "user_type": "user"}

# ============== PROPERTY ROUTES ==============

@api_router.get("/properties", response_model=List[Property])
async def get_properties(
    listing_type: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    bedrooms: Optional[int] = None,
    location: Optional[str] = None,
    sector: Optional[str] = None,
    furnishing: Optional[str] = None,
    is_featured: Optional[bool] = None,
    sort_by: str = "newest",
    limit: int = 50,
    skip: int = 0
):
    query = {"is_published": True}
    
    if listing_type:
        query["listing_type"] = listing_type
    if property_type:
        query["property_type"] = property_type
    if min_price:
        query["price"] = {"$gte": min_price}
    if max_price:
        query.setdefault("price", {})["$lte"] = max_price
    if bedrooms:
        query["bedrooms"] = bedrooms
    if location:
        query["$or"] = [
            {"location": {"$regex": location, "$options": "i"}},
            {"sector": {"$regex": location, "$options": "i"}},
            {"city": {"$regex": location, "$options": "i"}}
        ]
    if sector:
        query["sector"] = {"$regex": sector, "$options": "i"}
    if furnishing:
        query["furnishing"] = furnishing
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    # Sorting
    sort_options = {
        "newest": [("created_at", -1)],
        "price_low": [("price", 1)],
        "price_high": [("price", -1)],
        "relevance": [("is_featured", -1), ("views", -1)]
    }
    sort = sort_options.get(sort_by, [("created_at", -1)])
    
    properties = await db.properties.find(query, {"_id": 0}).sort(sort).skip(skip).limit(limit).to_list(limit)
    
    # Convert datetime strings back to datetime objects
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
        if isinstance(prop.get('updated_at'), str):
            prop['updated_at'] = datetime.fromisoformat(prop['updated_at'])
    
    return properties

@api_router.get("/properties/featured", response_model=List[Property])
async def get_featured_properties(limit: int = 8):
    properties = await db.properties.find(
        {"is_published": True, "is_featured": True},
        {"_id": 0}
    ).sort([("created_at", -1)]).limit(limit).to_list(limit)
    
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
        if isinstance(prop.get('updated_at'), str):
            prop['updated_at'] = datetime.fromisoformat(prop['updated_at'])
    
    return properties

@api_router.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id, "is_published": True}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Increment views
    await db.properties.update_one({"id": property_id}, {"$inc": {"views": 1}})
    
    if isinstance(prop.get('created_at'), str):
        prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    if isinstance(prop.get('updated_at'), str):
        prop['updated_at'] = datetime.fromisoformat(prop['updated_at'])
    
    return prop

@api_router.get("/properties/{property_id}/similar", response_model=List[Property])
async def get_similar_properties(property_id: str, limit: int = 4):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        return []
    
    query = {
        "id": {"$ne": property_id},
        "is_published": True,
        "listing_type": prop.get("listing_type"),
        "$or": [
            {"sector": prop.get("sector")},
            {"property_type": prop.get("property_type")}
        ]
    }
    
    properties = await db.properties.find(query, {"_id": 0}).limit(limit).to_list(limit)
    
    for p in properties:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    
    return properties

# ============== ADMIN PROPERTY ROUTES ==============

@api_router.get("/admin/properties", response_model=List[Property])
async def admin_get_all_properties(admin: dict = Depends(require_admin)):
    properties = await db.properties.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(1000)
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
        if isinstance(prop.get('updated_at'), str):
            prop['updated_at'] = datetime.fromisoformat(prop['updated_at'])
    return properties

@api_router.post("/admin/properties", response_model=Property)
async def create_property(property_data: PropertyCreate, admin: dict = Depends(require_admin)):
    prop = Property(**property_data.model_dump())
    doc = prop.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.properties.insert_one(doc)
    return prop

@api_router.put("/admin/properties/{property_id}", response_model=Property)
async def update_property(property_id: str, property_data: PropertyCreate, admin: dict = Depends(require_admin)):
    existing = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Property not found")
    
    update_data = property_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.properties.update_one({"id": property_id}, {"$set": update_data})
    
    updated = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated

@api_router.delete("/admin/properties/{property_id}")
async def delete_property(property_id: str, admin: dict = Depends(require_admin)):
    result = await db.properties.delete_one({"id": property_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}

@api_router.patch("/admin/properties/{property_id}/publish")
async def toggle_publish(property_id: str, is_published: bool, admin: dict = Depends(require_admin)):
    result = await db.properties.update_one(
        {"id": property_id},
        {"$set": {"is_published": is_published, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": f"Property {'published' if is_published else 'unpublished'} successfully"}

@api_router.patch("/admin/properties/{property_id}/feature")
async def toggle_feature(property_id: str, is_featured: bool, admin: dict = Depends(require_admin)):
    result = await db.properties.update_one(
        {"id": property_id},
        {"$set": {"is_featured": is_featured, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": f"Property {'featured' if is_featured else 'unfeatured'} successfully"}

# ============== LISTING REQUEST ROUTES ==============

@api_router.post("/listing-requests", response_model=ListingRequest)
async def create_listing_request(data: ListingRequestCreate):
    quality_score = calculate_quality_score(data.model_dump())
    
    request = ListingRequest(**data.model_dump(), quality_score=quality_score)
    doc = request.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.listing_requests.insert_one(doc)
    
    return request

@api_router.get("/admin/listing-requests", response_model=List[ListingRequest])
async def get_listing_requests(
    status: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.listing_requests.find(query, {"_id": 0}).sort([("created_at", -1)]).to_list(1000)
    
    for req in requests:
        if isinstance(req.get('created_at'), str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
        if isinstance(req.get('updated_at'), str):
            req['updated_at'] = datetime.fromisoformat(req['updated_at'])
    
    return requests

@api_router.patch("/admin/listing-requests/{request_id}/status")
async def update_listing_request_status(
    request_id: str,
    status: str,
    admin: dict = Depends(require_admin)
):
    if status not in ["pending", "reviewed", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.listing_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return {"message": f"Request status updated to {status}"}

# ============== ENQUIRY ROUTES ==============

@api_router.post("/enquiries", response_model=Enquiry)
async def create_enquiry(
    data: EnquiryCreate,
    user: dict = Depends(get_current_user)
):
    enquiry_data = data.model_dump()
    if user:
        enquiry_data["user_id"] = user.get("user_id")
    
    enquiry = Enquiry(**enquiry_data)
    doc = enquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.enquiries.insert_one(doc)
    return enquiry

@api_router.get("/my-enquiries", response_model=List[Enquiry])
async def get_my_enquiries(user: dict = Depends(require_auth)):
    enquiries = await db.enquiries.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort([("created_at", -1)]).to_list(100)
    
    for enq in enquiries:
        if isinstance(enq.get('created_at'), str):
            enq['created_at'] = datetime.fromisoformat(enq['created_at'])
        if isinstance(enq.get('updated_at'), str):
            enq['updated_at'] = datetime.fromisoformat(enq['updated_at'])
    
    return enquiries

@api_router.get("/admin/enquiries", response_model=List[Enquiry])
async def get_enquiries(
    status: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    query = {}
    if status:
        query["status"] = status
    
    enquiries = await db.enquiries.find(query, {"_id": 0}).sort([("created_at", -1)]).to_list(1000)
    
    for enq in enquiries:
        if isinstance(enq.get('created_at'), str):
            enq['created_at'] = datetime.fromisoformat(enq['created_at'])
        if isinstance(enq.get('updated_at'), str):
            enq['updated_at'] = datetime.fromisoformat(enq['updated_at'])
    
    return enquiries

@api_router.patch("/admin/enquiries/{enquiry_id}/status")
async def update_enquiry_status(
    enquiry_id: str,
    status: str,
    admin_response: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    if status not in ["new", "accepted", "rejected", "contacted", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if admin_response:
        update_data["admin_response"] = admin_response
    
    result = await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    return {"message": f"Enquiry status updated to {status}"}

# ============== FAVORITES ROUTES ==============

@api_router.get("/favorites", response_model=List[Property])
async def get_favorites(user: dict = Depends(require_auth)):
    user_doc = await db.users.find_one({"id": user["user_id"]}, {"_id": 0})
    if not user_doc or not user_doc.get("favorites"):
        return []
    
    properties = await db.properties.find(
        {"id": {"$in": user_doc["favorites"]}, "is_published": True},
        {"_id": 0}
    ).to_list(100)
    
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
        if isinstance(prop.get('updated_at'), str):
            prop['updated_at'] = datetime.fromisoformat(prop['updated_at'])
    
    return properties

@api_router.post("/favorites/{property_id}")
async def add_favorite(property_id: str, user: dict = Depends(require_auth)):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    await db.users.update_one(
        {"id": user["user_id"]},
        {"$addToSet": {"favorites": property_id}}
    )
    return {"message": "Property added to favorites"}

@api_router.delete("/favorites/{property_id}")
async def remove_favorite(property_id: str, user: dict = Depends(require_auth)):
    await db.users.update_one(
        {"id": user["user_id"]},
        {"$pull": {"favorites": property_id}}
    )
    return {"message": "Property removed from favorites"}

# ============== RENTAL PROPERTY ROUTES (ADMIN ONLY) ==============

def validate_rental_dates(start_date: str, end_date: str):
    """Validate that end date is greater than start date"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        if end <= start:
            raise HTTPException(status_code=400, detail="End date must be greater than start date")
        return True
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

@api_router.get("/admin/rental-properties")
async def get_rental_properties(
    page: int = 1,
    limit: int = 50,
    admin: dict = Depends(require_admin)
):
    """Get paginated rental properties - ADMIN ONLY"""
    skip = (page - 1) * limit
    limit = min(limit, 50)  # Max 50 per page
    
    total = await db.rental_properties.count_documents({})
    properties = await db.rental_properties.find({}, {"_id": 0}).sort([("created_at", -1)]).skip(skip).limit(limit).to_list(limit)
    
    # Convert datetime strings and compute status dynamically
    today = datetime.now(timezone.utc).date()
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
        if isinstance(prop.get('updated_at'), str):
            prop['updated_at'] = datetime.fromisoformat(prop['updated_at'])
        
        # Compute status dynamically
        try:
            end_date = datetime.strptime(prop['agreement_end_date'], "%Y-%m-%d").date()
            remaining_days = (end_date - today).days
            if remaining_days < 30:
                prop['status'] = 'due_approaching'
                prop['status_text'] = 'Due date approaching'
                prop['remaining_days'] = remaining_days
            else:
                prop['status'] = 'enough_time'
                prop['status_text'] = 'Enough time left'
                prop['remaining_days'] = remaining_days
        except:
            prop['status'] = 'unknown'
            prop['status_text'] = 'Unknown'
            prop['remaining_days'] = 0
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "data": properties,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }

@api_router.post("/admin/rental-properties")
async def create_rental_property(
    data: RentalPropertyCreate,
    admin: dict = Depends(require_admin)
):
    """Create a new rental property - ADMIN ONLY"""
    # Validate required fields
    if not data.flat_no or not data.flat_no.strip():
        raise HTTPException(status_code=400, detail="Flat No is required")
    if not data.society_name or not data.society_name.strip():
        raise HTTPException(status_code=400, detail="Society Name is required")
    if not data.contact_number or not data.contact_number.strip():
        raise HTTPException(status_code=400, detail="Contact Number is required")
    if not data.agreement_start_date:
        raise HTTPException(status_code=400, detail="Start Date is required")
    if not data.agreement_end_date:
        raise HTTPException(status_code=400, detail="End Date is required")
    
    # Validate dates
    validate_rental_dates(data.agreement_start_date, data.agreement_end_date)
    
    rental_prop = RentalProperty(**data.model_dump())
    doc = rental_prop.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.rental_properties.insert_one(doc)
    
    return {"message": "Rental property created successfully", "id": rental_prop.id}

@api_router.put("/admin/rental-properties/{property_id}")
async def update_rental_property(
    property_id: str,
    data: RentalPropertyUpdate,
    admin: dict = Depends(require_admin)
):
    """Update a rental property - ADMIN ONLY"""
    existing = await db.rental_properties.find_one({"id": property_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Rental property not found")
    
    update_data = {}
    if data.flat_no is not None:
        if not data.flat_no.strip():
            raise HTTPException(status_code=400, detail="Flat No cannot be empty")
        update_data["flat_no"] = data.flat_no
    if data.society_name is not None:
        if not data.society_name.strip():
            raise HTTPException(status_code=400, detail="Society Name cannot be empty")
        update_data["society_name"] = data.society_name
    if data.contact_number is not None:
        if not data.contact_number.strip():
            raise HTTPException(status_code=400, detail="Contact Number cannot be empty")
        update_data["contact_number"] = data.contact_number
    if data.agreement_start_date is not None:
        update_data["agreement_start_date"] = data.agreement_start_date
    if data.agreement_end_date is not None:
        update_data["agreement_end_date"] = data.agreement_end_date
    if data.remarks is not None:
        update_data["remarks"] = data.remarks if data.remarks.strip() else None
    
    # Validate dates if both are being updated or if one is updated
    start_date = update_data.get("agreement_start_date", existing.get("agreement_start_date"))
    end_date = update_data.get("agreement_end_date", existing.get("agreement_end_date"))
    if start_date and end_date:
        validate_rental_dates(start_date, end_date)
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.rental_properties.update_one(
        {"id": property_id},
        {"$set": update_data}
    )
    
    return {"message": "Rental property updated successfully"}

@api_router.delete("/admin/rental-properties/{property_id}")
async def delete_rental_property(
    property_id: str,
    admin: dict = Depends(require_admin)
):
    """Delete a rental property - ADMIN ONLY"""
    result = await db.rental_properties.delete_one({"id": property_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rental property not found")
    return {"message": "Rental property deleted successfully"}

# ============== STATS ROUTES ==============

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(require_admin)):
    total_properties = await db.properties.count_documents({})
    published_properties = await db.properties.count_documents({"is_published": True})
    featured_properties = await db.properties.count_documents({"is_featured": True})
    total_enquiries = await db.enquiries.count_documents({})
    new_enquiries = await db.enquiries.count_documents({"status": "new"})
    total_requests = await db.listing_requests.count_documents({})
    pending_requests = await db.listing_requests.count_documents({"status": "pending"})
    total_users = await db.users.count_documents({})
    total_rental_properties = await db.rental_properties.count_documents({})
    
    return {
        "properties": {
            "total": total_properties,
            "published": published_properties,
            "featured": featured_properties
        },
        "enquiries": {
            "total": total_enquiries,
            "new": new_enquiries
        },
        "listing_requests": {
            "total": total_requests,
            "pending": pending_requests
        },
        "users": {
            "total": total_users
        },
        "rental_properties": {
            "total": total_rental_properties
        }
    }

# ============== LOCATIONS ROUTE ==============

@api_router.get("/locations")
async def get_locations():
    return {
        "cities": [
            "Airoli", "Kopar Khairane", "Vashi", "Ghansoli", "Rabale",
            "Digha", "Vitawa", "Mulund", "Nerul", "CBD Belapur", "Sea Woods",
            "Navi Mumbai", "Mumbai", "Thane"
        ],
        "sectors": [
            "Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5",
            "Sector 6", "Sector 7", "Sector 8", "Sector 9", "Sector 10",
            "Sector 11", "Sector 12", "Sector 13", "Sector 14", "Sector 15",
            "Sector 16", "Sector 17", "Sector 18", "Sector 19", "Sector 20"
        ],
        "areas": [
            "Airoli", "Kopar Khairane", "Vashi", "Ghansoli", "Rabale",
            "Digha", "Vitawa", "Mulund", "Nerul", "CBD Belapur", "Sea Woods",
            "Turbhe", "Sanpada", "Kharghar", "Panvel"
        ]
    }

# ============== SEED DATA ROUTE ==============

@api_router.post("/seed")
async def seed_data():
    # Check if data already exists
    existing = await db.properties.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded", "count": existing}
    
    # Demo property images from Unsplash
    images = [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    ]
    
    demo_properties = [
        # Buy properties
        {
            "title": "Spacious 2 BHK Flat in Airoli Sector 8",
            "property_type": "flat",
            "listing_type": "buy",
            "price": 8500000,
            "area_sqft": 950,
            "bedrooms": 2,
            "bathrooms": 2,
            "furnishing": "semi-furnished",
            "parking": "1 Covered",
            "floor": "5th",
            "total_floors": 12,
            "facing": "East",
            "property_age": "2-5 years",
            "description": "Beautiful 2 BHK flat with excellent ventilation and natural light. Located in a prime area of Airoli Sector 8, close to railway station and market.",
            "amenities": ["Lift", "Power Backup", "Security", "Gym", "Club House", "Children Play Area"],
            "images": [images[0], images[1], images[2], images[3]],
            "location": "Near Yash Paradise",
            "sector": "Sector 8",
            "city": "Navi Mumbai",
            "latitude": 19.1518,
            "longitude": 72.9979,
            "is_featured": True,
        },
        {
            "title": "Premium 3 BHK with Sea View in Airoli",
            "property_type": "flat",
            "listing_type": "buy",
            "price": 14500000,
            "area_sqft": 1450,
            "bedrooms": 3,
            "bathrooms": 3,
            "furnishing": "fully-furnished",
            "parking": "2 Covered",
            "floor": "15th",
            "total_floors": 20,
            "facing": "West",
            "property_age": "New",
            "description": "Luxurious 3 BHK apartment with stunning sea view. Premium fittings, modular kitchen, and spacious balconies. Gated community with world-class amenities.",
            "amenities": ["Swimming Pool", "Gym", "Club House", "Tennis Court", "24x7 Security", "Power Backup", "Parking"],
            "images": [images[4], images[5], images[6], images[7]],
            "location": "Creek Side",
            "sector": "Sector 9",
            "city": "Navi Mumbai",
            "latitude": 19.1550,
            "longitude": 72.9950,
            "is_featured": True,
        },
        {
            "title": "Affordable 1 BHK in Ghansoli",
            "property_type": "flat",
            "listing_type": "buy",
            "price": 4500000,
            "area_sqft": 550,
            "bedrooms": 1,
            "bathrooms": 1,
            "furnishing": "unfurnished",
            "parking": "Open",
            "floor": "3rd",
            "total_floors": 7,
            "facing": "North",
            "property_age": "5-10 years",
            "description": "Well-maintained 1 BHK flat ideal for first-time buyers. Close to Ghansoli railway station and all amenities.",
            "amenities": ["Lift", "Security", "Power Backup"],
            "images": [images[1], images[2], images[0]],
            "location": "Near Ghansoli Station",
            "sector": "Ghansoli",
            "city": "Navi Mumbai",
            "is_featured": False,
        },
        {
            "title": "Elegant 2 BHK in Vashi",
            "property_type": "flat",
            "listing_type": "buy",
            "price": 11000000,
            "area_sqft": 1100,
            "bedrooms": 2,
            "bathrooms": 2,
            "furnishing": "semi-furnished",
            "parking": "1 Covered",
            "floor": "8th",
            "total_floors": 15,
            "facing": "South",
            "property_age": "2-5 years",
            "description": "Modern 2 BHK in the heart of Vashi. Walking distance to Inorbit Mall and Vashi Station.",
            "amenities": ["Gym", "Swimming Pool", "Club House", "Children Play Area", "Security"],
            "images": [images[3], images[4], images[5]],
            "location": "Sector 17",
            "sector": "Sector 17",
            "city": "Navi Mumbai",
            "is_featured": True,
        },
        {
            "title": "Independent House with Garden in Airoli",
            "property_type": "house",
            "listing_type": "buy",
            "price": 25000000,
            "area_sqft": 2200,
            "bedrooms": 4,
            "bathrooms": 4,
            "furnishing": "fully-furnished",
            "parking": "2 Car Garage",
            "facing": "Corner",
            "property_age": "5-10 years",
            "description": "Stunning independent house with private garden. Perfect for large families. Quiet neighborhood with excellent connectivity.",
            "amenities": ["Garden", "Terrace", "Modular Kitchen", "Study Room", "Servant Room"],
            "images": [images[5], images[6], images[7], images[0]],
            "location": "Sector 3",
            "sector": "Sector 3",
            "city": "Navi Mumbai",
            "is_featured": True,
        },
        {
            "title": "Commercial Shop in Prime Location",
            "property_type": "shop",
            "listing_type": "buy",
            "price": 7500000,
            "area_sqft": 400,
            "furnishing": "unfurnished",
            "facing": "Main Road",
            "description": "Prime commercial shop on main road. High footfall area, ideal for retail business or showroom.",
            "amenities": ["Power Backup", "Water Supply", "Parking Available"],
            "images": [images[2], images[3]],
            "location": "Sector 8 Main Road",
            "sector": "Sector 8",
            "city": "Navi Mumbai",
            "is_featured": False,
        },
        # Rent properties
        {
            "title": "Fully Furnished 2 BHK for Rent in Airoli",
            "property_type": "flat",
            "listing_type": "rent",
            "price": 28000,
            "deposit": 100000,
            "area_sqft": 900,
            "bedrooms": 2,
            "bathrooms": 2,
            "furnishing": "fully-furnished",
            "parking": "1 Covered",
            "floor": "7th",
            "total_floors": 14,
            "facing": "East",
            "availability": "Immediate",
            "description": "Move-in ready furnished 2 BHK. Includes AC, fridge, washing machine, and modular kitchen. Family preferred.",
            "amenities": ["AC", "Fridge", "Washing Machine", "Gym", "Security", "Power Backup"],
            "images": [images[6], images[7], images[0], images[1]],
            "location": "Near Airoli Bridge",
            "sector": "Sector 7",
            "city": "Navi Mumbai",
            "is_featured": True,
        },
        {
            "title": "Semi-Furnished 1 BHK for Bachelor/Family",
            "property_type": "flat",
            "listing_type": "rent",
            "price": 15000,
            "deposit": 50000,
            "area_sqft": 500,
            "bedrooms": 1,
            "bathrooms": 1,
            "furnishing": "semi-furnished",
            "parking": "Open",
            "floor": "2nd",
            "total_floors": 5,
            "facing": "North",
            "availability": "Within 15 days",
            "description": "Cozy 1 BHK suitable for bachelors or small family. Basic furniture included. Close to local market.",
            "amenities": ["Water Supply 24x7", "Power Backup"],
            "images": [images[0], images[1]],
            "location": "Sector 10",
            "sector": "Sector 10",
            "city": "Navi Mumbai",
            "is_featured": False,
        },
        {
            "title": "Spacious 3 BHK with Balcony for Rent",
            "property_type": "flat",
            "listing_type": "rent",
            "price": 45000,
            "deposit": 150000,
            "area_sqft": 1400,
            "bedrooms": 3,
            "bathrooms": 3,
            "furnishing": "semi-furnished",
            "parking": "2 Covered",
            "floor": "10th",
            "total_floors": 18,
            "facing": "West",
            "availability": "Immediate",
            "description": "Spacious 3 BHK with large balcony overlooking greenery. Master bedroom with attached bath. Near international school.",
            "amenities": ["Club House", "Swimming Pool", "Gym", "Children Play Area", "Jogging Track"],
            "images": [images[4], images[5], images[6]],
            "location": "Near DAV School",
            "sector": "Sector 9",
            "city": "Navi Mumbai",
            "is_featured": True,
        },
        {
            "title": "Office Space for Rent in Airoli IT Park",
            "property_type": "office",
            "listing_type": "rent",
            "price": 75000,
            "deposit": 300000,
            "area_sqft": 1200,
            "furnishing": "fully-furnished",
            "parking": "4 Covered",
            "availability": "Within 30 days",
            "description": "Ready-to-use office space in IT Park. Includes workstations for 20 people, conference room, and pantry.",
            "amenities": ["24x7 Access", "Security", "Cafeteria", "High-speed Internet", "AC"],
            "images": [images[2], images[3], images[4]],
            "location": "Airoli Knowledge Park",
            "sector": "Sector 8",
            "city": "Navi Mumbai",
            "is_featured": False,
        },
        # PG properties
        {
            "title": "Boys PG with Meals in Airoli",
            "property_type": "pg",
            "listing_type": "pg",
            "price": 8000,
            "deposit": 8000,
            "furnishing": "fully-furnished",
            "availability": "Immediate",
            "description": "Comfortable boys PG accommodation. Includes breakfast and dinner. Near railway station. AC and non-AC rooms available.",
            "amenities": ["Meals Included", "WiFi", "Laundry", "TV", "Security"],
            "images": [images[1], images[2]],
            "location": "Near Airoli Station",
            "sector": "Sector 8",
            "city": "Navi Mumbai",
            "is_featured": False,
        },
        {
            "title": "Girls PG with All Facilities",
            "property_type": "pg",
            "listing_type": "pg",
            "price": 9000,
            "deposit": 9000,
            "furnishing": "fully-furnished",
            "availability": "Immediate",
            "description": "Safe and secure girls PG. Homely atmosphere with home-cooked meals. 24x7 security and CCTV surveillance.",
            "amenities": ["Meals Included", "WiFi", "Hot Water", "CCTV", "24x7 Security", "Power Backup"],
            "images": [images[0], images[3]],
            "location": "Sector 5",
            "sector": "Sector 5",
            "city": "Navi Mumbai",
            "is_featured": True,
        },
        # More variety
        {
            "title": "Luxurious 4 BHK Penthouse in Vashi",
            "property_type": "flat",
            "listing_type": "buy",
            "price": 35000000,
            "area_sqft": 3200,
            "bedrooms": 4,
            "bathrooms": 5,
            "furnishing": "fully-furnished",
            "parking": "3 Covered",
            "floor": "25th (Top)",
            "total_floors": 25,
            "facing": "All Sides",
            "property_age": "New",
            "description": "Ultra-luxurious penthouse with 360-degree view. Private terrace, jacuzzi, home theatre, and smart home features.",
            "amenities": ["Private Terrace", "Jacuzzi", "Home Theatre", "Smart Home", "Infinity Pool", "Concierge"],
            "images": [images[4], images[5], images[6], images[7]],
            "location": "Palm Beach Road",
            "sector": "Vashi",
            "city": "Navi Mumbai",
            "is_featured": True,
        },
        {
            "title": "Budget 2 BHK in Kopar Khairane",
            "property_type": "flat",
            "listing_type": "buy",
            "price": 6500000,
            "area_sqft": 800,
            "bedrooms": 2,
            "bathrooms": 1,
            "furnishing": "unfurnished",
            "parking": "Open",
            "floor": "4th",
            "total_floors": 7,
            "facing": "East",
            "property_age": "10+ years",
            "description": "Affordable 2 BHK in established society. Well-connected area with good resale value.",
            "amenities": ["Lift", "Water Supply", "Security"],
            "images": [images[0], images[1]],
            "location": "Near NMMC Garden",
            "sector": "Kopar Khairane",
            "city": "Navi Mumbai",
            "is_featured": False,
        },
        {
            "title": "Commercial Plot in Turbhe",
            "property_type": "plot",
            "listing_type": "buy",
            "price": 50000000,
            "area_sqft": 5000,
            "facing": "Main Road",
            "description": "Prime commercial plot suitable for warehouse, factory, or showroom. Clear title, ready for construction.",
            "amenities": ["Road Access", "Water Connection", "Electricity Available"],
            "images": [images[2]],
            "location": "MIDC Turbhe",
            "sector": "Turbhe",
            "city": "Navi Mumbai",
            "is_featured": False,
        },
    ]
    
    # Insert demo properties
    for prop_data in demo_properties:
        prop = Property(**prop_data)
        doc = prop.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.properties.insert_one(doc)
    
    return {"message": "Demo data seeded successfully", "count": len(demo_properties)}

# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "TM Real Estate API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
