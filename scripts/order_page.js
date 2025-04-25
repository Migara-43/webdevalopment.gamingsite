// Cart and Constants
let cart = [];
const DISCOUNT_PERCENTAGE = 20;
const MAX_QUANTITY = 10;

// Utility Functions
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Cart Management Functions
function clearCart() {
    if (cart.length === 0) {
        showNotification('Cart is already empty', 'error');
        return;
    }
    
    cart = [];
    saveCart();
    updateSummaryTable();
    showNotification('Cart cleared', 'success');
}

function saveFavourite() {
    if (cart.length === 0) {
        showNotification('Cannot save empty cart', 'error');
        return;
    }
    
    localStorage.setItem('favouriteCart', JSON.stringify(cart));
    showNotification('Cart saved as favourite', 'success');
}

function applyFavourite() {
    const savedCart = localStorage.getItem('favouriteCart');
    if (!savedCart) {
        showNotification('No favourite cart found', 'error');
        return;
    }

    cart = JSON.parse(savedCart);
    updateSummaryTable();
    showNotification('Favourite cart applied', 'success');
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Cannot checkout with empty cart', 'error');
        return;
    }
    
    saveCart();
    window.location.href = 'checkout_page.html';
}

// Product Functions
function addToCart(productCard) {
    const quantityInput = productCard.querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value);
    
    if (quantity === 0 || isNaN(quantity)) {
        showNotification('Cannot add zero quantity. Please select at least 1 item.', 'error');
        return;
    }

    const product = {
        id: productCard.dataset.productId,
        name: productCard.querySelector('.product-name').textContent,
        price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '')),
        quantity: quantity,
        image: productCard.querySelector('img').src
    };

    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += quantity;
    } else {
        cart.push(product);
    }

    saveCart();
    updateSummaryTable();
    showNotification(`Added ${product.name} to cart`, 'success');
}

function updateItemQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        showNotification('Quantity must be at least 1', 'error');
        updateSummaryTable();
        return;
    }
    cart[index].quantity = newQuantity;
    saveCart();
    updateSummaryTable();
    showNotification('Quantity updated', 'success');
}

function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    saveCart();
    updateSummaryTable();
    showNotification(`Removed ${removedItem.name} from cart`, 'success');
}

function addToFavourite(index) {
    const item = cart[index];
    const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
    favourites.push(item);
    localStorage.setItem('favourites', JSON.stringify(favourites));
    showNotification(`${item.name} added to favourites`, 'success');
}

// Summary Table Function
function updateSummaryTable() {
    const summaryTableBody = document.querySelector('.summary-table tbody');
    summaryTableBody.innerHTML = '';
    
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountedTotal = cartTotal * (1 - DISCOUNT_PERCENTAGE/100);
    const savings = cartTotal - discountedTotal;

    cart.forEach((item, index) => {
        const originalTotal = item.price * item.quantity;
        const discountedItemTotal = originalTotal * (1 - DISCOUNT_PERCENTAGE/100);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <div class="table-quantity-controls">
                    <button class="table-minus-btn">-</button>
                    <input type="number" class="table-quantity-input" 
                           value="${item.quantity}" min="1" max="${MAX_QUANTITY}">
                    <button class="table-plus-btn">+</button>
                </div>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${originalTotal.toFixed(2)}</td>
            <td>$${discountedItemTotal.toFixed(2)}</td>
            <td>
                <button class="remove-btn">Remove</button>
                <button class="favourite-btn">♥</button>
            </td>
        `;

        const tableQuantityInput = row.querySelector('.table-quantity-input');
        const tableMinusBtn = row.querySelector('.table-minus-btn');
        const tablePlusBtn = row.querySelector('.table-plus-btn');

        tableMinusBtn.addEventListener('click', () => {
            let value = parseInt(tableQuantityInput.value);
            if (value > 1) {
                tableQuantityInput.value = value - 1;
                updateItemQuantity(index, value - 1);
            }
        });

        tablePlusBtn.addEventListener('click', () => {
            let value = parseInt(tableQuantityInput.value);
            if (value < MAX_QUANTITY) {
                tableQuantityInput.value = value + 1;
                updateItemQuantity(index, value + 1);
            }
        });

        tableQuantityInput.addEventListener('change', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > MAX_QUANTITY) value = MAX_QUANTITY;
            updateItemQuantity(index, value);
        });

        row.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(index));
        row.querySelector('.favourite-btn').addEventListener('click', () => addToFavourite(index));

        summaryTableBody.appendChild(row);
    });

    if (cart.length > 0) {
        const separatorRow = document.createElement('tr');
        separatorRow.innerHTML = `<td colspan="6" style="border-top: 2px solid #333;"></td>`;
        summaryTableBody.appendChild(separatorRow);

        const originalTotalRow = document.createElement('tr');
        originalTotalRow.innerHTML = `
            <td colspan="3" style="text-align: right;"><strong>Original Total:</strong></td>
            <td colspan="3"><strong>$${cartTotal.toFixed(2)}</strong></td>
        `;
        summaryTableBody.appendChild(originalTotalRow);

        const discountRow = document.createElement('tr');
        discountRow.innerHTML = `
            <td colspan="3" style="text-align: right;"><strong>Discount Amount (${DISCOUNT_PERCENTAGE}%):</strong></td>
            <td colspan="3" style="color: #44D62C;"><strong>-$${savings.toFixed(2)}</strong></td>
        `;
        summaryTableBody.appendChild(discountRow);

        const finalTotalRow = document.createElement('tr');
        finalTotalRow.className = 'final-total-row';
        finalTotalRow.innerHTML = `
            <td colspan="3" style="text-align: right;"><strong>Final Total Price:</strong></td>
            <td colspan="3" style="color: #44D62C;"><strong>$${discountedTotal.toFixed(2)}</strong></td>
        `;
        summaryTableBody.appendChild(finalTotalRow);
    }
}

// Setup Functions
function setupProductQuantityButtons() {
    const quantityControls = document.querySelectorAll('.quantity-controls');
    
    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.minus');
        const plusBtn = control.querySelector('.plus');
        const quantityInput = control.querySelector('.quantity-input');
        
        minusBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > parseInt(quantityInput.min)) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue < parseInt(quantityInput.max)) {
                quantityInput.value = currentValue + 1;
            }
        });
        
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            const min = parseInt(this.min);
            const max = parseInt(this.max);
            
            if (isNaN(value) || value < min) {
                this.value = min;
            } else if (value > max) {
                this.value = max;
            }
        });
    });
}

function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            addToCart(productCard);
        });
    });
}

function setupScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function setupEventListeners() {
    // Cart Management Buttons
    document.getElementById('remove-cart-btn')?.addEventListener('click', clearCart);
    document.getElementById('save-favourite-btn')?.addEventListener('click', saveFavourite);
    document.getElementById('apply-favourite-btn')?.addEventListener('click', applyFavourite);
    document.getElementById('checkout-btn')?.addEventListener('click', proceedToCheckout);
    
    // Section navigation buttons
    document.querySelectorAll('.section-nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    setupProductQuantityButtons();
    setupAddToCartButtons();
    updateSummaryTable();
    setupEventListeners();
    setupScrollToTopButton();
});