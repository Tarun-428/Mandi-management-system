from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.models import db, Bill, BillItem, Merchant, AdhatiyaIncome, User
from ..utils.helpers import generate_bill_number, calculate_bill_totals, calculate_adhatiya
from datetime import datetime
from sqlalchemy import func
from . import bills_bp
from flask import render_template


# ------------------- GET BILLS -------------------
@bills_bp.route('/', methods=['GET'])
@jwt_required()
def get_bills():
    try:
        user_id = get_jwt_identity()
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        farmer_name = request.args.get('farmer_name')
        village_name = request.args.get('village_name')
        merchant_id = request.args.get('merchant_id')

        query = Bill.query.filter_by(user_id=user_id)

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

# ------------------- CREATE BILL -------------------
@bills_bp.route('/', methods=['POST'])
@jwt_required()
def create_bill():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        bill_number = generate_bill_number()
        items_data = data.get('items', [])
        himmali = float(data.get('himmali', 0))        
        bharai = float(data.get('bharai', 0))        
        motor_bhada = float(data.get('motor_bhada', 0))
        other_charges = float(data.get('other_charges', 0))
        totals = calculate_bill_totals(items_data, himmali,bharai, motor_bhada, other_charges)

        bill = Bill(
            user_id=user_id,
            bill_number=bill_number,
            farmer_name=data.get('farmer_name'),
            farmer_mobile=data.get('farmer_mobile'),
            village_name=data.get('village_name'),
            merchant_id=data.get('merchant_id'),
            total_bags=totals['total_bags'],
            total_weight=totals['total_weight'],
            himmali=himmali,
            bharai=bharai,
            motor_bhada=motor_bhada,
            other_charges=other_charges,
            subtotal=totals['subtotal'],
            grand_total=totals['grand_total']
        )

        db.session.add(bill)
        db.session.flush()  # Get bill.id before commit

        for item_data in items_data:
            item = BillItem(
                bill_id=bill.id,
                vegetable=item_data.get('vegetable'),
                bags=int(item_data.get('bags')),
                weight=float(item_data.get('weight')),
                rate=float(item_data.get('rate')),
                amount=float(item_data.get('amount')),
                merchant_id=item_data.get('merchant_id')
            )
            db.session.add(item)

            # Update merchant balance & Adhatiya
            if item.merchant_id:
                merchant = db.session.query(Merchant).with_for_update().filter_by(id=item.merchant_id, user_id=user_id).first()
                if merchant:
                    merchant.current_balance += item.amount

                    commission_amount = calculate_adhatiya(item.amount)
                    adhatiya = AdhatiyaIncome(
                        user_id=user_id,
                        bill_id=bill.id,
                        merchant_id=item.merchant_id,
                        trade_amount=item.amount,
                        commission_rate=2.0,
                        commission_amount=commission_amount,
                        date=datetime.utcnow().date()
                    )
                    db.session.add(adhatiya)

        db.session.commit()
        return jsonify(bill.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# ------------------- GET SINGLE BILL -------------------
@bills_bp.route('/<int:bill_id>', methods=['GET'])
@jwt_required()
def get_bill(bill_id):
    try:
        user_id = get_jwt_identity()
        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return jsonify({'message': 'Bill not found'}), 404
        return jsonify(bill.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ------------------- UPDATE BILL -------------------
@bills_bp.route('/<int:bill_id>', methods=['PUT'])
@jwt_required()
def update_bill(bill_id):
    try:
        user_id = get_jwt_identity()
        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return jsonify({'message': 'Bill not found'}), 404

        data = request.get_json()

        # Revert old balances & delete items/adhatiya
        old_items = BillItem.query.filter_by(bill_id=bill_id).all()
        for item in old_items:
            if item.merchant_id:
                merchant = db.session.query(Merchant).with_for_update().filter_by(id=item.merchant_id, user_id=user_id).first()
                if merchant:
                    merchant.current_balance -= item.amount
            db.session.delete(item)
        AdhatiyaIncome.query.filter_by(bill_id=bill_id, user_id=user_id).delete()

        # Update bill
        bill.farmer_name = data.get('farmer_name', bill.farmer_name)
        bill.farmer_mobile = data.get('farmer_mobile', bill.farmer_mobile)
        bill.village_name = data.get('village_name', bill.village_name)
        bill.merchant_id = data.get('merchant_id', bill.merchant_id)

        items_data = data.get('items', [])
        himmali = float(data.get('himmali', 0))
        bharai = float(data.get('bharai', 0))
        motor_bhada = float(data.get('motor_bhada', 0))
        other_charges = float(data.get('other_charges', 0))
        totals = calculate_bill_totals(items_data, himmali,bharai, motor_bhada, other_charges)

        bill.total_bags = totals['total_bags']
        bill.total_weight = totals['total_weight']
        bill.himmali = himmali
        bill.bharai = bharai
        bill.motor_bhada = motor_bhada
        bill.other_charges = other_charges
        bill.subtotal = totals['subtotal']
        bill.grand_total = totals['grand_total']

        # Add updated items
        for item_data in items_data:
            item = BillItem(
                bill_id=bill.id,
                vegetable=item_data.get('vegetable'),
                bags=int(item_data.get('bags')),
                weight=float(item_data.get('weight')),
                rate=float(item_data.get('rate')),
                amount=float(item_data.get('amount')),
                merchant_id=item_data.get('merchant_id')
            )
            db.session.add(item)

            if item.merchant_id:
                merchant = db.session.query(Merchant).with_for_update().filter_by(id=item.merchant_id, user_id=user_id).first()
                if merchant:
                    merchant.current_balance += item.amount

                    commission_amount = calculate_adhatiya(item.amount)
                    adhatiya = AdhatiyaIncome(
                        user_id=user_id,
                        bill_id=bill.id,
                        merchant_id=item.merchant_id,
                        trade_amount=item.amount,
                        commission_rate=2.0,
                        commission_amount=commission_amount,
                        date=datetime.utcnow().date()
                    )
                    db.session.add(adhatiya)

        db.session.commit()
        return jsonify({'message': 'Bill updated successfully', 'bill': bill.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# ------------------- DELETE BILL -------------------
@bills_bp.route('/<int:bill_id>', methods=['DELETE'])
@jwt_required()
def delete_bill(bill_id):
    try:
        user_id = get_jwt_identity()
        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return jsonify({'message': 'Bill not found'}), 404

        items = BillItem.query.filter_by(bill_id=bill_id).all()
        for item in items:
            if item.merchant_id:
                merchant = db.session.query(Merchant).with_for_update().filter_by(id=item.merchant_id, user_id=user_id).first()
                if merchant:
                    merchant.current_balance -= item.amount

        AdhatiyaIncome.query.filter_by(bill_id=bill_id, user_id=user_id).delete()
        db.session.delete(bill)
        db.session.commit()
        return jsonify({'message': 'Bill deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# ------------------- PRINT BILL TEMPLATE -------------------
# @bills_bp.route('/print/<int:bill_id>', methods=['GET'])
# @jwt_required()
# def print_bill(bill_id):
#     try:
#         user_id = get_jwt_identity()
#         bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
#         if not bill:
#             return "Bill not found", 404

#         # Fetch all bill items
#         items = BillItem.query.filter_by(bill_id=bill.id).all()

#         # Create safe merchants dict
#         merchants = {}
#         for item in items:
#             if item.merchant_id:
#                 merchant = Merchant.query.filter_by(id=item.merchant_id, user_id=user_id).first()
#                 if merchant:
#                     merchants[item.merchant_id] = merchant

#         return render_template(
#             'print_bill.html',
#             bill=bill,
#             items=items,
#             merchants=merchants
#         ), 200, {"Content-Type": "text/html"}

#     except Exception as e:
#         import traceback
#         print("Error in print_bill:", e)
#         traceback.print_exc()
#         return f"Error: {str(e)}", 500


# Make sure User is imported from your models
# from app.models import User, Bill, BillItem, Merchant 
from num2words import num2words # <-- You will need this for the next step

@bills_bp.route('/print/<int:bill_id>', methods=['GET'])
@jwt_required()
def print_bill(bill_id):
    try:
        user_id = get_jwt_identity()
        
        # --- FIX 1: Fetch the user ---
        user = User.query.get(user_id)
        if not user:
            return "User not found", 404

        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return "Bill not found", 404

        # Fetch all bill items
        items = BillItem.query.filter_by(bill_id=bill.id).all()

        # Create safe merchants dict
        merchants = {}
        for item in items:
            if item.merchant_id:
                merchant = Merchant.query.filter_by(id=item.merchant_id, user_id=user_id).first()
                if merchant:
                    merchants[item.merchant_id] = merchant

        # --- FIX 2: Generate amount_in_words (This will be your next error) ---
        amount_in_words = "Zero"
        if bill.grand_total and bill.grand_total > 0:
            try:
                # Convert the total to an integer to ignore decimals
                total_integer = int(bill.grand_total)
                
                # Convert only the integer part to words
                # We use lang='en_IN' to get "Lakh" and "Crore" if needed
                amount_in_words = num2words(total_integer, lang='en_IN').title()

            except Exception as e:
                print(f"Error converting number to words: {e}")
                amount_in_words = "Error" # Or just a blank string
        else:
            amount_in_words = "Zero"
            
        return render_template(
            'print_bill.html',
            # --- FIX 3: Pass user and amount_in_words to the template ---
            user=user,
            bill=bill,
            items=items,
            merchants=merchants,
            amount_in_words=amount_in_words
        ), 200, {"Content-Type": "text/html"}

    except Exception as e:
        import traceback
        print("Error in print_bill:", e)
        traceback.print_exc()
        return f"Error: {str(e)}", 500