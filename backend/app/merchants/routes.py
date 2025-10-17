from flask import request, jsonify
from flask_jwt_extended import jwt_required
from ..models.models import db, Merchant, Transaction, BillItem, AdhatiyaIncome
from sqlalchemy import func, desc
from datetime import datetime
from . import merchants_bp

@merchants_bp.route('/', methods=['GET'])
@jwt_required()
def get_merchants():
    try:
        merchants = Merchant.query.all()
        return jsonify([merchant.to_dict() for merchant in merchants]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/', methods=['POST'])
@jwt_required()
def create_merchant():
    try:
        data = request.get_json()
        
        merchant = Merchant(
            name=data.get('name'),
            business_name=data.get('business_name'),
            mobile=data.get('mobile'),
            opening_balance=float(data.get('opening_balance', 0)),
            current_balance=float(data.get('opening_balance', 0))
        )
        
        db.session.add(merchant)
        db.session.commit()
        
        return jsonify({
            'message': 'Merchant created successfully',
            'merchant': merchant.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>', methods=['GET'])
@jwt_required()
def get_merchant(merchant_id):
    try:
        merchant = Merchant.query.get(merchant_id)
        
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404
        
        bill_items = BillItem.query.filter_by(merchant_id=merchant_id).all()
        transactions = Transaction.query.filter_by(merchant_id=merchant_id).order_by(desc(Transaction.created_at)).all()
        
        trades = []
        for item in bill_items:
            trades.append({
                'id': item.id,
                'bill_id': item.bill_id,
                'bill_number': item.bill.bill_number if item.bill else None,
                'date': item.created_at.isoformat() if item.created_at else None,
                'vegetable': item.vegetable,
                'quantity': item.quantity,
                'bags': item.bags,
                'weight': item.weight,
                'rate': item.rate,
                'amount': item.amount,
                'farmer_name': item.bill.farmer_name if item.bill else None
            })
        
        total_trade = sum(item.amount for item in bill_items)
        total_credit = sum(t.amount for t in transactions if t.transaction_type == 'credit')
        
        return jsonify({
            'merchant': merchant.to_dict(),
            'trades': trades,
            'transactions': [t.to_dict() for t in transactions],
            'total_trade': total_trade,
            'total_credit': total_credit,
            'balance': total_trade - total_credit
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>', methods=['PUT'])
@jwt_required()
def update_merchant(merchant_id):
    try:
        merchant = Merchant.query.get(merchant_id)
        
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404
        
        data = request.get_json()
        
        if data.get('name'):
            merchant.name = data.get('name')
        if data.get('business_name') is not None:
            merchant.business_name = data.get('business_name')
        if data.get('mobile'):
            merchant.mobile = data.get('mobile')
        if 'opening_balance' in data:
            merchant.opening_balance = float(data.get('opening_balance'))
        
        db.session.commit()
        
        return jsonify({
            'message': 'Merchant updated successfully',
            'merchant': merchant.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>', methods=['DELETE'])
@jwt_required()
def delete_merchant(merchant_id):
    try:
        merchant = Merchant.query.get(merchant_id)
        
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404
        
        db.session.delete(merchant)
        db.session.commit()
        
        return jsonify({'message': 'Merchant deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>/credit', methods=['POST'])
@jwt_required()
def add_credit(merchant_id):
    try:
        merchant = Merchant.query.get(merchant_id)
        
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404
        
        data = request.get_json()
        
        transaction = Transaction(
            merchant_id=merchant_id,
            amount=float(data.get('amount')),
            payment_mode=data.get('payment_mode'),
            transaction_type='credit',
            description=data.get('description', '')
        )
        
        merchant.current_balance -= float(data.get('amount'))
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Credit entry added successfully',
            'transaction': transaction.to_dict(),
            'merchant': merchant.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_merchant_summary():
    try:
        date_str = request.args.get('date')
        
        if date_str:
            filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            bill_items = BillItem.query.filter(func.date(BillItem.created_at) == filter_date).all()
        else:
            bill_items = BillItem.query.filter(func.date(BillItem.created_at) == datetime.utcnow().date()).all()
        
        merchant_data = {}
        
        for item in bill_items:
            if item.merchant_id:
                if item.merchant_id not in merchant_data:
                    merchant = Merchant.query.get(item.merchant_id)
                    merchant_data[item.merchant_id] = {
                        'merchant': merchant.to_dict() if merchant else None,
                        'items': [],
                        'subtotal': 0,
                        'total_bags': 0,
                        'total_weight': 0
                    }
                
                merchant_data[item.merchant_id]['items'].append(item.to_dict())
                merchant_data[item.merchant_id]['subtotal'] += item.amount
                merchant_data[item.merchant_id]['total_bags'] += item.bags
                merchant_data[item.merchant_id]['total_weight'] += item.weight
        
        summary = []
        grand_total = 0
        total_commission = 0
        total_bags = 0
        total_weight = 0
        
        for merchant_id, data in merchant_data.items():
            commission = round((data['subtotal'] * 2) / 100, 2)
            summary.append({
                'merchant': data['merchant'],
                'items': data['items'],
                'subtotal': data['subtotal'],
                'total_bags': data['total_bags'],
                'total_weight': data['total_weight'],
                'commission': commission
            })
            grand_total += data['subtotal']
            total_commission += commission
            total_bags += data['total_bags']
            total_weight += data['total_weight']
        
        return jsonify({
            'summary': summary,
            'grand_total': grand_total,
            'total_commission': total_commission,
            'total_bags': total_bags,
            'total_weight': total_weight
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500
