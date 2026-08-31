from flask import request
from flask_restful import Resource
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Produce, User
from schemas import produce_schema


class ProduceListResource(Resource):
    @jwt_required(optional=True)
    def get(self):
        query = Produce.query

        category = request.args.get("category")
        farmer_id = request.args.get("farmer_id")

        if category:
            query = query.filter(Produce.category.ilike(f"%{category}%"))
        if farmer_id:
            query = query.filter_by(farmer_id=int(farmer_id))

        # pagination
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 20))
        except ValueError:
            return {"error": "page and per_page must be integers"}, 400

        pagination = query.order_by(Produce.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        listings = pagination.items
        return {
            "items": produce_schema.dump(listings, many=True),
            "total": pagination.total,
            "pages": pagination.pages,
            "page": page,
            "per_page": per_page,
        }, 200

    @jwt_required()
    def post(self):
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get_or_404(current_user_id)

        if current_user.role != "farmer":
            return {"error": "Only farmers can create produce listings"}, 403

        data = request.get_json() or {}
        required = ("name", "category", "price_per_unit", "unit", "quantity_available")
        missing = [field for field in required if data.get(field) is None]
        if missing:
            return {"error": f"Missing fields: {', '.join(missing)}"}, 400

        produce = Produce(
            farmer_id=current_user.id,
            name=data["name"],
            category=data["category"],
            price_per_unit=float(data["price_per_unit"]),
            unit=data["unit"],
            quantity_available=float(data["quantity_available"]),
            description=data.get("description"),
            image_url=data.get("image_url"),
        )

        db.session.add(produce)
        db.session.commit()
        return produce_schema.dump(produce), 201


class ProduceResource(Resource):
    @jwt_required(optional=True)
    def get(self, produce_id):
        produce = Produce.query.get_or_404(produce_id)
        return produce_schema.dump(produce), 200

    @jwt_required()
    def put(self, produce_id):
        current_user_id = int(get_jwt_identity())
        produce = Produce.query.get_or_404(produce_id)

        if produce.farmer_id != current_user_id:
            return {"error": "You can only update your own listings"}, 403

        data = request.get_json() or {}

        for field in ("name", "category", "price_per_unit", "unit", "quantity_available"):
            if field in data:
                if field in ("price_per_unit", "quantity_available"):
                    setattr(produce, field, float(data[field]))
                else:
                    setattr(produce, field, data[field])

        if "description" in data:
            produce.description = data["description"]
        if "image_url" in data:
            produce.image_url = data["image_url"]

        db.session.commit()
        return produce_schema.dump(produce), 200

    @jwt_required()
    def delete(self, produce_id):
        current_user_id = int(get_jwt_identity())
        produce = Produce.query.get_or_404(produce_id)

        if produce.farmer_id != current_user_id:
            return {"error": "You can only delete your own listings"}, 403

        db.session.delete(produce)
        db.session.commit()
        return {"message": "Listing deleted"}, 200
