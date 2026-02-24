# main.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import json
import os
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import smtplib
from email.message import EmailMessage

# Load environment variables from .env into os.environ
load_dotenv()

app = FastAPI(title="LoopCart Backend")

# Enable CORS (for development use "*", restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to product.json
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRODUCT_FILE = os.path.join(BASE_DIR, "product.json")


def load_products() -> List[Dict[str, Any]]:
    """Load fresh product.json every time (returns empty list on error)."""
    try:
        with open(PRODUCT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        # Keep this print for local debugging; in production use logging
        print("Error loading product.json:", e)
        return []


# -----------------------------
# 1. ROOT ENDPOINT
# -----------------------------
@app.get("/")
def root() -> Dict[str, Any]:
    return {
        "status": "ok",
        "message": "Backend is running",
        "try": ["/docs", "/search?query=iphone", "/request-access"]
    }


# -----------------------------
# 2. PRODUCT SEARCH API
# -----------------------------
@app.get("/search", response_model=List[Dict[str, Any]])
def search_products(query: str = Query(..., description="Search keyword for products")) -> List[Dict[str, Any]]:
    products = load_products()
    query_lower = query.lower()

    results = [
        product for product in products
        if query_lower in product.get("title", "").lower()
        or query_lower in product.get("brand", "").lower()
        or query_lower in product.get("category", "").lower()
    ]

    return results


# -----------------------------
# 3. REQUEST ACCESS EMAIL API
# -----------------------------
class RequestForm(BaseModel):
    fullName: str
    email: EmailStr
    phone: Optional[str] = None
    boutique: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    categories: Optional[List[str]] = None
    notes: Optional[str] = None


def build_html(payload: RequestForm) -> str:
    """Build an HTML email body from the payload."""
    categories = ", ".join(payload.categories) if payload.categories else "None"

    return f"""
    <h2>Exclusive Collection Access Request</h2>
    <p><strong>Name:</strong> {payload.fullName}</p>
    <p><strong>Email:</strong> {payload.email}</p>
    <p><strong>Phone:</strong> {payload.phone or ''}</p>
    <p><strong>Boutique:</strong> {payload.boutique or ''}</p>
    <p><strong>Preferred Date:</strong> {payload.date or ''}</p>
    <p><strong>Preferred Time:</strong> {payload.time or ''}</p>
    <p><strong>Categories:</strong> {categories}</p>
    <p><strong>Special Requests:</strong><br>{payload.notes or ''}</p>
    """


@app.post("/request-access")
async def request_access(payload: RequestForm) -> Dict[str, Any]:
    """Send form details to the configured EMAIL_TO using Gmail SMTP."""
    email_from = os.getenv("EMAIL_FROM")
    email_to = os.getenv("EMAIL_TO")
    email_password = os.getenv("EMAIL_PASSWORD")

    if not email_from or not email_to or not email_password:
        raise HTTPException(status_code=500, detail="Email environment variables not configured")

    msg = EmailMessage()
    msg["Subject"] = f"New Access Request: {payload.fullName}"
    msg["From"] = email_from
    msg["To"] = email_to
    msg.set_content(build_html(payload), subtype="html")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(email_from, email_password)
            smtp.send_message(msg)
    except Exception as e:
        # Provide the error in the response for easier local debugging
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")

    return {"ok": True, "message": "Request sent successfully!"}
