const token = localStorage.getItem("token");

fetch("http://localhost:8080/api/admin/total-users", {
    headers: {
        "Authorization": "Bearer " + token
    }
})
.then(res => res.text())
.then(data => {
    document.getElementById("totalUsers").innerText = data;
});

fetch("http://localhost:8080/api/admin/users", {
    headers: {
        "Authorization": "Bearer " + token
    }
})
.then(res => res.json())
.then(users => {
    const list = document.getElementById("userList");

    users.forEach(user => {
        const li = document.createElement("li");
        li.innerText = user.email + " | Login Count: " + user.loginCount;
        list.appendChild(li);
    });
});
