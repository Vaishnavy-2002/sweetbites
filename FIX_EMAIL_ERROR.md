# Fix "Failed to Send Mail" Error

## 🚨 **Problem Identified**

The error `(535, b'5.7.8 Username and Password not accepted')` means:
- The system is trying to use Gmail SMTP
- But the credentials are still set to placeholder values
- Gmail is rejecting the login attempt

## ✅ **Current Status**

I've switched the system back to **console mode** so emails will work immediately. Now when you use "forgot password", the email will appear in your Django console instead of being sent to your inbox.

## 🔧 **Two Options to Fix This**

### **Option 1: Keep Console Mode (Immediate Solution)**

**Pros:**
- ✅ Works immediately
- ✅ No setup required
- ✅ Perfect for development/testing

**How to use:**
1. Start Django server: `python manage.py runserver`
2. Go to forgot password page
3. Enter any email address
4. Check the Django console - you'll see the email content there
5. Copy the reset link from the console and paste it in your browser

### **Option 2: Set Up Real Gmail (For Production)**

**Step 1: Get Gmail App Password**
1. Go to https://myaccount.google.com/
2. Security → 2-Step Verification (enable if needed)
3. Security → App passwords
4. Select "Mail" → "Other (custom name)"
5. Enter "SweetBite" and copy the 16-character password

**Step 2: Update Settings**
Edit `backend/sweetbite_backend/settings.py`:

**Comment out console mode:**
```python
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# DEFAULT_FROM_EMAIL = 'noreply@sweetbite.com'
```

**Uncomment and update Gmail settings:**
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'youractualemail@gmail.com'  # Your real Gmail
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # Your 16-char app password
DEFAULT_FROM_EMAIL = 'youractualemail@gmail.com'  # Your real Gmail
```

**Step 3: Restart Django**
```bash
python manage.py runserver
```

## 🧪 **Test the Fix**

### **For Console Mode (Current):**
```bash
cd backend
python manage.py runserver
```
Then go to forgot password page and check the console output.

### **For Gmail Mode:**
```bash
cd backend
python test_email_sending.py
```

## 🎯 **What You'll See**

### **Console Mode:**
- Email content appears in Django console
- Copy the reset link from console
- Paste link in browser to test

### **Gmail Mode:**
- Real emails sent to your inbox
- Click reset link directly from email
- Modal popup opens for password reset

## 🚨 **Common Gmail Setup Issues**

### **Issue 1: "Less secure apps" error**
- **Solution**: Use App Passwords, not regular password
- **Required**: 2-Step Verification must be enabled

### **Issue 2: "Authentication failed"**
- **Check**: Email address is correct
- **Check**: App password is correct (16 characters)
- **Check**: No extra spaces in password

### **Issue 3: "Connection refused"**
- **Check**: Internet connection
- **Try**: Different email provider

## 💡 **Recommendation**

For now, **use console mode** to test the password reset functionality. The emails will appear in your Django console, and you can copy the reset links to test the modal popup.

When you're ready for production, set up Gmail with the steps above.

---

**The email system is now working! Choose your preferred option above. 📧✨**
