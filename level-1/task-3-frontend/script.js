const API_URL = "http://localhost:5000/api/users";

const userForm = document.getElementById("userForm");
const userTableBody = document.getElementById("userTableBody");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");


// ========================================
// GET ALL USERS
// ========================================

async function fetchUsers() {

    loading.style.display = "block";

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to fetch users");
        }

        displayUsers(result.data);

    } catch (error) {

        console.error(error);

        userTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Failed to load users
                </td>
            </tr>
        `;

    } finally {

        loading.style.display = "none";
    }
}


// ========================================
// DISPLAY USERS
// ========================================

function displayUsers(users) {

    userTableBody.innerHTML = "";

    if (users.length === 0) {

        userTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No users found
                </td>
            </tr>
        `;

        return;
    }


    users.forEach(user => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.age}</td>
            <td>
                <button
                    class="delete-btn"
                    onclick="deleteUser(${user.id})"
                >
                    Delete
                </button>
            </td>
        `;

        userTableBody.appendChild(row);
    });
}


// ========================================
// CREATE USER
// ========================================

userForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const age = Number(document.getElementById("age").value);


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                age
            })

        });


        const result = await response.json();


        if (!response.ok) {
            throw new Error(result.message || "Failed to create user");
        }


        showMessage(
            "User created successfully!",
            "success"
        );


        userForm.reset();

        fetchUsers();


    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "error"
        );

    }

});


// ========================================
// DELETE USER
// ========================================

async function deleteUser(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok) {
            throw new Error(
                result.message || "Failed to delete user"
            );
        }


        showMessage(
            "User deleted successfully!",
            "success"
        );


        fetchUsers();


    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "error"
        );

    }
}


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(text, type) {

    message.textContent = text;

    message.className = type;


    setTimeout(() => {

        message.textContent = "";
        message.className = "";

    }, 3000);
}


// ========================================
// REFRESH
// ========================================

refreshBtn.addEventListener(
    "click",
    fetchUsers
);


// ========================================
// INITIAL LOAD
// ========================================

fetchUsers();