#NOTE
#NOTE
#NOTE
#NOTE
#try mga code for debugging and testing
#NOTE
#NOTE
#NOTE
#NOTE
from flask import Flask, render_template, request, redirect, jsonify, url_for, session
import mysql.connector


app = Flask(__name__)


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",  # Your DB username
        password="",  # Your DB password
        database="goodboisdb"
    )

@app.route('/item_list', methods=['GET'])
def get_items():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")  # Adjust the query as needed
    products = cursor.fetchall()
    cursor.close()
    conn.close()

    product_list = []
    for product in products:
        product_list.append({
            'id': product[0],
            'product_name': product[1],
            'product_price': product[2],
            'product_description': product[3],
            'product_quantity': product[4],
            'brand': product[5],
            'product_category': product[6],
            'product_image': product[9],  # Assuming product_image is at index 9
        })

    print(product_list)

    return render_template('itemList.html')

@app.route('/')
def index():
    return "Welcome to the Product Page. Visit /item_list to see the items."

if __name__ == "__main__":
    app.run(debug=True)
