// Telegram Web App Initialization
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#F8F9FA'); // Match background

// DOM Elements
const joinScreen = document.getElementById('join-screen');
const appContainer = document.getElementById('app-container');
const verifyBtn = document.getElementById('verify-btn');
const verifyMsg = document.getElementById('verify-msg');
const copyBtn = document.getElementById('copy-btn');

// 1. Initial Load & User Data
document.addEventListener('DOMContentLoaded', () => {
    // Telegram User Data Load
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        
        // Home Page Data
        document.getElementById('user-name').textContent = user.first_name;
        document.getElementById('user-id').textContent = `ID: ${user.id}`;
        if (user.photo_url) {
            document.getElementById('user-dp').src = user.photo_url;
            document.getElementById('profile-dp').src = user.photo_url;
        }
        
        // Profile Page Data
        document.getElementById('profile-name').textContent = user.first_name;
        document.getElementById('profile-id').textContent = `Telegram ID: ${user.id}`;
        
        // Referral Link with User ID
        document.getElementById('ref-link').value = `https://t.me/MONVEX9_bot?start=${user.id}`;

    } else {
        // Fallback for browser testing
        document.getElementById('user-name').textContent = "Guest User";
        document.getElementById('profile-name').textContent = "Guest User";
    }
});

// 2. Channel Verification Logic (Frontend Demo)
verifyBtn.addEventListener('click', () => {
    verifyBtn.textContent = "Verifying...";
    verifyMsg.style.color = "#F59E0B";
    verifyMsg.textContent = "Checking channel membership...";

    // Simulate Backend Check Delay
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
function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`page-${pageId}`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    // Update Bottom Nav active state
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    // Find the clicked nav item and set active
    const navItems = document.querySelectorAll('.nav-item');
    const pageMap = ['home', 'earn', 'refer', 'wallet', 'profile'];
    const index = pageMap.indexOf(pageId);
    if (index !== -1 && navItems[index]) {
        navItems[index].classList.add('active');
    }
}

// 4. Copy Referral Link Logic
copyBtn.addEventListener('click', () => {
    const linkInput = document.getElementById('ref-link');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    // Use Clipboard API
    navigator.clipboard.writeText(linkInput.value).then(() => {
        // Change icon temporarily
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        tg.showAlert("Failed to copy link.");
    });
});
