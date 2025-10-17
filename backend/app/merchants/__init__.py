from flask import Blueprint

merchants_bp = Blueprint('merchants', __name__)

from . import routes
