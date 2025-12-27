// nav-toggle.js - Mobile hamburger menu toggle
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger-btn');
    const nav = document.getElementById('main-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            nav.classList.toggle('nav-open');
        });

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                nav.classList.remove('nav-open');
            });
        });
    }
});
