import os

from dotenv import load_dotenv
from flask import Flask
from flask_restful import Api

from controllers.auth_controller import LoginResource, RegisterResource, RefreshResource
from controllers.order_controller import OrderListResource, OrderResource
from controllers.produce_controller import ProduceListResource, ProduceResource
from extensions import cors, db, jwt, ma, migrate

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/agri_marketplace",
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")

    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    jwt.init_app(app)
    # Register auth helpers (user lookup) after JWT init
    import auth  # noqa: F401
    cors.init_app(app)

    api = Api(app)
    api.add_resource(RegisterResource, "/api/register")
    api.add_resource(LoginResource, "/api/login")
    api.add_resource(RefreshResource, "/api/refresh")
    api.add_resource(ProduceListResource, "/api/produce")
    api.add_resource(ProduceResource, "/api/produce/<int:produce_id>")
    api.add_resource(OrderListResource, "/api/orders")
    api.add_resource(OrderResource, "/api/orders/<int:order_id>")

    from models import Order, OrderItem, Produce, User  # noqa: F401

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)