# 📧 Email Setup Instructions for SweetBite

## Gmail SMTP Configuration

To enable real email sending for password reset functionality, you need to configure Gmail SMTP settings.

### Step 1: Create a Gmail Account for SweetBite

1. Go to [Gmail](https://gmail.com)
2. Create a new Gmail account: `sweetbite.bakery@gmail.com` (or your preferred email)
3. Complete the account setup

### Step 2: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Follow the setup process

### Step 3: Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Enter "SweetBite Django App"
5. Copy the generated 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 4: Update Django Settings

Update `backend/sweetbite_backend/settings.py`:

```python
# Email settings - Real email sending via Gmail SMTP
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'sweetbite.bakery@gmail.com'  # Your Gmail address
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # Your app password
DEFAULT_FROM_EMAIL = 'SweetBite Bakery <sweetbite.bakery@gmail.com>'
SERVER_EMAIL = 'sweetbite.bakery@gmail.com'
```

### Step 5: Test Email Sending

1. Restart your Django server
2. Go to `/forgot-password`
3. Enter a valid email address
4. Check if the email is received

## Alternative Email Providers

### Outlook/Hotmail SMTP
```python
EMAIL_HOST = 'smtp-mail.outlook.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@outlook.com'
EMAIL_HOST_PASSWORD = 'your-password'
```

### Yahoo SMTP
```python
EMAIL_HOST = 'smtp.mail.yahoo.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@yahoo.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
```

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Ensure 2FA is enabled
   - Use app password, not regular password
   - Check email and password are correct

2. **Connection Refused**
   - Check firewall settings
   - Verify SMTP server and port
   - Try different port (465 for SSL)

3. **Emails Not Received**
   - Check spam folder
   - Verify recipient email address
   - Check Gmail sending limits

### Testing Commands:

```bash
# Test email configuration
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'sweetbite.bakery@gmail.com', ['test@example.com'])
```

## Security Notes

- Never commit real email credentials to version control
- Use environment variables for production
- Consider using email services like SendGrid, Mailgun, or AWS SES for production
- Regularly rotate app passwords

## Environment Variables (Recommended for Production)

Create a `.env` file:
```
EMAIL_HOST_USER=sweetbite.bakery@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=SweetBite Bakery <sweetbite.bakery@gmail.com>
```

Then update settings.py:
```python
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')
```
