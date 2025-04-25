document.addEventListener('DOMContentLoaded', () => {
    console.log("Checkout page loaded. Checking cart..."); // Debug log
    
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Cart contents:", cart); // Debug log

    if (cart.length === 0) {
        console.log("Cart is empty. Redirecting..."); // Debug log
        showNotification('No items in cart', 'error');
        
        // Redirect after 2 seconds (optional: remove if you want instant redirect)
        setTimeout(() => {
            window.location.href = 'order_page.html';
        }, 2000);
    } else {
        console.log("Cart has items. Updating summary..."); // Debug log
        updateCheckoutSummary(cart);
    }
});

function updateItemQuantity(index, newQuantity) {
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Validate quantity
    if (newQuantity < 1) {
        showNotification('Quantity must be at least 1', 'error');
        return;
    }
    
    // Update the quantity for this item
    cart[index].quantity = newQuantity;
    
    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Refresh the display with updated quantities
    updateCheckoutSummary(cart);
    
    // Show confirmation message
    showNotification('Quantity updated', 'success');
}


    
    // Add cart items
    function updateCheckoutSummary(cart) {
        const DISCOUNT_PERCENTAGE = 20;
        const MAX_QUANTITY = 10;
        const summaryTableBody = document.querySelector('.summary-table tbody');
        summaryTableBody.innerHTML = '';
        
        // Calculate initial totals
        let cartTotal = 0;
        
        // Add cart items
        cart.forEach((item, index) => {
            const originalTotal = item.price * item.quantity;
            const discountedTotal = originalTotal * (1 - DISCOUNT_PERCENTAGE/100);
            cartTotal += originalTotal;
    
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="item-container">
                        <div class="item-image-container">
                            <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                        </div>
                        <div class="item-name">${item.name}</div>
                    </div>
                </td>
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
                <td>$${discountedTotal.toFixed(2)}</td>
                <td>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </td>
            `;
    

        // Add event listeners for quantity controls
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
            if (isNaN(value)) value = 1;
            if (value < 1) value = 1;
            if (value > MAX_QUANTITY) value = MAX_QUANTITY;
            updateItemQuantity(index, value);
        });

        // Add event listener for remove button
        row.querySelector('.remove-btn').addEventListener('click', () => {
            removeFromCart(index);
        });

        summaryTableBody.appendChild(row);
    });




    // Calculate final totals
    const discountedTotal = cartTotal * (1 - DISCOUNT_PERCENTAGE/100);
    const savings = cartTotal - discountedTotal;

    // Add totals to the table
    const totalsRow = document.createElement('tr');
    totalsRow.innerHTML = `
        <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
        <td>$${cartTotal.toFixed(2)}</td>
        <td>$${discountedTotal.toFixed(2)}</td>
        <td></td>
    `;
    summaryTableBody.appendChild(totalsRow);

    // Add discount row
    const discountRow = document.createElement('tr');
    discountRow.innerHTML = `
        <td colspan="3" style="text-align: right;"><strong>Discount (${DISCOUNT_PERCENTAGE}%):</strong></td>
        <td colspan="2" style="color: #44D62C;">-$${savings.toFixed(2)}</td>
        <td></td>
    `;
    summaryTableBody.appendChild(discountRow);

    // Add final total row
    const finalTotalRow = document.createElement('tr');
    finalTotalRow.className = 'final-total-row';
    finalTotalRow.innerHTML = `
        <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
        <td colspan="2" style="color: #44D62C;"><strong>$${discountedTotal.toFixed(2)}</strong></td>
        <td></td>
    `;
    summaryTableBody.appendChild(finalTotalRow);
}

// Update the remove button event listener in the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    console.log("Checkout page loaded. Checking cart...");
    
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Cart contents:", cart);

    if (cart.length === 0) {
        console.log("Cart is empty. Redirecting...");
        showNotification('No items in cart', 'error');
        
        setTimeout(() => {
            window.location.href = 'order_page.html';
        }, 2000);
    } else {
        console.log("Cart has items. Updating summary...");
        updateCheckoutSummary(cart);
    }
});

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (index >= 0 && index < cart.length) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (cart.length === 0) {
            showNotification('Cart is now empty', 'error');
            setTimeout(() => {
                window.location.href = 'order_page.html';
            }, 2000);
        } else {
            updateCheckoutSummary(cart);
            showNotification(`Removed ${removedItem.name} from cart`, 'success');
        }
    }
}

// Add this at the bottom of the file, before any event listeners
function savePaymentDetails() {
    const paymentDetails = {
        cardName: document.getElementById('cardName').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiry: document.getElementById('expiry').value,
        cvv: document.getElementById('cvv').value
    };
    
    localStorage.setItem('savedPaymentDetails', JSON.stringify(paymentDetails));
    showNotification('Payment details saved successfully', 'success');
}

function loadPaymentDetails() {
    const savedDetails = localStorage.getItem('savedPaymentDetails');
    if (savedDetails) {
        const paymentDetails = JSON.parse(savedDetails);
        document.getElementById('cardName').value = paymentDetails.cardName || '';
        document.getElementById('cardNumber').value = paymentDetails.cardNumber || '';
        document.getElementById('expiry').value = paymentDetails.expiry || '';
        document.getElementById('cvv').value = paymentDetails.cvv || '';
        showNotification('Payment details loaded', 'success');
    } else {
        showNotification('No saved payment details found', 'error');
    }
}

// Add event listeners for the new buttons
document.addEventListener('DOMContentLoaded', () => {
    // ... existing DOMContentLoaded code ...
    
    // Add payment buttons functionality
    document.getElementById('savePaymentBtn')?.addEventListener('click', savePaymentDetails);
    document.getElementById('addPaymentBtn')?.addEventListener('click', loadPaymentDetails);
});

function completePurchase() {
    // Validate all required fields
    const requiredFields = [
        'firstName', 'lastName', 'email', 'phone',
        'address', 'city', 'postcode', 'country',
        'cardName', 'cardNumber', 'expiry', 'cvv'
    ];
    
    let isValid = true;
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = 'red';
            isValid = false;
        } else {
            field.style.borderColor = '#44D62C';
        }
    });

    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Get cart items
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    // Get delivery details
    const deliveryDetails = {
        name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postcode: document.getElementById('postcode').value,
        country: document.getElementById('country').value,
        instructions: document.getElementById('deliveryInstructions').value || 'None'
    };

    // Calculate delivery date (3 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const formattedDate = deliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Create thank you message
    let message = `Thank you for your purchase!\n\n`;
    message += `Your order will be delivered on ${formattedDate} to:\n`;
    message += `${deliveryDetails.name}\n`;
    message += `${deliveryDetails.address}\n`;
    message += `${deliveryDetails.city}, ${deliveryDetails.postcode}\n`;
    message += `${deliveryDetails.country}\n\n`;
    message += `Delivery instructions: ${deliveryDetails.instructions}\n\n`;
    message += `Ordered items:\n`;
    
    cart.forEach(item => {
        message += `- ${item.name} (${item.quantity} x $${item.price.toFixed(2)})\n`;
    });

    // Calculate total
    const DISCOUNT_PERCENTAGE = 20;
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountedTotal = cartTotal * (1 - DISCOUNT_PERCENTAGE/100);
    
    message += `\nTotal: $${discountedTotal.toFixed(2)} (after ${DISCOUNT_PERCENTAGE}% discount)`;

    // Show confirmation
    alert(message);
    
    // Clear cart and redirect
    localStorage.removeItem('cart');
    setTimeout(() => {
        window.location.href = 'order_page.html';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Add event listener for complete purchase button
    document.querySelector('.submit-button')?.addEventListener('click', completePurchase);
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}