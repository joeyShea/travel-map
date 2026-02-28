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


def _to_nullable_string(value):
    if value is None:
        return None
    value_as_string = str(value).strip()
    return value_as_string if value_as_string else None


def _require_authenticated_user():
    user_id = session.get("user_id")
    email = session.get("email")
    if not user_id or not email:
        return None

    user = _get_user_by_email(email)
    if not user or user["user_id"] != user_id:
        session.clear()
        return None

    return user


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


@app.route("/trips", methods=["POST", "OPTIONS"])
def create_trip_with_details():
    if request.method == "OPTIONS":
        return ("", 204)

    authenticated_user = _require_authenticated_user()
    if not authenticated_user:
        return jsonify({"error": "authentication required"}), 401

    payload = request.get_json(silent=True) or {}
    title = _to_nullable_string(payload.get("title"))
    if not title:
        return jsonify({"error": "title is required"}), 400

    lodgings = payload.get("lodgings") or []
    activities = payload.get("activities") or []
    tags = payload.get("tags") or []

    if not isinstance(lodgings, list):
        return jsonify({"error": "lodgings must be a list"}), 400
    if not isinstance(activities, list):
        return jsonify({"error": "activities must be a list"}), 400
    if not isinstance(tags, list):
        return jsonify({"error": "tags must be a list"}), 400

    try:
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO trips (
                thumbnail_url,
                title,
                description,
                latitude,
                longitude,
                cost,
                duration,
                date,
                visibility,
                owner_user_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING trip_id
            """,
            (
                _to_nullable_string(payload.get("thumbnail_url")),
                title,
                _to_nullable_string(payload.get("description")),
                _to_nullable_string(payload.get("latitude")),
                _to_nullable_string(payload.get("longitude")),
                _to_nullable_string(payload.get("cost")),
                duration,
                _to_nullable_string(payload.get("date")),
                visibility,
                authenticated_user["user_id"],
            ),
        )
        created_trip = cur.fetchone()
        if not created_trip:
            cur.close()
            conn.rollback()
            return jsonify({"error": "failed to create trip"}), 500

        trip_id = created_trip[0]

        inserted_tags = []
        for tag in tags:
            clean_tag = _to_nullable_string(tag)
            if not clean_tag:
                continue

            cur.execute(
                """
                INSERT INTO trip_tags (trip_id, tag)
                VALUES (%s, %s)
                ON CONFLICT (trip_id, tag) DO NOTHING
                """,
                (trip_id, clean_tag),
            )
            inserted_tags.append(clean_tag)

        created_lodgings = []
        for lodging in lodgings:
            if not isinstance(lodging, dict):
                continue

            cur.execute(
                """
                INSERT INTO lodgings (
                    trip_id,
                    address,
                    thumbnail_url,
                    title,
                    description,
                    latitude,
                    longitude,
                    cost
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING lodge_id
                """,
                (
                    trip_id,
                    _to_nullable_string(lodging.get("address")),
                    _to_nullable_string(lodging.get("thumbnail_url")),
                    _to_nullable_string(lodging.get("title")),
                    _to_nullable_string(lodging.get("description")),
                    _to_nullable_string(lodging.get("latitude")),
                    _to_nullable_string(lodging.get("longitude")),
                    _to_nullable_string(lodging.get("cost")),
                ),
            )
            lodging_id = cur.fetchone()
            if lodging_id:
                created_lodgings.append({"lodge_id": lodging_id[0]})

        created_activities = []
        for activity in activities:
            if not isinstance(activity, dict):
                continue

            cur.execute(
                """
                INSERT INTO activities (
                    trip_id,
                    address,
                    thumbnail_url,
                    title,
                    location,
                    description,
                    latitude,
                    longitude,
                    cost
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING activity_id
                """,
                (
                    trip_id,
                    _to_nullable_string(activity.get("address")),
                    _to_nullable_string(activity.get("thumbnail_url")),
                    _to_nullable_string(activity.get("title")),
                    _to_nullable_string(activity.get("location")),
                    _to_nullable_string(activity.get("description")),
                    _to_nullable_string(activity.get("latitude")),
                    _to_nullable_string(activity.get("longitude")),
                    _to_nullable_string(activity.get("cost")),
                ),
            )
            activity_id = cur.fetchone()
            if activity_id:
                created_activities.append({"activity_id": activity_id[0]})

        conn.commit()
        cur.close()

        return (
            jsonify(
                {
                    "message": "trip created",
                    "trip_id": trip_id,
                    "owner_user_id": authenticated_user["user_id"],
                    "tags": inserted_tags,
                    "lodgings": created_lodgings,
                    "activities": created_activities,
                }
            ),
            201,
        )
    except Exception as error:
        conn.rollback()
        app.logger.exception("Create trip failed")
        return jsonify({"error": f"create trip failed: {str(error)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", "5001")))