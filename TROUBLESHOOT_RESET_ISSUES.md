# Troubleshoot Password Reset Issues

## 🚨 **Issues Identified**

1. **Reset password modal not appearing** - clicking reset password navigates to forgot password instead
2. **Email functionality not working properly**

## 🔧 **Fixes Applied**

### **1. Enhanced Reset Password Page**
- Added better debugging and error handling
- Modal now shows immediately when token is present
- Added console logging to track what's happening

### **2. Created Test Page**
- New test page at: http://localhost:3000/test-reset
- Allows you to test the modal popup directly
- Helps debug the complete flow

## 🧪 **Step-by-Step Testing**

### **Method 1: Direct Modal Test**
1. **Go to test page**: http://localhost:3000/test-reset
2. **Click "Test Modal Popup"** - modal should appear immediately
3. **Enter new password** and confirm
4. **Test if modal works properly**

### **Method 2: Complete Flow Test**
1. **Start Django server**: `python manage.py runserver`
2. **Go to test page**: http://localhost:3000/test-reset
3. **Click "Create Test User & Request Reset"**
4. **Check Django console** for the reset link
5. **Copy the reset link** and paste in browser
6. **Modal should popup** with password fields

### **Method 3: Manual Reset Link**
1. **Create a reset link manually**:
   - Format: `http://localhost:3000/reset-password?token=YOUR_TOKEN`
2. **Get a real token from Django console** when you request forgot password
3. **Paste the complete URL** in browser
4. **Modal should appear**

## 🔍 **Debugging Steps**

### **Check Browser Console**
1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Look for error messages** when clicking reset links
4. **Check for JavaScript errors**

### **Check Django Console**
1. **Look for token generation** messages
2. **Check for email sending** logs
3. **Verify reset URL format** in console output

### **Check Network Tab**
1. **Open browser developer tools** (F12)
2. **Go to Network tab**
3. **Click reset link** and see what requests are made
4. **Check if token verification API is called**

## 🎯 **Expected Behavior**

### **When Reset Link is Clicked:**
1. **URL should be**: `http://localhost:3000/reset-password?token=SOME_UUID`
2. **Page should load** with loading spinner
3. **Console should show**: "Reset password page loaded with token: ..."
4. **Modal should popup** with password fields
5. **No navigation** to forgot password page

### **Modal Should Show:**
- ✅ **New Password field**
- ✅ **Confirm Password field**
- ✅ **Reset Password button**
- ✅ **User email** (if token verification works)

## 🔧 **Quick Fixes to Try**

### **Fix 1: Clear Browser Cache**
```bash
# Clear browser cache and cookies
# Or try in incognito/private mode
```

### **Fix 2: Restart Django Server**
```bash
cd backend
python manage.py runserver
```

### **Fix 3: Check Console Output**
Look for these messages in Django console:
```
Reset password page loaded with token: [TOKEN]
Verifying token: [TOKEN]
Token verification response: 200
```

### **Fix 4: Test Direct Modal**
Go to: http://localhost:3000/test-reset
Click "Test Modal Popup" - this bypasses all token verification

## 🚨 **Common Issues & Solutions**

### **Issue 1: Modal Not Appearing**
**Symptoms**: Clicking reset link goes to forgot password page
**Solution**: 
- Check browser console for errors
- Try the test page: http://localhost:3000/test-reset
- Verify the URL has `?token=` parameter

### **Issue 2: Token Verification Fails**
**Symptoms**: Error message about invalid token
**Solution**:
- Check if Django server is running
- Verify token format in URL
- Try creating a new reset request

### **Issue 3: Email Not Working**
**Symptoms**: Not receiving emails
**Solution**:
- Check Django console - emails should print there
- Verify email settings in settings.py
- Try the test email command

## 📧 **Email Configuration Check**

Run this to check email status:
```bash
cd backend
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sweetbite_backend.settings')
django.setup()
from django.conf import settings
print('Email Backend:', settings.EMAIL_BACKEND)
if 'console' in settings.EMAIL_BACKEND:
    print('✅ Console mode - emails print to Django console')
    print('💡 Check Django console for reset links')
else:
    print('✅ SMTP mode - emails sent to inbox')
    print('📧 Check your email inbox')
"
```

## 🎯 **Testing Checklist**

- [ ] Django server is running on port 8000
- [ ] React app is running on port 3000
- [ ] Test page works: http://localhost:3000/test-reset
- [ ] Modal popup appears when clicking "Test Modal Popup"
- [ ] Console shows token verification messages
- [ ] Reset links have proper format with token parameter
- [ ] Browser console shows no JavaScript errors

## 🆘 **If Still Not Working**

1. **Try the test page first**: http://localhost:3000/test-reset
2. **Check browser console** for any error messages
3. **Check Django console** for backend errors
4. **Try in incognito/private browsing** mode
5. **Restart both Django and React servers**

---

**Use the test page to isolate the issue and verify the modal works! 🔧✨**
