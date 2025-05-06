from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timedelta
from models import UserRequest, AdminRequest, CheckoutRequest, SubscriptionRequest
from utils.logging_utils import logger
import os
import stripe
import asyncio
from httpx import AsyncClient

router = APIRouter()

# This would typically be stored in a database
user_subscriptions = {}
user_trials = {}
daily_usage = {}
weekly_usage = {}
admin_users = set()  # Store admin user IDs

@router.post("/user-subscription")
async def check_subscription(user_data: UserRequest):
    user_id = user_data.user_id
    
    # Check if user is an admin
    is_admin = user_id in admin_users
    
    # If user is admin, they get full access regardless of subscription
    if is_admin:
        return {
            "subscription": "pro",  # Admin users effectively have Pro access
            "is_admin": True
        }
    
    # Check if user has an active paid subscription
    if user_id in user_subscriptions:
        response = {
            "subscription": user_subscriptions[user_id],
            "is_admin": False
        }
        
        # Add weekly analyses left for basic plan
        if user_subscriptions[user_id] == "basic" and user_id in weekly_usage:
            current_week = datetime.now().isocalendar()[1]
            weekly_analyses_used = weekly_usage[user_id].get(current_week, 0)
            analyses_left = 10 - weekly_analyses_used  # 10 analyses per week for basic plan
            response["basic_info"] = {
                "weekly_analyses_left": analyses_left if analyses_left > 0 else 0
            }
            
        return response
    
    # Check if user is in trial period
    if user_id in user_trials:
        trial_start = user_trials[user_id]["start_date"]
        trial_end = trial_start + timedelta(days=3)
        now = datetime.now()
        
        if now <= trial_end:
            days_left = (trial_end - now).days
            return {
                "subscription": "free-trial", 
                "trial_info": {
                    "days_left": days_left,
                    "end_date": trial_end.isoformat()
                },
                "is_admin": False
            }
        else:
            # Trial expired
            return {"subscription": "free", "is_admin": False}
    else:
        # Start a new trial for the user
        user_trials[user_id] = {
            "start_date": datetime.now(),
            "email": user_data.email
        }
        # Reset the usage counter for this new user
        reset_daily_usage(user_id)
        return {
            "subscription": "free-trial", 
            "trial_info": {
                "days_left": 3,
                "end_date": (datetime.now() + timedelta(days=3)).isoformat()
            },
            "is_admin": False
        }

@router.post("/check-usage")
async def check_usage(user_data: UserRequest):
    user_id = user_data.user_id
    
    # Admin users have unlimited usage
    if user_id in admin_users:
        return {"remaining_analyses": float('inf')}
    
    # Reset usage if it's a new day
    reset_if_new_day(user_id)
    
    # Check if user is on basic plan and update weekly usage
    if user_id in user_subscriptions and user_subscriptions[user_id] == "basic":
        current_week = datetime.now().isocalendar()[1]
        if user_id not in weekly_usage or current_week not in weekly_usage[user_id]:
            if user_id not in weekly_usage:
                weekly_usage[user_id] = {}
            weekly_usage[user_id][current_week] = 0
            
        weekly_analyses_used = weekly_usage[user_id][current_week]
        analyses_left = 10 - weekly_analyses_used  # 10 analyses per week for basic plan
        return {"remaining_analyses": analyses_left if analyses_left > 0 else 0}
    
    # Free trial user - daily usage check
    today = datetime.now().date().isoformat()
    if user_id not in daily_usage or today not in daily_usage[user_id]:
        daily_usage[user_id] = {today: 0}
    
    remaining = 3 - daily_usage[user_id][today]
    return {"remaining_analyses": remaining}

@router.post("/track-analysis")
async def track_analysis(user_data: UserRequest):
    user_id = user_data.user_id
    
    # Admin users have unlimited analyses
    if user_id in admin_users:
        return {"unlimited": True}
    
    # Check if user is on pro plan (unlimited analyses)
    if user_id in user_subscriptions and user_subscriptions[user_id] == "pro":
        return {"unlimited": True}
    
    # Check if user is on basic plan (weekly limit)
    if user_id in user_subscriptions and user_subscriptions[user_id] == "basic":
        current_week = datetime.now().isocalendar()[1]
        if user_id not in weekly_usage:
            weekly_usage[user_id] = {}
        
        if current_week not in weekly_usage[user_id]:
            weekly_usage[user_id][current_week] = 0
            
        if weekly_usage[user_id][current_week] >= 10:  # 10 analyses per week for basic plan
            raise HTTPException(status_code=403, detail="Weekly analysis limit reached")
        
        weekly_usage[user_id][current_week] += 1
        remaining = 10 - weekly_usage[user_id][current_week]
        return {"remaining_analyses": remaining}
    
    # Free trial user - daily limit
    reset_if_new_day(user_id)
    
    today = datetime.now().date().isoformat()
    if user_id not in daily_usage or today not in daily_usage[user_id]:
        daily_usage[user_id] = {today: 0}
    
    if daily_usage[user_id][today] >= 3:
        raise HTTPException(status_code=403, detail="Daily analysis limit reached")
    
    # Increment usage
    daily_usage[user_id][today] += 1
    remaining = 3 - daily_usage[user_id][today]
    
    return {"remaining_analyses": remaining}

@router.post("/create-checkout-session")
async def create_checkout_session(checkout_data: CheckoutRequest):
    try:
        # This is a mock implementation
        # In a real app, this would use stripe.checkout.Session.create()
        
        # Store the user's plan choice
        user_subscriptions[checkout_data.user_id] = checkout_data.plan
        
        # In production, this would be the Stripe checkout URL
        checkout_url = f"http://localhost:3000/payment-success?plan={checkout_data.plan}"
        
        return {"checkout_url": checkout_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/set-admin")
async def set_admin(admin_data: AdminRequest):
    # Very simple security check - in production, use proper authentication
    if admin_data.admin_key != "oculis-admin-key":
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    # Add user to admin set
    admin_users.add(admin_data.user_id)
    return {"status": "success", "message": f"User {admin_data.user_id} is now an admin"}

@router.post("/check-admin")
async def check_admin(user_data: UserRequest):
    is_admin = user_data.user_id in admin_users
    return {"is_admin": is_admin}

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Webhook signature verification failed: {str(e)}")

    # Handle checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})
        user_id = metadata.get('user_id')
        selected_plan = metadata.get('selected_plan')

        if user_id and selected_plan:
            # Update Auth0 metadata
            await update_auth0_user_plan(user_id, selected_plan)

    return {"status": "success"}

# Helper functions for user management
def reset_if_new_day(user_id: str):
    """Reset daily usage if it's a new day"""
    if user_id in daily_usage:
        today = datetime.now().date().isoformat()
        if today not in daily_usage[user_id]:
            reset_daily_usage(user_id)

def reset_daily_usage(user_id: str):
    """Reset the daily usage counter for a user"""
    today = datetime.now().date().isoformat()
    daily_usage[user_id] = {today: 0}

async def update_auth0_user_plan(user_id: str, plan: str):
    """Update Auth0 user metadata with subscription plan information"""
    auth0_domain = os.getenv("AUTH0_DOMAIN")
    auth0_token = os.getenv("AUTH0_API_TOKEN")

    url = f"https://{auth0_domain}/api/v2/users/{user_id}"
    headers = {
        "Authorization": f"Bearer {auth0_token}",
        "Content-Type": "application/json"
    }
    data = {
        "app_metadata": {
            "plan": plan
        }
    }

    async with AsyncClient() as client:
        response = await client.patch(url, headers=headers, json=data)
        response.raise_for_status()
