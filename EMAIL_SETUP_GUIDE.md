# Email Setup Guide - Real Email Sending

This guide will help you set up real email sending for the password reset functionality.

## 🎯 **Current Issue**

Right now, the system is configured to only print emails to the console instead of actually sending them. This guide will help you set up real email sending.

## 📧 **Email Setup Options**

### **Option 1: Gmail SMTP (Recommended)**

#### **Step 1: Create Gmail App Password**
1. Go to your Google Account settings
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Go to **Security** → **App passwords**
4. Select **Mail** and **Other (custom name)**
5. Enter "SweetBite App" as the name
6. Copy the generated 16-character password

#### **Step 2: Update Django Settings**
Edit `backend/sweetbite_backend/settings.py`:

```python
# Gmail SMTP Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-actual-email@gmail.com'  # Your Gmail address
EMAIL_HOST_PASSWORD = 'your-16-character-app-password'  # App password from Step 1
DEFAULT_FROM_EMAIL = 'your-actual-email@gmail.com'
```

#### **Step 3: Test Email Sending**
Run the test script to verify emails are being sent:
```bash
cd backend
python test_email_sending.py
```

### **Option 2: Other Email Providers**

#### **Outlook/Hotmail**
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp-mail.outlook.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@outlook.com'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'your-email@outlook.com'
```

#### **Yahoo Mail**
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mail.yahoo.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@yahoo.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'your-email@yahoo.com'
```

### **Option 3: File Backend (For Testing)**

If you want to test without sending real emails, use the file backend:

```python
EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
EMAIL_FILE_PATH = BASE_DIR / 'sent_emails'
DEFAULT_FROM_EMAIL = 'noreply@sweetbite.com'
```

This will save emails as files in the `sent_emails` folder.

## 🧪 **Testing Email Functionality**

### **Test Script**
I've created a test script to verify email sending:

```bash
cd backend
python test_email_sending.py
```

### **Manual Testing**
1. Start Django server: `python manage.py runserver`
2. Go to forgot password page
3. Enter a valid email address
4. Check if email is received (or check console/file if using test backends)

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Gmail "Less Secure Apps" Error**
- **Solution**: Use App Passwords instead of regular password
- **Steps**: Follow the Gmail App Password setup above

#### **2. Authentication Failed**
- **Check**: Email address and app password are correct
- **Verify**: 2-Step Verification is enabled on Gmail
- **Ensure**: Using app password, not regular password

#### **3. Connection Refused**
- **Check**: Internet connection
- **Verify**: SMTP settings (host, port, TLS)
- **Try**: Different email provider

#### **4. Emails Going to Spam**
- **Add**: Your email to contacts
- **Check**: Spam folder
- **Consider**: Using a professional email service

## 📝 **Quick Setup for Gmail**

### **1. Update Settings File**
Replace these lines in `backend/sweetbite_backend/settings.py`:

```python
EMAIL_HOST_USER = 'your-actual-email@gmail.com'  # Your Gmail
EMAIL_HOST_PASSWORD = 'your-16-char-app-password'  # App password
DEFAULT_FROM_EMAIL = 'your-actual-email@gmail.com'  # Your Gmail
```

### **2. Restart Django Server**
```bash
cd backend
python manage.py runserver
```

### **3. Test Password Reset**
1. Go to forgot password page
2. Enter your email address
3. Check your email inbox for the reset link

## 🎯 **Expected Results**

After proper setup:
- ✅ **Real emails sent** to user's inbox
- ✅ **Reset links work** and open the modal
- ✅ **Professional email template** with SweetBite branding
- ✅ **Secure token-based** password reset

## 🚨 **Security Notes**

- **Never commit** real email credentials to version control
- **Use environment variables** for production
- **Enable 2FA** on your email account
- **Use app passwords** instead of regular passwords
- **Consider** using a dedicated email service for production

## 🔄 **Environment Variables (Recommended for Production)**

Create a `.env` file in the backend directory:

```env
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

Then update settings.py to use environment variables:

```python
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')
```

---

**Follow these steps to enable real email sending for your password reset functionality! 📧✨**
