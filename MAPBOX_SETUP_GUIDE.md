# 🗺️ Mapbox Setup Guide for Sweet Bite

## 📋 **Current Status**
Your project already has Mapbox integrated! Here's what's working:

### ✅ **Already Configured:**
- **Mapbox GL JS** - Interactive map library
- **React Map GL** - React wrapper for Mapbox
- **OrderTracking Component** - Shows delivery locations
- **Access Token** - Already configured in the code

## 🔧 **How to Set Up Mapbox Properly**

### **Step 1: Get Your Own Mapbox Token**
1. Go to [Mapbox.com](https://www.mapbox.com/)
2. Sign up for a free account
3. Go to your [Account page](https://account.mapbox.com/)
4. Copy your **Default Public Token**

### **Step 2: Update Your Token**
Replace the token in `src/components/OrderTracking.js`:

```javascript
// Replace this line:
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2FheWE5OSIsImEiOiJjbWZxY2U3bWcwcHM0MmluNTkxaHEzcDd1In0.nlgLV43KSw1e_AgyBVFuMQ';

// With your own token:
const MAPBOX_TOKEN = 'pk.your_actual_token_here';
```

### **Step 3: Environment Variables (Recommended)**
For security, store your token in environment variables:

1. Create `.env` file in your project root:
```bash
REACT_APP_MAPBOX_TOKEN=pk.your_actual_token_here
```

2. Update `OrderTracking.js`:
```javascript
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
```

## 🚀 **How Mapbox Works in Your App**

### **OrderTracking Component Features:**
- **📍 Interactive Map** - Shows delivery locations
- **🚚 Real-time Tracking** - Updates every 10 seconds
- **👤 Customer Location** - Shows where to deliver
- **📱 Delivery Person Location** - Shows current position
- **🎯 Auto-centering** - Map centers on delivery location

### **Map Features:**
- **Zoom in/out** - Users can zoom the map
- **Pan around** - Users can move around the map
- **Click markers** - Shows location details
- **Real-time updates** - Location updates automatically

## 🔄 **How It Integrates with Your Order System**

### **Order Flow with Mapbox:**
1. **Order Placed** → Customer location stored
2. **Order Confirmed** → Delivery person assigned
3. **Out for Delivery** → Mapbox shows real-time tracking
4. **Delivered** → Final location recorded

### **Backend Integration:**
Your backend needs to provide:
- **Order details** with location data
- **Delivery person location** updates
- **Customer address** coordinates
- **Location history** for tracking

## 🛠️ **Backend Setup Required**

### **Add to Your Django Models:**
```python
# In your Order model
class Order(models.Model):
    # ... existing fields ...
    customer_latitude = models.FloatField(null=True, blank=True)
    customer_longitude = models.FloatField(null=True, blank=True)
    delivery_person_latitude = models.FloatField(null=True, blank=True)
    delivery_person_longitude = models.FloatField(null=True, blank=True)

# New model for location tracking
class LocationUpdate(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    delivery_person = models.ForeignKey(User, on_delete=models.CASCADE)
```

### **API Endpoint for Tracking:**
```python
# In your views.py
@api_view(['GET'])
def order_tracking(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    return Response({
        'order': OrderSerializer(order).data,
        'customer_location': {
            'latitude': order.customer_latitude,
            'longitude': order.customer_longitude
        },
        'delivery_location': {
            'latitude': order.delivery_person_latitude,
            'longitude': order.delivery_person_longitude
        },
        'location_history': LocationUpdateSerializer(
            LocationUpdate.objects.filter(order=order).order_by('-timestamp')[:10]
        ).data
    })
```

## 🎯 **Usage Examples**

### **1. View Order Tracking:**
```javascript
// In your order details page
<OrderTracking orderId={order.id} />
```

### **2. Update Delivery Location:**
```javascript
// When delivery person moves
const updateLocation = async (lat, lng) => {
  await fetch(`/api/orders/${orderId}/location/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  });
};
```

## 🔒 **Security Considerations**

### **Token Security:**
- **Never commit** your token to version control
- **Use environment variables** for production
- **Restrict token permissions** in Mapbox dashboard
- **Monitor usage** to avoid exceeding limits

### **Rate Limiting:**
- **Free tier**: 50,000 map loads per month
- **Paid plans**: Higher limits available
- **Monitor usage** in Mapbox dashboard

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Map not loading** → Check token validity
2. **No markers showing** → Check coordinate data
3. **Updates not working** → Check API endpoints
4. **Styling issues** → Check CSS imports

### **Debug Steps:**
1. Check browser console for errors
2. Verify token in Mapbox dashboard
3. Test API endpoints manually
4. Check coordinate format (lat/lng)

## 📱 **Mobile Considerations**

### **Responsive Design:**
- Map automatically adapts to screen size
- Touch gestures work on mobile
- Zoom controls optimized for mobile

### **Performance:**
- Map tiles cached for faster loading
- Updates throttled to prevent excessive API calls
- Mobile-optimized rendering

## 🎨 **Customization Options**

### **Map Styles:**
- **Light theme** - Clean, minimal look
- **Dark theme** - Modern, sleek appearance
- **Satellite view** - Real imagery
- **Custom styles** - Create your own in Mapbox Studio

### **Markers:**
- **Custom icons** - Use your own delivery truck icon
- **Colors** - Match your brand colors
- **Animations** - Smooth transitions and effects

## 📊 **Analytics & Monitoring**

### **Mapbox Analytics:**
- Track map usage
- Monitor performance
- Identify popular areas
- Optimize delivery routes

### **Custom Analytics:**
- Track delivery times
- Monitor customer satisfaction
- Analyze delivery patterns
- Optimize delivery routes

## 🚀 **Next Steps**

1. **Get your own Mapbox token**
2. **Update the token** in OrderTracking.js
3. **Set up backend location tracking**
4. **Test the integration**
5. **Customize the map style**
6. **Add real-time updates**

## 💡 **Pro Tips**

- **Use geocoding** to convert addresses to coordinates
- **Implement route optimization** for multiple deliveries
- **Add delivery time estimates** based on traffic
- **Use clustering** for multiple nearby deliveries
- **Add offline support** for areas with poor connectivity

---

**Need Help?** Check the [Mapbox Documentation](https://docs.mapbox.com/) or [React Map GL Docs](https://visgl.github.io/react-map-gl/) for more details!
