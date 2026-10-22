import datetime
import pytest
from fastapi import Depends, HTTPException
from fastapi.testclient import TestClient
from app.main import app
from app.db import SessionLocal
from app.models import User
from app.security import create_access_token
from app.dependencies import require_admin_user

client = TestClient(app)

# Dummy test endpoint to check admin-only dependency
@app.get("/api/test-admin-only")
def sample_admin_endpoint(admin: User = Depends(require_admin_user)):
    return {"message": "Admin authorized", "admin_id": admin.id}


def test_register_student_success():
    email = f"test.student.{datetime.datetime.now().timestamp()}@reviewlens.edu"
    payload = {
        "full_name": "New Student",
        "email": email,
        "password": "Password123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email.lower()
    assert data["full_name"] == "New Student"
    assert data["role"] == "student"
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email():
    payload = {
        "full_name": "Admin Tester",
        "email": "admin@reviewlens.edu",
        "password": "SomePassword123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_login_success():
    payload = {
        "email": "admin@reviewlens.edu",
        "password": "Admin@ReviewLens2026"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@reviewlens.edu"
    assert data["user"]["role"] == "admin"


def test_login_wrong_password():
    payload = {
        "email": "admin@reviewlens.edu",
        "password": "WrongPassword!999"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


def test_login_nonexistent_user():
    payload = {
        "email": "doesnotexist@reviewlens.edu",
        "password": "SomePassword123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


def test_get_me_missing_token():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_get_me_valid_token():
    # Login first
    login_res = client.post("/api/auth/login", json={
        "email": "student1@reviewlens.edu",
        "password": "Student@ReviewLens1"
    })
    token = login_res.json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "student1@reviewlens.edu"
    assert data["role"] == "student"


def test_get_me_expired_token():
    # Generate expired token
    expired_token = create_access_token(
        data={"sub": "1", "role": "admin", "email": "admin@reviewlens.edu"},
        expires_delta=datetime.timedelta(seconds=-10)
    )
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401


def test_admin_restriction_blocks_student():
    # Student login
    login_res = client.post("/api/auth/login", json={
        "email": "student1@reviewlens.edu",
        "password": "Student@ReviewLens1"
    })
    token = login_res.json()["access_token"]

    response = client.get("/api/test-admin-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert "Administrator privileges required" in response.json()["detail"]


def test_admin_restriction_allows_admin():
    # Admin login
    login_res = client.post("/api/auth/login", json={
        "email": "admin@reviewlens.edu",
        "password": "Admin@ReviewLens2026"
    })
    token = login_res.json()["access_token"]

    response = client.get("/api/test-admin-only", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Admin authorized"
