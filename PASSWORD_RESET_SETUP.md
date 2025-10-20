# Password Reset Functionality Setup

This document describes the password reset functionality that has been added to the SweetBite application.

## 🎯 Features Implemented

### Backend (Django)
- ✅ Password reset token model with expiration (24 hours)
- ✅ Forgot password endpoint (`/api/users/auth/forgot-password/`)
- ✅ Reset password endpoint (`/api/users/auth/reset-password/`)
- ✅ Token verification endpoint (`/api/users/auth/verify-reset-token/<token>/`)
- ✅ Email template for password reset notifications
- ✅ Proper validation and error handling

### Frontend (React)
- ✅ Forgot Password page (`/forgot-password`)
- ✅ Reset Password page (`/reset-password`)
- ✅ Updated Login Modal with "Forgot Password?" link
- ✅ Beautiful, responsive UI with animations
- ✅ Proper error handling and user feedback

## 🚀 How to Use

### For Users
1. **Forgot Password Flow:**
   - Click "Forgot password?" link on the login modal
   - Enter your email address on the forgot password page
   - Check your email for the reset link
   - Click the link to go to the reset password page
   - Enter your new password and confirm it
   - You'll be redirected to the home page after successful reset

2. **Reset Password Flow:**
   - Access the reset password page via the email link
   - The page will verify the token automatically
   - Enter your new password (minimum 8 characters)
   - Confirm your new password
   - Click "Reset Password" to complete the process

### For Developers

#### Backend Endpoints

**Forgot Password:**
```http
POST /api/users/auth/forgot-password/
Content-Type: application/json

{
  "email": "user@gmail.com"
}
```

**Verify Reset Token:**
```http
GET /api/users/auth/verify-reset-token/{token}/
```

**Reset Password:**
```http
POST /api/users/auth/reset-password/
Content-Type: application/json

{
  "token": "uuid-token-here",
  "password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

#### Frontend Routes
- `/forgot-password` - Forgot password page
- `/reset-password?token={token}` - Reset password page

## 🔧 Configuration

### Email Settings
The application is configured to use console email backend for development. To use real email:

1. Update `settings.py`:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-host'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@domain.com'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'noreply@sweetbite.com'
```

2. Update the reset URL in `users/views.py`:
```python
reset_url = f"https://yourdomain.com/reset-password?token={reset_token.token}"
```

### Database Migration
Make sure to run migrations to create the password reset token table:
```bash
python manage.py makemigrations
python manage.py migrate
```

## 🧪 Testing

### Manual Testing
1. Start the Django server: `python manage.py runserver`
2. Start the React app: `npm start`
3. Create a user account
4. Test the forgot password flow
5. Check the Django console for the reset email

### Automated Testing
Run the test script:
```bash
python test_password_reset.py
```

## 📁 Files Added/Modified

### New Files
- `src/pages/ForgotPasswordPage.js` - Forgot password page component
- `src/pages/ResetPasswordPage.js` - Reset password page component
- `backend/templates/emails/password_reset.html` - Email template
- `backend/test_password_reset.py` - Test script
- `PASSWORD_RESET_SETUP.md` - This documentation

### Modified Files
- `src/components/LoginModal.js` - Added forgot password link
- `src/App.js` - Added routing for new pages
- `backend/sweetbite_backend/settings.py` - Added template directory and email settings

### Existing Backend Files (Already Implemented)
- `backend/users/models.py` - PasswordResetToken model
- `backend/users/serializers.py` - Password reset serializers
- `backend/users/views.py` - Password reset endpoints
- `backend/users/urls.py` - Password reset URL patterns

## 🔒 Security Features

- **Token Expiration:** Reset tokens expire after 24 hours
- **Single Use:** Each token can only be used once
- **Email Validation:** Only valid email addresses can request resets
- **Password Validation:** Minimum 8 characters required
- **CSRF Protection:** All endpoints are properly protected
- **Input Validation:** Comprehensive validation on both frontend and backend

## 🎨 UI/UX Features

- **Responsive Design:** Works on all device sizes
- **Smooth Animations:** Framer Motion animations for better UX
- **Loading States:** Visual feedback during API calls
- **Error Handling:** Clear error messages for users
- **Success Feedback:** Confirmation messages for successful actions
- **Consistent Styling:** Matches the existing SweetBite design system

## 🚨 Important Notes

1. **Email Backend:** Currently using console backend for development. Update for production.
2. **Frontend URL:** Reset URL is hardcoded to `localhost:3000`. Update for production.
3. **Token Security:** Tokens are UUID4 and cryptographically secure
4. **Rate Limiting:** Consider adding rate limiting for production use
5. **Email Templates:** The email template is responsive and professional

## 🔄 Future Enhancements

- [ ] Add rate limiting to prevent abuse
- [ ] Add email verification before password reset
- [ ] Add password strength indicator
- [ ] Add "Remember me" functionality
- [ ] Add social login options
- [ ] Add two-factor authentication

## 📞 Support

If you encounter any issues with the password reset functionality, check:
1. Django server is running on port 8000
2. React app is running on port 3000
3. Database migrations are up to date
4. Email settings are properly configured
5. Check browser console for any JavaScript errors
6. Check Django console for any server errors

---

**Happy coding! 🍰✨**
