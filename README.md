# UniMarket — Student Marketplace

UniMarket is a full-stack campus marketplace where students buy and sell textbooks, lecture notes, scientific calculators, engineering instruments, lab kits, stationery, and hostel essentials.

Built with **React, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, and Mongoose**.

---

## Features

- **Authentication & Authorization**: Secure JWT authentication stored in HTTP-only cookies, with CSRF protection, bcrypt password hashing, and server-enforced role access (`student` vs `admin`).
- **Listings Management (CRUD)**: Create, browse, filter, edit, mark as sold, relist, and delete listings. Edits trigger re-moderation automatically.
- **Search & Filtering**: Search by title, description, category, condition, price range, and college campus with real MongoDB queries and pagination.
- **Image Uploads**: Multi-image uploads via Multer with validation (format, count, file size) stored in local `/uploads` directory.
- **Favourites**: Persistent user wishlist saved in MongoDB with quick toggle on cards and detail pages.
- **In-App Messaging**: Real-time buyer-seller conversations linked to specific items, message read receipts, unread badges, and self-message prevention.
- **Listing Reports**: In-app listing reporting with reason categories for student safety.
- **Admin Moderation**: Comprehensive admin dashboard for approving/rejecting listings with feedback reasons, reviewing reports, monitoring platform statistics, and moderating accounts.
- **Campus Safety Guidelines**: Practical advice for safe physical campus exchanges, inspect-before-paying reminders, and anti-scam warnings.
- **Zero-Config Developer Fallback**: Automatically connects to local MongoDB or MongoDB Atlas via `MONGODB_URI`. If local MongoDB is not running during local development, an embedded in-memory MongoDB server seamlessly activates so the app runs out-of-the-box.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router v6, Axios, Lucide React, React Hot Toast |
| **Backend** | Node.js (ESM), Express.js 4, RESTful APIs (`/api/v1`) |
| **Database** | MongoDB with Mongoose 8 (Indexes, Validation, Cascading cleanup) |
| **Security** | Helmet, CORS, CSRF tokens, Cookie-parser, Express-validator, Express-rate-limit, Bcryptjs |
| **Testing** | Vitest 2, Supertest 7, Testing Library, JSDOM, MongoMemoryServer |

---

## Project Structure

```
unimarket/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components (ProductCard, SearchBar, Navbar, Modals)
│   │   ├── context/            # AuthContext, FavoritesContext, ToastProvider
│   │   ├── pages/              # 10+ core pages (Landing, Marketplace, Listing, Sell, Messages, Admin, Safety)
│   │   ├── services/           # Axios API client with CSRF interceptors
│   │   ├── test/               # Component & unit tests
│   │   ├── App.jsx             # Route definitions & protection
│   │   └── main.jsx
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
├── server/                     # Backend Express REST API
│   ├── config/                 # Database connection & env validation
│   ├── controllers/            # Auth, Listing, Conversation, Favorite, Report, Admin
│   ├── middleware/             # Auth, CSRF, Uploads, Rate limiting, Error handling
│   ├── models/                 # User, Listing, Conversation, Message, Report, ModerationLog
│   ├── routes/                 # Express API routes mounted at /api/v1
│   ├── scripts/                # Database seed script & admin creation script
│   ├── tests/                  # Integration tests with Supertest & Vitest
│   ├── validators/             # Express-validator schemas
│   ├── uploads/                # Local uploaded listing images
│   ├── app.js                  # Express application setup
│   ├── server.js               # Entrypoint & database listener
│   ├── package.json
│   └── .env.example
├── README.md
├── .gitignore
└── package.json                # Root orchestrator scripts
```

---

## MongoDB Compass Guide

MongoDB Compass is the official GUI for inspecting and managing your MongoDB database.

### Connecting with MongoDB Compass:
1. Open **MongoDB Compass**.
2. In the connection dialog, enter the connection string:
   ```text
   mongodb://127.0.0.1:27017/unimarket
   ```
   *(Or simply `mongodb://localhost:27017`)*
