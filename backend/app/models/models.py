# from datetime import datetime
# from flask_sqlalchemy import SQLAlchemy

# db = SQLAlchemy()
# print("Database initialized")

# class User(db.Model):
#     __tablename__ = 'users'
    
#     id = db.Column(db.Integer, primary_key=True)
#     company_name = db.Column(db.String(200), nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)
#     mobile = db.Column(db.String(20), nullable=False)
#     password = db.Column(db.String(255), nullable=False)
#     partners = db.Column(db.JSON, default=[])
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     def to_dict(self):
#         return {
#             'id': self.id,
#             'company_name': self.company_name,
#             'email': self.email,
#             'mobile': self.mobile,
#             'partners': self.partners,
#             'created_at': self.created_at.isoformat() if self.created_at else None,
#             'updated_at': self.updated_at.isoformat() if self.updated_at else None
#         }


# class Merchant(db.Model):
#     __tablename__ = 'merchants'
    
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(200), nullable=False)
#     business_name = db.Column(db.String(200), nullable=True)
#     mobile = db.Column(db.String(20), nullable=False)
#     opening_balance = db.Column(db.Float, default=0.0)
#     current_balance = db.Column(db.Float, default=0.0)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
#     bills = db.relationship('Bill', backref='merchant', lazy=True, cascade='all, delete-orphan')
#     transactions = db.relationship('Transaction', backref='merchant', lazy=True, cascade='all, delete-orphan')

#     def to_dict(self):
#         return {
#             'id': self.id,
#             'name': self.name,
#             'business_name': self.business_name,
#             'mobile': self.mobile,
#             'opening_balance': self.opening_balance,
#             'current_balance': self.current_balance,
#             'created_at': self.created_at.isoformat() if self.created_at else None,
#             'updated_at': self.updated_at.isoformat() if self.updated_at else None
#         }


# class Bill(db.Model):
#     __tablename__ = 'bills'
    
#     id = db.Column(db.Integer, primary_key=True)
#     bill_number = db.Column(db.String(50), unique=True, nullable=False)
#     farmer_name = db.Column(db.String(200), nullable=False)
#     farmer_mobile = db.Column(db.String(20), nullable=True)
#     village_name = db.Column(db.String(200), nullable=False)
#     merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=True)
    
#     total_bags = db.Column(db.Integer, default=0)
#     total_weight = db.Column(db.Float, default=0.0)
    
#     himmali = db.Column(db.Float, default=0.0)
#     motor_bhada = db.Column(db.Float, default=0.0)
#     other_charges = db.Column(db.Float, default=0.0)
    
#     subtotal = db.Column(db.Float, default=0.0)
#     grand_total = db.Column(db.Float, default=0.0)
    
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
#     items = db.relationship('BillItem', backref='bill', lazy=True, cascade='all, delete-orphan')

#     def to_dict(self):
#         return {
#             'id': self.id,
#             'bill_number': self.bill_number,
#             'farmer_name': self.farmer_name,
#             'farmer_mobile': self.farmer_mobile,
#             'village_name': self.village_name,
#             'merchant_id': self.merchant_id,
#             'merchant': self.merchant.to_dict() if self.merchant else None,
#             'total_bags': self.total_bags,
#             'total_weight': self.total_weight,
#             'himmali': self.himmali,
#             'motor_bhada': self.motor_bhada,
#             'other_charges': self.other_charges,
#             'subtotal': self.subtotal,
#             'grand_total': self.grand_total,
#             'items': [item.to_dict() for item in self.items],
#             'created_at': self.created_at.isoformat() if self.created_at else None,
#             'updated_at': self.updated_at.isoformat() if self.updated_at else None
#         }


# class BillItem(db.Model):
#     __tablename__ = 'bill_items'
    
#     id = db.Column(db.Integer, primary_key=True)
#     bill_id = db.Column(db.Integer, db.ForeignKey('bills.id'), nullable=False)
#     vegetable = db.Column(db.String(100), nullable=False)
#     # quantity = db.Column(db.Float, nullable=False)
#     bags = db.Column(db.Integer, nullable=False)
#     weight = db.Column(db.Float, nullable=False)
#     rate = db.Column(db.Float, nullable=False)
#     amount = db.Column(db.Float, nullable=False)
#     merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=True)
    
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             'id': self.id,
#             'bill_id': self.bill_id,
#             'vegetable': self.vegetable,
#             # 'quantity': self.quantity,
#             'bags': self.bags,
#             'weight': self.weight,
#             'rate': self.rate,
#             'amount': self.amount,
#             'merchant_id': self.merchant_id,
#             'merchant': Merchant.query.get(self.merchant_id).to_dict() if self.merchant_id else None,
#             'created_at': self.created_at.isoformat() if self.created_at else None
#         }


# class Transaction(db.Model):
#     __tablename__ = 'transactions'
    
#     id = db.Column(db.Integer, primary_key=True)
#     merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=False)
#     amount = db.Column(db.Float, nullable=False)
#     payment_mode = db.Column(db.String(50), nullable=False)
#     transaction_type = db.Column(db.String(50), default='credit')
#     description = db.Column(db.String(500), nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             'id': self.id,
#             'merchant_id': self.merchant_id,
#             'amount': self.amount,
#             'payment_mode': self.payment_mode,
#             'transaction_type': self.transaction_type,
#             'description': self.description,
#             'created_at': self.created_at.isoformat() if self.created_at else None
#         }


