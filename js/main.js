// ===================== MAIN.JS =====================
// Logique globale et helpers pour TRAIN EMPIRE PE EDITION

const App = (() => {

    // ===================== NAVIGATION =====================
    function initNavigation() {
        const links = document.querySelectorAll('[data-link]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-link');
                if (target) {
                    window.location.href = target;
                }
            });
        });
    }

    // ===================== NOTIFICATIONS =====================
    function showNotification(message, type = 'info', duration = 3000) {
        const notif = document.createElement('div');
        notif.className = `notif ${type}`;
        notif.innerText = message;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.classList.add('fade-out');
            setTimeout(() => document.body.removeChild(notif), 500);
        }, duration);
    }

    // ===================== HELPERS =====================
    function formatTime(date) {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    function parseTime(str) {
        const [h, m] = str.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ===================== THEME =====================
    function initTheme() {
        document.body.classList.add('theme-dark');
    }

    // ===================== INIT =====================
    function init() {
        initTheme();
        initNavigation();
    }

    // ===================== PUBLIC =====================
    return {
        init,
        showNotification,
        formatTime,
        parseTime,
        randomInt
    };

})();

// ===================== INITIALISATION =====================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
