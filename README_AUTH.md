# Trip Logger - Next.js Authentication System

This project has been upgraded from a simple HTML/JavaScript application to a modern Next.js application with a complete authentication system using Supabase.

## 🚀 Features

### Authentication System
- **Signup & Login**: Email/password authentication
- **Google OAuth**: Sign in with Google account
- **Password Reset**: Forgot password functionality
- **Session Management**: Persistent user sessions
- **Route Protection**: Middleware-based authentication
- **Secure Dashboard**: Protected trip logger functionality

### UI/UX
- **Modern Design**: Clean, professional interface with TailwindCSS
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Professional transitions and interactions
- **Reusable Components**: Button, Card, and Input components

### Trip Logger Features
- **Trip Tracking**: Record trips with odometer readings and earnings
- **Fuel Management**: Track fuel purchases and costs
- **Analytics**: Daily, weekly, and monthly summaries
- **Filtering**: View trips, fuel entries, or all entries
- **Real-time Data**: All data synced with Supabase

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router) with React 18
- **Styling**: TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ready for Vercel deployment

## 📁 Project Structure

```
├── app/                    # Next.js app router pages
│   ├── auth/callback/     # OAuth callback handler
│   ├── dashboard/         # Protected dashboard page
│   ├── forgot-password/   # Password reset page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── globals.css       # Global styles
│   ├── layout.js         # Root layout
│   └── page.js           # Home page (redirects to auth)
├── components/            # Reusable UI components
│   ├── Button.js         # Button component
│   ├── Card.js          # Card component
│   └── Input.js         # Input component
├── lib/                  # Utility libraries
│   └── supabase.js      # Supabase client configuration
├── middleware.js        # Route protection middleware
├── tailwind.config.js   # TailwindCSS configuration
└── next.config.js      # Next.js configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account with project set up
- Google OAuth configured in Supabase (see below)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Supabase**:
   - Open `lib/supabase.js`
   - Update the URL and key with your Supabase project credentials:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
   ```

3. **Set up Supabase Authentication**:
   - Go to your Supabase dashboard
   - Navigate to Authentication → Settings
   - Configure the following:
     - **Site URL**: `http://localhost:3003` (current development port)
     - **Redirect URLs**: `http://localhost:3003/auth/callback`

4. **Enable Google OAuth (Required for Google Sign-in)**:
   - Go to Authentication → Providers in your Supabase dashboard
   - Find "Google" in the providers list and click "Enable"
   - You'll need to create OAuth credentials in Google Cloud Console:
     1. Go to [Google Cloud Console](https://console.cloud.google.com/)
     2. Create a new project or select existing one
     3. Enable the Google+ API
     4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
     5. Configure OAuth consent screen if prompted
     6. Set application type to "Web application"
     7. Add authorized redirect URIs:
        - `http://localhost:3003/auth/callback` (for development)
        - `https://your-production-domain.com/auth/callback` (for production)
     8. Copy the Client ID and Client Secret
   - Back in Supabase, paste the Client ID and Client Secret
   - Save the configuration

   **Note**: If you see "Unsupported provider: provider is not enabled", it means Google OAuth is not properly enabled in step 4 above.

5. **Database Setup**:
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL script from `create_trips_table.sql` to create the trips table

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to `http://localhost:3003`

## 🔐 Authentication Flow

### User Registration
1. Visit `/signup`
2. Enter email and password
3. Click "Create account"
4. Check email for confirmation link
5. After confirmation, you'll be redirected to login

### User Login
1. Visit `/login`
2. Enter email and password, OR
3. Click "Sign in with Google" for OAuth
4. After successful login, redirected to dashboard

### Password Reset
1. Visit `/login` and click "Forgot your password?"
2. Enter your email on the forgot password page
3. Check email for reset link
4. Follow link and set new password

### Protected Routes
- `/dashboard` - Only accessible to authenticated users
- Middleware automatically redirects unauthenticated users to `/login`
- Authenticated users are redirected away from auth pages

## 📱 Usage

### Dashboard Features
1. **Navigation Tabs**: Switch between "Logs" and "Analytics"
2. **Logs View**:
   - View all trip and fuel entries
   - Filter by type (All, Trips, Fuel)
   - See detailed information for each entry
3. **Analytics View**:
   - View statistics for different time periods (Today, This Week, This Month)
   - See total distance, earnings, fuel usage, and costs
4. **Add Entry**: Click the "+" button to add new trips (coming soon)

### Trip Entry Types
- **Trip**: Record odometer reading and amount received
- **Fuel**: Record fuel purchase with liters and cost

## 🔧 Development

### Adding New Pages
Create new pages in the `app/` directory following Next.js App Router conventions:
```
app/
├── new-page/
│   └── page.js          # Page component
└── another-page/
    └── page.js
```

### Creating Protected Routes
Add route patterns to `middleware.js`:
```javascript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/your-new-protected-route/:path*',
    '/login',
    '/signup'
  ],
}
```

### Styling with TailwindCSS
Use Tailwind classes throughout your components:
```jsx
<div className="bg-white shadow rounded-lg p-6">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automatically on push to main branch

### Environment Variables
Create a `.env.local` file for local development:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔒 Security Features

- **Row Level Security**: Database policies (configure in Supabase)
- **JWT Tokens**: Secure session management
- **HTTPS**: Required for production OAuth
- **Protected Routes**: Middleware-based authentication
- **Password Requirements**: Minimum 6 characters
- **Email Verification**: Required for new accounts

## 📊 Database Schema

The `trips` table structure:
```sql
CREATE TABLE trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('trip', 'fuel')),
    km_reading INTEGER NOT NULL,
    distance INTEGER DEFAULT 0,
    amount_received DECIMAL(10,2) DEFAULT 0,
    fuel_liters DECIMAL(8,2) DEFAULT 0,
    fuel_cost DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure the database table is created correctly
4. Check network connectivity to Supabase

## 🔄 Migration Notes

This project was migrated from a simple HTML/CSS/JavaScript application to Next.js with authentication. Key changes:
- Converted to Next.js 14 with App Router
- Added Supabase authentication system
- Implemented route protection with middleware
- Created reusable React components
- Integrated existing trip logger functionality
- Added modern styling with TailwindCSS

The original functionality is preserved while adding enterprise-grade authentication and security features.