3. Click **Connect**.
4. You will see the **`unimarket`** database with the following 7 collections:
   - **`listings`**: 16 student listings across all categories (Books, Casio calculators, drafting kits, lab gear, kettle, etc.), including price, condition (`new`, `like_new`, `good`, `fair`), status (`approved`, `pending`, `sold`, `rejected`, `removed`), and image paths.
   - **`users`**: Demo student accounts (`aarav@unimarket.demo`, `priya@unimarket.demo`, etc.) and the admin account (`admin@unimarket.demo`) with hashed passwords and roles.
   - **`conversations`**: Active buyer-seller messaging threads linked to listings.
   - **`messages`**: Persisted conversation messages with read status.
   - **`reports`**: Flagged listings with student report descriptions and resolution statuses.
   - **`moderationlogs`**: Audit trail records of admin approval, rejection, and removal actions with reasons.
   - **`passwordresettokens`**: Password reset token storage.

*(Note: In development, UniMarket automatically binds the database on port `27017` and auto-seeds the demo data, so MongoDB Compass connects immediately out of the box).*

---

## Setup & Running the Application

### 1. Install Dependencies

From the workspace root directory:

```bash
npm run install:all
```

Or install individually:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Environment Configuration

Check `server/.env` (and `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/unimarket
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
```

Check `client/.env` (and `client/.env.example`):

```env
VITE_API_URL=/api/v1
```

### 3. Seed Demo Data

Run the repeatable seed script to populate realistic student accounts, listings, conversations, and reports:

```bash
npm run seed
```

Or run directly in `server/`:
```bash
node scripts/seed.js
```

#### Demo Credentials:
- **Admin**:
  - Email: `admin@unimarket.demo`
  - Password: `Admin@12345`
- **Student Accounts** (Password for all students: `Student@12345`):
  - `aarav@unimarket.demo`
  - `priya@unimarket.demo`
  - `rohan@unimarket.demo`
  - `sana@unimarket.demo`
  - `dev@unimarket.demo`

### 4. Create an Administrator

To safely promote or create an admin account:

```bash
npm run create-admin
```

Or specify custom credentials via environment variables:
```bash
ADMIN_NAME="Admin User" ADMIN_EMAIL="admin@college.edu" ADMIN_PASSWORD="StrongPassword@123" node server/scripts/createAdmin.js
```

### 5. Start the Development Server

Start both the backend API and frontend Vite dev server concurrently:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## Running Tests & Production Builds

### 1. Run All Tests
```bash
npm test
```
Runs 31 server integration tests and 10 client component tests.

### 2. Run Server Tests Only
```bash
npm run test --prefix server
```

### 3. Run Client Tests Only
```bash
npm run test --prefix client
```

### 4. Build Client Production Bundle
```bash
npm run build
```
Creates optimized static production assets in `client/dist`.

---

## API Summary (`/api/v1`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/auth/csrf` | GET | Public | Fetch CSRF token and cookie |
| `/auth/register` | POST | Public | Register new student account |
| `/auth/login` | POST | Public | Sign in and receive auth cookie |
| `/auth/logout` | POST | Public | Clear auth cookie |
| `/auth/me` | GET | Auth | Get current authenticated user |
| `/listings` | GET | Public | Search, filter, paginate approved listings |
| `/listings` | POST | Auth | Submit new listing with images (status: pending) |
| `/listings/:id` | GET | Public | View listing details |
| `/listings/:id` | PATCH | Owner | Edit listing details |
| `/listings/:id` | DELETE | Owner | Delete listing & cascade cleanup |
| `/listings/:id/status` | PATCH | Owner | Mark listing as sold / relist |
| `/favorites` | GET | Auth | Get student wishlist |
| `/favorites/:listingId` | POST | Auth | Save item to favourites |
| `/favorites/:listingId` | DELETE | Auth | Remove item from favourites |
| `/conversations` | GET | Auth | List user conversations with unread counts |
| `/conversations` | POST | Auth | Start conversation about a listing |
| `/conversations/:id/messages` | GET | Participant | Retrieve messages for a conversation |
| `/conversations/:id/messages` | POST | Participant | Send text message to buyer/seller |
| `/conversations/:id/read` | PATCH | Participant | Mark conversation as read |
| `/reports` | POST | Auth | Report inappropriate listing |
| `/admin/stats` | GET | Admin | View platform moderation statistics |
| `/admin/listings` | GET | Admin | Moderate pending, approved, and reported items |
| `/admin/listings/:id/moderate` | PATCH | Admin | Approve, reject, or remove listing with reason |
| `/admin/reports` | GET | Admin | View listing reports and resolution statuses |
| `/admin/reports/:id` | PATCH | Admin | Resolve or dismiss report |
