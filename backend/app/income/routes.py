from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.models import db, AdhatiyaIncome, Merchant
from sqlalchemy import func
from datetime import datetime
from . import income_bp

@income_bp.route('/', methods=['GET'])
@jwt_required()
def get_income():
    try:
        user_id = get_jwt_identity()
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Get all merchant IDs for the current user
        merchant_ids = [m.id for m in Merchant.query.filter_by(user_id=user_id).all()]
        
        query = AdhatiyaIncome.query.filter(AdhatiyaIncome.merchant_id.in_(merchant_ids))
        
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(AdhatiyaIncome.date >= start)
        
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(AdhatiyaIncome.date <= end)
        
        incomes = query.order_by(AdhatiyaIncome.date.desc()).all()
        
        income_data = []
        total_income = 0
        
        for income in incomes:
            income_data.append(income.to_dict())
            total_income += income.commission_amount
        
        return jsonify({
            'incomes': income_data,
            'total_income': total_income
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@income_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_income_summary():
    try:
        user_id = get_jwt_identity()
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Get all merchant IDs for the current user
        merchant_ids = [m.id for m in Merchant.query.filter_by(user_id=user_id).all()]
        
        query = db.session.query(
            AdhatiyaIncome.date,
            AdhatiyaIncome.merchant_id,
            func.sum(AdhatiyaIncome.trade_amount).label('total_trade'),
            func.sum(AdhatiyaIncome.commission_amount).label('total_commission')
        ).filter(AdhatiyaIncome.merchant_id.in_(merchant_ids))
        
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(AdhatiyaIncome.date >= start)
        
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(AdhatiyaIncome.date <= end)
        
        results = query.group_by(AdhatiyaIncome.date, AdhatiyaIncome.merchant_id).order_by(AdhatiyaIncome.date.desc()).all()
        
        summary_data = []
        grand_total_income = 0
        
        for result in results:
            merchant = Merchant.query.get(result.merchant_id)
            summary_data.append({
                'date': result.date.isoformat() if result.date else None,
                'merchant_id': result.merchant_id,
                'merchant_name': merchant.name if merchant else None,
                'total_trade': float(result.total_trade),
                'commission': float(result.total_commission)
            })
            grand_total_income += float(result.total_commission)
        
        return jsonify({
            'summary': summary_data,
            'grand_total_income': grand_total_income
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500
