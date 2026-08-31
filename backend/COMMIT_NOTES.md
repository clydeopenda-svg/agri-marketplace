Commit notes for recent changes
================================

Run these commands from the `backend` folder to create the commits locally.

1) Remove duplicate files and fix schema nesting
------------------------------------------------
git add -A
git commit -m "chore: remove duplicate modules and fix Marshmallow nested schemas"

Files changed:
- Removed duplicate controllers/auth-controller.py
- Removed duplicate models/user.py
- Updated schemas.py to instantiate nested schemas

2) Add JWT user loader and register it
--------------------------------------
git add auth.py main.py
git commit -m "feat(auth): add JWT user lookup loader and register in main.py"

3) Add listings backref and pagination for produce
--------------------------------------------------
git add models/__init__.py controllers/produce_controller.py
git commit -m "feat(listings): add listings relationship to User and paginate produce listings"

4) Protect listing create/delete with authentication
---------------------------------------------------
git add controllers/listing_controller.py
git commit -m "feat(listings): require authenticated farmer for create/delete and enforce ownership"

5) Update order endpoints and make order creation transactional
---------------------------------------------------------------
git add controllers/order_controller.py
git commit -m "feat(orders): add pagination and transactional order creation with validation"

6) Wire frontend (client) for auth, paginated orders, and placing orders
-------------------------------------------------------------------------
git add agri-marketplace/client/src/api.js agri-marketplace/client/src/App.jsx
git commit -m "feat(client): add API helpers and basic UI to login, fetch paginated orders, and place demo order"

7) Frontend: add produce listing, cart and create-listing UI
----------------------------------------------------------
git add agri-marketplace/client/src/api.js agri-marketplace/client/src/App.jsx
git commit -m "feat(client): add produce listing, cart ordering and create-listing UI"

8) Add seed script for demo data
--------------------------------
git add scripts/seed.py
git commit -m "chore(seed): add demo seed script for farmer, buyer and produce"

Notes and next steps
--------------------
- I could not run `flask db migrate`/`flask db upgrade` or start the server from this environment. Run these locally after activating your venv.

Suggested commands to run before testing locally:
```bash
source venv/bin/activate
export FLASK_APP=main.py
flask db migrate -m "sync models after cleanup"
flask db upgrade
python main.py
```

If you want, I can also prepare a shell script that runs the `git commit` sequence above automatically (it will stop if there are conflicts). Tell me if you'd like that.
