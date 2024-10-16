from flask import Flask, render_template, request, redirect, jsonify, url_for
import mysql.connector

app = Flask(__name__)

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",  # Your DB username
        password="",  # Your DB password
        database="goodboisdb"
    )




@app.route('/')  # Define the route for the root URL
def home():
    return render_template('index.html')  # Ensure the template exists

@app.route('/logout')
def index():
    return render_template('index.html')
#Sign up
@app.route('/submit_form', methods=['POST'])
def submit_form():
    name = request.form['name']
    email = request.form['email']
    password = request.form['password']
    user_type = 'Buyer'  # Default user type
    archive = 'no'

    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO users (name, email, password, user_type, archieve) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (name, email, password, user_type,archive))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Sign Up Successful'})

# Sign in form
@app.route('/login', methods=['POST'])
def login():
    try:
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "SELECT * FROM users WHERE email = %s AND password = %s"
        cursor.execute(sql, (email, password))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            user_type = user[4]  # Assuming user_type is the 5th column in your table
            name = user[1]  # Assuming name is the 2nd column

            if user_type == 'Buyer':
                return jsonify({'redirect': 'success', 'name': name})
            elif user_type == 'Admin':
                return jsonify({'redirect': 'admin', 'name': name})
        else:
            return jsonify({'error': 'Invalid Email or Password.'}), 401
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/success')
def success():
    name = request.args.get('name', '')
    return render_template('success.html', name=name)

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
    cursor.execute("SELECT id, name, email, password, user_type FROM users WHERE archieve = 'yes'")  # Fetch archived users
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
            'password': user[3],  # Include password in the response
            'user_type': user[4],
        })

    return jsonify(archived_user_list)


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
    cursor.execute("SELECT id, name, email, password, user_type FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        # Convert the result into a dictionary
        user_data = {
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'password': user[3],
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
    password = data.get('password')
    user_type = data.get('user_type')  # Get user type from request

    conn = get_db_connection()
    cursor = conn.cursor()

    # Update user details in the database
    cursor.execute("""
        UPDATE users 
        SET name = %s, email = %s, password = %s, user_type = %s 
        WHERE id = %s
    """, (name, email, password, user_type, user_id))
    
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


if __name__ == "__main__":
    app.run(debug=True)
