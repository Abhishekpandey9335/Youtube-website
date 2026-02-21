document.getElementById("loginForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });

    const data = await response.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    if(data.role === "ADMIN"){
        window.location.href = "admin.html";
    } else {
        window.location.href = "home.html";
    }
});
