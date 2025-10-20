# Best-Selling Items & Profit Analyzer Integration

## Overview
This document describes the complete integration of the SweetBite "Best-Selling Items & Profit Analyzer" page with real-time backend data. The page now displays live analytics from the database instead of static mock data.

## Backend Implementation

### New Analytics Endpoints
Added three new endpoints to the analytics app:

1. **`/api/analytics/best-selling-items/`** - Main analyzer data
   - Top 5 performing cakes
   - Low performing cakes (sales < 5)
   - Summary metrics (total revenue, orders, profit margins)
   - Real-time data based on selected period (week/month/year)

2. **`/api/analytics/profit-analysis/`** - Detailed profit analysis
   - Individual cake profit metrics
   - Sales trends over time
   - Recent order history
   - Cost analysis

3. **`/api/analytics/promote-cake/`** - Promotion creation
   - Creates promotional offers for low-performing cakes
   - Integrates with existing offers system
   - Automatic promotion setup

### Data Sources
The analytics endpoints pull data from:
- **Cakes**: Product information, pricing, categories
- **OrderItems**: Sales quantities, revenue, order details
- **Orders**: Order status, dates, customer information
- **Offers**: Active promotions and campaigns

### Key Calculations

#### Sales Metrics
```python
# Total sales for a cake in selected period
total_sold = OrderItem.objects.filter(
    cake=cake,
    order__created_at__date__gte=start_date,
    order__order_status='delivered'
).aggregate(total=Sum('quantity'))['total'] or 0

# Total revenue for a cake
total_revenue = OrderItem.objects.filter(
    cake=cake,
    order__created_at__date__gte=start_date,
    order__order_status='delivered'
).aggregate(total=Sum('total_price'))['total'] or 0
```

#### Profit Analysis
```python
# Profit margin calculation (currently 30% - can be made dynamic)
profit_margin = 30.0
estimated_profit = float(total_revenue) * (profit_margin / 100)
```

#### Low Performers Detection
```python
# Cakes with sales < 5 in the selected period
low_performers = [
    cake for cake in cake_analytics 
    if cake['sales'] < 5
]
```

## Frontend Integration

### Updated Components
Modified `src/pages/AnalyticsPage.js` to integrate with backend APIs:

#### State Management
```javascript
const [salesData, setSalesData] = useState({
    topCakes: [],
    lowPerformers: [],
    totalRevenue: 0,
    totalOrders: 0,
    averageProfitMargin: 0,
    topPerformer: 'N/A'
});
const [selectedPeriod, setSelectedPeriod] = useState('month');
const [lastUpdated, setLastUpdated] = useState('');
```

#### Real-time Data Fetching
- Fetches data on component mount and period change
- Auto-refreshes every 30 seconds
- Handles loading states and errors gracefully
- Falls back to mock data on API failures

#### Dynamic UI Updates
- Summary cards show real-time metrics
- Top 5 cakes bar chart with actual sales data
- Low performers alerts with real data
- Promotion creation with backend integration

### Key Features

#### Real-time Updates
- Dashboard refreshes automatically every 30 seconds
- Shows actual sync timestamps
- Period-based filtering (week/month/year)
- Maintains data freshness

#### Interactive Elements
- **Promote Button**: Creates actual promotional offers
- **Period Selector**: Filters data by time period
- **Refresh Button**: Manual data refresh
- **View Details**: Future enhancement for detailed analysis

#### Error Handling
- Graceful fallback to mock data
- User-friendly error messages
- Continues functioning even if API is unavailable

## Data Flow

### 1. Page Load
1. Component mounts and checks authentication
2. Calls `/api/analytics/best-selling-items/?period=month`
3. Processes response data and updates state
4. Sets up auto-refresh interval

### 2. Period Change
1. User selects new period (week/month/year)
2. Triggers new API call with updated period
3. Updates all metrics and charts
4. Maintains real-time updates

### 3. Promotion Creation
1. User clicks "Promote" button on low performer
2. Calls `/api/analytics/promote-cake/` with cake details
3. Creates promotional offer in database
4. Refreshes data to show updated information

### 4. Auto-refresh
1. Every 30 seconds, fetches latest data
2. Updates timestamps and metrics
3. Maintains current period selection
4. Handles errors silently

## API Response Structure

### Best-Selling Items Response
```json
{
  "summary": {
    "total_revenue": 15000.00,
    "total_orders": 45,
    "total_sales": 120,
    "average_profit_margin": 30.0,
    "top_performer": "Chocolate Delight",
    "period": "month",
    "date_range": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    }
  },
  "top_cakes": [
    {
      "id": 1,
      "name": "Chocolate Delight",
      "sales": 45,
      "revenue": 2250.00,
      "profit_margin": 30.0,
      "estimated_profit": 675.00,
      "order_count": 12,
      "days_since_last_sale": 2,
      "image": "/media/cakes/chocolate.jpg",
      "price": 50.00,
      "category": "Birthday Cakes"
    }
  ],
  "low_performers": [
    {
      "id": 6,
      "name": "Lemon Drizzle",
      "sales": 2,
      "revenue": 100.00,
      "profit_margin": 30.0,
      "days_since_last_sale": 15
    }
  ],
  "last_updated": "2024-01-31T10:30:00Z"
}
```

## Security & Performance

### Authentication
- All endpoints require admin authentication
- Proper permission checks for admin users
- Secure API token handling

### Performance Optimizations
- Efficient database queries with aggregations
- Minimal data transfer with focused responses
- Optimized for real-time updates
- Proper error handling and validation

### Data Integrity
- Consistent profit margin calculations
- Accurate sales tracking
- Real-time order status filtering
- Proper date range handling

## Usage Instructions

### For Administrators
1. Navigate to `/admin/others/analytics`
2. Select desired time period (week/month/year)
3. View real-time sales analytics
4. Identify low-performing products
5. Create promotions for underperforming items
6. Monitor performance improvements

### For Developers
1. Backend endpoints are available at `/api/analytics/`
2. All endpoints require admin authentication
3. Period parameter accepts: `week`, `month`, `year`
4. Promotion creation requires cake_id and promotion details
5. Error responses include detailed error messages

## Future Enhancements

### Planned Features
- **Dynamic Profit Margins**: Calculate based on actual ingredient costs
- **Advanced Filtering**: Category, price range, customer segment filters
- **Export Functionality**: PDF/Excel reports for analytics
- **Predictive Analytics**: Sales forecasting and trend analysis
- **Custom Date Ranges**: User-defined time periods
- **Real-time Notifications**: Alerts for significant changes

### Technical Improvements
- **Caching**: Redis caching for better performance
- **WebSocket Updates**: Real-time data streaming
- **Advanced Charts**: Interactive visualizations
- **Mobile Optimization**: Responsive design improvements
- **API Rate Limiting**: Protection against abuse

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Ensure user has admin privileges
2. **Empty Data**: Check if orders exist in selected period
3. **API Timeouts**: Verify backend server is running
4. **Promotion Failures**: Check offer creation permissions

### Debug Information
- Check browser console for API errors
- Verify backend logs for database issues
- Test endpoints directly with admin credentials
- Monitor network requests in browser dev tools
