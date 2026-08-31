from flask_jwt_extended import JWTManager
from extensions import jwt

from models import User


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Load a `User` for the `current_user` proxy using the token identity.

    The token identity is expected to be the user's id (string or int).
    """
    identity = jwt_data.get("sub")
    if identity is None:
        return None
    try:
        return User.query.get(int(identity))
    except Exception:
        return None
