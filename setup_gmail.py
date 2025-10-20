#!/usr/bin/env python3
"""
Quick Gmail Setup for SweetBite Password Reset
This script will help you configure your own Gmail account for sending password reset emails.
"""

import os
import sys

def main():
    print("🍰 SweetBite Gmail Setup for Password Reset")
    print("=" * 50)
    print()
    
    print("The password reset is currently working with console emails.")
    print("To send REAL emails to users, you need to configure your Gmail account.")
    print()
    
    print("📋 Step-by-Step Setup:")
    print()
    print("1. Go to https://myaccount.google.com/security")
    print("2. Enable '2-Step Verification' if not already enabled")
    print("3. Go to 'App passwords' under 2-Step Verification")
    print("4. Select 'Mail' and create a new app password")
    print("5. Copy the 16-character password (e.g., 'abcd efgh ijkl mnop')")
    print()
    
    # Get user's Gmail credentials
    email = input("Enter your Gmail address (e.g., yourname@gmail.com): ").strip()
    if not email:
        print("❌ Email address is required!")
        return
    
    print()
    print("Enter the 16-character app password from step 5:")
    app_password = input("App password: ").strip()
    if not app_password:
        print("❌ App password is required!")
        return
    
    # Update settings.py
    settings_path = 'backend/sweetbite_backend/settings.py'
    
    try:
        with open(settings_path, 'r') as f:
            content = f.read()
        
        # Replace the email settings
        new_email_settings = f"""# Email settings - Real email sending via Gmail SMTP
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = '{email}'
EMAIL_HOST_PASSWORD = '{app_password}'
DEFAULT_FROM_EMAIL = 'SweetBite Bakery <{email}>'
SERVER_EMAIL = '{email}'"""
        
        # Find and replace the email settings section
        import re
        pattern = r'# Email settings.*?(?=\n# [A-Z]|\n[A-Z]|\Z)'
        content = re.sub(pattern, new_email_settings, content, flags=re.DOTALL)
        
        with open(settings_path, 'w') as f:
            f.write(content)
        
        print(f"✅ Updated {settings_path} with your Gmail credentials")
        print()
        print("🔄 Next steps:")
        print("1. Restart your Django server (Ctrl+C then npm run dev)")
        print("2. Test password reset at /forgot-password")
        print("3. Check your email inbox for the reset link")
        print()
        print("⚠️  Important:")
        print("- Never share your app password")
        print("- Keep your Gmail account secure")
        print("- The app password is only for this application")
        
    except Exception as e:
        print(f"❌ Failed to update settings: {str(e)}")
        print()
        print("Manual setup:")
        print("1. Open backend/sweetbite_backend/settings.py")
        print("2. Replace the email settings with:")
        print(f"   EMAIL_HOST_USER = '{email}'")
        print(f"   EMAIL_HOST_PASSWORD = '{app_password}'")
        print(f"   DEFAULT_FROM_EMAIL = 'SweetBite Bakery <{email}>'")

if __name__ == "__main__":
    main()
