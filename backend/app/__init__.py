from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from .models.models import db
import os

bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mandi.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'jwt-secret-key-change-in-production')
    
    CORS(app)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    from .auth import auth_bp
    from .bills import bills_bp
    from .merchants import merchants_bp
    from .farmers import farmers_bp
    from .income import income_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(bills_bp, url_prefix='/api/bills')
    app.register_blueprint(merchants_bp, url_prefix='/api/merchants')
    app.register_blueprint(farmers_bp, url_prefix='/api/farmers')
    app.register_blueprint(income_bp, url_prefix='/api/income')
    
    with app.app_context():
        db.create_all()
    
    return app