# class AdhatiyaIncome(db.Model):
#     __tablename__ = 'adhatiya_income'
    
#     id = db.Column(db.Integer, primary_key=True)
#     bill_id = db.Column(db.Integer, db.ForeignKey('bills.id'), nullable=True)
#     merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=False)
#     trade_amount = db.Column(db.Float, nullable=False)
#     commission_rate = db.Column(db.Float, default=2.0)
#     commission_amount = db.Column(db.Float, nullable=False)
#     date = db.Column(db.Date, default=datetime.utcnow().date)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         merchant = Merchant.query.get(self.merchant_id)
#         return {
#             'id': self.id,
#             'bill_id': self.bill_id,
#             'merchant_id': self.merchant_id,
#             'merchant_name': merchant.name if merchant else None,
#             'trade_amount': self.trade_amount,
#             'commission_rate': self.commission_rate,
#             'commission_amount': self.commission_amount,
#             'date': self.date.isoformat() if self.date else None,
#             'created_at': self.created_at.isoformat() if self.created_at else None
#         }


from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
print("Database initialized")

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255))
    password = db.Column(db.String(255), nullable=False)
    partners = db.Column(db.JSON, default=[])
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    merchants = db.relationship('Merchant', backref='user', lazy=True)
    bills = db.relationship('Bill', backref='user', lazy=True)
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    adhatiya_income = db.relationship('AdhatiyaIncome', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'email': self.email,
            'mobile': self.mobile,
            'address': self.address,
            'partners': self.partners,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Merchant(db.Model):
    __tablename__ = 'merchants'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # ownership
    name = db.Column(db.String(200), nullable=False)
    business_name = db.Column(db.String(200), nullable=True)
    mobile = db.Column(db.String(20), nullable=False)
    opening_balance = db.Column(db.Float, default=0.0)
    current_balance = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bills = db.relationship('Bill', backref='merchant', lazy=True, cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', backref='merchant', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'business_name': self.business_name,
            'mobile': self.mobile,
            'opening_balance': self.opening_balance,
            'current_balance': self.current_balance,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Bill(db.Model):
    __tablename__ = 'bills'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # ownership
    bill_number = db.Column(db.String(50), unique=True, nullable=False)
    farmer_name = db.Column(db.String(200), nullable=False)
    farmer_mobile = db.Column(db.String(20), nullable=True)
    village_name = db.Column(db.String(200), nullable=False)
    merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=True)
    
    total_bags = db.Column(db.Integer, default=0)
    total_weight = db.Column(db.Float, default=0.0)
    
    himmali = db.Column(db.Float, default=0.0)
    bharai = db.Column(db.Float, default=0.0)
    motor_bhada = db.Column(db.Float, default=0.0)
    other_charges = db.Column(db.Float, default=0.0)
    
    subtotal = db.Column(db.Float, default=0.0)
    grand_total = db.Column(db.Float, default=0.0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    items = db.relationship('BillItem', backref='bill', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bill_number': self.bill_number,
            'farmer_name': self.farmer_name,
            'farmer_mobile': self.farmer_mobile,
            'village_name': self.village_name,
            'merchant_id': self.merchant_id,
            'merchant': self.merchant.to_dict() if self.merchant else None,
            'total_bags': self.total_bags,
            'total_weight': self.total_weight,
            'himmali': self.himmali,
            'bharai' : self.bharai,
            'motor_bhada': self.motor_bhada,
            'other_charges': self.other_charges,
            'subtotal': self.subtotal,
            'grand_total': self.grand_total,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class BillItem(db.Model):
    __tablename__ = 'bill_items'
    
    id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('bills.id'), nullable=False)
    vegetable = db.Column(db.String(100), nullable=False)
    bags = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=False)
    rate = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'bill_id': self.bill_id,
            'vegetable': self.vegetable,
            'bags': self.bags,
            'weight': self.weight,
            'rate': self.rate,
            'amount': self.amount,
            'merchant_id': self.merchant_id,
            'merchant': Merchant.query.get(self.merchant_id).to_dict() if self.merchant_id else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # ownership
    merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_mode = db.Column(db.String(50), nullable=False)
    transaction_type = db.Column(db.String(50), default='credit')
    description = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'merchant_id': self.merchant_id,
            'amount': self.amount,
            'payment_mode': self.payment_mode,
            'transaction_type': self.transaction_type,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AdhatiyaIncome(db.Model):
    __tablename__ = 'adhatiya_income'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # ownership
    bill_id = db.Column(db.Integer, db.ForeignKey('bills.id'), nullable=True)
    merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=False)
    trade_amount = db.Column(db.Float, nullable=False)
    commission_rate = db.Column(db.Float, default=2.0)
    commission_amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow().date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        merchant = Merchant.query.get(self.merchant_id)
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bill_id': self.bill_id,
            'merchant_id': self.merchant_id,
            'merchant_name': merchant.name if merchant else None,
            'trade_amount': self.trade_amount,
            'commission_rate': self.commission_rate,
            'commission_amount': self.commission_amount,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
