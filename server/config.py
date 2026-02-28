import os

from dotenv import load_dotenv

load_dotenv()

CLIENT_APP_URL = os.getenv("CLIENT_APP_URL", "http://localhost:3000")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
PORT = int(os.getenv("PORT", "5001"))

DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST"),
    "port": int(os.getenv("POSTGRES_PORT", "5432")),
    "dbname": os.getenv("POSTGRES_DB"),
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD"),
    "sslmode": os.getenv("POSTGRES_SSLMODE", "require"),
}
