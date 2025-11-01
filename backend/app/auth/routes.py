from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models.models import db, User
from .. import bcrypt
from . import auth_bp
from sqlalchemy.exc import IntegrityError
from datetime import timedelta

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
        
        partners = data.get('partners', [])
        if len(partners) > 10:
            return jsonify({'message': 'Maximum 10 partners allowed'}), 400
        
        user = User(
            company_name=data.get('company_name'),
            email=data.get('email'),
            mobile=data.get('mobile'),
            address=data.get('address'),
            password=hashed_password,
            partners=partners
        )
        
        db.session.add(user)
        db.session.commit()
        
        
        
        return jsonify({
            'message': 'User registered successfully',
            'redirect_url' : '/login',
            'user': user.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'User already exists'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        user = User.query.filter_by(email=data.get('email')).first()
        
        if not user or not bcrypt.check_password_hash(user.password, data.get('password')):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=str(user.id))
        # access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=8))

        
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        if data.get('company_name'):
            user.company_name = data.get('company_name')
        if data.get('email'):
            existing_user = User.query.filter_by(email=data.get('email')).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'message': 'Email already in use'}), 400
            user.email = data.get('email')
        if data.get('mobile'):
            user.mobile = data.get('mobile')
        if data.get('address'):
            user.address = data.get('address')
        if data.get('password'):
            user.password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
        if 'partners' in data:
            partners = data.get('partners', [])
            if len(partners) > 10:
                return jsonify({'message': 'Maximum 10 partners allowed'}), 400
            user.partners = partners
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
