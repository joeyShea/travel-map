import os
from flask import Flask, redirect, url_for, session
from authlib.integrations.flask_client import OAuth
import psycopg2
from dotenv import load_dotenv

# Load env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# PostgreSQL connection
conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST"),
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
)

# OAuth setup for Cognito
oauth = OAuth(app)
COGNITO_URL = f"https://cognito-idp.{os.getenv('COGNITO_REGION')}.amazonaws.com/{os.getenv('COGNITO_USER_POOL_ID')}"

oauth.register(
    name='oidc',
    authority=COGNITO_URL,
    client_id=os.getenv("COGNITO_CLIENT_ID"),
    client_secret=os.getenv("COGNITO_CLIENT_SECRET"),
    server_metadata_url=f"{COGNITO_URL}/.well-known/openid-configuration",
    client_kwargs={'scope': 'openid email profile'}
)

# -----------------------------
# Routes
# -----------------------------

@app.route('/')
def index():
    user = session.get('user')
    if user:
        return f'Hello, {user["email"]}. <a href="/logout">Logout</a>'
    else:
        return f'Welcome! Please <a href="/login">Login</a>.'

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return oauth.oidc.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    # Get token + user info from Cognito
    token = oauth.oidc.authorize_access_token()
    user_info = token['userinfo']
    session['user'] = user_info

    # Auto-create traveler in Postgres
    cognito_sub = user_info['sub']
    email = user_info.get('email')
    name = user_info.get('name')

    cur = conn.cursor()
    cur.execute("SELECT user_id FROM travelers WHERE cognito_sub=%s", (cognito_sub,))
    row = cur.fetchone()
    if not row:
        cur.execute(
            """
            INSERT INTO travelers (cognito_sub, name, email)
            VALUES (%s, %s, %s)
            RETURNING user_id
            """,
            (cognito_sub, name, email)
        )
        conn.commit()
        user_id = cur.fetchone()[0]
    else:
        user_id = row[0]

    cur.close()
    # store user_id in session if needed
    session['user_id'] = user_id

    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('user_id', None)
    return redirect(url_for('index'))

# -----------------------------
# Protected route example
# -----------------------------
@app.route('/my_trips')
def my_trips():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))
    cur = conn.cursor()
    cur.execute("SELECT trip_id, title FROM trips WHERE owner_user_id=%s", (user_id,))
    trips = cur.fetchall()
    cur.close()
    html = "<h1>My Trips</h1><ul>"
    for trip in trips:
        html += f"<li>{trip[1]} (ID: {trip[0]})</li>"
    html += "</ul>"
    return html

# -----------------------------
# Run App
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)