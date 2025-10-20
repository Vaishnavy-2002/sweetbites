# Feedback System Setup Guide

This guide will help you set up the complete feedback system for your Django + React application.

## Backend Setup (Django)

### 1. Run Database Migrations

```bash
cd backend
python manage.py makemigrations feedback
python manage.py migrate
```

### 2. Create Superuser (if not already done)

```bash
python manage.py createsuperuser
```

### 3. Start Django Server

```bash
python manage.py runserver
```

The feedback API will be available at:
- `POST /api/feedback/` - Submit feedback
- `GET /api/feedback/` - List feedback (authenticated users only)
- `GET /api/feedback/stats/` - Get feedback statistics (authenticated users only)

## Frontend Setup (React)

### 1. Install Dependencies (if not already installed)

```bash
npm install @heroicons/react
```

### 2. Start React Development Server

```bash
npm start
```

## Features Implemented

### 1. Django Backend
- ✅ **Feedback Model**: User, message, rating (1-5), timestamps
- ✅ **API Endpoints**: POST for submission, GET for listing/stats
- ✅ **Authentication**: Supports both authenticated and anonymous feedback
- ✅ **Validation**: Rating (1-5), message length (min 10 chars)
- ✅ **Admin Interface**: View and manage feedback in Django admin

### 2. React Frontend
- ✅ **Feedback Form Component**: Star rating + textarea with validation
- ✅ **Dedicated Feedback Page**: `/feedback` route with full form
- ✅ **Footer Integration**: Feedback link in site footer
- ✅ **Order Success Integration**: Feedback prompt after order completion
- ✅ **Modal Feedback**: Inline feedback form on order success page
- ✅ **API Service**: Centralized feedback API calls

### 3. User Experience
- ✅ **Star Rating**: Interactive 1-5 star rating system
- ✅ **Form Validation**: Client-side and server-side validation
- ✅ **Success Messages**: Confirmation after successful submission
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Responsive Design**: Works on desktop and mobile

## API Endpoints

### Submit Feedback
```http
POST /api/feedback/
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "message": "Great service and delicious cakes!",
  "rating": 5
}
```

### Get Feedback Statistics (Admin)
```http
GET /api/feedback/stats/
Authorization: Bearer <token>

Response:
{
  "total_feedback": 25,
  "average_rating": 4.2,
  "rating_distribution": {
    "1": 1,
    "2": 2,
    "3": 5,
    "4": 8,
    "5": 9
  }
}
```

## File Structure

### Backend Files Created/Modified:
```
backend/
├── feedback/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── tests.py
│   └── migrations/
│       ├── __init__.py
│       └── 0001_initial.py
├── sweetbite_backend/
│   ├── settings.py (modified)
│   └── urls.py (modified)
```

### Frontend Files Created/Modified:
```
src/
├── components/
│   ├── FeedbackForm.js (new)
│   └── Footer.js (new)
├── pages/
│   ├── FeedbackPage.js (new)
│   └── OrderSuccessPage.js (modified)
├── services/
│   └── feedbackService.js (new)
└── App.js (modified)
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test feedback
```

### Manual Testing
1. Visit `/feedback` to test the dedicated feedback page
2. Complete an order and check the feedback prompt on order success page
3. Check footer for feedback link
4. Test both authenticated and anonymous feedback submission

## Customization

### Styling
- All components use Tailwind CSS classes
- Colors and styling can be customized by modifying the className props
- Star rating colors: `text-yellow-400` for filled, `text-gray-300` for empty

### Validation
- Minimum message length: 10 characters (configurable in serializer)
- Rating range: 1-5 stars
- Server-side validation in Django serializer
- Client-side validation in React component

### Features
- Anonymous feedback is supported
- Authenticated users' feedback is linked to their account
- Admin can view all feedback in Django admin interface
- Feedback statistics available for admin users

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS settings in Django include your React app URL
2. **Authentication**: Make sure token is properly stored in localStorage
3. **API Endpoints**: Verify Django server is running and URLs are correct
4. **Database**: Run migrations if you get database errors

### Debug Steps

1. Check browser console for JavaScript errors
2. Check Django server logs for API errors
3. Verify API endpoints with tools like Postman
4. Check database for created feedback records

## Next Steps

Consider adding these features:
- Email notifications for new feedback
- Feedback moderation system
- Feedback analytics dashboard
- Export feedback to CSV
- Feedback categories/tags
- Response to feedback feature
