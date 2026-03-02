# MoonPay Backend - Detailed Summary

## Overview
MoonPay is a classroom-based virtual currency and reward system backend built with Node.js and Express. The system enables professors and TAs to manage classes, reward students with virtual currency (MoonBucks), and create a marketplace where students can purchase items using their earned currency.

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB (via Mongoose v9.0.0)
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **Password Hashing**: bcryptjs v3.0.3
- **Environment Variables**: dotenv v17.2.3
- **CORS**: cors v2.8.5

### Server Configuration
- **Port**: 5005
- **Base URL**: `http://localhost:5005`
- **API Prefix**: `/api`

## Project Structure

```
MoonPay-Backend/
├── server.js                 # Main application entry point
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Class.js             # Class model
│   ├── ClassMembership.js   # User-Class relationship model
│   ├── Transaction.js       # Transaction model
│   └── Listing.js           # Marketplace listing model
└── routes/
    ├── auth.js              # Authentication routes
    ├── users.js             # User management routes
    ├── transactions.js      # Transaction history routes
    └── classes.js           # Class management routes
```

## Data Models

### 1. User Model
**Schema Fields:**
- `username` (String, unique, required) - User's unique username
- `email` (String, unique, required) - User's email address
- `passwordHash` (String, required) - Bcrypt-hashed password
- `balance` (Number, default: 1000) - Global account balance in MoonBucks
- `createdAt` (Date, default: Date.now) - Account creation timestamp

**Purpose**: Represents user accounts with global balance. New users start with 1000 MoonBucks.

### 2. Class Model
**Schema Fields:**
- `name` (String, required) - Class name
- `description` (String) - Class description
- `code` (String, unique, required) - 6-character alphanumeric join code
- `professor` (ObjectId, ref: User, required) - Reference to professor user
- `createdAt` (Date, default: Date.now) - Class creation timestamp

**Indexes:**
- Unique index on `code` field

**Purpose**: Represents a classroom entity that students can join using a code.

### 3. ClassMembership Model
**Schema Fields:**
- `class` (ObjectId, ref: Class, required) - Reference to class
- `user` (ObjectId, ref: User, required) - Reference to user
- `role` (String, enum: ["professor", "ta", "student"], required) - User's role in class
- `balance` (Number, default: 0) - Class-specific MoonBucks balance
- `joinedAt` (Date, default: Date.now) - Membership creation timestamp

**Indexes:**
- Unique compound index on `(class, user)` - Ensures one membership per user per class
- Index on `user` - For querying user's classes
- Index on `(class, role)` - For role-based queries

**Purpose**: Manages user-class relationships and class-specific balances. Each user has a separate balance per class.

### 4. Transaction Model
**Schema Fields:**
- `from` (ObjectId, ref: User) - Sender user
- `to` (ObjectId, ref: User) - Recipient user
- `amount` (Number, required) - Transaction amount
- `note` (String) - Optional transaction note/description
- `type` (String, enum: ["transfer", "reward", "purchase"], default: "transfer") - Transaction type
- `class` (ObjectId, ref: Class) - Associated class (for class-specific transactions)
- `listing` (ObjectId, ref: Listing) - Associated listing (for purchases)
- `timestamp` (Date, default: Date.now) - Transaction timestamp

**Indexes:**
- Index on `(class, timestamp)` - For class transaction history
- Index on `(to, class)` - For recipient queries
- Index on `(from, class)` - For sender queries

**Purpose**: Records all financial transactions (rewards, purchases, transfers) for audit and history.

### 5. Listing Model
**Schema Fields:**
- `class` (ObjectId, ref: Class, required) - Associated class
- `createdBy` (ObjectId, ref: User, required) - Creator (professor/TA)
- `title` (String, required) - Listing title
- `description` (String, required) - Listing description
- `price` (Number, required, min: 1) - Price in class MoonBucks
- `imageUrl` (String) - Optional image URL
- `isActive` (Boolean, default: true) - Whether listing is available
- `createdAt` (Date, default: Date.now) - Creation timestamp
- `updatedAt` (Date, default: Date.now) - Last update timestamp

**Indexes:**
- Index on `(class, isActive)` - For active listing queries

**Purpose**: Represents marketplace items that students can purchase with class MoonBucks.

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/signup`
**Purpose**: Register a new user account

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
- Success (200): `{ "message": "Signup successful" }`
- Error (400): `{ "error": "Username already exists" }`

**Features:**
- Validates username uniqueness
- Hashes password with bcrypt (10 rounds)
- Creates user with default balance of 1000 MoonBucks

#### POST `/api/auth/login`
**Purpose**: Authenticate user and return JWT token

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- Success (200): 
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "username": "string",
    "email": "string",
    "balance": 1000,
    "createdAt": "date"
  }
}
```
- Error (400): `{ "error": "Invalid credentials" }`

**Features:**
- Validates username and password
- Returns JWT token with 2-day expiration
- Returns user profile with balance

