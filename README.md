# NS Badminton Booking System

A court booking system for the NS (Network School) badminton community. Built with Next.js, PostgreSQL, and Discord OAuth.

## Features

- **Discord Authentication** - Sign in with your Discord account
- **Real-time Booking** - Book 30-minute court slots
- **Skill-based Matching** - Join games at your skill level or higher
- **Private Groups** - Book for your own group (4+ players locks the slot)
- **Core Team Slots** - Reserved 5:00-6:30 PM slots (admin can unblock)
- **Flexible Game Types** - 1v1 or 2v2 options for 6:30-7:30 PM slots
- **Admin Panel** - Manage admins, bookings, and core slot availability

## Time Slots

| Period | Time | Notes |
|--------|------|-------|
| Afternoon | 12:30 PM - 4:30 PM | 8 slots |
| Core Team | 5:00 PM - 6:30 PM | Reserved (admin can unblock) |
| Flexible | 6:30 PM - 7:30 PM | Choose 1v1 or 2v2 |
| Evening | 7:30 PM - 12:30 AM | Standard 2v2 |

## Booking Rules

- Maximum **2 bookings per user per day**
- Maximum **6 players per booking**
- If you book with 4+ players, it's a private group (no one else can join)
- Players can only join games at their skill level or higher
- Past bookings cannot be modified or deleted

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Auth**: Discord OAuth2
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (Neon recommended)
- Discord Application (for OAuth)

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

### Discord Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 → Redirects
4. Add your redirect URI: `https://your-domain.com/api/auth/callback`
5. Copy Client ID and Client Secret to your `.env`

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Run development server
pnpm dev
```

### Database Commands

```bash
pnpm db:push      # Push schema to database
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add environment variables
4. Deploy

Don't forget to add your production URL to Discord OAuth redirects:
```
https://your-app.vercel.app/api/auth/callback
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── admins/         # Admin management
│   │   ├── auth/callback/  # Discord OAuth callback
│   │   ├── bookings/       # Booking CRUD
│   │   ├── core-dates/     # Core slot management
│   │   └── users/          # User management
│   ├── admin/              # Admin panel
│   ├── onboarding/         # Skill level selection
│   ├── profile/            # User profile
│   └── page.tsx            # Main booking page
├── components/
│   ├── booking-card.tsx    # Booking display
│   ├── date-picker.tsx     # Date selection
│   ├── header.tsx          # Navigation
│   ├── footer.tsx          # Footer
│   └── new-booking-dialog.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts        # Drizzle client
│   │   └── schema.ts       # Database schema
│   ├── auth-context.tsx    # Auth provider
│   ├── store.ts            # API functions
│   └── types.ts            # TypeScript types
└── drizzle.config.ts       # Drizzle config
```

## Database Schema

- **users** - Discord user info, skill level, admin status
- **bookings** - Court bookings with players
- **admin_usernames** - List of admin Discord usernames
- **unblocked_core_dates** - Dates where core slots are open

## Admin Access

Default admin: `shreyaspapi`

Admins can:
- Add/remove other admins
- Unblock core team slots for specific dates
- Delete any booking
- View all users and bookings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

---

Built by [Onera Team](https://onera.chat)
