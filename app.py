from flask import Flask, render_template, request, redirect, jsonify, url_for, session, send_from_directory, flash
from flask_mailman import Mail, EmailMessage
from itsdangerous import URLSafeTimedSerializer  # For token generation
from datetime import datetime, timedelta, timezone
import mysql.connector
import os
from random import randint
import time
import uuid
from werkzeug.utils import secure_filename
import bcrypt


app = Flask(__name__)
mail = Mail()
app.secret_key = os.urandom(24)
app.secret_key = "your_secret_key"

UPLOAD_FOLDER = 'static/Uploads/pics'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Token Serializer
serializer = URLSafeTimedSerializer("your_secret_key")  # Change to a random secret key

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="goodboisdb"
    )

def create_mail_app():
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 465
    app.config["MAIL_USERNAME"] = "SneakHub.noreply@gmail.com"
    app.config["MAIL_PASSWORD"] = "bifj ftki bkai moji"  # Use App Password
    app.config["MAIL_USE_TLS"] = False
    app.config["MAIL_USE_SSL"] = True
    mail.init_app(app)

create_mail_app()

@app.route('/forgotpassword', methods=['POST'])
def forgotpassword():
    email = request.form['email']
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Retrieve user information
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()  # Fetches one result

        # If user exists, proceed to send email
        if user:
            token = serializer.dumps(email, salt="password-reset-salt")
            reset_link = url_for('reset_password', token=token, _external=True)

            msg = EmailMessage(
                "Password Recovery",
                f"Here is your password recovery link: {reset_link}",
                "SneakHub.noreply@gmail.com",
                [email]
            )
            msg.send()

            # Clear results if any remain
            cursor.fetchall()  # Add this line to consume any remaining results

            return redirect(url_for('home'))
        else:
            return jsonify({'error': 'Email not found!'}), 404
    except mysql.connector.Error as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'Database error occurred'}), 500
    finally:
        conn.commit()  # Ensure all transactions are committed
        cursor.close()
        conn.close()


create_mail_app()


@app.route('/sign-up', methods=['POST'])
def send_verification_email():
    email = request.form['email']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        
        token = serializer.dumps(email, salt="email-verification-salt")
        verification_link = url_for('verify_email', token=token, _external=True)

        msg = EmailMessage(
            "Email Verification",
            f"Please verify your email by clicking on the following link: {verification_link}",
            "SneakHub.noreply@gmail.com",
            [email]
        )
        msg.send()
        return jsonify({'message': 'Verification email sent!'}), 200
    else:
        return jsonify({'error': 'Email not found!'}), 404

@app.route('/verify_email/<token>', methods=['GET'])
def verify_email(token):
    try:
        # Decode the token and verify it hasn't expired (5 minutes)
        email = serializer.loads(token, salt="email-verification-salt", max_age=300)  #ginawa ko 5 mins lang, 5 minutes lang ba or dagdagan or bawasan yung time limit??? 
    except Exception:
        return jsonify({'error': 'The verification link is invalid or has expired.'}), 400

    # Update the user's isVerified column to "Yes" in the database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET isVerified = 'Yes' WHERE isVerified = %s", (email,))
    conn.commit()
    cursor.close()
    conn.close()


    return redirect(url_for('home')) 

@app.route('/')  # Define the route for the root URL
def home():
    return render_template('MainWeb.html')  # Ensure the template exists


@app.route('/sign-up')
def sign_up():
    return redirect(url_for('index'))

@app.route('/buyersettings')
def buyersettings():
    return render_template('BuyerAccSettings.html')

@app.route('/request')
def requests():
    return render_template('seller_requests.html')


@app.route('/AdminRequests')
def AdminRequests():
    return render_template('admin_seller_requests.html')


@app.route('/logout')
def index():
    session.clear()
    return render_template('index.html')
    
