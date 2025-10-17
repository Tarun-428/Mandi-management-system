from flask import Blueprint

farmers_bp = Blueprint('farmers', __name__)

from . import routes
