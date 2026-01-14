
import sqlite3
import os

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tenants_tenant';")
tables = cursor.fetchall()
if not tables:
    print("tenants_tenant missing. Deleting migration...")
    cursor.execute("DELETE FROM django_migrations WHERE app='tenants';")
    conn.commit()
    print("Deleted.")
else:
    print("tenants_tenant exists.")

conn.close()
