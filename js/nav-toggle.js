// nav-toggle.js - Mobile hamburger menu toggle with backdrop
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger-btn');
    const nav = document.getElementById('main-nav');

    // Create backdrop element
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop && nav) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.appendChild(backdrop);
    }

    if (hamburger && nav) {
        function toggleMenu() {
            hamburger.classList.toggle('active');
            nav.classList.toggle('nav-open');
            if (backdrop) backdrop.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('nav-open') ? 'hidden' : '';
        }

        function closeMenu() {
            hamburger.classList.remove('active');
            nav.classList.remove('nav-open');
            if (backdrop) backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', toggleMenu);

        // Close menu when clicking backdrop
        if (backdrop) {
            backdrop.addEventListener('click', closeMenu);
        }

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
});
