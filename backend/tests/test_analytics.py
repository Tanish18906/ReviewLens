import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.preprocess import clean_text

client = TestClient(app)


def test_admin_overview_forbidden_for_student():
    # Login as student
    login_res = client.post("/api/auth/login", json={
        "email": "student1@reviewlens.edu",
        "password": "Student@ReviewLens1"
    })
    token = login_res.json()["access_token"]

    response = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_admin_overview_forbidden_for_unauthenticated():
    response = client.get("/api/admin/overview")
    assert response.status_code == 401


def test_admin_overview_success():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@reviewlens.edu",
        "password": "Admin@ReviewLens2026"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    response = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()

    # Verify 4 KPIs
    assert data["total_users"] >= 7
    assert data["total_products"] == 16
    assert data["total_reviews"] >= 60
    assert data["average_rating"] is not None
    assert 1.0 <= data["average_rating"] <= 5.0

    # Verify 5-bucket rating distribution
    dist = data["rating_distribution"]
    assert len(dist) == 5
    assert [b["rating"] for b in dist] == [1, 2, 3, 4, 5]
    total_dist_count = sum(b["count"] for b in dist)
    assert total_dist_count == data["total_reviews"]

    # Verify top products
    assert len(data["top_products"]) <= 5
    for p in data["top_products"]:
        assert "slug" in p
        assert "review_count" in p
        assert "average_rating" in p

    # Verify recent reviews
    assert len(data["recent_reviews"]) <= 5
    for r in data["recent_reviews"]:
        assert "product_name" in r
        assert "reviewer_name" in r
        assert 1 <= r["rating"] <= 5


def test_analytics_updates_after_new_review():
    # 1. Admin login to get initial totals
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@reviewlens.edu",
        "password": "Admin@ReviewLens2026"
    })
    admin_token = admin_login.json()["access_token"]
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    res_before = client.get("/api/admin/overview", headers=headers_admin)
    data_before = res_before.json()
    init_total_reviews = data_before["total_reviews"]

    # 2. Register fresh student
    student_email = f"analytics.student.{id(res_before)}@reviewlens.edu"
    client.post("/api/auth/register", json={
        "full_name": "Analytics Tester",
        "email": student_email,
        "password": "StudentPassword123"
    })
    student_login = client.post("/api/auth/login", json={
        "email": student_email,
        "password": "StudentPassword123"
    })
    student_token = student_login.json()["access_token"]
    headers_student = {"Authorization": f"Bearer {student_token}"}

    # 3. Post a 5-star review on strawberry-bunny-plush
    client.post("/api/products/strawberry-bunny-plush/reviews", json={
        "rating": 5,
        "review_text": "Super soft strawberry plushie that makes studying so much cozier and calming."
    }, headers=headers_student)

    # 4. Refetch admin overview - numbers must update from DB!
    res_after = client.get("/api/admin/overview", headers=headers_admin)
    data_after = res_after.json()

    assert data_after["total_reviews"] == init_total_reviews + 1
    # Bucket 5 count should increment
    b5_before = next(b["count"] for b in data_before["rating_distribution"] if b["rating"] == 5)
    b5_after = next(b["count"] for b in data_after["rating_distribution"] if b["rating"] == 5)
    assert b5_after == b5_before + 1


def test_text_cleaning_deterministic():
    raw1 = "Great strawberry plush! Check http://example.com for details... REALLY LOVED IT."
    raw2 = "Great strawberry plush! Check http://example.com for details... REALLY LOVED IT."
    cleaned1 = clean_text(raw1)
    cleaned2 = clean_text(raw2)
    assert cleaned1 == cleaned2
    assert "http" not in cleaned1
    assert "great strawberry plush" in cleaned1
