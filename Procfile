web: gunicorn sweetbite_backend.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate --noinput && python manage.py collectstatic --noinput
worker: celery -A sweetbite_backend worker --loglevel=info
beat: celery -A sweetbite_backend beat --loglevel=info