@app.route('/submit_form', methods=['POST'])
def submit_form():
    email = request.form['email']
    password = request.form['password'].encode('utf-8')  # Encode the password
    confpass = request.form['confpass']
    
    # Validate that the email ends with '@gmail.com'
    if not email.endswith('@gmail.com'):
        return jsonify({'error': 'Email must be a Gmail address (e.g., user@gmail.com)'}), 400

    # Check if the password and confirm password match
    if password.decode('utf-8') != confpass:  # Decode for comparison
        return jsonify({'error': 'Passwords do not match'}), 400

    # Check if the email already exists in the database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    check_email_sql = "SELECT COUNT(*) FROM users WHERE email = %s"
    cursor.execute(check_email_sql, (email,))
    email_exists = cursor.fetchone()[0] > 0
    
    if email_exists:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Email already exists'}), 400
    
    # Extract name from the email (remove domain)
    name = email.split('@')[0]  # Get the part before the '@'

    # Hash the password
    # Skip encoding if password is already in bytes
    hashed_password = bcrypt.hashpw(password if isinstance(password, bytes) else password.encode('utf-8'), bcrypt.gensalt())

    user_type = 'Buyer'  # Default user type
    archive = 'no'

    sql = "INSERT INTO users (name, email, password, user_type, archieve) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (name, email, hashed_password, user_type, archive))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Sign Up Successful'})




@app.route('/login', methods=['POST'])
def login():
    try:
        email = request.form['email']
        password = request.form['password'].encode('utf-8')  # Encode the password

        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "SELECT * FROM users WHERE email = %s"
        cursor.execute(sql, (email,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            user_id = user[0]  # Assuming user_id is the 1st column
            user_type = user[6]  # Assuming user_type is the 5th column
            name = user[1]  # Assuming name is the 2nd column
            hashed_password = user[5].encode('utf-8')  # Assuming hashed password is the 4th column
            archive_status = user[8]  # Assuming archive status is the 6th column

            # Check if user is archived
            if archive_status == 'yes':
                return jsonify({'error': 'Your account is deleted. Please contact support.'}), 403

            # Check the password
            if bcrypt.checkpw(password, hashed_password):
                # Store user info in session
                session['user_id'] = user_id
                session['user_type'] = user_type
                session['name'] = name

                # Redirect based on user_type
                if user_type == 'Buyer':
                    return jsonify({'redirect': 'success', 'name': name})
                elif user_type == 'Admin':
                    return jsonify({'redirect': 'admin', 'name': name})
                elif user_type == 'Seller':
                    return jsonify({'redirect': 'seller', 'name': name})
            else:
                return jsonify({'error': 'Invalid Email or Password.'}), 401
        else:
            return jsonify({'error': 'Invalid Email or Password.'}), 401
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/success')
def success():
    name = request.args.get('name', '')
    return render_template('success.html', name=name)

@app.route('/seller')
def seller():
    name = request.args.get('name', '')
    return render_template('seller.html', name=name)

@app.route('/admin')
def admin():
    name = request.args.get('name', '')
    return render_template('admin.html', name=name)

@app.route('/users', methods=['GET'])
def get_users():
    # Fetch users that are not admins from the database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password, user_type FROM users WHERE user_type != 'Admin' AND archieve = 'no'")
    users = cursor.fetchall()
    cursor.close()

    # Convert query results to a list of dictionaries
    user_list = []
    for user in users:
        user_list.append({
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'password': user[3],  # Include password in the response
            'user_type': user[4],
        })

    return jsonify(user_list)

@app.route('/archived_users', methods=['GET'])
def get_archived_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, user_type FROM users WHERE archieve = 'yes'")
    users = cursor.fetchall()
    cursor.close()
    conn.close()

    # Convert query results to a list of dictionaries
    archived_user_list = []
    for user in users:
        archived_user_list.append({
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'user_type': user[3],  # Corrected the index to 3 for user_type
        })

    return jsonify(archived_user_list)  # Return JSON response



# Add a new user (default to Buyer type)
@app.route('/add_user', methods=['POST'])
def add_user():
    name = request.form['name']
    email = request.form['email']
    password = request.form['password']
    user_type = 'Buyer'
    archive = 'no'

    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO users (name, email, password, user_type, archieve) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (name, email, password, user_type, archive))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'User added successfully.'}), 201

# Archive a user
@app.route('/delete_user/<int:user_id>', methods=['PUT'])  # Changed method to PUT since we're updating
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update the 'archieve' column to 'yes' for the given user_id
    cursor.execute("UPDATE users SET archieve = %s WHERE id = %s", ('yes', user_id))
    
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'User archived successfully.'}), 200

