from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.models import db, Merchant, Transaction, BillItem, Bill
from sqlalchemy import func, desc
from datetime import datetime
from . import merchants_bp

# -------------------- HELPER FUNCTIONS -------------------- #

def calculate_current_balance(merchant_id):
    """Calculates current balance for a merchant dynamically."""
    total_trade = db.session.query(func.sum(BillItem.amount)) \
        .filter_by(merchant_id=merchant_id).scalar() or 0
    total_credit = db.session.query(func.sum(Transaction.amount)) \
        .filter_by(merchant_id=merchant_id, transaction_type='credit').scalar() or 0
    return total_trade - total_credit

def update_merchant_current_balance(merchant_id):
    """Recalculate and update merchant's current balance in DB."""
    merchant = Merchant.query.get(merchant_id)
    if merchant:
        merchant.current_balance = calculate_current_balance(merchant_id)
        db.session.commit()

# -------------------- MERCHANT CRUD -------------------- #

@merchants_bp.route('/', methods=['GET'])
@jwt_required()
def get_merchants():
    try:
        user_id = get_jwt_identity()
        merchants = Merchant.query.filter_by(user_id=user_id).all()
        result = []
        for m in merchants:
            data = m.to_dict()
            data['current_balance'] = calculate_current_balance(m.id)
            result.append(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/', methods=['POST'])
@jwt_required()
def create_merchant():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        opening_balance = float(data.get('opening_balance', 0))

        merchant = Merchant(
            user_id=user_id,
            name=data.get('name'),
            business_name=data.get('business_name'),
            mobile=data.get('mobile'),
            opening_balance=opening_balance
        )
        db.session.add(merchant)
        db.session.flush()  # get merchant.id before commit

        if opening_balance > 0:
            opening_txn = Transaction(
                user_id=user_id,
                merchant_id=merchant.id,
                amount=opening_balance,
                payment_mode="Opening Balance",
                transaction_type="credit",
                description="Opening balance credited on merchant creation"
            )
            db.session.add(opening_txn)

        db.session.commit()

        update_merchant_current_balance(merchant.id)

        merchant_dict = merchant.to_dict()
        merchant_dict['current_balance'] = merchant.current_balance
        return jsonify({'message': 'Merchant created successfully', 'merchant': merchant_dict}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>', methods=['GET'])
@jwt_required()
def get_merchant(merchant_id):
    try:
        user_id = get_jwt_identity()

        # Fetch merchant for this user
        merchant = Merchant.query.filter_by(id=merchant_id, user_id=user_id).first()
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404

        # Fetch trades with related bill info
        trades_query = db.session.query(
            BillItem.id,
            BillItem.bags,
            BillItem.weight,
            BillItem.rate,
            BillItem.amount,
            BillItem.vegetable,
            Bill.created_at.label('date'),
            Bill.bill_number,
            Bill.farmer_name
        ).join(Bill, Bill.id == BillItem.bill_id) \
         .filter(BillItem.merchant_id == merchant_id, Bill.user_id == user_id) \
         .order_by(Bill.created_at.desc()) \
         .all()

        trades = [
            {
                'id': t.id,
                'bags': t.bags,
                'weight': t.weight,
                'rate': t.rate,
                'amount': t.amount,
                'vegetable': t.vegetable,
                'date': t.date,
                'bill_number': t.bill_number,
                'farmer_name': t.farmer_name
            }
            for t in trades_query
        ]

        # Fetch transactions for this merchant
        transactions = [
            t.to_dict() for t in Transaction.query.filter_by(merchant_id=merchant_id, user_id=user_id)
            .order_by(desc(Transaction.created_at))
            .all()
        ]

        # Calculate totals
        total_trade = sum(item['amount'] for item in trades)
        total_credit = sum(t['amount'] for t in transactions if t['transaction_type'] == 'credit')
        balance = total_trade - total_credit

        # Update merchant's current balance in DB
        merchant.current_balance = balance
        db.session.commit()

        merchant_dict = merchant.to_dict()
        merchant_dict['current_balance'] = balance

        return jsonify({
            'merchant': merchant_dict,
            'trades': trades,
            'transactions': transactions,
            'total_trade': total_trade,
            'total_credit': total_credit,
            'balance': balance
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>', methods=['PUT'])
@jwt_required()
def update_merchant(merchant_id):
    try:
        user_id = get_jwt_identity()
        merchant = Merchant.query.filter_by(id=merchant_id, user_id=user_id).first()
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404

        data = request.get_json()
        old_opening = merchant.opening_balance
        new_opening = float(data.get('opening_balance', old_opening))

        if data.get('name'):
            merchant.name = data.get('name')
        if data.get('business_name') is not None:
            merchant.business_name = data.get('business_name')
        if data.get('mobile'):
            merchant.mobile = data.get('mobile')

        if new_opening != old_opening:
            merchant.opening_balance = new_opening
            opening_txn = Transaction.query.filter_by(
                merchant_id=merchant_id,
                payment_mode="Opening Balance",
                transaction_type='credit'
            ).first()
            if opening_txn:
                opening_txn.amount = new_opening
                opening_txn.description = f"Opening balance updated to {new_opening}"
                opening_txn.user_id = user_id
            else:
                opening_txn = Transaction(
                    user_id=user_id,
                    merchant_id=merchant_id,
                    amount=new_opening,
                    payment_mode="Opening Balance",
                    transaction_type='credit',
                    description="Opening balance added on update"
                )
                db.session.add(opening_txn)

        update_merchant_current_balance(merchant_id)

        merchant_dict = merchant.to_dict()
        merchant_dict['current_balance'] = merchant.current_balance

        return jsonify({'message': 'Merchant updated successfully', 'merchant': merchant_dict}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>', methods=['DELETE'])
@jwt_required()
def delete_merchant(merchant_id):
    try:
        user_id = get_jwt_identity()
        merchant = Merchant.query.filter_by(id=merchant_id, user_id=user_id).first()
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404
        db.session.delete(merchant)
        db.session.commit()
        return jsonify({'message': 'Merchant deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# -------------------- CREDIT TRANSACTIONS -------------------- #

@merchants_bp.route('/<int:merchant_id>/credit', methods=['POST'])
@jwt_required()
def add_credit(merchant_id):
    try:
        user_id = get_jwt_identity()
        merchant = Merchant.query.filter_by(id=merchant_id, user_id=user_id).first()
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404

        data = request.get_json()
        amount = float(data.get('amount'))

        transaction = Transaction(
            user_id=user_id,
            merchant_id=merchant_id,
            amount=amount,
            payment_mode=data.get('payment_mode'),
            transaction_type='credit',
            description=data.get('description', '')
        )
        db.session.add(transaction)
        db.session.commit()

        update_merchant_current_balance(merchant_id)

        merchant_dict = merchant.to_dict()
        merchant_dict['current_balance'] = merchant.current_balance

        return jsonify({'message': 'Credit added successfully', 'transaction': transaction.to_dict(), 'merchant': merchant_dict}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>/credit/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_credit(merchant_id, transaction_id):
    try:
        user_id = get_jwt_identity()
        merchant = Merchant.query.filter_by(id=merchant_id, user_id=user_id).first()
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404

        transaction = Transaction.query.filter_by(id=transaction_id, merchant_id=merchant_id, transaction_type='credit').first()
        if not transaction:
            return jsonify({'message': 'Credit transaction not found'}), 404

        data = request.get_json()
        transaction.amount = float(data.get('amount', transaction.amount))
        transaction.payment_mode = data.get('payment_mode', transaction.payment_mode)
        transaction.description = data.get('description', transaction.description)
        transaction.user_id = user_id

        db.session.commit()
        update_merchant_current_balance(merchant_id)

        merchant_dict = merchant.to_dict()
        merchant_dict['current_balance'] = merchant.current_balance

        return jsonify({'message': 'Credit updated successfully', 'transaction': transaction.to_dict(), 'merchant': merchant_dict}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@merchants_bp.route('/<int:merchant_id>/credit/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_credit(merchant_id, transaction_id):
    try:
        user_id = get_jwt_identity()
        merchant = Merchant.query.filter_by(id=merchant_id, user_id=user_id).first()
        if not merchant:
            return jsonify({'message': 'Merchant not found'}), 404

        transaction = Transaction.query.filter_by(id=transaction_id, merchant_id=merchant_id, transaction_type='credit').first()
        if not transaction:
            return jsonify({'message': 'Credit transaction not found'}), 404

        db.session.delete(transaction)
        db.session.commit()

        update_merchant_current_balance(merchant_id)

        merchant_dict = merchant.to_dict()
        merchant_dict['current_balance'] = merchant.current_balance

        return jsonify({'message': 'Credit deleted successfully', 'merchant': merchant_dict}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# -------------------- SUMMARY -------------------- #

@merchants_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_merchant_summary():
    try:
        user_id = get_jwt_identity()
        date_str = request.args.get('date')
        if date_str:
            filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            bill_items = BillItem.query.join(Merchant).filter(
                Merchant.user_id==user_id,
                func.date(BillItem.created_at)==filter_date
            ).all()
        else:
            bill_items = BillItem.query.join(Merchant).filter(
                Merchant.user_id==user_id,
                func.date(BillItem.created_at)==datetime.utcnow().date()
            ).all()

        merchant_data = {}
        for item in bill_items:
            if item.merchant_id:
                if item.merchant_id not in merchant_data:
                    merchant_obj = Merchant.query.get(item.merchant_id)
                    merchant_data[item.merchant_id] = {
                        'merchant': merchant_obj.to_dict() if merchant_obj else None,
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
            commission = round(data['subtotal'] * 0.02, 2)
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
