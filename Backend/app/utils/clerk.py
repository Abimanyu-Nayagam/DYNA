import os
import requests

CLERK_API_KEY = os.getenv("CLERK_API_KEY")
CLERK_API_URL = os.getenv("CLERK_API_URL", "https://api.clerk.com")
CLERK_API_VERSION = os.getenv("CLERK_API_VERSION", "v1")

BASE_URL = f"{CLERK_API_URL}/{CLERK_API_VERSION}"


def create_clerk_user(email, password, name):
    """Creates a Clerk user via the backend API."""
    url = f"{BASE_URL}/users"
    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "email_address": [email],
        "password": password,
        "first_name": name
    }

    response = requests.post(url, json=payload, headers=headers)
    data = safe_json(response)

    if response.status_code != 200:
        raise Exception({
            "stage": "create_user",
            "details": data
        })

    return data


def safe_json(response):
    """Return JSON if valid, otherwise include raw text & status."""
    try:
        return {
            "status": response.status_code,
            "json": response.json(),
            "raw": None
        }
    except Exception:
        return {
            "status": response.status_code,
            "json": None,
            "raw": response.text
        }


def verify_clerk_login(email, password):
    """Verify user exists and return user data"""
    url = f"{BASE_URL}/users"
    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Search for user by email
    response = requests.get(
        url,
        headers=headers,
        params={"email_address": [email]}
    )
    
    data = safe_json(response)
    
    if response.status_code != 200:
        raise Exception({"stage": "get_user", "details": data})
    
    users = data.get("json", [])
    if not users:
        raise Exception({"stage": "user_not_found", "details": "No user with this email"})
    
    user = users[0]
    
    # Extract user info with correct field name
    return {
        "success": True,
        "user_id": user.get("id"),  # Changed from "user_id" to "id"
        "email": user.get("email_addresses", [{}])[0].get("email_address"),
        "first_name": user.get("first_name"),
        "created_at": user.get("created_at"),
        # "full_user_data": user  # Include full response if needed
    }