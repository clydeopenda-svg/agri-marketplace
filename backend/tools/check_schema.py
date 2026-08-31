"""Inspect SQLAlchemy models and the connected database to report mismatches.

Run after activating your venv and configuring `DATABASE_URL` (or using default).

Usage:
    source venv/bin/activate
    python tools/check_schema.py

This prints declared model tables and columns and the actual database tables/columns.
"""
from pprint import pprint
from sqlalchemy import inspect

import os
import sys

# Ensure project root is on sys.path so `import main` works when running the script
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# ensure we can import app and models
try:
    from main import create_app
    from extensions import db
except Exception as e:
    print("Error importing application modules:", e)
    print("Make sure you're running this script from the backend folder and that venv is activated.")
    raise


def main():
    app = create_app()
    with app.app_context():
        inspector = inspect(db.engine)

        db_tables = inspector.get_table_names()
        print("\nDatabase tables:")
        pprint(db_tables)

        # import model classes
        from models import User, Produce, Order, OrderItem
        from models.listing import Listing

        model_classes = [User, Produce, Listing, Order, OrderItem]

        print("\nDeclared models and their columns:")
        for m in model_classes:
            try:
                tbl = m.__tablename__
            except Exception:
                tbl = getattr(m, "__name__", str(m))
            cols = [c.name for c in m.__table__.columns]
            print(f"\nModel: {m.__name__} -> table: {tbl}")
            print("  columns:")
            for c in cols:
                print(f"   - {c}")

            if tbl not in db_tables:
                print(f"  -> WARNING: table '{tbl}' not found in database")
            else:
                db_cols = [c['name'] for c in inspector.get_columns(tbl)]
                missing = set(cols) - set(db_cols)
                extra = set(db_cols) - set(cols)
                if missing:
                    print(f"  -> MISSING columns in DB: {sorted(missing)}")
                if extra:
                    print(f"  -> EXTRA columns in DB: {sorted(extra)}")


if __name__ == "__main__":
    main()
