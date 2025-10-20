# Quick Email Setup - Fix "No Email Received" Issue

## 🚨 **Why You're Not Getting Emails**

The system is currently configured to only print emails to the console instead of actually sending them. Here's how to fix it:

## 🔧 **Step-by-Step Fix**

### **Step 1: Get Gmail App Password**

1. **Go to Google Account**: https://myaccount.google.com/
2. **Click "Security"** in the left menu
3. **Enable 2-Step Verification** (if not already enabled)
4. **Go to "App passwords"** (under Security)
5. **Select "Mail"** and **"Other (custom name)"**
6. **Enter "SweetBite"** as the name
7. **Copy the 16-character password** (like: abcd efgh ijkl mnop)

### **Step 2: Update Settings File**

Edit this file: `backend/sweetbite_backend/settings.py`

Find these lines (around line 192-194):
```python
EMAIL_HOST_USER = 'your-email@gmail.com'  # ⚠️ REPLACE WITH YOUR GMAIL ADDRESS
EMAIL_HOST_PASSWORD = 'your-app-password'  # ⚠️ REPLACE WITH YOUR GMAIL APP PASSWORD
DEFAULT_FROM_EMAIL = 'your-email@gmail.com'  # ⚠️ REPLACE WITH YOUR GMAIL ADDRESS
```

**Replace them with your actual information:**
```python
EMAIL_HOST_USER = 'youractualemail@gmail.com'  # Your real Gmail address
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # The 16-character app password
DEFAULT_FROM_EMAIL = 'youractualemail@gmail.com'  # Your real Gmail address
```

### **Step 3: Restart Django Server**

1. **Stop the Django server** (Ctrl+C in the terminal)
2. **Start it again**:
   ```bash
   cd backend
   python manage.py runserver
   ```

### **Step 4: Test Email Sending**

Run this command to test:
```bash
cd backend
python test_email_sending.py
```

### **Step 5: Test Forgot Password**

1. **Go to your website** (http://localhost:3000)
2. **Click "Forgot Password"**
3. **Enter your email address**
4. **Check your email inbox** for the reset link

## 🎯 **Expected Results**

After following these steps:
- ✅ **Real emails will be sent** to your inbox
- ✅ **You'll receive password reset links**
- ✅ **Links will open the password reset modal**

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Authentication failed"**
- **Solution**: Make sure you're using the **App Password**, not your regular Gmail password
- **Check**: 2-Step Verification is enabled on your Gmail account

### **Issue 2: "Connection refused"**
- **Solution**: Check your internet connection
- **Try**: Using a different email provider (Outlook, Yahoo)

### **Issue 3: "Invalid credentials"**
- **Solution**: Double-check the email address and app password
- **Make sure**: No extra spaces in the app password

### **Issue 4: Emails go to spam**
- **Solution**: Check your spam folder
- **Add**: The sender email to your contacts

## 🔄 **Alternative: Use File Backend for Testing**

If you want to test without setting up Gmail, you can use the file backend:

1. **Comment out** the Gmail settings in `settings.py`
2. **Uncomment** these lines:
   ```python
   EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
   EMAIL_FILE_PATH = BASE_DIR / 'sent_emails'
   DEFAULT_FROM_EMAIL = 'noreply@sweetbite.com'
   ```
3. **Restart Django server**
4. **Check the `sent_emails` folder** for the email files

## 📧 **Quick Test**

After setup, test with this simple command:
```bash
cd backend
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sweetbite_backend.settings')
django.setup()
from django.core.mail import send_mail
result = send_mail('Test', 'This is a test email', 'your-email@gmail.com', ['your-email@gmail.com'])
print('Email sent!' if result else 'Email failed!')
"
```

---

**Follow these steps and you'll start receiving real password reset emails! 📧✨**