@app.route('/archive')
def archive():
    return render_template('archive.html')

#Restore a user
@app.route('/restore_user/<int:user_id>', methods=['POST'])
def restore_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update the 'archieve' column to 'no' for the given user_id
    cursor.execute("UPDATE users SET archieve = %s WHERE id = %s", ('no', user_id))
    
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'User restored successfully.'}), 200

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch the user with the given user_id
    cursor.execute("SELECT id, name, email, user_type FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        # Convert the result into a dictionary
        user_data = {
            'id': user[0],
            'name': user[1],
            'email': user[2],

            'user_type': user[4]
        }
        return jsonify(user_data)
    else:
        return jsonify({'error': 'User not found'}), 404
    
# Edit a user
@app.route('/edit_user/<int:user_id>', methods=['PUT'])
def edit_user(user_id):
    data = request.get_json()  # Get the user data from the PUT request
    name = data.get('name')
    email = data.get('email')
    user_type = data.get('user_type')  # Get user type from request

    conn = get_db_connection()
    cursor = conn.cursor()

    # Update user details in the database
    cursor.execute("""
        UPDATE users 
        SET name = %s, email = %s, user_type = %s 
        WHERE id = %s
    """, (name, email, user_type, user_id))
    
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'User updated successfully.'}), 200

@app.route('/categories', methods=['GET'])
def categories():
    return render_template('categories.html')  # Ensure this renders the category management page

@app.route('/go_to_admin', methods=['POST'])
def go_to_admin():
    return redirect(url_for('admin'))  # Redirect to the admin page

# Get all categories
@app.route('/api/categories', methods=['GET'])  # Changed to /api/categories for clarity
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, category_name, description FROM categories")
    categories = cursor.fetchall()
    cursor.close()
    conn.close()

    # Convert query results to a list of dictionaries
    category_list = []
    for category in categories:
        category_list.append({
            'id': category[0],
            'category_name': category[1],
            'description': category[2],
        })

    return jsonify(category_list)

