import socket
import json
import hashlib
import os
import can 
import time

USERS_FILE = "users.json"

# Load users from file
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as file:
            return json.load(file)
    return []

# Save users to file
def save_users(users):
    with open(USERS_FILE, "w") as file:
        json.dump(users, file)

users = load_users()
valid_pins = {"1234", "5678", "91011"}  # Predefined set of valid pins

# Utility function for hashing passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# CAN bus initialization
def init_can():
    os.system('sudo ip link set can0 type can bitrate 500000')
    os.system('sudo ifconfig can0 up')
    return can.interface.Bus(channel='can0', bustype='socketcan')

# Send a request to the CAN bus
def send_can_request(can_bus, pid):
    OBD_REQUEST_ID = 0x7DF  # Standard OBD-II request ID
    msg = can.Message(
        arbitration_id=OBD_REQUEST_ID,
        data=[0x02, 0x01, pid, 0, 0, 0, 0, 0],  # OBD-II request format
        is_extended_id=False
    )
    can_bus.send(msg)

# Decode CAN message
def decode_can_data(msg):
    ECU_CODE = 0x7E8
    if not msg or msg.arbitration_id != ECU_CODE or len(msg.data) < 3:
        return None

    PID_RPM = 0x0C
    PID_SPEED = 0x0D
    PID_COOLANT_TEMP = 0x05
    PID_FUEL_LEVEL = 0x2F  

    pid = msg.data[2]
    if pid == PID_RPM:
        rpm = (msg.data[3] * 256 + msg.data[4]) / 4
        return {"rpm": rpm}
    elif pid == PID_SPEED:
        speed = msg.data[3]
        return {"speed": speed}
    elif pid == PID_COOLANT_TEMP:
        temp = msg.data[3] - 40
        return {"temperature": temp}
    elif pid == PID_FUEL_LEVEL:
        fuel = (msg.data[3] * 100) / 255 
        return {"fuel": fuel}
    else:
        return None

def fetch_can_data(can_bus):
    # List of PIDs to request
    pids = {
        "rpm": 0x0C,  # PID for RPM
        "speed": 0x0D,  # PID for Speed
        "temperature": 0x05,  # PID for Coolant Temp
        "fuel": 0x2F
    }

    data = {"rpm": None, "speed": None, "temperature": None, "fuel": None}

    for key, pid in pids.items():
        send_can_request(can_bus, pid)  # Send request for the PID

        # Wait for response
        start_time = time.time()
        while time.time() - start_time < 1:  # Wait up to 1 second
            msg = can_bus.recv(0.5)  # Receive message with a 0.5-second timeout
            if msg:
                decoded = decode_can_data(msg)
                if decoded and key in decoded: # Checks if decoded and if its the right decoded message 
                    data[key] = decoded[key]
                    break  # Break the while loop once the data is received

    return data

def handle_request(client_connection, can_bus):
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
        can_data = fetch_can_data(can_bus)
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
            f"{response_body}"
        )

    client_connection.sendall(response.encode('utf-8'))
    client_connection.close()

def run_server(host='0.0.0.0', port=5000):
    can_bus = init_can()  # Initialize CAN bus
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((host, port))
    server_socket.listen(5)
    print(f"Server running on {host}:{port}...")

    try:
        while True:
            client_connection, client_address = server_socket.accept()
            print(f"Connection from {client_address}")
            handle_request(client_connection, can_bus)
    except KeyboardInterrupt:
        print("Shutting down server...")
    finally:
        os.system('sudo ifconfig can0 down')  # Bring down CAN interface

if __name__ == '__main__':
    run_server()