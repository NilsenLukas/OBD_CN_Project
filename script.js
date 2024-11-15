
//need following functions
// async function login() {
// async function create_account() {


// Function to fetch data from the Raspberry Pi server
async function fetchData() {
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
        document.getElementById("dataDisplay").innerText = JSON.stringify(
        data,
        null,
        2
        );
    } catch (error) {
        // Handle errors and display them in the HTML
        document.getElementById(
        "dataDisplay"
        ).innerText = `Error: ${error.message}`;
        console.error(error);
    }
}


// Fetch data immediately on page load
fetchData();
