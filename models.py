
from pydantic import BaseModel
from typing import Optional, List

class Query(BaseModel):
    query: str
    url: str
    analysis_type: Optional[str] = None
    is_competitor: Optional[bool] = False

class UserRequest(BaseModel):
    user_id: str
    email: Optional[str] = None

class AdminRequest(BaseModel):
    user_id: str
    admin_key: str

class CheckoutRequest(BaseModel):
    user_id: str
    plan: str
    return_url: Optional[str] = None

class SubscriptionRequest(BaseModel):
    user_id: str
    plan: str
    customer_id: Optional[str] = None
    subscription_id: Optional[str] = None
