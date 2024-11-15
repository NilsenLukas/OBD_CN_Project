// Existing fetchData function to retrieve data from the Raspberry Pi server
async function fetchData() {
    document.getElementById("dataDisplay").innerText = "Loading...";
    try {
        const response = await fetch("http://172.18.23.28:5000/get_data");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById("dataDisplay").innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById("dataDisplay").innerText = `Error: ${error.message}`;
        console.error(error);
    }
}

// Navigation function to redirect to registration page
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
            <input type="submit" value="Submit">
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
        </div>
      </form>
    </div>
    `;
}

// Function to check password input
async function passCheck(event) {
    event.preventDefault();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://172.18.23.28:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (!response.ok) throw new Error("Server error during login.");

        const result = await response.json();
        alert(result.message); // Show response message
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
        const response = await fetch("http://172.18.23.28:5000/create_account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin, password }),
        });

        if (!response.ok) throw new Error("Server error during account creation.");

        const result = await response.json();
        alert(result.message); // Show response message
        if (result.message === "Account created successfully") {
            window.location.href = 'index.html'; // Redirect to login page if successful
        }
    } catch (error) {
        console.error("Error during account creation:", error);
        alert("Error during account creation.");
    }
}
