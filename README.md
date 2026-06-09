# ReviewPulse

ReviewPulse is a high-performance customer feedback and review collection portal built with a modern decoupled architecture. It features a Laravel-powered API backend and a Next.js (Turbopack) frontend dashboard console.

---

## Repository Structure

```bash
pulse-review/
├── backend/       # Laravel API Server
└── frontend/      # Next.js Dashboard & Portal
```

---

## Features

- **Decoupled Architecture**: Separation of concerns between backend APIs and frontend dashboard rendering.
- **Tenant Management**: Multi-business tenant support.
- **Review Portals**: Automated feedback generation, QR code onboarding, and sentiment status categorization (Pending, Voucher Sent, Alert Triggered).
- **Flexible Database Configuration**: Supports instant toggling between a remote MySQL production database and a local SQLite database for offline development.

---

## Setup and Installation

### Backend Setup (Laravel)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   composer install
   npm install
   ```
3. Configure your Environment:
   - Copy the environment template:
     ```bash
     cp .env.example .env
     ```
   - Generate application key:
     ```bash
     php artisan key:generate
     ```
4. Database Selection:
   Configure the connection type inside your `.env` file:
   ```env
   # Toggle between 'sqlite' (local development) and 'mysql' (production)
   DB_CONNECTION=sqlite
   ```
5. Run migrations:
   ```bash
   php artisan migrate
   ```
6. Start the server:
   ```bash
   php artisan serve
   ```

### Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env.local` file mapping the backend API address:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## Development vs Production Database Toggle

The application supports seamless toggling between databases:
- **Local SQLite**: Extremely fast response times for local testing.
- **Production MySQL**: Used for the live site.

To switch, change the `DB_CONNECTION` option inside `backend/.env`.

---

## License

This project is open-sourced software licensed under the [MIT license](LICENSE).
