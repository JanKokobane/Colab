import mysql.connector
import logging

logging.basicConfig(level=logging.INFO) 

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='#', 
            user='#',                                   
            password='#',                             
            database='#',                     
            port=3306                                           
        )
        if connection.is_connected():
            logging.info("Connected to the database successfully.")
            return connection
    except mysql.connector.Error as err:
        logging.error(f"Database connection error: {err}")
        return None
