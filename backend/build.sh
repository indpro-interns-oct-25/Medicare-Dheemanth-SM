#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Create logs directory if it doesn't exist
mkdir -p logs

# Run collectstatic
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate --no-input
