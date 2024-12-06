const SERVER_IP = "172.18.20.158";
const SERVER_PORT = "5000";

// Fetch CAN data from the server and update the dashboard
async function fetchData() {
    try {
        const response = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/get_data`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // const data = {
        //     rpm: 200,
        //     speed: 20,
        //     temperature: 90,
        //     fuel: 25
        // };

        // Map keys to user-friendly labels and corresponding table rows
        const dataMapping = {
            rpm: "RPM (Revolutions Per Minute)",
            speed: "Speed (km/h)",
            temperature: "Coolant Temperature (°C)",
            fuel: "Fuel Level (%)"
        };

        // Update the second column of the table with the new values
        for (const [key, label] of Object.entries(dataMapping)) {
            const row = document.querySelector(
                `tr[data-label="${label}"] td:last-child`
            );
            if (row) row.textContent = data[key] !== null ? data[key] : "No data";
        }

        // Normalize and update the speedometer with data
        const speedValue = (data.speed || 0) / 200; 
        const rpmValue = (data.rpm || 0) / 800; 
        const fuelValue = (data.fuel || 0) / 100; 
        // const turnSignals = { left: false, right: false };
        
        draw(speedValue, rpmValue, fuelValue, 0, turnSignals, icons);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data from the server.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Define turnSignals variable as required by the draw function
    const turnSignals = { left: false, right: false }; 
    const icons = document.getElementById("sprite"); 

    console.log("Initializing speedometer...");
    draw(0, 0, 0, 0, turnSignals, icons); // Initial render with zero values
});


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
            <div class="btns">
                <input id="submitBtn" type="submit" value="Submit">
                <button id="backBtn" type="button" onclick="loginPage()">Back</button>
            </div>
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
