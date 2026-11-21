// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// আপনার Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAj5UW69Ed6BNTZ7uKRjXYF5hCsKoWJyeE",
  authDomain: "monvex-660f1.firebaseapp.com",
  projectId: "monvex-660f1",
  storageBucket: "monvex-660f1.firebasestorage.app",
  messagingSenderId: "980809538898",
  appId: "1:980809538898:web:5b176771596b0284b22e8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Telegram Web App Initialization
const tg = window.Telegram.WebApp;
tg.expand(); 
tg.setHeaderColor('#0A0612'); 

// Global Variables
let userData = null;
let tgUser = null;

// DOM Elements
const forceJoinScreen = document.getElementById('force-join-screen');
const mainScreen = document.getElementById('main-screen');
const verifyBtn = document.getElementById('verify-btn');
const verifyMsg = document.getElementById('verify-message');
const userNameEl = document.getElementById('user-name');
const userPhotoEl = document.getElementById('user-photo');
const coinBalanceEl = document.getElementById('coin-balance');
const tapCircle = document.getElementById('tap-circle');
const energyCountEl = document.getElementById('energy-count');

// --- 1. INITIALIZATION & AUTH ---
document.addEventListener('DOMContentLoaded', async () => {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        tgUser = tg.initDataUnsafe.user;
        userNameEl.textContent = tgUser.first_name;
        // টেলিগ্রাম থেকে ডিপি অটোমেটিক সেট হবে
        userPhotoEl.src = tgUser.photo_url || "https://i.ibb.co/3W1Z8Y7/default-avatar.png"; 
        
        // ডাটাবেস থেকে ইউজার ডাটা লোড করুন
        await loadUserData(tgUser.id);
    } else {
        alert("Please open this app inside Telegram.");
        tg.close();
    }
});

// --- 2. FORCE JOIN VERIFICATION LOGIC ---
verifyBtn.addEventListener('click', async () => {
    verifyBtn.textContent = "Verifying...";
    verifyMsg.style.color = "#FFD700";
    verifyMsg.textContent = "Checking channel membership...";

    // এখানে আপাতত ২ সেকেন্ড পর ধরে নিচ্ছি সে জয়েন করেছে।
    setTimeout(() => {
        verifyMsg.style.color = "#00FF00";
        verifyMsg.textContent = "Verification Successful!";
        
        setTimeout(() => {
            forceJoinScreen.classList.remove('active');
            mainScreen.classList.add('active');
        }, 1000);
    }, 2000);
});

// --- 3. FIREBASE DATABASE LOGIC ---
async function loadUserData(telegramId) {
    const userRef = doc(db, "users", telegramId.toString());
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        userData = userSnap.data();
        updateUI();
    } else {
        // নতুন ইউজার তৈরি
        const newUser = {
            telegramId: telegramId.toString(),
            username: tgUser.username || "",
            firstName: tgUser.first_name || "",
            coins: 0,
            energy: 1000,
            energyMax: 1000,
            tapPower: 1,
            level: 1,
            createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newUser);
        userData = newUser;
        updateUI();
    }
}

function updateUI() {
    if (userData) {
        coinBalanceEl.textContent = userData.coins;
        energyCountEl.textContent = userData.energy;
    }
}

// --- 4. TAP TO MINE LOGIC ---
tapCircle.addEventListener('click', async () => {
    if (userData.energy <= 0) {
        tg.showAlert("Energy depleted! Wait for refill.");
        return;
    }

    // Optimistic UI Update
    userData.coins += userData.tapPower;
    userData.energy -= 1;
    updateUI();

    // Animate Tap
    tapCircle.style.transform = "scale(0.9)";
    setTimeout(() => tapCircle.style.transform = "scale(1)", 100);

    // ডাটাবেসে সেভ করা
    const userRef = doc(db, "users", tgUser.id.toString());
    await updateDoc(userRef, {
        coins: userData.coins,
        energy: userData.energy
    });
});

// --- 5. MODAL LOGIC ---
const viewDetailsBtn = document.getElementById('view-details-btn');
const rewardModal = document.getElementById('reward-modal');
const closeModal = document.getElementById('close-modal');

viewDetailsBtn.addEventListener('click', () => {
    rewardModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    rewardModal.classList.remove('active');
});

rewardModal.addEventListener('click', (e) => {
    if (e.target === rewardModal) rewardModal.classList.remove('active');
});
