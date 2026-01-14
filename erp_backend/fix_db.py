
import sqlite3
import os

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Deleting admin and auth migrations...")
cursor.execute("DELETE FROM django_migrations WHERE app IN ('admin', 'auth', 'contenttypes', 'sessions');")
conn.commit()

print("Verifying...")
cursor.execute("SELECT app, name FROM django_migrations;")
rows = cursor.fetchall()
print(f"Remaining migrations: {len(rows)}")
for r in rows:
    print(r)

conn.close()