# Add a new category
@app.route('/api/add_category', methods=['POST'])
def add_category():
    category_name = request.form['category_name']
    description = request.form['description']

    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO categories (category_name, description) VALUES (%s, %s)"
    
    try:
        cursor.execute(sql, (category_name, description))
        conn.commit()
    except Exception as e:
        print('Error adding category:', str(e))  # Log the error
        return jsonify({'error': 'Error adding category.'}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({'message': 'Category added successfully.'}), 201

# Edit a category
@app.route('/api/edit_category/<int:category_id>', methods=['PUT'])
def edit_category(category_id):
    category_name = request.form['category_name']
    description = request.form['description']

    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE categories SET category_name = %s, description = %s WHERE id = %s"
    cursor.execute(sql, (category_name, description, category_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Category updated successfully.'}), 200

# Delete a category
@app.route('/api/delete_category/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM categories WHERE id = %s", (category_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Category deleted successfully.'}), 200

@app.route('/forgot_password')
def forgot_password():
    return render_template('forgot_password.html')  # Ensure this file exists in your templates folder

@app.route('/submit_product', methods=['POST'])
def submit_product():
    user_id = session.get('user_id')  # Fetch the user_id from session
    if not user_id:
        return jsonify({'error': 'User not logged in.'}), 401
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id FROM users WHERE id = %s AND user_type = 'Seller'", (user_id,))
        seller = cursor.fetchone()
        
        if not seller:
            return jsonify({'error': 'Seller not found or user is not a seller.'}), 404
        
        seller_id = seller[0]
        
        # Product details from the form
        product_name = request.form['productName']
        brand_name = request.form['brandname']
        description = request.form['productDescription']
        price = request.form['productPrice']
        category = request.form['productCategory']
        product_quantity = request.form['productQuantity']
        archive = "no"  # Default value for 'archive'
        
        # Handle image upload
        if 'productImage' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['productImage']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Insert product details without image filename
        sql = """INSERT INTO products (product_name, product_price, product_description, product_quantity, brand, product_category, seller_id, archive, created_at, updated_at)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())"""
        cursor.execute(sql, (product_name, price, description, product_quantity, brand_name, category, seller_id, archive))
        
        product_id = cursor.lastrowid
        
        # Save the image with a new filename
        if file:
            original_filename = secure_filename(file.filename)
            file_ext = original_filename.rsplit('.', 1)[1].lower()
            new_filename = f"{seller_id}-{product_id}.{file_ext}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
            file.save(file_path)
            
            # Update the product with the image URL
            update_sql = "UPDATE products SET product_image = %s WHERE id = %s"
            cursor.execute(update_sql, (new_filename, product_id))
        
        conn.commit()
        return jsonify({'message': 'Product added successfully.', 'image_url': file_path}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()
    

#side nav functions
@app.route('/add-product')
def add_product():
    if 'user_id' not in session or session.get('user_type') != 'Seller':
        return redirect(url_for('index'))  # Redirect to login if not authenticated
    return render_template('selleraddproduct.html')

@app.route('/backToDash')
def backToDash():
    if 'user_id' not in session or session.get('user_type') != 'Seller':
        return redirect(url_for('index'))  # Redirect to login if not authenticated
    return render_template('seller.html')

@app.route('/itemList')
def itemList():
    if 'user_id' not in session or session.get('user_type') != 'Seller':
        return redirect(url_for('index'))  # Redirect to login if not authenticated
    return render_template('itemList.html')

@app.route('/updateList')
def updateList():
    if 'user_id' not in session or session.get('user_type') != 'Seller':
        return redirect(url_for('index'))  # Redirect to login if not authenticated
    return render_template('UpdateList.html')

@app.route('/accSettings')
def accSettings():
    if 'user_id' not in session or session.get('user_type') != 'Seller':
        return redirect(url_for('index'))  # Redirect to login if not authenticated
    return render_template('AccountSettings.html')


@app.route('/sellerlogout')
def sellerlogout():
    session.clear()
    return render_template('index.html')

@app.route('/buyer-account-settings')
def buyer_account_settings():
    return render_template('BuyerAccSettings.html')



@app.route('/Uploads/pics/<path:filename>')
def serve_pics(filename):
    return send_from_directory(os.path.join(app.root_path, 'static/Uploads/pics'), filename)



@app.route('/item_list', methods=['GET'])
def get_items():
    user_id = session.get('user_id')  # Get the user ID from the session
    if not user_id:
        return jsonify({'error': 'User not logged in.'}), 401  # Return an error if not logged in

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Modify the query to fetch only products uploaded by the current seller
        cursor.execute("""
            SELECT id, product_name, product_price, product_description, product_quantity, brand, product_category, product_image
            FROM products
            WHERE seller_id = %s AND archive != 'yes'
        """, (user_id,))
        products = cursor.fetchall()
        
        if products:
            product_list = [
                {
                    'id': product[0],
                    'product_name': product[1],
                    'product_price': product[2],
                    'product_description': product[3],
                    'product_quantity': product[4],
                    'brand': product[5],    
                    'product_category': product[6],
                    'product_image': product[7],
                }
                for product in products
            ]
            return jsonify(product_list)  # Send JSON response
        else:
            return jsonify([])  # Return empty list if no products found
            
    finally:
        cursor.close()
        conn.close()


@app.route('/get_product/<int:product_id>', methods=['GET'])
def get_product(product_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)  # Use dictionary=True for easier JSON conversion

    try:
        # Fetch the product by ID from the products table
        cursor.execute("SELECT * FROM products WHERE id = %s AND archive != 'yes'", (product_id,))
        product = cursor.fetchone()

        if product:
            return jsonify(product)  # Send product details as JSON
        else:
            return jsonify({'error': 'Product not found'}), 404
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)})
    finally:
        cursor.close()
        connection.close()



@app.route('/update_product', methods=['POST'])
def update_product():
    product_id = request.form['product_id']
    product_name = request.form['product_name']
    product_price = request.form['product_price']
    product_description = request.form['product_description']
    product_quantity = request.form['product_quantity']
    brand = request.form['brand']
    product_category = request.form['product_category']
    updated_at = datetime.now()  # Current timestamp

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Update the product in the database
        cursor.execute(""" 
            UPDATE products 
            SET product_name = %s, 
                product_price = %s, 
                product_description = %s, 
                product_quantity = %s, 
                brand = %s, 
                product_category = %s, 
                updated_at = %s 
            WHERE id = %s
        """, (product_name, product_price, product_description, product_quantity,
              brand, product_category, updated_at, product_id))

        connection.commit()

        return jsonify({'success': True, 'message': 'Product updated successfully'})

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)})

    finally:
        cursor.close()
        connection.close()

