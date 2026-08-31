from flask import request
from flask_restful import Resource
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Order, OrderItem, Produce, User
from schemas import order_schema


class OrderListResource(Resource):
    @jwt_required()
    def get(self):
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get_or_404(current_user_id)
        # pagination params
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 20))
        except ValueError:
            return {"error": "page and per_page must be integers"}, 400

        if current_user.role == "buyer":
            query = Order.query.filter_by(buyer_id=current_user.id)
        else:
            # farmer: orders where any order item references this farmer's produce
            query = (
                Order.query.join(OrderItem).join(Produce).filter(Produce.farmer_id == current_user.id).distinct()
            )

        pagination = query.order_by(Order.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        orders = pagination.items
        return {
            "items": order_schema.dump(orders, many=True),
            "total": pagination.total,
            "pages": pagination.pages,
            "page": page,
            "per_page": per_page,
        }, 200

    @jwt_required()
    def post(self):
        current_user_id = int(get_jwt_identity())
        buyer = User.query.get_or_404(current_user_id)

        if buyer.role != "buyer":
            return {"error": "Only buyers can create orders"}, 403

        data = request.get_json() or {}
        items = data.get("items")
        if not items:
            return {"error": "Order must include at least one item"}, 400
        # create order transactionally; rollback on any validation error
        try:
            order = Order(buyer_id=buyer.id, status="pending", total_amount=0.0)
            total_amount = 0.0

            for item in items:
                produce_id = item.get("produce_id")
                produce = Produce.query.get(produce_id)
                if not produce:
                    raise ValueError(f"Produce item {produce_id} not found")

                try:
                    quantity = float(item.get("quantity", 0))
                except Exception:
                    raise ValueError("Order item quantity must be a number")

                if quantity <= 0:
                    raise ValueError("Order item quantity must be greater than zero")
                if quantity > produce.quantity_available:
                    raise ValueError(f"Not enough stock for produce {produce.name}")

                # reserve stock
                produce.quantity_available -= quantity
                total_amount += quantity * produce.price_per_unit

                order_item = OrderItem(
                    produce_id=produce.id,
                    quantity=quantity,
                    price_at_purchase=produce.price_per_unit,
                )
                order.items.append(order_item)

            order.total_amount = total_amount
            db.session.add(order)
            db.session.commit()
            return order_schema.dump(order), 201
        except ValueError as ve:
            db.session.rollback()
            return {"error": str(ve)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "Could not create order"}, 500


class OrderResource(Resource):
    @jwt_required()
    def get(self, order_id):
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get_or_404(current_user_id)
        order = Order.query.get_or_404(order_id)

        if current_user.role == "buyer" and order.buyer_id != current_user.id:
            return {"error": "You can only view your own orders"}, 403

        if current_user.role == "farmer":
            owns_listing = any(item.produce.farmer_id == current_user.id for item in order.items)
            if not owns_listing:
                return {"error": "You are not associated with this order"}, 403

        return order_schema.dump(order), 200

    @jwt_required()
    def patch(self, order_id):
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get_or_404(current_user_id)
        order = Order.query.get_or_404(order_id)
        data = request.get_json() or {}
        new_status = data.get("status")

        if not new_status:
            return {"error": "Missing status field"}, 400

        valid_statuses = ["pending", "confirmed", "delivered", "cancelled"]
        if new_status not in valid_statuses:
            return {"error": "Invalid status value"}, 400

        if current_user.role == "farmer":
            allowed = ["confirmed", "delivered", "cancelled"]
            if new_status not in allowed:
                return {"error": "Farmers can only confirm, deliver, or cancel an order"}, 403
            owns_listing = any(item.produce.farmer_id == current_user.id for item in order.items)
            if not owns_listing:
                return {"error": "You are not allowed to update this order"}, 403
        else:
            if order.buyer_id != current_user.id:
                return {"error": "You can only update your own orders"}, 403
            if new_status not in ["cancelled"]:
                return {"error": "Buyers can only cancel an order"}, 403

        order.status = new_status
        db.session.commit()
        return order_schema.dump(order), 200