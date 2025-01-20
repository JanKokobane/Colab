// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCojD7DoEYXtQAREfvhqbaygCN1XoHKak0",
    authDomain: "colab-bd5c9.firebaseapp.com",
    projectId: "colab-bd5c9",
    storageBucket: "colab-bd5c9.appspot.com",
    messagingSenderId: "1070826813260",
    appId: "1:1070826813260:web:803d8c3a8cbd96f79281e9",
    measurementId: "G-3VC04DBHNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Google Sign-In
document.getElementById('googleSignIn').addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            // Handle successful sign-in
            const user = result.user;
            console.log('Google sign-in successful:', user);

            // Send user information to your backend for signup/login
            fetch('http://127.0.0.1:5000/google-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: user.displayName, email: user.email, uid: user.uid })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error during backend processing:', data.error);
                    // Display error message to user
                    document.getElementById('emailError').textContent = 'An error occurred. Please try again.';
                } else {
                    // Store JWT token and user data
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('user', JSON.stringify({ name: user.displayName, email: user.email, uid: user.uid }));

                    if (data.isNewUser) {
                        // Redirect to login page if it's a new user
                        window.location.href = '/frontend/login.html';
                    } else {
                        // Redirect to dashboard if the user already exists
                        window.location.href = '/frontend/dashboard.html';
                    }
                }
            })
            .catch(error => {
                console.error('Error during backend processing:', error);
                // Display error message to user
                document.getElementById('emailError').textContent = 'An error occurred. Please try again.';
            });
        })
        .catch((error) => {
            // Handle errors
            console.error('Error during Google sign-in:', error);
        });
});