@app.route('/archive_product/<int:product_id>', methods=['POST'])
def archive_product(product_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        # Update the archive column to "yes" for the specified product ID
        cursor.execute("UPDATE products SET archive = 'yes' WHERE id = %s", (product_id,))
        connection.commit()
        
        return jsonify({'success': 'Product archived successfully.'}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()




@app.route('/update_image/<int:product_id>', methods=['POST'])
def update_image(product_id):
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Get the current image name from the database
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT product_image FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    current_image_name = product['product_image']
    file_path = os.path.join('static/Uploads/pics', current_image_name)
    
    # Delete the existing image file if it exists
    if os.path.exists(file_path):
        os.remove(file_path)

    # Save the new file with the existing name
    file.save(file_path)
    
    cursor.close()
    connection.close()
    
    return jsonify({'success': 'Image updated successfully'})




#ARCHIVE PRODUCTS
@app.route('/item_listArchive', methods=['GET'])
def get_itemsArchive():
    user_id = session.get('user_id')  # Get the user ID from the session
    if not user_id:
        return jsonify({'error': 'User not logged in.'}), 401  # Return an error if not logged in

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Modify the query to fetch only products uploaded by the current seller
        cursor.execute("""
            SELECT id, product_name, product_price, product_description, product_quantity, brand, product_category, product_image
            FROM products
            WHERE seller_id = %s AND archive != 'no'
        """, (user_id,))
        products = cursor.fetchall()
        
        if products:
            product_list = [
                {
                    'id': product[0],
                    'product_name': product[1],
                    'product_price': product[2],
                    'product_description': product[3],
                    'product_quantity': product[4],
                    'brand': product[5],    
                    'product_category': product[6],
                    'product_image': product[7],
                }
                for product in products
            ]
            return jsonify(product_list)  # Send JSON response
        else:
            return jsonify([])  # Return empty list if no products found
            
    finally:
        cursor.close()
        conn.close()



@app.route('/restore_product/<int:product_id>', methods=['POST'])
def restore_product(product_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        # Update the archive column to "yes" for the specified product ID
        cursor.execute("UPDATE products SET archive = 'no' WHERE id = %s", (product_id,))
        connection.commit()
        
        return jsonify({'success': 'Product archived successfully.'}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    try:
        email = serializer.loads(token, salt="password-reset-salt", max_age=3600)  # Token valid for 1 hour
    except Exception as e:
        return jsonify({'error': 'The reset link is invalid or has expired.'}), 400
    
    if request.method == 'POST':
        new_password = request.form['password']
        
        # Hash the new password using bcrypt
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_password, email))
        conn.commit()
        cursor.close()
        conn.close()
        
        # Redirect to index.html after successful password change
        return redirect(url_for('home'))  # Change to index.html route
    
    return render_template('reset_password.html', token=token)  # Render the reset password page



@app.route('/item_listBUYER', methods=['GET'])
def get_itemsBUYER():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Fetch all products that are not archived
        cursor.execute("""
            SELECT id, product_name, product_price, product_description, product_quantity, brand, product_category, product_image
            FROM products
            WHERE archive != 'yes'
        """)
        products = cursor.fetchall()
        
        if products:
            product_list = [
                {
                    'id': product[0],
                    'product_name': product[1],
                    'product_price': product[2],
                    'product_description': product[3],
                    'product_quantity': product[4],
                    'brand': product[5],    
                    'product_category': product[6],
                    'product_image': product[7],
                }
                for product in products
            ]
            return jsonify(product_list)  # Send JSON response
        else:
            return jsonify([])  # Return empty list if no products found
            
    finally:
        cursor.close()
        conn.close()


@app.route('/get_productBUYER/<int:product_id>', methods=['GET'])
def get_productBUYER(product_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)  # Use dictionary=True for easier JSON conversion

    try:
        # Fetch the product by ID from the products table
        cursor.execute("SELECT * FROM products WHERE id = %s AND archive != 'yes'", (product_id,))
        product = cursor.fetchone()

        if product:
            return jsonify(product)  # Send product details as JSON
        else:
            return jsonify({'error': 'Product not found'}), 404
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)})
    finally:
        cursor.close()
        connection.close()

