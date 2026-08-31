"""Seed script to create a demo farmer, buyer and a produce listing.

Run with:
  source venv/bin/activate
  python scripts/seed.py
"""
import os
import sys

# Ensure project root is on sys.path when running this script directly
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from main import create_app
from extensions import db
from models import User, Produce


def seed():
    app = create_app()
    with app.app_context():
        # create demo users
        if not User.query.filter_by(email='farmer@example.com').first():
            farmer = User(name='Demo Farmer', email='farmer@example.com', role='farmer', location='County', phone='0700000000')
            farmer.set_password('password')
            db.session.add(farmer)
        else:
            farmer = User.query.filter_by(email='farmer@example.com').first()

        if not User.query.filter_by(email='buyer@example.com').first():
            buyer = User(name='Demo Buyer', email='buyer@example.com', role='buyer', location='City', phone='0700000001')
            buyer.set_password('password')
            db.session.add(buyer)

        db.session.commit()

        # create a produce item
        if not Produce.query.first():
            p = Produce(farmer_id=farmer.id, name='Tomatoes', category='Vegetables', price_per_unit=1.5, unit='kg', quantity_available=100, description='Fresh tomatoes')
            db.session.add(p)
            db.session.commit()
            print('Seeded produce id', p.id)
        else:
            print('Produce already exists')

        print('Seed complete. Farmer: farmer@example.com / password, Buyer: buyer@example.com / password')


if __name__ == '__main__':
    seed()
