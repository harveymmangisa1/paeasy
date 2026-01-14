
import sqlite3
import os

db_path = 'db.sqlite3'
if not os.path.exists(db_path):
    print("No db.sqlite3 found.")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users_user', 'auth_user', 'django_admin_log');")
tables = [r[0] for r in cursor.fetchall()]
print(f"Tables found: {tables}")

# Check migrations
cursor.execute("SELECT app, name FROM django_migrations WHERE app IN ('users', 'admin', 'auth');")
migrations = cursor.fetchall()
print("Migrations found:")
for m in migrations:
    print(m)

conn.close()
