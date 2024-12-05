const SERVER_IP = "172.18.20.158";
const SERVER_PORT = "5000";

// Fetch CAN data from the server
async function fetchData() {
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = "";

    try {
        const response = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/get_data`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Map keys to user-friendly labels
        const formattedData = [
            { label: "RPM (Revolutions Per Minute)", value: data.rpm || "No data" },
            { label: "Speed (km/h)", value: data.speed || "No data" },
            { label: "Coolant Temperature (°C)", value: data.temperature || "No data" }
        ];
        // dataDisplay.innerHTML = "";
        // Populate the table with formatted data
        formattedData.forEach(item => {
            const row = document.createElement("tr");

            const labelCell = document.createElement("td");
            labelCell.textContent = item.label;

            const valueCell = document.createElement("td");
            valueCell.textContent = item.value;

            row.appendChild(labelCell);
            row.appendChild(valueCell);

            dataDisplay.appendChild(row);
        });
    } catch (error) {
        const row = document.createElement("tr");
        const errorCell = document.createElement("td");
        errorCell.setAttribute("colspan", 2);
        errorCell.textContent = `Error: ${error.message}`;
        row.appendChild(errorCell);
        dataDisplay.appendChild(row);

        console.error(error);
    }
}


// Navigation function to redirect to the registration page
function registerPage() {
    const loginPage = document.querySelector("body");
    loginPage.innerHTML = `
    <div id="pinPassEnter">
      <h1>Enter Pin</h1>
        <form onsubmit="pinCheck(event)" method="post" id="pinPassForm">
            <div id="inputForm">
                <input type="password" id="pin" placeholder="Enter Pin" required><br>
                <input type="password" id="newPassword" placeholder="Enter New Password" required>
            </div>
            <br>
            <input id="submitBtn" type="submit" value="Submit">
            <button id="backBtn" type="button" onclick="loginPage()">Back</button>
        </form>
    </div>
    `;
}

// Navigation function to return to the login page
function loginPage() {
    const loginPage = document.querySelector("body");
    loginPage.innerHTML = `
    <div id="loginStart">
      <h1>Enter Password</h1>
      <form onsubmit="passCheck(event)" method="post" id="loginForm">
        <input type="password" id="password" placeholder="Enter Password" required><br><br>
        <div class="btns">
            <input id="submitBtn" type="submit" value="Submit">
            <button id="registBtn" type="button" onclick="registerPage()">Register</button>
      </form>
    </div>
    `;
}

// Function to check password input
async function passCheck(event) {
    event.preventDefault();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        const result = await response.json();
        alert(result.message); 
    } catch (error) {
        console.error("Error during login:", error);
        alert("Error during login.");
    }
}

// Function to check PIN input during registration
async function pinCheck(event) {
    event.preventDefault();
    const pin = document.getElementById("pin").value;
    const password = document.getElementById("newPassword").value;

    try {
        const response = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/create_account`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin, password }),
        });

        const result = await response.json();
        alert(result.message); 
        if (result.message === "Account created successfully") {
            loginPage(); 
        }
    } catch (error) {
        console.error("Error during account creation:", error);
        alert("Error during account creation.");
    }
}
