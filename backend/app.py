from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = 'consumption_tracker.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Route pour récupérer toutes les unités
@app.route('/units', methods=['GET'])
def get_units():
    db = get_db()
    try:
        units = db.execute('SELECT * FROM units').fetchall()
        return jsonify([dict(row) for row in units])
    finally:
        db.close()

# Route pour ajouter une unité
@app.route('/units', methods=['POST'])
def add_unit():
    data = request.json
    name = data.get('name')
    abbreviation = data.get('abbreviation')

    if not name or not abbreviation:
        return jsonify({'error': 'Name and abbreviation are required'}), 400

    db = get_db()
    try:
        db.execute('INSERT INTO units (name, abbreviation) VALUES (?, ?)', (name, abbreviation))
        db.commit()
        return jsonify({'message': 'Unit added successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Unit already exists'}), 400
    finally:
        db.close()

# Route pour récupérer tous les produits (avec unité)
@app.route('/products', methods=['GET'])
def get_products():
    db = get_db()
    try:
        products = db.execute(
            '''
            SELECT p.*, u.name AS unit_name, u.abbreviation AS unit_abbreviation
            FROM product_types p
            LEFT JOIN units u ON p.unit_id = u.id
            '''
        ).fetchall()
        return jsonify([dict(row) for row in products])
    finally:
        db.close()

# Route pour ajouter un produit (avec unité)
@app.route('/products', methods=['POST'])
def add_product():
    data = request.json
    name = data.get('name')
    description = data.get('description')
    unit_id = data.get('unit_id')

    if not name or not unit_id:
        return jsonify({'error': 'Product name and unit ID are required'}), 400

    db = get_db()
    try:
        db.execute(
            'INSERT INTO product_types (name, description, unit_id) VALUES (?, ?, ?)',
            (name, description, unit_id)
        )
        db.commit()
        return jsonify({'message': 'Product added successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Product already exists'}), 400
    finally:
        db.close()

# Route pour récupérer les consommations pour une plage de dates (avec unité)
@app.route('/consumption', methods=['GET'])
def get_consumption():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        return jsonify({'error': 'Start date and end date are required'}), 400

    db = get_db()
    try:
        consumptions = db.execute(
            '''
            SELECT c.id, c.product_type_id, c.date, c.quantity, c.note, 
                   p.name AS product_name, u.name AS unit_name, u.abbreviation AS unit_abbreviation
            FROM daily_consumption c
            JOIN product_types p ON c.product_type_id = p.id
            LEFT JOIN units u ON p.unit_id = u.id
            WHERE c.date BETWEEN ? AND ?
            ORDER BY c.date ASC
            ''', (start_date, end_date)
        ).fetchall()
        return jsonify([dict(row) for row in consumptions])
    finally:
        db.close()

# Route pour ajouter une consommation quotidienne
@app.route('/consumption', methods=['POST'])
def add_consumption():
    data = request.json
    product_type_id = data.get('product_type_id')
    date = data.get('date')
    quantity = data.get('quantity')
    note = data.get('note')

    if not product_type_id or not date or not quantity:
        return jsonify({'error': 'Product type, date, and quantity are required'}), 400

    db = get_db()
    try:
        db.execute(
            'INSERT INTO daily_consumption (product_type_id, date, quantity, note) VALUES (?, ?, ?, ?)',
            (product_type_id, date, quantity, note)
        )
        db.commit()
        return jsonify({'message': 'Consumption added successfully'}), 201
    finally:
        db.close()

# Route pour obtenir un résumé de la consommation (avec unités)
@app.route('/consumption_summary', methods=['GET'])
def get_consumption_summary():
    db = get_db()
    try:
        summary = db.execute(
            '''
            SELECT p.name AS product_name, u.abbreviation AS unit_abbreviation, 
                   SUM(c.quantity) AS total_quantity, COUNT(c.id) AS total_days
            FROM product_types p
            LEFT JOIN daily_consumption c ON p.id = c.product_type_id
            LEFT JOIN units u ON p.unit_id = u.id
            GROUP BY p.id
            '''
        ).fetchall()
        return jsonify([dict(row) for row in summary])
    finally:
        db.close()

# Route pour l'authentification utilisateur
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    db = get_db()
    try:
        user = db.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password)).fetchone()
        if user:
            return jsonify({'message': 'Login successful', 'user_id': user['id']}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    finally:
        db.close()

if __name__ == '__main__':
    app.run(debug=True)
