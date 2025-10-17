from flask import request, jsonify
from flask_jwt_extended import jwt_required
from ..models.models import db, Bill, BillItem, Merchant, AdhatiyaIncome
from ..utils.helpers import generate_bill_number, calculate_bill_totals, calculate_adhatiya
from datetime import datetime
from sqlalchemy import func, or_
from . import bills_bp

@bills_bp.route('/', methods=['GET'])
@jwt_required()
def get_bills():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        farmer_name = request.args.get('farmer_name')
        village_name = request.args.get('village_name')
        merchant_id = request.args.get('merchant_id')
        
        query = Bill.query
        
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(Bill.created_at >= start)
        
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(Bill.created_at <= end)
        
        if farmer_name:
            query = query.filter(Bill.farmer_name.ilike(f'%{farmer_name}%'))
        
        if village_name:
            query = query.filter(Bill.village_name.ilike(f'%{village_name}%'))
        
        if merchant_id:
            query = query.filter(Bill.merchant_id == merchant_id)
        
        bills = query.order_by(Bill.created_at.desc()).all()
        
        return jsonify([bill.to_dict() for bill in bills]), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bills_bp.route('/', methods=['POST'])
@jwt_required()
def create_bill():
    try:
        data = request.get_json()
        
        bill_number = generate_bill_number()
        
        items_data = data.get('items', [])
        himmali = float(data.get('himmali', 0))
        motor_bhada = float(data.get('motor_bhada', 0))
        other_charges = float(data.get('other_charges', 0))
        
        totals = calculate_bill_totals(items_data, himmali, motor_bhada, other_charges)
        
        bill = Bill(
            bill_number=bill_number,
            farmer_name=data.get('farmer_name'),
            farmer_mobile=data.get('farmer_mobile'),
            village_name=data.get('village_name'),
            merchant_id=data.get('merchant_id'),
            total_bags=totals['total_bags'],
            total_quantity=totals['total_quantity'],
            total_weight=totals['total_weight'],
            himmali=himmali,
            motor_bhada=motor_bhada,
            other_charges=other_charges,
            subtotal=totals['subtotal'],
            grand_total=totals['grand_total']
        )
        
        db.session.add(bill)
        db.session.flush()
        
        for item_data in items_data:
            item = BillItem(
                bill_id=bill.id,
                vegetable=item_data.get('vegetable'),
                quantity=float(item_data.get('quantity')),
                bags=int(item_data.get('bags')),
                weight=float(item_data.get('weight')),
                rate=float(item_data.get('rate')),
                amount=float(item_data.get('amount')),
                merchant_id=item_data.get('merchant_id')
            )
            db.session.add(item)
            
            if item.merchant_id:
                merchant = Merchant.query.get(item.merchant_id)
                if merchant:
                    merchant.current_balance += item.amount
                    
                    commission_amount = calculate_adhatiya(item.amount)
                    adhatiya = AdhatiyaIncome(
                        bill_id=bill.id,
                        merchant_id=item.merchant_id,
                        trade_amount=item.amount,
                        commission_rate=2.0,
                        commission_amount=commission_amount,
                        date=datetime.utcnow().date()
                    )
                    db.session.add(adhatiya)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Bill created successfully',
            'bill': bill.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bills_bp.route('/<int:bill_id>', methods=['GET'])
@jwt_required()
def get_bill(bill_id):
    try:
        bill = Bill.query.get(bill_id)
        
        if not bill:
            return jsonify({'message': 'Bill not found'}), 404
        
        return jsonify(bill.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bills_bp.route('/<int:bill_id>', methods=['PUT'])
@jwt_required()
def update_bill(bill_id):
    try:
        bill = Bill.query.get(bill_id)
        
        if not bill:
            return jsonify({'message': 'Bill not found'}), 404
        
        data = request.get_json()
        
        old_items = BillItem.query.filter_by(bill_id=bill_id).all()
        for item in old_items:
            if item.merchant_id:
                merchant = Merchant.query.get(item.merchant_id)
                if merchant:
                    merchant.current_balance -= item.amount
            db.session.delete(item)
        
        AdhatiyaIncome.query.filter_by(bill_id=bill_id).delete()
        
        bill.farmer_name = data.get('farmer_name', bill.farmer_name)
        bill.farmer_mobile = data.get('farmer_mobile', bill.farmer_mobile)
        bill.village_name = data.get('village_name', bill.village_name)
        bill.merchant_id = data.get('merchant_id', bill.merchant_id)
        
        items_data = data.get('items', [])
        himmali = float(data.get('himmali', 0))
        motor_bhada = float(data.get('motor_bhada', 0))
        other_charges = float(data.get('other_charges', 0))
        
        totals = calculate_bill_totals(items_data, himmali, motor_bhada, other_charges)
        
        bill.total_bags = totals['total_bags']
        bill.total_quantity = totals['total_quantity']
        bill.total_weight = totals['total_weight']
        bill.himmali = himmali
        bill.motor_bhada = motor_bhada
        bill.other_charges = other_charges
        bill.subtotal = totals['subtotal']
        bill.grand_total = totals['grand_total']
        
        for item_data in items_data:
            item = BillItem(
                bill_id=bill.id,
                vegetable=item_data.get('vegetable'),
                quantity=float(item_data.get('quantity')),
                bags=int(item_data.get('bags')),
                weight=float(item_data.get('weight')),
                rate=float(item_data.get('rate')),
                amount=float(item_data.get('amount')),
                merchant_id=item_data.get('merchant_id')
            )
            db.session.add(item)
            
            if item.merchant_id:
                merchant = Merchant.query.get(item.merchant_id)
                if merchant:
                    merchant.current_balance += item.amount
                    
                    commission_amount = calculate_adhatiya(item.amount)
                    adhatiya = AdhatiyaIncome(
                        bill_id=bill.id,
                        merchant_id=item.merchant_id,
                        trade_amount=item.amount,
                        commission_rate=2.0,
                        commission_amount=commission_amount,
                        date=datetime.utcnow().date()
                    )
                    db.session.add(adhatiya)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Bill updated successfully',
            'bill': bill.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bills_bp.route('/<int:bill_id>', methods=['DELETE'])
@jwt_required()
def delete_bill(bill_id):
    try:
        bill = Bill.query.get(bill_id)
        
        if not bill:
            return jsonify({'message': 'Bill not found'}), 404
        
        items = BillItem.query.filter_by(bill_id=bill_id).all()
        for item in items:
            if item.merchant_id:
                merchant = Merchant.query.get(item.merchant_id)
                if merchant:
                    merchant.current_balance -= item.amount
        
        AdhatiyaIncome.query.filter_by(bill_id=bill_id).delete()
        
        db.session.delete(bill)
        db.session.commit()
        
        return jsonify({'message': 'Bill deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
