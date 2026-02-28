import os

import bcrypt
import psycopg2
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret")
CLIENT_APP_URL = os.getenv("CLIENT_APP_URL", "http://localhost:3000")

conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST"),
    port=5432,
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
    sslmode="require",
)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = CLIENT_APP_URL
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def _safe_user_row_to_json(row):
    return {
        "user_id": row["user_id"],
        "name": row["name"],
        "email": row["email"],
    }


def _get_user_by_email(email: str):
    cur = conn.cursor()
    cur.execute(
        """
        SELECT user_id, name, email, password_hash
        FROM travelers
        WHERE email=%s
        LIMIT 1
        """,
        (email,),
    )
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {
        "user_id": row[0],
        "name": row[1],
        "email": row[2],
        "password_hash": row[3],
    }


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/create-user", methods=["POST", "OPTIONS"])
def create_user():
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        payload = request.get_json(silent=True) or request.form
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""
        name = (payload.get("name") or "").strip() or email.split("@")[0]

        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400
        if len(password) < 8:
            return jsonify({"error": "password must be at least 8 characters"}), 400

        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        cur = conn.cursor()
        cur.execute("SELECT user_id FROM travelers WHERE email=%s", (email,))
        existing = cur.fetchone()
        if existing:
            cur.close()
            return jsonify({"error": "user already exists"}), 409

        cur.execute(
            """
            INSERT INTO travelers (name, email, password_hash, verified)
            VALUES (%s, %s, %s, FALSE)
            RETURNING user_id
            """,
            (name, email, password_hash),
        )
        created = cur.fetchone()
        conn.commit()
        cur.close()

        if not created:
            return jsonify({"error": "failed to create user"}), 500

        session["user_id"] = created[0]
        session["email"] = email

        return jsonify({"message": "user created", "user_id": created[0], "email": email}), 201

    except Exception as error:
        conn.rollback()
        app.logger.exception("Create user failed")
        return jsonify({"error": f"create user failed: {str(error)}"}), 500


@app.route("/login", methods=["POST", "OPTIONS"])
def login_user():
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        payload = request.get_json(silent=True) or request.form
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""

        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400

        user = _get_user_by_email(email)
        if not user:
            return jsonify({"error": "invalid email or password"}), 401

        password_hash = user.get("password_hash") or ""
        if not password_hash:
            return jsonify({"error": "invalid email or password"}), 401

        password_valid = bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
        if not password_valid:
            return jsonify({"error": "invalid email or password"}), 401

        session["user_id"] = user["user_id"]
        session["email"] = user["email"]

        return jsonify(
            {
                "message": "logged in",
                "user": {
                    "user_id": user["user_id"],
                    "name": user["name"],
                    "email": user["email"],
                },
            }
        ), 200
    except Exception as error:
        app.logger.exception("Login failed")
        return jsonify({"error": f"login failed: {str(error)}"}), 500


@app.route("/me", methods=["GET", "OPTIONS"])
def me():
    if request.method == "OPTIONS":
        return ("", 204)

    user_id = session.get("user_id")
    email = session.get("email")
    if not user_id or not email:
        return jsonify({"authenticated": False}), 401

    user = _get_user_by_email(email)
    if not user or user["user_id"] != user_id:
        session.clear()
        return jsonify({"authenticated": False}), 401

    return jsonify(
        {
            "authenticated": True,
            "user": {
                "user_id": user["user_id"],
                "name": user["name"],
                "email": user["email"],
            },
        }
    ), 200


@app.route("/logout", methods=["POST", "OPTIONS"])
def logout():
    if request.method == "OPTIONS":
        return ("", 204)

    session.clear()
    return jsonify({"message": "logged out"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", "5001")))