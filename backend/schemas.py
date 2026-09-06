from marshmallow import fields
from extensions import ma
from models import User, Produce, Order, OrderItem


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_fk = True
        ordered = True

    password_hash = fields.String(load_only=True)


class ProduceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Produce
        load_instance = True
        include_fk = True
        ordered = True

    farmer = ma.Nested(lambda: UserSchema(only=("id", "name", "email", "role", "location", "phone")))
    order_items = ma.Nested(lambda: OrderItemSchema(), many=True, exclude=("produce", "order"))


class OrderItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = OrderItem
        load_instance = True
        include_fk = True
        ordered = True

    produce = ma.Nested(lambda: ProduceSchema(exclude=("farmer", "order_items")))
    order = ma.Nested(lambda: OrderSchema(exclude=("items", "buyer")))


class OrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Order
        load_instance = True
        include_fk = True
        ordered = True

    buyer = ma.Nested(lambda: UserSchema(only=("id", "name", "email", "role", "location", "phone")))
    items = ma.Nested(lambda: OrderItemSchema(exclude=("order", "produce")), many=True)


user_schema = UserSchema()
produce_schema = ProduceSchema()
order_item_schema = OrderItemSchema()
order_schema = OrderSchema()
