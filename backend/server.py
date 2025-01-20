from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import logging
from db_connection import get_db_connection



def generate_token(user_id):
    return create_access_token(identity=user_id)

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:5500"])

# Configure JWT
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
jwt = JWTManager(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    app.logger.debug(f"Received data: name={name}, email={email}, password={password}")

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if user already exists
        check_query = "SELECT id FROM users WHERE email = %s"
        cursor.execute(check_query, (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'User already exists'}), 409

        # Insert data into your database
        insert_query = "INSERT INTO users (name, email, password, created_at) VALUES (%s, %s, %s, NOW())"
        cursor.execute(insert_query, (name, email, password))
        connection.commit()

        # Generate JWT token
        user_id = cursor.lastrowid
        access_token = create_access_token(identity={'id': user_id, 'name': name, 'email': email})

        cursor.close()
        connection.close()
        app.logger.info("Signup successful!")

        return jsonify({
            'message': 'Signup successful!',
            'access_token': access_token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email
            }
        }), 200
    except Exception as e:
        app.logger.error(f"Error during signup: {e}")
        return jsonify({'error': 'An error occurred during signup'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    app.logger.debug(f"Received login data: email={email}, password={password}")

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Validate user credentials and fetch user details
        query = "SELECT id, name, email FROM users WHERE email = %s AND password = %s"
        cursor.execute(query, (email, password))
        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        access_token = create_access_token(identity={'id': user[0], 'name': user[1], 'email': user[2]})
        app.logger.info("Login successful!")

        return jsonify({
            'message': 'Login successful!',
            'access_token': access_token,
            'user': {
                'id': user[0],
                'name': user[1],
                'email': user[2]
            }
        }), 200
    except Exception as e:
        app.logger.error(f"Error during login: {e}")
        return jsonify({'error': 'An error occurred during login'}), 500

@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@app.route('/upload-profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    email = get_jwt_identity()['email']
    data = request.get_json()

    if 'image' not in data:
        return jsonify({'error': 'No image data provided'}), 400

    base64_image = data['image']

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        app.logger.debug(f"Base64 image size: {len(base64_image)}")
        app.logger.debug(f"Base64 image: {base64_image[:100]}...")  # Log the first 100 characters for debugging
        update_query = "UPDATE users SET profile_picture = %s WHERE email = %s"
        cursor.execute(update_query, (base64_image, email))
        connection.commit()
        cursor.close()
        connection.close()
        app.logger.info("Profile picture updated in database")
    except Exception as e:
        app.logger.error(f"Error updating profile picture: {e}")
        return jsonify({'error': 'An error occurred while updating profile picture'}), 500

    app.logger.debug('Profile picture uploaded successfully')
    return jsonify({'message': 'Profile picture uploaded successfully!'}), 200

@app.route('/google-auth', methods=['POST'])
def google_auth():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    uid = data.get('uid')
    app.logger.debug(f"Received Google auth data: name={name}, email={email}, uid={uid}")

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if user already exists
        check_query = "SELECT id FROM users WHERE email = %s"
        cursor.execute(check_query, (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            connection.close()
            return jsonify({'isNewUser': False, 'access_token': create_access_token(identity={'id': existing_user[0], 'name': name, 'email': email})}), 200

        # Insert new user data into your database
        insert_query = "INSERT INTO users (name, email, password, created_at) VALUES (%s, %s, %s, NOW())"
        cursor.execute(insert_query, (name, email, uid))
        connection.commit()

        # Generate JWT token
        user_id = cursor.lastrowid
        access_token = create_access_token(identity={'id': user_id, 'name': name, 'email': email})

        cursor.close()
        connection.close()
        app.logger.info("Google signup successful!")

        return jsonify({
            'isNewUser': True,
            'access_token': access_token
        }), 200
    except Exception as e:
        app.logger.error(f"Error during Google authentication: {e}")
        return jsonify({'error': 'An error occurred during Google authentication'}), 500

@app.route('/add-task', methods=['POST'])
def add_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    assignee = data.get('assignee')
    due_date = data.get('due_date')
    priority = data.get('priority')

    # Validate priority value
    if priority not in ['low', 'medium', 'high']:
        return jsonify({'error': 'Invalid priority value. Must be low, medium, or high.'}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        insert_query = """
        INSERT INTO tasks (title, description, assignee, due_date, priority)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (title, description, assignee, due_date, priority))
        connection.commit()

        cursor.close()
        connection.close()
        app.logger.info("Task added successfully!")

        return jsonify({'message': 'Task added successfully!'}), 200
    except Exception as e:
        app.logger.error(f"Error adding task: {e}")
        return jsonify({'error': 'An error occurred while adding the task'}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT id, name FROM users")
        users = cursor.fetchall()

        # Convert fetched data to a list of dictionaries
        users_list = [{'id': row[0], 'name': row[1]} for row in users]

        cursor.close()
        connection.close()

        return jsonify(users_list), 200
    except Exception as e:
        app.logger.error(f"Error fetching users: {e}")
        return jsonify({'error': 'An error occurred while fetching users'}), 500

@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT id, title, description, assignee, due_date, priority FROM tasks")
        tasks = cursor.fetchall()

        tasks_list = [{'id': row[0], 'title': row[1], 'description': row[2], 'assignee': row[3], 'due_date': row[4], 'priority': row[5]} for row in tasks]

        cursor.close()
        connection.close()

        return jsonify(tasks_list), 200
    except Exception as e:
        app.logger.error(f"Error fetching tasks: {e}")
        return jsonify({'error': 'An error occurred while fetching tasks'}), 500

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error deleting task: {e}")
        return jsonify({'error': 'An error occurred while deleting the task'}), 500


@app.route('/save_profile', methods=['POST'])
def save_profile():
    data = request.get_json()
    phone_number = data.get('phoneNumber')
    high_school = data.get('highSchool')
    college = data.get('college')
    area_of_study = data.get('areaOfStudy')
    additional_education_details = data.get('additionalEducationDetails')
    current_employer = data.get('currentEmployer')
    current_position = data.get('currentPosition')
    current_duration = data.get('currentDuration')
    previous_employer = data.get('previousEmployer')
    previous_position = data.get('previousPosition')
    previous_duration = data.get('previousDuration')
    additional_work_experience = data.get('additionalWorkExperience')

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        insert_query = """
        INSERT INTO user_profile (phone_number, high_school, college, area_of_study, additional_education_details, current_employer, current_position, current_duration, previous_employer, previous_position, previous_duration, additional_work_experience, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(insert_query, (
            phone_number, high_school, college, area_of_study, additional_education_details,
            current_employer, current_position, current_duration, previous_employer, previous_position,
            previous_duration, additional_work_experience))
        connection.commit()

        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Profile saved successfully!', 'userProfile': data}), 200
    except Exception as e:
        app.logger.error(f"Error saving profile: {e}")
        return jsonify({'error': 'An error occurred during saving profile'}), 500

@app.route('/get_user_info', methods=['GET'])
def get_user_info():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        select_query = "SELECT name, email FROM users WHERE id = %s"
        # Assuming you are fetching the details of a specific user based on user_id (hardcoding user_id=1 for simplicity)
        cursor.execute(select_query, (1,))
        user_info = cursor.fetchone()

        cursor.close()
        connection.close()

        if user_info:
            return jsonify({'fullName': user_info[0], 'personalEmail': user_info[1]}), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        app.logger.error(f"Error fetching user info: {e}")
        return jsonify({'error': 'An error occurred during fetching user info'}), 500


@app.route('/fetch_users', methods=['GET'])
def fetch_users():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT id, name FROM users")
        users = cursor.fetchall()

        cursor.close()
        connection.close()

        users_list = [{'id': user[0], 'name': user[1], 'jwt_token': generate_token(user[0])} for user in users] # Assuming generate_token(user_id) generates a JWT for each user
        return jsonify({'users': users_list}), 200
    except Exception as e:
        app.logger.error(f"Error fetching users: {e}")
        return jsonify({'error': 'An error occurred during fetching users'}), 500

@app.route('/get_user_name', methods=['GET'])
def get_user_name():
    try:
        # Replace this with actual logic to get the user's name
        user_name = "John Doe"
        return jsonify({'name': user_name}), 200
    except Exception as e:
        app.logger.error(f"Error getting user name: {e}")
        return jsonify({'error': 'An error occurred while fetching the user name'}), 500


@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '')
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Search tasks
        cursor.execute("SELECT * FROM tasks WHERE title LIKE %s OR description LIKE %s", (f'%{query}%', f'%{query}%'))
        tasks = cursor.fetchall()
        
        # Search user profiles
        cursor.execute("""
            SELECT * FROM user_profile WHERE 
            phone_number LIKE %s OR 
            high_school LIKE %s OR 
            college LIKE %s OR 
            area_of_study LIKE %s OR 
            additional_education_details LIKE %s OR 
            current_employer LIKE %s OR 
            current_position LIKE %s OR 
            current_duration LIKE %s OR 
            previous_employer LIKE %s OR 
            previous_position LIKE %s OR 
            previous_duration LIKE %s OR 
            additional_work_experience LIKE %s
        """, (f'%{query}%',) * 12)
        users = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({'tasks': tasks, 'users': users}), 200
    except Exception as e:
        app.logger.error(f"Error during search: {e}")
        return jsonify({'error': 'An error occurred during search'}), 500


@app.route('/fetch_tasks', methods=['GET'])
def fetch_tasks():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM tasks")
        tasks = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify({'tasks': tasks}), 200
    except Exception as e:
        app.logger.error(f"Error fetching tasks: {e}")
        return jsonify({'error': 'An error occurred while fetching tasks'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
