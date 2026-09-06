from datetime import datetime, timezone
from extensions import db, ma
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "farmer" or "buyer"
    location = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    produce_listings = db.relationship(
        "Produce", back_populates="farmer", cascade="all, delete-orphan"
    )
    orders_placed = db.relationship(
        "Order", back_populates="buyer", cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Produce(db.Model):
    __tablename__ = "produce"

    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))  # e.g. vegetables, fruits, grains
    price_per_unit = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default="kg")  # kg, crate, bag, etc.
    quantity_available = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    farmer = db.relationship("User", back_populates="produce_listings")
    order_items = db.relationship(
        "OrderItem", back_populates="produce", cascade="all, delete-orphan"
    )


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending, confirmed, delivered, cancelled
    total_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    buyer = db.relationship("User", back_populates="orders_placed")
    items = db.relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(db.Model):
    """Join table: one order can contain multiple produce items."""
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    produce_id = db.Column(db.Integer, db.ForeignKey("produce.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False)  # snapshot, in case price changes later

    order = db.relationship("Order", back_populates="items")
    produce = db.relationship("Produce", back_populates="order_items")
