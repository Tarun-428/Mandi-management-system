from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.models import db, Bill
from sqlalchemy import func
from datetime import datetime
from . import farmers_bp

@farmers_bp.route('/', methods=['GET'])
@jwt_required()
def get_farmers():
    try:
        user_id = get_jwt_identity()
        date_str = request.args.get('date')
        
        if date_str:
            filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            bills = Bill.query.filter(
                Bill.user_id == user_id,
                func.date(Bill.created_at) == filter_date
            ).all()
        else:
            bills = Bill.query.filter(
                Bill.user_id == user_id,
                func.date(Bill.created_at) == datetime.utcnow().date()
            ).all()
        
        farmers_data = []
        total_farmers = len(bills)
        total_bags = 0
        total_weight = 0
        total_amount = 0
        
        for bill in bills:
            vegetables = [item.vegetable for item in bill.items]
            vegetables_str = ', '.join(vegetables)
            
            farmers_data.append({
                'id': bill.id,
                'bill_number': bill.bill_number,
                'farmer_name': bill.farmer_name,
                'farmer_mobile': bill.farmer_mobile,
                'village_name': bill.village_name,
                'vegetables': vegetables_str,
                'total_bags': bill.total_bags,
                'total_weight': bill.total_weight,
                'grand_total': bill.grand_total,
                'created_at': bill.created_at.isoformat() if bill.created_at else None
            })
            
            total_bags += bill.total_bags
            total_weight += bill.total_weight
            total_amount += bill.grand_total
        
        return jsonify({
            'farmers': farmers_data,
            'summary': {
                'total_farmers': total_farmers,
                'total_bags': total_bags,
                'total_weight': total_weight,
                'total_amount': total_amount
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500
