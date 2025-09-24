# Trip Logger - Supabase Integration

This Trip Logger application now uses Supabase as its database backend for storing trip and fuel data.

## 🚀 Features

- **Trip Tracking**: Record trips with odometer readings and earnings
- **Fuel Management**: Track fuel purchases and costs
- **Analytics**: View daily, weekly, and monthly summaries
- **Modern UI**: Clean, professional interface with blue theme
- **Supabase Integration**: Cloud database with real-time capabilities

## 🛠️ Setup Instructions

### 1. Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up/login and create a new project
   - Wait for the project to be fully set up

2. **Get Your Project Credentials**:
   - Go to Settings → API in your Supabase dashboard
   - Copy your Project URL and anon/public key

3. **Update Supabase Configuration**:
   - Open `supabase.js` file
   - Replace the URL and key with your own:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

4. **Create the Database Table**:
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL script from `create_trips_table.sql`
   - This will create the `trips` table with proper structure

### 2. Run the Application

```bash
# Navigate to the project directory
cd "D:\Documents\Practice\calc"

# Start the local server
python -m http.server 8000

# Open your browser and go to
http://localhost:8000
```

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

## 🔧 Features Overview

### Trip Entries
- **Odometer Reading**: Track your vehicle's mileage
- **Earnings**: Record amount received for each trip
- **Automatic Distance Calculation**: Calculates distance from previous reading
- **Profit Tracking**: Calculates profit after fuel costs

### Fuel Entries
- **Fuel Purchase**: Record fuel liters and cost
- **Odometer Tracking**: Track when fuel was purchased
- **Cost Analysis**: Track fuel expenses over time

### Analytics
- **Daily Summary**: Today's trips and earnings
- **Weekly Summary**: This week's performance
- **Monthly Summary**: Monthly overview
- **Real-time Updates**: All data synced with Supabase

## 🎨 UI Features

- **Modern Design**: Clean, professional interface
- **Blue Theme**: Professional blue color scheme
- **Responsive Layout**: Works on different screen sizes
- **Smooth Animations**: Professional transitions and hover effects
- **Intuitive Navigation**: Easy-to-use interface

## 🔐 Security Notes

Currently, the database allows all operations. For production use, consider:
- Adding user authentication
- Implementing Row Level Security (RLS) policies
- Restricting database access to authenticated users only

## 🛠️ Technical Details

- **Frontend**: HTML, CSS, JavaScript (ES6 modules)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with CSS variables
- **Data Flow**: Async/await for database operations
- **Real-time**: Supabase real-time subscriptions (ready for implementation)

## 📝 Usage

1. **Add Trip**: Click the blue + button to add a new trip or fuel entry
2. **Edit/Delete**: Use the edit (✏️) and delete (🗑️) buttons on each entry
3. **View Analytics**: Switch between Daily, Weekly, and Monthly views
4. **Filter Data**: Use the filter chips to show only trips or fuel entries

## 🔄 Migration from localStorage

The application has been migrated from localStorage to Supabase:
- All data operations now use Supabase API
- Real-time sync capabilities
- Cloud storage with backup
- Better data integrity and performance

## 📞 Support

For issues or questions:
1. Check the browser console for any error messages
2. Verify your Supabase configuration
3. Ensure the database table is created correctly
4. Check network connectivity to Supabase
