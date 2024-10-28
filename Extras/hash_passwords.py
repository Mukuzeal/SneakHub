import mysql.connector
import bcrypt
import os

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",  # Your DB username
        password="",  # Your DB password
        database="goodboisdb"
    )

def hash_passwords():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Fetch all users from the database
        cursor.execute("SELECT id, password FROM users")
        users = cursor.fetchall()

        for user in users:
            user_id = user[0]
            plain_password = user[1].encode('utf-8')  # Ensure the password is in bytes
            
            # Hash the password
            hashed_password = bcrypt.hashpw(plain_password, bcrypt.gensalt())
            
            # Update the user record with the new hashed password
            cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, user_id))
            print(f"Updated user ID {user_id} with hashed password.")

        # Commit the changes
        conn.commit()

    except Exception as e:
        print(f"An error occurred: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    hash_passwords()
