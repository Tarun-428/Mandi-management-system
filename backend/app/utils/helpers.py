from datetime import datetime
import random
import string

def generate_bill_number():
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_suffix = ''.join(random.choices(string.digits, k=4))
    return f"BILL-{timestamp}-{random_suffix}"

def calculate_adhatiya(amount, rate=2.0):
    return round((amount * rate) / 100, 2)

def calculate_bill_totals(items, himmali=0, motor_bhada=0, other_charges=0):
    total_bags = sum(item.get('bags', 0) for item in items)
    total_quantity = sum(item.get('quantity', 0) for item in items)
    total_weight = sum(item.get('weight', 0) for item in items)
    subtotal = sum(item.get('amount', 0) for item in items)
    
    grand_total = subtotal + himmali + motor_bhada + other_charges
    
    return {
        'total_bags': total_bags,
        'total_quantity': total_quantity,
        'total_weight': total_weight,
        'subtotal': subtotal,
        'grand_total': grand_total
    }
