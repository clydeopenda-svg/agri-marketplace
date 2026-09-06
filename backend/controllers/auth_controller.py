from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

from extensions import db
from models import User
from schemas import user_schema


class RegisterResource(Resource):
    def post(self):
        data = request.get_json() or {}

        required = ("name", "email", "password", "role")
        missing = [field for field in required if not data.get(field)]
        if missing:
            return {"error": f"Missing fields: {', '.join(missing)}"}, 400

        role = data["role"]
        if role not in ("farmer", "buyer"):
            return {"error": "Role must be 'farmer' or 'buyer'"}, 400

        if User.query.filter_by(email=data["email"]).first():
            return {"error": "Email already registered"}, 409

        user = User(
            name=data["name"],
            email=data["email"],
            role=role,
            location=data.get("location"),
            phone=data.get("phone"),
        )
        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        token = create_access_token(identity=str(user.id))
        return {
            "user": user_schema.dump(user),
            "access_token": token,
            "refresh_token": create_refresh_token(identity=str(user.id)),
        }, 201


class LoginResource(Resource):
    def post(self):
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return {"error": "Email and password required"}, 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {"error": "Invalid email or password"}, 401

        token = create_access_token(identity=str(user.id))
        return {
            "user": user_schema.dump(user),
            "access_token": token,
            "refresh_token": create_refresh_token(identity=str(user.id)),
        }, 200


class RefreshResource(Resource):
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()
        access = create_access_token(identity=identity)
        return {"access_token": access}, 200
