# 🍰 SweetBite Email Setup - Quick Start Guide

## The Problem
Currently, password reset emails are only printed to the console (terminal) instead of being sent to users' actual email addresses. This means users don't receive the reset links.

## The Solution
Configure Gmail SMTP to send real emails to users.

## Quick Setup (3 Steps)

### Step 1: Get Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled
3. Go to "App passwords" under 2-Step Verification
4. Select "Mail" and create a new app password
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Run Setup Script
```bash
python setup_email.py
```
Follow the prompts to enter your Gmail address and app password.

### Step 3: Restart Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Manual Setup (Alternative)

If the script doesn't work, manually update `backend/sweetbite_backend/settings.py`:

```python
# Replace the email settings section with:
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'  # Your Gmail
EMAIL_HOST_PASSWORD = 'your-app-password'  # Your app password
DEFAULT_FROM_EMAIL = 'SweetBite Bakery <your-email@gmail.com>'
SERVER_EMAIL = 'your-email@gmail.com'
```

## Test Email Sending

After setup, test the configuration:

```bash
python test_email_config.py
```

Or test manually:
1. Go to `/forgot-password`
2. Enter a valid email address
3. Check your email inbox (and spam folder)

## Troubleshooting

### "Authentication Failed"
- Ensure 2FA is enabled on Gmail
- Use app password, not regular password
- Check email and password are correct

### "Connection Refused"
- Check firewall settings
- Try port 465 instead of 587
- Verify SMTP server settings

### "Emails Not Received"
- Check spam folder
- Verify recipient email address
- Check Gmail sending limits

## What This Fixes

**Before:** 
- Password reset emails only appear in terminal console
- Users never receive reset links
- Password reset functionality appears broken

**After:**
- Real emails sent to users' inboxes
- Users receive beautiful HTML emails with reset links
- Password reset works as expected

## Security Notes

- Never commit real email credentials to version control
- Use environment variables for production
- Consider professional email services for production (SendGrid, Mailgun, AWS SES)

---

**Need Help?** Check `EMAIL_SETUP_INSTRUCTIONS.md` for detailed instructions.
