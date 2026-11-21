// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAj5UW69Ed6BNTZ7uKRjXYF5hCsKoWJyeE",
  authDomain: "monvex-660f1.firebaseapp.com",
  projectId: "monvex-660f1",
  storageBucket: "monvex-660f1.firebasestorage.app",
  messagingSenderId: "980809538898",
  appId: "1:980809538898:web:5b176771596b0284b22e8b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#F8F9FA'); 

// DOM Elements
const joinScreen = document.getElementById('join-screen');
const appContainer = document.getElementById('app-container');
const verifyBtn = document.getElementById('verify-btn');
const verifyMsg = document.getElementById('verify-msg');

// 1. Initial Load & User Data
document.addEventListener('DOMContentLoaded', async () => {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        
        // Set Profile Data
        document.getElementById('user-name').textContent = user.first_name;
        document.getElementById('user-id').textContent = `ID: ${user.id}`;
        if (user.photo_url) {
            document.getElementById('user-dp').src = user.photo_url;
            document.getElementById('profile-dp').src = user.photo_url;
        }
        
        document.getElementById('profile-name').textContent = user.first_name;
        document.getElementById('profile-id').textContent = `Telegram ID: ${user.id}`;
        document.getElementById('ref-link').value = `https://t.me/MONVEX9_bot?start=${user.id}`;

        // Load user balance from Firebase (Demo)
        loadUserBalance(user.id);
    } else {
        document.getElementById('user-name').textContent = "Guest User";
    }

    // Load Tasks from Firebase
    loadTasks();
});

// 2. Channel Verification Logic
verifyBtn.addEventListener('click', () => {
    verifyBtn.textContent = "Verifying...";
    verifyMsg.style.color = "#F59E0B";
    verifyMsg.textContent = "Checking channel membership...";

    setTimeout(() => {
        verifyMsg.style.color = "#10B981";
        verifyMsg.textContent = "Verification Successful!";
        setTimeout(() => {
            joinScreen.classList.remove('active');
            appContainer.classList.remove('hidden');
        }, 800);
    }, 1500);
});

// 3. Navigation Logic
window.navigateTo = function(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    const pageMap = ['home', 'earn', 'refer', 'wallet', 'profile'];
    const index = pageMap.indexOf(pageId);
    if (index !== -1) document.querySelectorAll('.nav-item')[index].classList.add('active');
}

// 4. Firebase: Load User Balance
async function loadUserBalance(uid) {
    try {
        const userRef = doc(db, "users", uid.toString());
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            document.getElementById('home-balance').innerHTML = `${data.coins || 0} <span>MC</span>`;
        }
    } catch (e) {
        console.log("Error loading balance:", e);
    }
}

// 5. Firebase: Load Dynamic Tasks
async function loadTasks() {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = ''; // Clear skeleton

    try {
        // Firebase থেকে tasks কালেকশন রিড করা
        const querySnapshot = await getDocs(collection(db, "tasks"));
        
        if (querySnapshot.empty) {
            // যদি ডাটাবেসে কোনো টাস্ক না থাকে, ডিফল্ট ডেমো টাস্ক দেখাবে
            renderDefaultTasks(tasksContainer);
            return;
        }

        querySnapshot.forEach((doc) => {
            const task = doc.data();
            const taskHTML = `
                <div class="task-card">
                    <div class="task-info">
                        <h4>${task.title}</h4>
                        <p>${task.description} - Earn ${task.reward} MC</p>
                    </div>
                    <button class="action-btn" onclick="startTask('${doc.id}')">Start</button>
                </div>
            `;
            tasksContainer.innerHTML += taskHTML;
        });

    } catch (error) {
        console.error("Error loading tasks:", error);
        renderDefaultTasks(tasksContainer); // Error হলে ডিফল্ট দেখাবে
    }
}

// ডিফল্ট টাস্ক রেন্ডার ফাংশন
function renderDefaultTasks(container) {
    container.innerHTML = `
        <div class="task-card">
            <div class="task-info">
                <h4>Daily Check-in</h4>
                <p>Claim your daily 100 MC</p>
            </div>
            <button class="action-btn">Start</button>
        </div>
        <div class="task-card">
            <div class="task-info">
                <h4>Subscribe YouTube Channel</h4>
                <p>Earn 150 MC</p>
            </div>
            <button class="action-btn">Start</button>
        </div>
    `;
}
