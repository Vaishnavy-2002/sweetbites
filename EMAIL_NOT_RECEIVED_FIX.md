# Fix: "Link Sent But Not Received in Email"

## 🚨 **Problem Identified**

Your system is using **console email backend**, which means:
- ✅ System says "link sent successfully"
- ❌ Emails are NOT sent to your inbox
- 📺 Emails are printed in the Django console instead

## 🔍 **Where to Find Your Reset Links**

### **Step 1: Check Django Console**
1. **Look at your Django server console** (where you ran `python manage.py runserver`)
2. **After requesting password reset**, you'll see the email content printed there
3. **Find the reset link** in the console output
4. **Copy the link** and paste it in your browser

### **Example Console Output:**
```
Content-Type: text/html; charset="utf-8"
Subject: Password Reset Request - SweetBite
From: noreply@sweetbite.com
To: your-email@example.com

<!DOCTYPE html>
<html>
...
<a href="http://localhost:3000/reset-password?token=abc123">Reset My Password</a>
...
```

## 🔧 **Solution 1: Use Console Links (Quick Fix)**

1. **Request password reset** from forgot password page
2. **Check Django console** for the email content
3. **Find the reset link** (looks like: `http://localhost:3000/reset-password?token=...`)
4. **Copy the complete link**
5. **Paste in browser address bar**
6. **Modal should popup** with password fields

## 🔧 **Solution 2: Configure Real Email (Permanent Fix)**

### **Step 1: Get Gmail App Password**
1. Go to https://myaccount.google.com/
2. Security → 2-Step Verification (enable if needed)
3. Security → App passwords
4. Select "Mail" → "Other (custom name)"
5. Enter "SweetBite" and copy the 16-character password

### **Step 2: Update Settings**
Edit `backend/sweetbite_backend/settings.py`:

**Find these lines (around line 184-194):**
```python
# OPTION 1: Console backend (for development/testing - emails print to console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@sweetbite.com'

# OPTION 2: Gmail SMTP (for real email sending) - CONFIGURE YOUR CREDENTIALS HERE
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = 'your-actual-email@gmail.com'  # ⚠️ REPLACE WITH YOUR REAL GMAIL
# EMAIL_HOST_PASSWORD = 'your-16-char-app-password'  # ⚠️ REPLACE WITH YOUR APP PASSWORD
# DEFAULT_FROM_EMAIL = 'your-actual-email@gmail.com'  # ⚠️ REPLACE WITH YOUR REAL GMAIL
```

**Change to:**
```python
# OPTION 1: Console backend (for development/testing - emails print to console)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# DEFAULT_FROM_EMAIL = 'noreply@sweetbite.com'

# OPTION 2: Gmail SMTP (for real email sending) - ACTIVE CONFIGURATION
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'youremail@gmail.com'  # Your real Gmail address
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # Your 16-character app password
DEFAULT_FROM_EMAIL = 'youremail@gmail.com'  # Your real Gmail address
```

### **Step 3: Restart Django Server**
```bash
# Stop the server (Ctrl+C) then restart:
python manage.py runserver
```

## 🧪 **Quick Test**

### **Test Console Mode (Current):**
```bash
cd backend
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sweetbite_backend.settings')
django.setup()
from django.core.mail import send_mail
print('Sending test email...')
result = send_mail('Test', 'This is a test', 'noreply@sweetbite.com', ['test@example.com'])
print('Email content should appear above ↑')
print('Result:', result)
"
```

### **Test After Gmail Setup:**
```bash
cd backend
python test_email_sending.py
```

## 📋 **Step-by-Step Instructions**

### **For Immediate Testing (Use Console Links):**
1. **Start Django server**: `python manage.py runserver`
2. **Go to forgot password page**: http://localhost:3000/forgot-password
3. **Enter any email address**
4. **Click "Send Reset Link"**
5. **Look at Django console** - you'll see the email content
6. **Find the reset link** in the console output
7. **Copy the complete URL**
8. **Paste in browser** - modal should popup

### **For Real Email Delivery:**
1. **Follow Gmail setup steps above**
2. **Update settings.py with your real credentials**
3. **Restart Django server**
4. **Test with forgot password page**
5. **Check your email inbox**

## 🎯 **What You Should See**

### **In Django Console (Current Mode):**
```
Subject: Password Reset Request - SweetBite
From: noreply@sweetbite.com
To: your-email@example.com
...
<a href="http://localhost:3000/reset-password?token=12345">Reset My Password</a>
...
```

### **In Your Email Inbox (After Gmail Setup):**
- Professional HTML email with SweetBite branding
- "Reset My Password" button
- Security information

## 🚨 **Common Issues**

### **"Link sent but not received"**
- **Cause**: Using console backend
- **Solution**: Check Django console for the email content

### **Gmail authentication fails**
- **Cause**: Using regular password instead of app password
- **Solution**: Generate Gmail app password and use that

### **Emails go to spam**
- **Cause**: Gmail spam filtering
- **Solution**: Check spam folder, add sender to contacts

---

**Right now, check your Django console for the reset links! 🔍✨**
