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
    app.url_map.strict_slashes = False 
    
    # 🔐 SECURITY KEYS
    app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key-change-in-production')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 18000  # Optional: token expires in 5 hour

    # ✅ PostgreSQL Database Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:tarun@localhost:5432/mandi_db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 10,
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'max_overflow': 20,
        'pool_timeout': 30,
    }

    # ✅ JWT CONFIGURATION
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_IDENTITY_CLAIM'] = 'sub'

    # ✅ ENABLE CORS FOR FRONTEND
    frontend_urls = os.environ.get('FRONTEND_URLS', 'http://localhost:5173,http://localhost:5000').split(',')
    CORS(
        app,
        resources={r"/api/*": {"origins": frontend_urls}},
        supports_credentials=True,
        expose_headers=["Content-Type", "Authorization"]
    )

    # ✅ Initialize Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # ✅ Register Blueprints
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
