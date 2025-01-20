import mysql.connector
import logging

logging.basicConfig(level=logging.INFO)  # Ensure logging is set up properly

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='Mojancko01.mysql.pythonanywhere-services.com',  # Your database host
            user='Mojancko01',                                   # Your PythonAnywhere username
            password='Mojancko@01',                              # Your database password
            database='Mojancko01$collab_db',                     # Full database name
            port=3306                                            # Default MySQL port
        )
        if connection.is_connected():
            logging.info("Connected to the database successfully.")
            return connection
    except mysql.connector.Error as err:
        logging.error(f"Database connection error: {err}")
        return None
