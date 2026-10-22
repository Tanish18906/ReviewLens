# ReviewLens API Specification & Contract

**Base URL:** `/api`  
**Data Format:** JSON (`application/json`)  
**Authentication Scheme:** `Authorization: Bearer <JWT>`  

---

## 1. Authentication Endpoints

### 1.1 Register New Student
- **Method:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "full_name": "Riddhima Patel",
    "email": "student2@reviewlens.edu",
    "password": "Student@ReviewLens2"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 3,
    "full_name": "Riddhima Patel",
    "email": "student2@reviewlens.edu",
    "role": "student",
    "created_at": "2026-10-22T15:30:00Z"
  }
  ```
- **Error Codes:**
  - `409 Conflict`: Email already exists in the system (`{"detail": "An account with this email already exists."}`)
  - `422 Unprocessable Entity`: Password < 8 characters or invalid email format.

---

### 1.2 User Login
- **Method:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@reviewlens.edu",
    "password": "Admin@ReviewLens2026"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "full_name": "ReviewLens Administrator",
      "email": "admin@reviewlens.edu",
      "role": "admin",
      "created_at": "2026-09-01T09:00:00Z"
    }
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: Generic message on invalid credentials (`{"detail": "Email or password is incorrect."}`)

---

### 1.3 Get Current User Session
- **Method:** `GET /api/auth/me`
- **Access:** Authenticated (Student or Admin)
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "full_name": "ReviewLens Administrator",
    "email": "admin@reviewlens.edu",
    "role": "admin",
    "created_at": "2026-09-01T09:00:00Z"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: Token missing, invalid, or expired.

---

## 2. Product Catalog Endpoints

### 2.1 List Products
- **Method:** `GET /api/products`
- **Access:** Public
- **Query Parameters:**
  - `q`: Search keyword matching name or description (optional)
  - `category`: Category filter e.g. "Audio", "Computing" (optional)
  - `sort`: Sort order (`name_asc`, `rating_desc`, `reviews_desc`) (default: `name_asc`)
  - `limit`: Number of items per page (default: 12, max: 100)
  - `offset`: Pagination offset (default: 0)
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": 1,
        "slug": "wireless-headphones",
        "name": "AcousticPro Wireless Headphones",
        "category": "Audio",
        "description": "Comfortable over-ear Bluetooth headphones with active noise cancellation...",
        "image_path": "/products/wireless-headphones.svg",
        "average_rating": 4.2,
        "review_count": 6
      }
    ],
    "total": 10
  }
  ```

---

### 2.2 Get Product Details
- **Method:** `GET /api/products/{slug}`
- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "slug": "wireless-headphones",
    "name": "AcousticPro Wireless Headphones",
    "category": "Audio",
    "description": "Comfortable over-ear Bluetooth headphones with active noise cancellation...",
    "image_path": "/products/wireless-headphones.svg",
    "average_rating": 4.2,
    "review_count": 6
  }
  ```
- **Error Codes:**
  - `404 Not Found`: Product slug does not exist (`{"detail": "We couldn't find that product."}`)

---

## 3. Product Reviews Endpoints

### 3.1 Get Reviews for a Product
- **Method:** `GET /api/products/{slug}/reviews`
- **Access:** Public
- **Query Parameters:**
  - `limit`: Items per page (default: 10, max: 50)
  - `offset`: Pagination offset (default: 0)
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "user_id": 2,
        "reviewer_name": "Aarav Sharma",
        "rating": 5,
        "review_text": "Outstanding sound quality and the noise cancellation blocks library noise completely.",
        "cleaned_text": "outstanding sound quality noise cancellation blocks library noise completely",
        "source": "demo_seed",
        "created_at": "2026-09-10T11:00:00Z"
      }
    ],
    "total": 6
  }
  ```

---

### 3.2 Submit a New Product Review
- **Method:** `POST /api/products/{slug}/reviews`
- **Access:** Authenticated (Student role)
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "rating": 5,
    "review_text": "The battery life easily lasts three full days of study sessions without needing a recharge."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 50,
    "product_id": 1,
    "user_id": 3,
    "reviewer_name": "Riddhima Patel",
    "rating": 5,
    "review_text": "The battery life easily lasts three full days of study sessions without needing a recharge.",
    "cleaned_text": "battery life easily lasts three full days study sessions without needing recharge",
    "source": "user",
    "created_at": "2026-10-22T15:35:10Z"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: Missing or invalid JWT credentials.
  - `404 Not Found`: Product slug does not exist.
  - `409 Conflict`: User has already reviewed this product (`{"detail": "You have already reviewed this product."}`)
  - `422 Unprocessable Entity`: Rating not between 1 and 5, or review text shorter than 20 characters.

---

## 4. Admin Analytics Endpoints

### 4.1 Admin System Overview
- **Method:** `GET /api/admin/overview`
- **Access:** Administrator only (`role == "admin"`)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "total_users": 7,
    "total_products": 10,
    "total_reviews": 49,
    "average_rating": 3.9,
    "rating_distribution": [
      { "rating": 1, "count": 1 },
      { "rating": 2, "count": 3 },
      { "rating": 3, "count": 6 },
      { "rating": 4, "count": 21 },
      { "rating": 5, "count": 18 }
    ],
    "top_products": [
      {
        "id": 1,
        "slug": "wireless-headphones",
        "name": "AcousticPro Wireless Headphones",
        "category": "Audio",
        "review_count": 6,
        "average_rating": 4.2
      }
    ],
    "recent_reviews": [
      {
        "id": 49,
        "product_name": "ClearView 1080p HD Webcam",
        "product_slug": "hd-webcam-microphone",
        "reviewer_name": "Rohan Gupta",
        "rating": 4,
        "review_text": "Plug and play worked immediately on Ubuntu and Mac without installing special drivers.",
        "created_at": "2026-10-17T10:45:00Z"
      }
    ]
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: Not logged in.
  - `403 Forbidden`: Logged in with a non-admin role e.g. student (`{"detail": "Administrator privileges required."}`)
