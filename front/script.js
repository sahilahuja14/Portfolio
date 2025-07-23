document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    // Select all elements that should be affected by the nav opening
    const mainContent = document.querySelectorAll('.main-content');

    const toggleMenu = () => {
        // Toggle the menu's active class
        navLinks.classList.toggle('active');
        // Toggle the shifted class on each content section
        mainContent.forEach(el => {
            el.classList.toggle('content-shifted');
        });
    };

    // Toggle nav menu on hamburger click
    if (hamburger) {
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from closing menu immediately
            toggleMenu();
        });
    }

    const closeMenu = () => {
        if (navLinks && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    };

    // Close menu when a nav link is clicked
    if (navLinks) {
        navLinks.addEventListener('click', closeMenu);
    }

    // Close menu when clicking outside of it
    document.addEventListener('click', (event) => {
        // Close only if the nav is active and the click is outside the nav and the hamburger
        if (navLinks && navLinks.classList.contains('active') && !navLinks.contains(event.target) && !hamburger.contains(event.target)) {
            closeMenu();
        }
    });
});
