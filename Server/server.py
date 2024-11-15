import socket
import json
import hashlib
import os

USERS_FILE = "users.json"

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as file:
            return json.load(file)
    return []

def save_users(users):
    with open(USERS_FILE, "w") as file:
        json.dump(users, file)


users = load_users()
valid_pins = {"1234", "5678", "91011"}  

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def handle_request(client_connection):
    global users
    request = client_connection.recv(1024).decode('utf-8')
    print(f"Request received:\n{request}")

    if "OPTIONS" in request:  
        response = (
            "HTTP/1.1 204 No Content\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
            "Access-Control-Allow-Headers: Content-Type\r\n"
            "Connection: close\r\n"
            "\r\n"
        )
        client_connection.sendall(response.encode('utf-8'))
        client_connection.close()
        return

    if "GET /get_data" in request:
        can_data = {
            "speed": 55,
            "rpm": 3000,
            "temperature": 80
        }
        response_body = json.dumps(can_data)
        response = (
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            f"Content-Length: {len(response_body)}\r\n"
            "Connection: close\r\n"
            "\r\n"
            f"{response_body}"
        )

    elif "POST /create_account" in request:
        body = request.split("\r\n\r\n")[1]
        data = json.loads(body)
        password = data.get("password")
        pin = data.get("pin")

        if pin in valid_pins:
            hashed_password = hash_password(password)
            users.append(hashed_password)
            save_users(users)  
            response_body = {"message": "Account created successfully"}
        else:
            response_body = {"message": "Invalid PIN"}

        response = (
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            f"Content-Length: {len(json.dumps(response_body))}\r\n"
            "Connection: close\r\n"
            "\r\n"
            f"{json.dumps(response_body)}"
        )

    elif "POST /login" in request:
        body = request.split("\r\n\r\n")[1]
        data = json.loads(body)
        password = data.get("password")
        hashed_password = hash_password(password)

        if hashed_password in users:
            response_body = {"message": "Login successful"}
        else:
            response_body = {"message": "Invalid password"}

        response = (
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            f"Content-Length: {len(json.dumps(response_body))}\r\n"
            "Connection: close\r\n"
            "\r\n"
            f"{json.dumps(response_body)}"
        )

    else:
        response_body = {"message": "Endpoint not found"}
        response = (
            "HTTP/1.1 404 Not Found\r\n"
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            f"Content-Length: {len(json.dumps(response_body))}\r\n"
            "Connection: close\r\n"
            "\r\n"
            f"{json.dumps(response_body)}"
        )

    client_connection.sendall(response.encode('utf-8'))
    client_connection.close()

def run_server(host='0.0.0.0', port=5000):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((host, port))
    server_socket.listen(5)
    print(f"Server running on {host}:{port}...")

    while True:
        client_connection, client_address = server_socket.accept()
        print(f"Connection from {client_address}")
        handle_request(client_connection)

if __name__ == '__main__':
    run_server()
