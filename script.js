
//need following functions
// async function login() {
// async function create_account() {

// Function to fetch data from the Raspberry Pi server
async function fetchData() {
    document.getElementById(
        "dataDisplay"
        ).innerText = `\nLoading...`;
    try {
        // Fetch data from the server
        const response = await fetch("http://172.18.23.28:5000/get_data");

        // Check if the response is OK (status 200)
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON data
        const data = await response.json();

        // Display the data in the HTML
        document.getElementById("dataDisplay").innerText = "\n" + JSON.stringify(
        data,
        null,
        2
        );
    } catch (error) {
        // Handle errors and display them in the HTML
        document.getElementById(
        "dataDisplay"
        ).innerText = `\nError: ${error.message}`;
        console.error(error);
    }
}

function registerPage() {
    const loginPage = document.querySelector("body");
    loginPage.innerHTML = `
    <div id="pinPassEnter">
      <h1>Enter Pin</h1>
        <form onsubmit="pinCheck(event)" method="get" id="pinPassForm">
            <div id="inputForm">
                <input type="password" placeholder="Enter Pin" required><br>
                <input type="password" placeholder="Enter New Password" required>
            </div>
            <br>
            <input type="submit" value="Submit"">
            <button id="backBtn" type="button" onclick="loginPage()">Back</button>
        </form>
    </div>
    `;
}

function loginPage() {
    const loginPage = document.querySelector("body");
    loginPage.innerHTML = `
    <div id="loginStart">
      <h1>Enter Password</h1>
      <form onsubmit="passCheck(event)" method="get" id="loginForm">
        <input type="password" placeholder="Enter Password" required><br><br>
        <input type="submit" value="Submit">
        <button id="registBtn" type="button" onclick="registerPage()">Register</button>
      </form>
    </div>
    `;
}

function passCheck(event){
    event.preventDefault();
    console.log("passCheck");
}

function pinCheck(event){
    event.preventDefault();
    console.log("pinCheck");
}

