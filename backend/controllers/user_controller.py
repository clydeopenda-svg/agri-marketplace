from flask import request
from flask_restful import Resource
from extensions import db
from models.user import User


class UserListResource(Resource):
    def post(self):
        data = request.get_json()

        required = ["name", "phone", "password", "role", "county"]
        missing = [field for field in required if field not in data]
        if missing:
            return {"error": f"Missing fields: {', '.join(missing)}"}, 400

        if User.query.filter_by(phone=data["phone"]).first():
            return {"error": "Phone number already registered"}, 409

        user = User(
            name=data["name"],
            phone=data["phone"],
            role=data["role"],
            county=data["county"],
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return user.to_dict(), 201


class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(phone=data.get("phone")).first()

        if not user or not user.check_password(data.get("password", "")):
            return {"error": "Invalid phone or password"}, 401

        # NOTE: swap this for a real JWT (flask-jwt-extended) once the core flow works
        return {"user": user.to_dict()}, 200