### User Routes (`/api/users`)

#### GET `/api/users/me`
**Purpose**: Get current authenticated user's profile

**Authentication**: Required (JWT token in Authorization header)

**Response:**
```json
{
  "id": "user_id",
  "username": "string",
  "email": "string",
  "balance": 1000,
  "createdAt": "date"
}
```

### Transaction Routes (`/api/transactions`)

#### GET `/api/transactions`
**Purpose**: Get all transactions for the authenticated user

**Authentication**: Required

**Response:**
```json
[
  {
    "_id": "transaction_id",
    "from": { "_id": "user_id", "username": "string" },
    "to": { "_id": "user_id", "username": "string" },
    "amount": 100,
    "note": "string",
    "type": "reward|purchase|transfer",
    "class": { "_id": "class_id", "name": "string", "code": "string" },
    "listing": { "_id": "listing_id", "title": "string" },
    "timestamp": "date"
  }
]
```

**Features:**
- Returns transactions where user is sender or recipient
- Populates related user, class, and listing data
- Sorted by timestamp (newest first)

#### GET `/api/transactions/history`
**Purpose**: Same as GET `/api/transactions` (duplicate endpoint)

### Class Routes (`/api/classes`)

#### GET `/api/classes`
**Purpose**: Get all classes the authenticated user is a member of

**Authentication**: Required

**Response:**
```json
[
  {
    "classId": "class_id",
    "name": "string",
    "description": "string",
    "role": "professor|ta|student",
    "balance": 0,
    "code": "string",
    "professor": "user_id",
    "createdAt": "date"
  }
]
```

**Features:**
- Returns user's class memberships with role and class-specific balance

#### GET `/api/classes/:classId`
**Purpose**: Get detailed information about a specific class

**Authentication**: Required
**Authorization**: Must be a member of the class

**Response:**
```json
{
  "classId": "class_id",
  "name": "string",
  "description": "string",
  "role": "professor|ta|student",
  "balance": 0,
  "professor": "user_id",
  "membershipId": "membership_id",
  "code": "string"
}
```

#### POST `/api/classes`
**Purpose**: Create a new class (professor only)

**Authentication**: Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "id": "class_id",
  "name": "string",
  "description": "string",
  "code": "6-character-code"
}
```

**Features:**
- Generates unique 6-character alphanumeric join code
- Creates class with creator as professor
- Creates ClassMembership with professor role and 0 balance

#### POST `/api/classes/join`
**Purpose**: Join a class using a join code

**Authentication**: Required

**Request Body:**
```json
{
  "code": "6-character-code"
}
```

**Response:**
```json
{
  "classId": "class_id",
  "name": "string",
  "description": "string",
  "role": "student",
  "balance": 0
}
```

**Features:**
- Validates join code
- Prevents duplicate memberships
- Creates membership with student role and 0 balance

#### DELETE `/api/classes/:classId`
**Purpose**: Delete a class and all associated data

**Authentication**: Required
**Authorization**: Only professor can delete

**Features:**
- Cascades deletion: removes memberships, listings, and transactions
- Only professor can delete their class

#### GET `/api/classes/:classId/members`
**Purpose**: Get list of all class members

**Authentication**: Required
**Authorization**: Only professors and TAs can view members

**Response:**
```json
[
  {
    "membershipId": "membership_id",
    "userId": "user_id",
    "username": "string",
    "email": "string",
    "role": "professor|ta|student",
    "balance": 0,
    "joinedAt": "date"
  }
]
```

#### POST `/api/classes/:classId/members/:memberId/promote`
**Purpose**: Promote a student to TA

**Authentication**: Required
**Authorization**: Only professor can promote

**Features:**
- Changes student role to "ta"
- Only students can be promoted

#### POST `/api/classes/:classId/members/:memberId/kick`
**Purpose**: Remove a member from the class

**Authentication**: Required
**Authorization**: Only professors and TAs can kick members

**Features:**
- Cannot kick the professor
- Removes ClassMembership

#### POST `/api/classes/:classId/members/:memberId/reward`
**Purpose**: Reward a student with MoonBucks

**Authentication**: Required
**Authorization**: Only professors and TAs can reward

**Request Body:**
```json
{
  "amount": 100,
  "note": "optional note"
}
```

**Response:**
```json
{
  "message": "Reward sent",
  "newBalance": 100
}
```

**Features:**
- Validates amount (must be > 0 and ≤ 1000)
- Only students can receive rewards
- Updates class-specific balance
- Creates transaction record with type "reward"

#### GET `/api/classes/:classId/listings`
**Purpose**: Get all active listings for a class

**Authentication**: Required
**Authorization**: Must be a class member

**Response:**
```json
[
  {
    "id": "listing_id",
    "title": "string",
    "description": "string",
    "price": 50,
    "imageUrl": "string",
    "createdBy": {
      "id": "user_id",
      "username": "string"
    },
    "createdAt": "date"
  }
]
```

**Features:**
- Only returns active listings (isActive: true)
- Sorted by creation date (newest first)

#### POST `/api/classes/:classId/listings`
**Purpose**: Create a new marketplace listing

**Authentication**: Required
**Authorization**: Only professors and TAs can create listings

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "price": 50,
  "imageUrl": "string"
}
```

