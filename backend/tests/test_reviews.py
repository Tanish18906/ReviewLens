import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_product_list_all():
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 16
    assert len(data["items"]) == 16
    # First product check
    prod = data["items"][0]
    assert "slug" in prod
    assert "average_rating" in prod
    assert "review_count" in prod


def test_product_search_match():
    response = client.get("/api/products?q=plush")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("plush" in item["name"].lower() for item in data["items"])


def test_product_search_no_match():
    response = client.get("/api/products?q=nonexistentproductqueryxyz")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["items"]) == 0


def test_product_category_filter():
    response = client.get("/api/products?category=Plush+Toys")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 4
    for item in data["items"]:
        assert item["category"] == "Plush Toys"


def test_product_sort_highest_rated():
    response = client.get("/api/products?sort=rating_desc")
    assert response.status_code == 200
    data = response.json()
    ratings = [p["average_rating"] for p in data["items"] if p["average_rating"] is not None]
    # Check descending order
    assert ratings == sorted(ratings, reverse=True)


def test_product_detail_found():
    response = client.get("/api/products/strawberry-bunny-plush")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "strawberry-bunny-plush"
    assert data["name"] == "Strawberry Bunny Plush"
    assert data["review_count"] >= 5


def test_product_detail_not_found():
    response = client.get("/api/products/unknown-product-slug")
    assert response.status_code == 404
    assert "find that product" in response.json()["detail"].lower()


def test_get_product_reviews():
    response = client.get("/api/products/strawberry-bunny-plush/reviews?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) <= 5
    if len(data["items"]) >= 2:
        # Check newest first
        assert data["items"][0]["created_at"] >= data["items"][1]["created_at"]


def test_submit_review_unauthenticated():
    payload = {
        "rating": 5,
        "review_text": "This is a valid review text with more than twenty characters."
    }
    response = client.post("/api/products/strawberry-bunny-plush/reviews", json=payload)
    assert response.status_code == 401


def test_submit_review_invalid_stars():
    # Login as student
    login_res = client.post("/api/auth/login", json={
        "email": "student1@reviewlens.edu",
        "password": "Student@ReviewLens1"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test 6 stars
    res_high = client.post("/api/products/strawberry-bunny-plush/reviews", json={
        "rating": 6,
        "review_text": "Valid length text but rating 6 is invalid and should fail."
    }, headers=headers)
    assert res_high.status_code == 422

    # Test 0 stars
    res_low = client.post("/api/products/strawberry-bunny-plush/reviews", json={
        "rating": 0,
        "review_text": "Valid length text but rating 0 is invalid and should fail."
    }, headers=headers)
    assert res_low.status_code == 422


def test_submit_review_too_short():
    login_res = client.post("/api/auth/login", json={
        "email": "student1@reviewlens.edu",
        "password": "Student@ReviewLens1"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/products/strawberry-bunny-plush/reviews", json={
        "rating": 5,
        "review_text": "Too short!"
    }, headers=headers)
    assert response.status_code == 422


def test_submit_valid_review_and_block_duplicate():
    # Register a new student who hasn't reviewed any product yet
    unique_email = f"reviewer.{uuid.uuid4().hex[:8]}@reviewlens.edu"
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Review Submitter",
        "email": unique_email,
        "password": "ReviewPassword123"
    })
    assert reg_res.status_code == 201

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "ReviewPassword123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit first review on cloud-bear-teddy
    review_body = "The cloud bear teddy plush is incredibly soft and comfortable for daily study sessions."
    res1 = client.post("/api/products/cloud-bear-teddy/reviews", json={
        "rating": 5,
        "review_text": review_body
    }, headers=headers)
    assert res1.status_code == 201
    data1 = res1.json()
    assert data1["rating"] == 5
    assert data1["review_text"] == review_body
    assert len(data1["cleaned_text"]) > 0
    assert data1["source"] == "user"

    # Attempt duplicate review on SAME product with SAME user
    res2 = client.post("/api/products/cloud-bear-teddy/reviews", json={
        "rating": 4,
        "review_text": "Attempting a second review on the same product which must be blocked."
    }, headers=headers)
    assert res2.status_code == 409
    assert "already reviewed" in res2.json()["detail"].lower()