@app.route('/request_seller', methods=['GET', 'POST'])
def request_seller():
    if request.method == 'POST':
        # Collect form data
        store_name = request.form['store_name']
        address = request.form['address']
        phone_number = request.form['phone_number']
        email = request.form['email']
        user_id = session.get('user_id')  # Get the current user's ID from the session

        if user_id is None:
            return jsonify({"error": "User not logged in"}), 403

        # Update database
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Insert additional details into a seller details table (optional)
            cursor.execute("""
                INSERT INTO seller_requests (user_id, store_name, address, phone_number, email, request_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (user_id, store_name, address, phone_number, email, datetime.now()))

            # Update user_type to 'Seller'
            cursor.execute("""
                UPDATE users SET user_type = %s WHERE id = %s
            """, ('Seller', user_id))

            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({"success": "Seller request submitted successfully."}), 200

        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return jsonify({"error": "Failed to process request."}), 500

    # Render the request form if method is GET
    return render_template('seller_request.html')

@app.route('/admin/handle_request/<int:request_id>', methods=['POST'])
def handle_request(request_id):
    action = request.form['action']
    conn = get_db_connection()
    cursor = conn.cursor()

    if action == 'accept':
        # Insert into stores table
        cursor.execute("""
            INSERT INTO stores (user_id, store_name, address, phone_number, email)
            SELECT user_id, store_name, address, phone_number, email FROM seller_requests WHERE id = %s
        """, (request_id,))
        
        # Update status to accepted
        cursor.execute("UPDATE seller_requests SET status = 'accepted' WHERE id = %s", (request_id,))
    elif action == 'deny':
        # Update status to denied
        cursor.execute("UPDATE seller_requests SET status = 'denied' WHERE id = %s", (request_id,))

    conn.commit()
    cursor.close()
    conn.close()
    
    return redirect(url_for('admin_seller_requests'))

@app.route('/admin/seller_requests')
def admin_seller_requests():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Fetch pending requests
    cursor.execute("SELECT id, user_id, store_name, address, phone_number, email, status FROM seller_requests WHERE status = 'pending'")
    requests = cursor.fetchall()
    
    cursor.close()
    conn.close()

    return render_template('admin_seller_requests.html', requests=requests)



@app.route('/send_otp', methods=['POST'])
def send_otp():
    email = request.json['email']

    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the email already exists in the database
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Email is already in use'}), 400

    # If the email does not exist, proceed to generate and send the OTP
    otp = str(randint(100000, 999999))
    session['otp'] = otp
    session['otp_expiration'] = datetime.now() + timedelta(minutes=5)

    # Send the OTP via email
    message = EmailMessage(
        subject="Your OTP Code",
        body=f"Your OTP code is {otp}",
        to=[email]
    )
    message.send()

    cursor.close()
    conn.close()
    
    return jsonify({'success': True, 'message': 'OTP sent!'})


@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    otp = request.json['otp']
    if otp == session.get('otp') and datetime.now(timezone.utc) < session.get('otp_expiration'):
        session.pop('otp', None)
        session.pop('otp_expiration', None)
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Invalid or expired OTP.'})


@app.route('/buyer-profile')
def buyer_profile():
    user_id = session.get('user_id')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT profile_image FROM users WHERE id = %s", (user_id,))
    profile_image = cursor.fetchone()[0]
    cursor.close()
    conn.close()

    image_path = f"/static/Uploads/pics/{profile_image}" if profile_image else "/static/Uploads/pics/default-profile.png"
    return render_template('BuyerAccProfile.html', profile_image=image_path)





@app.route('/upload-profile-image', methods=['POST'])
def upload_profile_image():
    if 'profile_image' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'})

    file = request.files['profile_image']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'})

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'User not logged in'})

    # Get the file extension and construct the new filename
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    if file_ext not in ['png', 'jpg', 'jpeg']:
        return jsonify({'success': False, 'error': 'Invalid file type. Only PNG and JPG are allowed.'})

    new_filename = f"{user_id}-profile-image.{file_ext}"
    filepath = os.path.join('static/Uploads/pics', new_filename)

    # Check for and delete any existing profile image
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT profile_image FROM users WHERE id = %s", (user_id,))
    current_image = cursor.fetchone()[0]
    
    if current_image:
        current_image_path = os.path.join('static/Uploads/pics', current_image)
        if os.path.exists(current_image_path):
            os.remove(current_image_path)  # Delete the old image

    # Save the new file and update the database
    file.save(filepath)
    cursor.execute("UPDATE users SET profile_image = %s WHERE id = %s", (new_filename, user_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'success': True, 'imageName': new_filename})


@app.route('/profile/data')
def profile_data():
    user_id = session.get('user_id')  # Get user_id from session
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401  # Return error if user is not logged in

    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query user information
    cursor.execute("SELECT name, FullName, email, bio FROM users WHERE id = %s", (user_id,))
    user_data = cursor.fetchone()

    # Close the database connection
    cursor.close()
    conn.close()

    if user_data:
        # Convert the tuple to a dictionary for better access
        user_info = {
            'name': user_data[0],
            'FullName': user_data[1],
            'email': user_data[2],
            'bio': user_data[3],
        }
        return jsonify(user_info)  # Return user data as JSON
    else:
        return jsonify({'error': 'User not found'}), 404  # Return error if user not found
    

@app.route('/update_profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'User not logged in.'}), 401

    data = request.json
    email = data.get('email')
    full_name = data.get('fullName')
    bio = data.get('bio')
    username = data.get('username')

    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Attempt to update the user's information in the database
    cursor.execute(""" 
        UPDATE users 
        SET email = %s, FullName = %s, Bio = %s, name = %s 
        WHERE id = %s 
    """, (email, full_name, bio, username, session['user_id']))

    conn.commit()  # Commit the changes
    cursor.close()
    conn.close()

    return jsonify({'success': True})  # Indicate success without additional message


@app.route('/get-email', methods=['GET'])
def get_email():
    user_id = session.get('user_id')  # Retrieve user ID from session
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401
    
    # Database connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if result:
        email = result[0]
        return jsonify({"email": email}), 200
    else:
        return jsonify({"error": "User not found"}), 404
    



@app.route('/submit_seller_request', methods=['POST'])
def submit_seller_request():
    # Fetch current user details based on the session user_id
    user_id = session.get('user_id')
    
    if not user_id:
        flash("User not logged in.")
        return redirect(url_for('login'))  # Redirect to login if user is not authenticated

    # Open a database connection
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Use dictionary=True to get column names in results

    # Retrieve user information from the 'users' table
    cursor.execute("SELECT id, name, FullName, email FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        flash("User not found.")
        cursor.close()
        conn.close()
        return redirect(url_for('home'))  # Redirect to a relevant page if user is not found

    # Get the input data from the form
    shop_name = request.form.get('shopName')
    phone_number = request.form.get('phoneNumber')
    pickup_address = request.form.get('pickupAddress')
    street = request.form.get('detailed-pickupAddress')
    email = user['email']  # Assuming email is fetched from the user table
    
    # Generate custom request_id
    cursor.execute("SELECT request_id FROM seller_requests ORDER BY request_id DESC LIMIT 1")
    last_request = cursor.fetchone()
    
    if last_request:
        # Extract and increment the last number part
        last_number = int(last_request['request_id'].split('-')[1])
        new_request_id = f"0123-{last_number + 1:04d}"
    else:
        new_request_id = "0123-0001"  # Initial ID if table is empty

    # Insert new seller request into `seller_requests`
    cursor.execute(
        """
        INSERT INTO seller_requests (request_id, user_id, username, fullname, ShopName, PhoneNo, PickUpAdd, Street, Email, request_status, submitted_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (new_request_id, user['id'], user['name'], user['FullName'], shop_name, phone_number, pickup_address, street, email, "pending", datetime.now())
    )
    
    # Commit the transaction and close the connection
    conn.commit()
    cursor.close()
    conn.close()

    flash("Your seller request has been submitted successfully.")
    return redirect(url_for('success'))  # Redirect to a success page




if __name__ == "__main__":
    app.run(debug=True)