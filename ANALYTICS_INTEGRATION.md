# Analytics Dashboard Integration

## Overview
This document describes the complete integration of the SweetBite analytics dashboard with real-time backend data. The dashboard now displays live data from the database instead of static values.

## Backend Implementation

### New Analytics App
Created a new Django app `analytics` with the following structure:
```
backend/analytics/
├── __init__.py
├── apps.py
├── urls.py
└── views.py
```

### API Endpoints
Four main endpoints provide real-time analytics data:

1. **`/api/analytics/dashboard-analytics/`** - Main dashboard data
   - Sales Growth percentage (current month vs previous month)
   - Customer Retention rate (last 30 days vs previous 30 days)
   - Active Campaigns count
   - Last sync timestamp

2. **`/api/analytics/sales-analytics/`** - Detailed sales data
   - Sales performance over last 30 days
   - Top performing products
   - Profit analysis
   - Monthly comparison

3. **`/api/analytics/seasonal-trends/`** - Seasonal data
   - Seasonal sales patterns by month
   - Upcoming seasonal events
   - Inventory optimization suggestions

4. **`/api/analytics/customer-loyalty/`** - Customer analytics
   - Customer retention metrics
   - Customer lifetime value
   - Satisfaction analysis
   - Engagement metrics

### Data Sources
The analytics endpoints pull data from existing models:
- **Orders**: Sales data, revenue, order counts
- **Users**: Customer data, user types
- **Feedback**: Customer satisfaction ratings
- **Offers**: Active campaigns and promotions
- **Seasonal Events**: Seasonal trends and events
- **Inventory**: Stock levels and alerts

## Frontend Integration

### Updated Components
Modified `src/pages/OthersPage.js` to integrate with backend APIs:

#### State Management
```javascript
const [analyticsData, setAnalyticsData] = useState({
    salesGrowth: '+15%',
    customerRetention: '85%',
    activeCampaigns: 12,
    lastSync: new Date().toLocaleTimeString()
});
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
```

#### Real-time Data Fetching
- Fetches data on component mount
- Auto-refreshes every 30 seconds
- Handles loading states and errors gracefully
- Falls back to default values on API errors

#### Dynamic UI Updates
- Quick Overview section shows real-time data
- Header displays last sync time
- Footer shows current sync status
- Error handling with user feedback

## Key Features

### Real-time Updates
- Dashboard refreshes automatically every 30 seconds
- Shows actual sync timestamps
- Maintains data freshness

### Error Handling
- Graceful fallback to default values
- User-friendly error messages
- Continues functioning even if API is unavailable

### Performance
- Efficient database queries with aggregations
- Minimal data transfer
- Optimized for real-time updates

## Data Calculations

### Sales Growth
```python
current_month_sales = Order.objects.filter(
    created_at__date__gte=current_month_start,
    order_status='delivered'
).aggregate(total=Sum('total_amount'))['total'] or 0

sales_growth = ((current_month_sales - previous_month_sales) / previous_month_sales) * 100
```

### Customer Retention
```python
recent_customers = User.objects.filter(
    user_type='customer',
    orders__created_at__date__gte=thirty_days_ago,
    orders__order_status='delivered'
).distinct().count()

customer_retention = (recent_customers / previous_customers) * 100
```

### Active Campaigns
```python
active_campaigns = Offer.objects.filter(
    status='active',
    start_date__lte=now,
    end_date__gte=now
).count()
```

## Security
- All endpoints require authentication
- Admin privileges required for access
- Proper error handling and validation

## Testing
- Created test script `test_analytics.py` to verify endpoints
- Endpoints return 401 (Unauthorized) without authentication
- Proper error responses for invalid requests

## Usage
1. Start Django backend: `python manage.py runserver`
2. Start React frontend: `npm start`
3. Navigate to `/admin/others` as an admin user
4. Dashboard will automatically load real-time data

## Future Enhancements
- Add caching for better performance
- Implement WebSocket for real-time updates
- Add more detailed analytics charts
- Export functionality for reports
- Custom date range filtering