**Response:**
```json
{
  "id": "listing_id",
  "title": "string",
  "description": "string",
  "price": 50,
  "imageUrl": "string"
}
```

**Features:**
- Validates price (must be > 0)
- Creates listing with isActive: true

#### DELETE `/api/classes/:classId/listings/:listingId`
**Purpose**: Remove a listing (soft delete)

**Authentication**: Required
**Authorization**: Only professors and TAs can delete listings

**Features:**
- Sets isActive to false (soft delete)

#### POST `/api/classes/:classId/listings/:listingId/purchase`
**Purpose**: Purchase a listing with class MoonBucks

**Authentication**: Required
**Authorization**: Only students can purchase

**Response:**
```json
{
  "message": "Purchase successful",
  "newBalance": 50
}
```

**Features:**
- Validates student has sufficient class balance
- Transfers MoonBucks from buyer to seller (class-specific balances)
- Marks listing as inactive (isActive: false)
- Creates transaction record with type "purchase"
- Only students can make purchases

## Authentication & Authorization

### JWT Authentication
- **Token Format**: Bearer token in `Authorization` header
- **Token Structure**: `Authorization: Bearer <token>`
- **Token Expiration**: 2 days
- **Secret**: Stored in `JWT_SECRET` environment variable

### Middleware (`middleware/auth.js`)
- Extracts JWT token from Authorization header
- Verifies token signature and expiration
- Attaches `userId` to request object
- Returns 401 if token is missing or invalid

### Role-Based Access Control
- **Professor**: Full class control (create, delete, reward, manage listings)
- **TA**: Can reward students and manage listings (cannot delete class)
- **Student**: Can view classes, join classes, purchase listings

## Business Logic

### Currency System
1. **Global Balance**: Each user has a global balance (default: 1000 MoonBucks)
2. **Class Balance**: Each user has a separate balance per class (default: 0)
3. **Rewards**: Professors/TAs can reward students with class MoonBucks (max 1000 per reward)
4. **Purchases**: Students spend class MoonBucks to purchase items
5. **Transactions**: All currency movements are recorded in Transaction model

### Class Management
1. **Class Creation**: Professors create classes with auto-generated 6-character codes
2. **Joining**: Students join using join codes
3. **Roles**: Three-tier system (professor, ta, student)
4. **Promotion**: Professors can promote students to TAs
5. **Removal**: Professors/TAs can remove members (except professor)

### Marketplace
1. **Listing Creation**: Professors/TAs create listings with price, description, image
2. **Purchase Flow**: 
   - Student initiates purchase
   - System validates sufficient balance
   - Transfers MoonBucks from buyer to seller (class-specific)
   - Marks listing as inactive
   - Creates transaction record
3. **Soft Delete**: Listings are soft-deleted (isActive: false) rather than hard-deleted

## Database Relationships

```
User (1) ──< (N) ClassMembership (N) >── (1) Class
User (1) ──< (N) Transaction (N) >── (1) User
Class (1) ──< (N) Transaction
Class (1) ──< (N) Listing
User (1) ──< (N) Listing
```

## Environment Variables

Required environment variables (`.env` file):
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing

## Error Handling

- **400 Bad Request**: Invalid input, validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

All errors return JSON format: `{ "error": "error message" }`

## Security Features

1. **Password Hashing**: bcrypt with 10 rounds
2. **JWT Authentication**: Token-based authentication
3. **Role-Based Authorization**: Enforced at route level
4. **Input Validation**: Amount validation, required field checks
5. **Unique Constraints**: Username, email, class codes are unique
6. **CORS**: Enabled for cross-origin requests

## Database Indexes

Optimized queries with indexes on:
- User: username, email (unique)
- Class: code (unique)
- ClassMembership: (class, user) unique, user, (class, role)
- Transaction: (class, timestamp), (to, class), (from, class)
- Listing: (class, isActive)

## API Response Patterns

- **Success Responses**: Return requested data or success message
- **Error Responses**: Consistent `{ "error": "message" }` format
- **Populated References**: User, Class, Listing data populated in responses
- **Timestamps**: ISO date strings in responses

## Key Features Summary

1. **Multi-class Support**: Users can be members of multiple classes
2. **Dual Balance System**: Global and class-specific balances
3. **Role Hierarchy**: Professor > TA > Student
4. **Marketplace**: Class-specific item listings
5. **Transaction History**: Complete audit trail
6. **Join Code System**: Simple class enrollment
7. **Reward System**: Staff can reward students
8. **Purchase System**: Students can buy items with earned currency

