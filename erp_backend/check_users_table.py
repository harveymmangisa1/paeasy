
import sqlite3
import os

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users_user';")
tables = cursor.fetchall()
if tables:
    print("users_user exists.")
else:
    print("users_user missing.")

conn.close()
