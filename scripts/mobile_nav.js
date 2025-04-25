// Mobile Navigation Functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchToggle = document.getElementById('search-toggle-mobile');
    const menuToggle = document.getElementById('menu-toggle-mobile');
    const searchDropdown = document.querySelector('.search-bar-dropdown-mobile');
    const menuDropdown = document.querySelector('.menu-dropdown-mobile');
    
    if (searchToggle && searchDropdown) {
        searchToggle.addEventListener('click', () => {
            searchDropdown.style.display = searchDropdown.style.display === 'block' ? 'none' : 'block';
            menuDropdown.style.display = 'none';
        });
    }
    
    if (menuToggle && menuDropdown) {
        menuToggle.addEventListener('click', () => {
            menuDropdown.style.display = menuDropdown.style.display === 'flex' ? 'none' : 'flex';
            searchDropdown.style.display = 'none';
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar-mobile')) {
            searchDropdown.style.display = 'none';
            menuDropdown.style.display = 'none';
        }
    });
}); 