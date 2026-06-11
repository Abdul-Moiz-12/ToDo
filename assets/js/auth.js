// Supabase Setup
const supabaseUrl = "https://ytyuthjlgjwlorblfyim.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0eXV0aGpsZ2p3bG9yYmxmeWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjQzNDEsImV4cCI6MjA5NjE0MDM0MX0.8nyTL-N8ygfH88X1uCtyiTF66ykx0MGHaDMpFiWsKAI";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// 1. TABS TOGGLE LOGIC
loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.remove("notVisible");
    signupForm.classList.add("notVisible");
});

signupTab.addEventListener("click", () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.remove("notVisible");
    loginForm.classList.add("notVisible");
});

// 2. SIGN UP LOGIC
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Signup Error: " + error.message);
    } else {
        alert("Signup Successful! Please check your email for confirmation link (if enabled) or try logging in.");
        loginTab.click(); // Automatically switch to login form
    }
});

// 3. LOGIN LOGIC
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Login Error: " + error.message);
    } else {
        alert("Login Successful! Redirecting to Dashboard...");
        // Yahan 'index.html' aapke todo dashboard page ka naam hona chahiye
        window.location.href = "index.html";
    }
});