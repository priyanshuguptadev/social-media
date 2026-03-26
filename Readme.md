# Social

Social is a full-stack social app with:

- **Backend**: Node.js + Express + TypeScript + MongoDB + JWT
- **Mobile Client**: React Native (Android/iOS)

> **APK Download:** The latest Android APK is available in the project’s **Releases** section.

---

## Project Structure

```text
social-media/
├── backend/   # Express API (TypeScript, MongoDB, JWT)
└── client/    # React Native mobile app
```

### Backend (`backend/`)

- [backend/src/app.ts](backend/src/app.ts): Express app setup, middleware, route mounting
- [backend/src/index.ts](backend/src/index.ts): server bootstrap + DB connection
- [backend/src/config](backend/src/config): app config and DB connection
- [backend/src/controllers](backend/src/controllers): auth/post request handlers
- [backend/src/middlewares](backend/src/middlewares): auth, logger, error middleware
- [backend/src/models](backend/src/models): Mongoose models/schemas
- [backend/src/routes](backend/src/routes): API route definitions
- [backend/src/schema](backend/src/schema): Zod validation schemas
- [backend/src/types](backend/src/types): shared backend types

### Client (`client/`)

- [client/src/App.jsx](client/src/App.jsx): app entry and navigation stack
- [client/src/screens](client/src/screens): app screens (auth, feed, post detail, profile)
- [client/src/components](client/src/components): reusable UI/features
- [client/src/store/useStore.js](client/src/store/useStore.js): Zustand state management
- [client/src/utils](client/src/utils): axios clients, auth token storage, helpers
- [client/android](client/android): Android native project
- [client/ios](client/ios): iOS native project

---

## Prerequisites

- **Node.js** (LTS recommended)
- **Bun** (for backend runtime as configured)
- **MongoDB** (local or cloud)
- **React Native environment** (Android Studio/Xcode), per [client/README.md](client/README.md)

---

## Environment Variables

### Backend `.env`

Create [backend/.env](backend/.env) with:

- `PORT=3000`
- `DATABASE_URL=<your_mongodb_connection_string>`
- `JWT_SECRET=<your_jwt_secret>`

(See fallback config in [backend/src/config/index.ts](backend/src/config/index.ts))

### Client `.env`

Create [client/.env](client/.env) with:

- `BASE_URL=http://<your-machine-ip>:3000/api/v1`
- `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`

(Used by [client/src/utils/axios.js](client/src/utils/axios.js) and [client/src/utils/cloudinary.js](client/src/utils/cloudinary.js))

---

## Setup & Run

## 1) Backend

From [backend](backend):

```bash
bun install
bun run src/index.ts
```

API base path: `http://localhost:3000/api/v1`

---

## 2) Client

From [client](client):

```bash
npm install
npm start
```

In another terminal:

### Android

```bash
npm run android
```

### iOS

```bash
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios
```

For detailed RN setup, see [client/README.md](client/README.md).

---

## API Routes (Summary)

- Auth routes: [backend/src/routes/authRoute.ts](backend/src/routes/authRoute.ts)
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- Post routes: [backend/src/routes/postRoute.ts](backend/src/routes/postRoute.ts)
  - `GET /posts`
  - `GET /posts/:id`
  - `POST /posts`
  - `POST /posts/:id/like`
  - `POST /posts/:id/comment`
  - `DELETE /posts/:id`

All routes are mounted in [backend/src/app.ts](backend/src/app.ts) under `/api/v1`.

---

## Notes

- Auth token is securely stored on device via Keychain in [client/src/utils/auth.js](client/src/utils/auth.js).
- Images are uploaded to Cloudinary from [client/src/utils/cloudinary.js](client/src/utils/cloudinary.js).
- Backend uses JWT auth middleware from [backend/src/middlewares/authMiddleware.ts](backend/src/middlewares/authMiddleware.ts).

---

## Releases

The latest Android APK can be downloaded from the **Releases** section of this repository.
