// --- CONFIGURATION ---
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// --- NAVIGATION HIGHLIGHT ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        // loose check for matching href
        if (link.getAttribute('href') === 'index.html' && (currentPath.endsWith('index.html') || currentPath.endsWith('/'))) {
            // handle home explicit/implicit
            link.classList.add('active');
        } else if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
});

// Constants moved to EmailService

// --- VALIDATION UTILITIES ---
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
};

const validateFiles = (files) => {
    const MAX_FILES = 7;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (files.length > MAX_FILES) {
        return { valid: false, message: `Maximum ${MAX_FILES} photos allowed.` };
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!VALID_TYPES.includes(file.type)) {
            return { valid: false, message: `Invalid file type: ${file.name}. Only JPG, PNG, and WebP allowed.` };
        }
        if (file.size > MAX_SIZE) {
            return { valid: false, message: `File too large: ${file.name}. Max 10MB per photo.` };
        }
    }

    return { valid: true };
};

const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
};

const showError = (input, message) => {
    const field = input.closest('.form-field');
    if (field) {
        field.classList.add('error');
        let errorDisplay = field.querySelector('.error-message');
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.className = 'error-message';
            field.appendChild(errorDisplay);
        }
        errorDisplay.textContent = message;
    }
};

const clearError = (input) => {
    const field = input.closest('.form-field');
    if (field) {
        field.classList.remove('error');
    }
};

// --- FEEDBACK UI ---
// --- FEEDBACK UI ---
// showFeedback moved to EmailService

const showConfirm = (options) => {
    return new Promise((resolve) => {
        let overlay = document.querySelector('.submission-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'submission-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="success-card confirm-card" style="max-width: 450px;">
                <div class="success-icon" style="background: rgba(255, 59, 63, 0.1); color: #ff3b3f;">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <h3>${options.title || 'Are you sure?'}</h3>
                <p>${options.message || 'This action cannot be undone.'}</p>
                <div style="display: flex; gap: 15px; margin-top: 25px; width: 100%;">
                    <button id="confirm-cancel" class="btn" style="flex: 1; background: rgba(255,255,255,0.05); color: var(--white); border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
                    <button id="confirm-yes" class="btn btn-primary" style="flex: 1; background: #ff3b3f; border-color: #ff3b3f;">Yes, Clear All</button>
                </div>
            </div>
        `;

        const yesBtn = overlay.querySelector('#confirm-yes');
        const noBtn = overlay.querySelector('#confirm-cancel');

        const close = (result) => {
            overlay.classList.remove('active');
            resolve(result);
        };

        yesBtn.onclick = () => close(true);
        noBtn.onclick = () => close(false);
        overlay.onclick = (e) => { if (e.target === overlay) close(false); };

        overlay.classList.add('active');
    });
};

// Add input listeners for real-time validation and formatting
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
        e.target.value = formatPhoneNumber(e.target.value);
        if (validatePhone(e.target.value)) clearError(e.target);
    });
    input.addEventListener('blur', (e) => {
        if (!validatePhone(e.target.value)) {
            showError(e.target, 'Please enter a valid 10-digit phone number');
        }
    });
});

document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('input', (e) => {
        if (validateEmail(e.target.value)) clearError(e.target);
    });
    input.addEventListener('blur', (e) => {
        if (!validateEmail(e.target.value)) {
            showError(e.target, 'Please enter a valid email address');
        }
    });
});

document.querySelectorAll('input[required], textarea[required], input[name="city"]').forEach(input => {
    input.addEventListener('input', (e) => {
        if (e.target.value.trim() !== "") {
            clearError(e.target);
        }
    });
    input.addEventListener('blur', (e) => {
        if (e.target.value.trim() === "") {
            const label = e.target.closest('.form-field').querySelector('label').textContent.replace('*', '').trim();
            showError(e.target, `${label} is required`);
        }
    });
});


const sizeCards = document.querySelectorAll('.size-card');
const bracketCards = document.querySelectorAll('.bracket-card');
const wallCards = document.querySelectorAll('.wall-card');
const addonItems = document.querySelectorAll('.addon-item');
const totalPriceDisplay = document.querySelector('.total-price');
const estimateField = document.getElementById('estimated-price');
const servicesField = document.getElementById('selected-services');
const bookingForm = document.querySelector('.form-overlay');
const breakdownContainer = document.getElementById('price-breakdown');

const sizeLabels = { 'up-to-55': 'Up to 55"', '56-75': '56" - 75"', 'over-75': 'Over 75"' };
const bracketLabels = { 'own': 'Own Bracket', 'tilting': 'Tilting/Fixed', 'full-motion': 'Full-Motion' };
const wallLabels = {
    'drywall-no-fp': 'Drywall (no fireplace)',
    'drywall-above-fp': 'Drywall (above fireplace)',
    'plaster': 'Plaster',
    'other': 'Brick / Stone / Wood Panel',
    'commercial': 'Commercial Building (Metal Studs)',
    'not-sure': "I don't know"
};
const addonLabels = {
    'concealment': 'In-Wall Concealment',
    'cord-cover': 'External Cord Cover',
    'soundbar': 'Soundbar Mounting',
    'hdmi': 'HDMI/Power Cords'
};

let quoteItems = [];
try {
    const stored = localStorage.getItem('lg_quoteItems');
    if (stored) quoteItems = JSON.parse(stored);
    if (!Array.isArray(quoteItems)) quoteItems = [];
} catch (e) {
    quoteItems = [];
}
// Load state, but if items are empty, we should ideally start fresh unless we want to persist work-in-progress.
// User feedback implies they expect a clean slate if breakdown is empty.
if (quoteItems.length === 0) {
    currentSize = null;
    currentBracket = null;
    currentWall = null;
    editingIndex = null;
    localStorage.removeItem('lg_currentSize');
    localStorage.removeItem('lg_currentBracket');
    localStorage.removeItem('lg_currentWall');
    localStorage.removeItem('lg_editingIndex');
    localStorage.removeItem('lg_selectedAddons');
    selectedAddons = new Set();
} else {
    // Only load these if we have items (or if we want to support WIP without items, but user finds it confusing)
    // Actually, persistence is good, BUT if "breakdown is empty" user expects "new page".
    // Let's stick to: If Quote items > 0, assume ongoing session. If 0, clear partials.
    // OR we could just trust the user, but they said "breakdown i empty and i just loaded the page".
    // This implies they expect reset.
    currentSize = localStorage.getItem('lg_currentSize');
    if (currentSize === 'null' || currentSize === '') currentSize = null;

    currentBracket = localStorage.getItem('lg_currentBracket');
    if (currentBracket === 'null' || currentBracket === '') currentBracket = null;

    currentWall = localStorage.getItem('lg_currentWall');
    if (currentWall === 'null' || currentWall === '') currentWall = null;

    editingIndex = localStorage.getItem('lg_editingIndex');
    if (editingIndex === 'null' || editingIndex === null || editingIndex === '') {
        editingIndex = null;
    } else {
        editingIndex = parseInt(editingIndex);
    }
    selectedAddons = new Set(JSON.parse(localStorage.getItem('lg_selectedAddons')) || []);
}

function saveToStorage() {
    localStorage.setItem('lg_quoteItems', JSON.stringify(quoteItems));
    localStorage.setItem('lg_currentSize', currentSize);
    localStorage.setItem('lg_currentBracket', currentBracket);
    localStorage.setItem('lg_currentWall', currentWall);
    localStorage.setItem('lg_editingIndex', editingIndex);
    localStorage.setItem('lg_selectedAddons', JSON.stringify(Array.from(selectedAddons)));
}

const pricing = {
    'up-to-55': {
        'own': 99,
        'tilting': 139,
        'full-motion': 159
    },
    '56-75': {
        'own': 149,
        'tilting': 189,
        'full-motion': 209
    },
    'over-75': {
        'own': 189,
        'tilting': 229,
        'full-motion': 249
    },
    'addons': {
        'concealment': 159,
        'cord-cover': 39,
        'soundbar': 49,
        'hdmi': 15
    }
};

function updatePrice() {
    const isBookingPage = window.location.pathname.includes('booking.html');

    let grandTotal = 0;
    let fullBreakdownHtml = '';

    // 1. Render items (Handling in-place editing)
    if (quoteItems.length > 0) {
        fullBreakdownHtml += `<div class="breakdown-header" style="font-size: 0.8rem; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; opacity: 0.7;">Your Quote Cart</div>`;
    }

    quoteItems.forEach((item, index) => {
        if (!item || !item.size) return;
        const isEditingThis = (index === editingIndex);
        let displayData = { ...item };

        if (isEditingThis && currentSize) {
            displayData.size = currentSize;
            displayData.sizeLabel = sizeLabels[currentSize] || item.sizeLabel;
            displayData.bracket = currentBracket;
            displayData.bracketLabel = bracketLabels[currentBracket] || item.bracketLabel;
            displayData.wall = currentWall;
            displayData.wallLabel = wallLabels[currentWall] || item.wallLabel;
            displayData.addons = Array.from(selectedAddons);

            const bracketPrice = currentBracket ? (pricing[currentSize][currentBracket] || 0) : 0;
            displayData.price = bracketPrice + Array.from(selectedAddons).reduce((acc, a) => acc + pricing.addons[a], 0);
        }

        grandTotal += (displayData.price || 0);
        fullBreakdownHtml += `
            <div class="quote-item" style="${isEditingThis ? 'border: 1px dashed var(--primary); padding: 15px; border-radius: 10px; background: rgba(43, 168, 187, 0.05); margin-bottom: 20px;' : ''}">
                <div class="item-header">
                    <div class="item-title">
                        <span class="item-count">${isEditingThis ? '<i class="fas fa-edit"></i> ' : ''}TV ${index + 1}${isEditingThis ? ' (Editing)' : ''}</span>
                        <span>${displayData.sizeLabel}</span>
                    </div>
                    <div class="item-actions">
                        <button onclick="editItemInQuote(${index})" class="item-edit-btn" title="Edit TV Selection" ${isEditingThis ? 'style="background: var(--primary); color: white;"' : ''}>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="removeItemFromQuote(${index})" class="item-remove-btn" title="Remove TV">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="item-detail">
                    <span>${displayData.sizeLabel} Base</span>
                    <span>$${pricing[displayData.size].own}</span>
                </div>
                ${displayData.bracket !== 'own' ? `
                <div class="item-detail">
                    <span>+ ${bracketLabels[displayData.bracket]}</span>
                    <span>+$${pricing[displayData.size][displayData.bracket] - pricing[displayData.size].own}</span>
                </div>` : ''}
                <div class="item-detail">
                    <span>Wall: ${displayData.wallLabel || 'Not Selected'}</span>
                    <span>Inc.</span>
                </div>
                ${displayData.addons.map(addon => `
                    <div class="item-addon">
                        <span>+ ${addonLabels[addon]}</span>
                        <span>+$${pricing.addons[addon]}</span>
                    </div>
                `).join('')}
                <div class="item-subtotal">
                    <span>Subtotal</span>
                    <span>$${displayData.price}</span>
                </div>
            </div>
        `;
    });

    // 2. Render Current Selection (only for NEW items, i.e., when not editing)
    const currentNum = quoteItems.length + 1;
    const isSelectionComplete = currentSize && currentBracket && currentWall;

    if (editingIndex === null && currentSize) {
        const bracketPrice = currentBracket ? (pricing[currentSize][currentBracket] || 0) : 0;
        const currentItemPrice = bracketPrice + Array.from(selectedAddons).reduce((acc, a) => acc + pricing.addons[a], 0);
        grandTotal += currentItemPrice;

        fullBreakdownHtml += `
            <div class="quote-item" style="border-bottom: none; opacity: 1;">
                <div class="item-header" style="margin-bottom: 8px;">
                    <div class="item-title">
                        <span class="item-count">TV ${currentNum} ${isBookingPage ? '' : ' (Current Selection)'}</span>
                        <span>${sizeLabels[currentSize]}</span>
                    </div>
                    <div class="item-actions">
                        ${isBookingPage ? `
                            <button onclick="editCurrentSelection()" class="item-edit-btn" title="Edit TV Selection">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        <button onclick="resetSelections()" class="item-remove-btn" title="Remove/Reset TV">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="item-detail">
                    <span>${sizeLabels[currentSize]} Base</span>
                    <span>$${pricing[currentSize].own}</span>
                </div>
                ${currentBracket && currentBracket !== 'own' ? `
                <div class="item-detail">
                    <span>+ ${bracketLabels[currentBracket]}</span>
                    <span>+$${pricing[currentSize][currentBracket] - pricing[currentSize].own}</span>
                </div>` : ''}
                ${currentWall ? `
                <div class="item-detail">
                    <span>Wall: ${wallLabels[currentWall]}</span>
                    <span>Inc.</span>
                </div>` : ''}
                ${Array.from(selectedAddons).map(addon => `
                    <div class="item-addon">
                        <span>+ ${addonLabels[addon]}</span>
                        <span>+$${pricing.addons[addon]}</span>
                    </div>
                `).join('')}
                <div class="item-subtotal">
                    <span>Subtotal</span>
                    <span>$${currentItemPrice}</span>
                </div>
            </div>
        `;
    }

    if (totalPriceDisplay) totalPriceDisplay.textContent = `$${grandTotal}`;
    if (estimateField) estimateField.value = `$${grandTotal}`;

    // Add Clear All button to header if there's anything to clear
    const clearBtnContainer = document.getElementById('clear-quote-container');
    if (clearBtnContainer) {
        if (quoteItems.length > 0 || currentSize) {
            clearBtnContainer.innerHTML = `
                <button onclick="clearQuote()" class="btn-clear-all" style="background: transparent; border: none; color: #ff3b3f; font-size: 0.75rem; cursor: pointer; padding: 0; margin-top: -10px; opacity: 0.7
                ; transition: opacity 0.2s; font-weight: 800; display: block;">
                    <i class="fas fa-trash-alt"></i> Clear All
                </button>
            `;
        } else {
            clearBtnContainer.innerHTML = '';
        }
    }

    if (breakdownContainer) breakdownContainer.innerHTML = fullBreakdownHtml;

    // Update button states
    const addTvBtn = document.getElementById('add-tv-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const canProceed = quoteItems.length > 0 || isSelectionComplete;

    if (addTvBtn) {
        addTvBtn.disabled = false; // Always interactive for validation
        addTvBtn.style.opacity = '1'; // Always visible
        addTvBtn.style.pointerEvents = 'auto'; // Force override inline style
        addTvBtn.style.cursor = 'pointer';
        addTvBtn.innerHTML = editingIndex !== null ? `<i class="fas fa-check"></i> Update TV ${editingIndex + 1}` : '<i class="fas fa-plus"></i> Add Another TV';
    }
    if (nextStepBtn) {
        // Keep interactive depending on cart state, but allow clicking to show error if empty AND incomplete
        // if cart empty -> must complete current selection.
        nextStepBtn.disabled = false;
        nextStepBtn.style.opacity = '1'; // Always visible
        nextStepBtn.style.pointerEvents = 'auto'; // Force override inline style
        nextStepBtn.style.cursor = 'pointer';
    }

    // 3. Serialize all for Formspree using helper
    const formattedQuote = formatQuoteForEmail(quoteItems, isSelectionComplete, editingIndex, {
        currentSize, currentBracket, currentWall, selectedAddons, grandTotal
    });

    if (servicesField) servicesField.value = formattedQuote;

    syncUIState();
    saveToStorage();
}

function syncUIState() {
    // Sync Size Cards
    sizeCards.forEach(c => {
        c.classList.toggle('active', c.dataset.size === currentSize);
    });

    // Sync Bracket Cards
    bracketCards.forEach(c => {
        c.classList.toggle('active', c.dataset.bracket === currentBracket);
    });

    // Sync Wall Cards
    wallCards.forEach(c => {
        c.classList.toggle('active', c.dataset.wall === currentWall);
    });

    // Sync Addon Items
    addonItems.forEach(i => {
        i.classList.toggle('active', selectedAddons.has(i.dataset.addon));
    });
}

function resetSelections() {
    currentSize = null;
    currentBracket = null;
    currentWall = null;
    editingIndex = null;
    selectedAddons.clear();

    updatePrice();
    saveToStorage();
}

window.clearQuote = async function () {
    const confirmed = await showConfirm({
        title: 'Clear Entire Quote?',
        message: 'Are you sure you want to clear all selected TVs and start over? This cannot be undone.'
    });
    if (confirmed) {
        quoteItems = [];
        resetSelections();
    }
};

window.editCurrentSelection = function () {
    saveToStorage();
    window.location.href = 'tv-mounting.html';
};

window.addItemToQuote = function () {
    if (!currentSize || !currentBracket || !currentWall) return;

    if (!Array.isArray(quoteItems)) quoteItems = [];

    const item = {
        size: currentSize,
        sizeLabel: sizeLabels[currentSize],
        bracket: currentBracket,
        bracketLabel: bracketLabels[currentBracket],
        wall: currentWall,
        wallLabel: wallLabels[currentWall],
        addons: Array.from(selectedAddons),
        addonLabels: Array.from(selectedAddons).map(a => addonLabels[a]),
        price: pricing[currentSize][currentBracket] + Array.from(selectedAddons).reduce((acc, a) => acc + pricing.addons[a], 0)
    };

    if (editingIndex !== null) {
        quoteItems[editingIndex] = item;
        editingIndex = null;
    } else {
        quoteItems.push(item);
    }

    resetSelections();
    saveToStorage();

    // Scroll back to step 1
    const step1 = document.querySelector('.section-title') || document.querySelector('.calc-card');
    if (step1) {
        const offset = 80; // Account for fixed header
        const elementPosition = step1.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

window.removeItemFromQuote = function (index) {
    quoteItems.splice(index, 1);
    if (editingIndex === index) {
        resetSelections();
    } else if (editingIndex !== null && editingIndex > index) {
        editingIndex--;
    }
    saveToStorage();
    updatePrice();
};

window.editItemInQuote = function (index) {
    const isBookingPage = window.location.pathname.includes('booking.html');
    const item = quoteItems[index];
    if (!item) return;

    // --- AUTO-COMMIT LOGIC ---
    // If user has a COMPLETE current selection (not an edit), save it first!
    if (editingIndex === null && currentSize && currentBracket && currentWall) {
        window.addItemToQuote();
        // Note: addItemToQuote calls resetSelections() and saveToStorage()
        // We need to re-fetch the item because addItemToQuote might have shifted indices 
        // (though in this case it just pushes, so index is safe).
    }

    // Load data into current state
    currentSize = item.size;
    currentBracket = item.bracket;
    currentWall = item.wall;
    selectedAddons = new Set(item.addons);
    editingIndex = index;

    if (isBookingPage) {
        saveToStorage();
        window.location.href = 'tv-mounting.html';
        return;
    }

    saveToStorage();
    updatePrice();

    // Scroll back to step 1
    const step1 = document.querySelector('.section-title') || document.querySelector('.calc-card');
    if (step1) {
        const offset = 80;
        const elementPosition = step1.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
};

const clearStepError = (stepId) => {
    const step = document.getElementById(stepId);
    if (step) step.classList.remove('step-error');
};

// --- NAVIGATION HIGHLIGHT (ScrollSpy) ---
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = Array.from(navLinks)
        .map(link => {
            const href = link.getAttribute('href');
            if (href.includes('#') && href.split('#')[1]) {
                return document.getElementById(href.split('#')[1]);
            }
            return null;
        })
        .filter(sec => sec !== null);

    const onScroll = () => {
        const scrollPos = window.scrollY + 120; // Offset for header height
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html';

        // 1. If not on index.html, just highlight current page link
        if (pageName !== 'index.html' && pageName !== '') {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === pageName) {
                    link.classList.add('active');
                }
            });
            return;
        }

        // 2. We are on index.html: Check scroll position for sections
        let currentSectionId = '';

        // Default to Home (top) if near top
        if (scrollPos < 300) {
            currentSectionId = 'home'; // Conceptually home
        } else {
            // Find which section is in view
            sections.forEach(sec => {
                if (sec.offsetTop <= scrollPos) {
                    currentSectionId = sec.id;
                }
            });
        }

        // If we scrolled past everything (bottom), maybe Contact?
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            // currentSectionId = 'contact'; // Optional: force contact at very bottom
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            // "Home" link usually href="index.html"
            if (currentSectionId === 'home' || scrollPos < 300) {
                if (href === 'index.html') link.classList.add('active');
            } else {
                if (href.includes('#' + currentSectionId)) {
                    link.classList.add('active');
                }
            }
        });
    };

    window.addEventListener('scroll', onScroll);
    // Initial check
    onScroll();
});

// --- Auto-Scroll Helper ---
const scrollToStep = (stepId) => {
    const el = document.getElementById(stepId);
    if (el) {
        const header = document.querySelector('header');
        const offset = header ? header.offsetHeight + 20 : 100;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        // "Slow down a little bit" -> Increased delay to 600ms + requestAnimationFrame for smoother start?
        // Native scroll behavior: 'smooth' is browser dependent. 
        // We can't change speed easily without library. 
        // But the delay helps user orient.
        setTimeout(() => {
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }, 600);
    }
};

sizeCards.forEach(card => {
    card.addEventListener('click', () => {
        currentSize = card.dataset.size;
        clearStepError('step-size');
        updatePrice();
        scrollToStep('step-bracket');
    });
});

bracketCards.forEach(card => {
    card.addEventListener('click', () => {
        currentBracket = card.dataset.bracket;
        clearStepError('step-bracket');
        updatePrice();
        scrollToStep('step-wall');
    });
});

wallCards.forEach(card => {
    card.addEventListener('click', () => {
        currentWall = card.dataset.wall;
        clearStepError('step-wall');
        updatePrice();
        scrollToStep('step-addons');
    });
});

addonItems.forEach(item => {
    item.addEventListener('click', () => {
        const addon = item.dataset.addon;
        if (selectedAddons.has(addon)) {
            selectedAddons.delete(addon);
        } else {
            selectedAddons.add(addon);
        }
        updatePrice();
    });
});

// Handle Form Submission with Cloudinary integration
const finalForm = document.getElementById('booking-form');
if (finalForm) {
    const submitBtn = document.getElementById('submit-btn');
    const photoInput = document.getElementById('photo-upload');

    finalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- Validation ---
        let isValid = true;
        const emailInput = finalForm.querySelector('input[name="email"]');
        const phoneInput = finalForm.querySelector('input[name="phone"]');
        const nameInput = finalForm.querySelector('input[name="name"]');

        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        if (!validatePhone(phoneInput.value)) {
            showError(phoneInput, 'Please enter a valid 10-digit phone number');
            isValid = false;
        }
        const cityInput = finalForm.querySelector('input[name="city"]');
        if (cityInput && cityInput.value.trim() === "") {
            showError(cityInput, 'City is required');
            isValid = false;
        }
        if (nameInput.value.trim() === "") {
            showError(nameInput, 'Full name is required');
            isValid = false;
        }

        if (!isValid) {
            const firstError = finalForm.querySelector('.form-field.error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }


        submitBtn.disabled = true;
        submitBtn.textContent = 'Preparing...';

        // 1. Validate Files
        const files = photoInput.files;
        if (files.length > 0) {
            const fileCheck = validateFiles(files);
            if (!fileCheck.valid) {
                showError(photoInput, fileCheck.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Quote Request';
                return;
            }
        }


        // 2. Submit via EmailService
        await EmailService.submitForm(finalForm, {
            photoInputId: 'photo-upload',
            onLoading: (msg) => { submitBtn.textContent = msg; },
            onSuccess: () => {
                quoteItems = [];
                resetSelections();
                const bookingOverlay = document.querySelector('.form-overlay');
                if (bookingOverlay) bookingOverlay.classList.remove('visible');
                submitBtn.textContent = 'Send Quote Request';
            },
            onError: () => {
                submitBtn.textContent = 'Send Quote Request';
            },
            onModalClose: () => {
                window.location.href = 'index.html';
            }
        });
    });
}

// --- Handle Home Page Contact Form ---
const homeForm = document.getElementById('contact-form');
if (homeForm) {
    const homePhotoInput = document.getElementById('home-photo-upload');

    homeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- Validation ---
        let isValid = true;
        const emailInput = homeForm.querySelector('input[name="email"]');
        const phoneInput = homeForm.querySelector('input[name="phone"]');
        const nameInput = homeForm.querySelector('input[name="name"]');

        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        if (!validatePhone(phoneInput.value)) {
            showError(phoneInput, 'Please enter a valid 10-digit phone number');
            isValid = false;
        }
        const cityInput = homeForm.querySelector('input[name="city"]');
        if (cityInput && cityInput.value.trim() === "") {
            showError(cityInput, 'City is required');
            isValid = false;
        }
        if (nameInput.value.trim() === "") {
            showError(nameInput, 'Full name is required');
            isValid = false;
        }

        if (!isValid) return;


        const homeSubmitBtn = homeForm.querySelector('button[type="submit"]');
        homeSubmitBtn.disabled = true;

        // 1. Validate Files
        const files = homePhotoInput.files;
        if (files.length > 0) {
            const fileCheck = validateFiles(files);
            if (!fileCheck.valid) {
                showError(homePhotoInput, fileCheck.message);
                homeSubmitBtn.disabled = false;
                return;
            }
        }

        await EmailService.submitForm(homeForm, {
            photoInputId: 'home-photo-upload',
            onLoading: (msg) => { homeSubmitBtn.textContent = msg; },
            onSuccess: () => {
                homeSubmitBtn.disabled = false;
                homeSubmitBtn.textContent = 'Send Request';
            },
            onError: () => {
                homeSubmitBtn.disabled = false;
                homeSubmitBtn.textContent = 'Send Request';
            }
        });
    });
}

// --- BUTTON EVENT LISTENERS FOR VALIDATION ---
// Helper to highlight missing steps
const highlightMissingSteps = (missing) => {
    missing.forEach(field => {
        let id = '';
        if (field === 'TV Size') id = 'step-size';
        if (field === 'Bracket Type') id = 'step-bracket';
        if (field === 'Wall Type') id = 'step-wall';

        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('step-error'); // Reset animation
            void el.offsetWidth; // Trigger reflow
            el.classList.add('step-error');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
};

const addTvBtn = document.getElementById('add-tv-btn');
if (addTvBtn) {
    addTvBtn.addEventListener('click', (e) => {
        // Prevent default form submission or link follow
        e.preventDefault();

        // Check for missing strict requirements
        let missing = [];
        if (!currentSize) missing.push("TV Size");
        if (!currentBracket) missing.push("Bracket Type");
        if (!currentWall) missing.push("Wall Type");

        if (missing.length > 0) {
            highlightMissingSteps(missing);
            EmailService.showFeedback({
                title: 'Incomplete Selection',
                message: `Please select the following to continue: <strong>${missing.join(', ')}</strong>`
            }, 'error');
            return;
        }

        // Logic check: only add if complete
        addItemToQuote();
    });
}

const nextStepBtn = document.getElementById('next-step-btn');
if (nextStepBtn) {
    nextStepBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const hasItems = quoteItems.length > 0;
        // const currentComplete = (currentSize && currentBracket && currentWall); // This line is no longer needed

        // Scenario 1: Cart has items -> Valid to proceed (current selection ignored or auto-added?)
        // Logic: if current selection is PARTIAL (some selected but not all), warn user.
        // If current selection is EMPTY (nothing selected), ignore and proceed with cart.
        // If current selection is COMPLETE, auto-add it and proceed? Or just warn?
        // User asked for: "require a selection in each step so i cant add nother tv or go to next details if that condition isnt met"
        // This implies strict enforcement on the CURRENT item being built.

        // Refined Logic Rule:
        // 1. If Cart has items AND current selection is empty -> Proceed (using cart).
        // 2. If Cart has items AND current selection is partial -> Warn "Finish current item or Clear it".
        // 3. If Cart is empty -> Must have COMPLETE selection.

        let missing = [];
        if (!currentSize) missing.push("TV Size");
        if (!currentBracket) missing.push("Bracket Type");
        if (!currentWall) missing.push("Wall Type");

        // Check if current selection has ANY progress
        const isPartial = (currentSize || currentBracket || currentWall) && !(currentSize && currentBracket && currentWall);
        const isEmpty = !currentSize && !currentBracket && !currentWall;

        if (hasItems) {
            if (isPartial) {
                highlightMissingSteps(missing);
                EmailService.showFeedback({
                    title: 'Finish Your Selection',
                    message: `You have an unfinished TV in progress. Please finish selecting <strong>${missing.join(', ')}</strong> or clear the current selection.`
                }, 'error');
                return;
            }
            if (!isEmpty && !isPartial) {
                // Complete selection sitting there? Auto-add it.
                addItemToQuote();
            }
            // Proceed
            showBookingForm();
        } else {
            // No items in cart, MUST have complete selection
            if (missing.length > 0) {
                highlightMissingSteps(missing);
                EmailService.showFeedback({
                    title: 'Incomplete Selection',
                    message: `Please complete your selection or add at least one TV to proceed.`
                }, 'error');
                return;
            }
            // Complete selection, add it then proceed
            addItemToQuote();
            showBookingForm();
        }
    });
}

// Show form on button click
window.showBookingForm = function () {
    saveToStorage();
    if (window.location.pathname.includes('tv-mounting.html')) {
        window.location.href = 'booking.html';
    } else {
        const bookingForm = document.querySelector('.form-overlay');
        if (bookingForm) {
            bookingForm.classList.add('visible');
            bookingForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// --- INITIALIZE UI STATE ---
function initUI() {
    updatePrice();
}

// Run init on pages with total price display
if (document.querySelector('.total-price')) {
    initUI();
}

/**
 * Helper: Format Quote for Email
 * Abstracted for cleaner logic and potential reuse.
 */
function formatQuoteForEmail(items, isComplete, editIndex, state) {
    let finalString = items.map((item, i) => {
        const itemTotal = item.price || 0;
        let details = `TV ${i + 1}: ${item.sizeLabel} ($${pricing[item.size].own})`;
        if (item.bracket !== 'own') {
            details += `, ${item.bracketLabel} (+$${pricing[item.size][item.bracket] - pricing[item.size].own})`;
        }
        details += `, Wall: ${item.wallLabel}`;
        if (item.addons.length > 0) {
            const addonString = item.addons.map(a => `${addonLabels[a]} (+$${pricing.addons[a]})`).join(', ');
            details += `\n   + Add-ons: ${addonString}`;
        }
        details += `\n   Item Total: $${itemTotal}`;
        return details;
    }).join('\n\n--------------------------------------------------\n\n');

    // Add current selection if not null (and not currently editing it in place)
    if (editIndex === null && isComplete) {
        const bracketPrice = state.currentBracket ? (pricing[state.currentSize][state.currentBracket] || 0) : 0;
        const currentItemPrice = bracketPrice + Array.from(state.selectedAddons).reduce((acc, a) => acc + pricing.addons[a], 0);

        let currentString = `TV Selection (Cart): ${sizeLabels[state.currentSize]} ($${pricing[state.currentSize].own})`;
        if (state.currentBracket !== 'own') {
            currentString += `, ${bracketLabels[state.currentBracket]} (+$${pricing[state.currentSize][state.currentBracket] - pricing[state.currentSize].own})`;
        }
        currentString += `, Wall: ${wallLabels[state.currentWall]}`;
        if (state.selectedAddons.size > 0) {
            const addonString = Array.from(state.selectedAddons).map(a => `${addonLabels[a]} (+$${pricing.addons[a]})`).join(', ');
            currentString += `\n   + Add-ons: ${addonString}`;
        }
        currentString += `\n   Item Total: $${currentItemPrice}`;

        finalString += (finalString ? '\n\n--------------------------------------------------\n\n' : '') + currentString;
    }

    finalString += `\n\n==================================================\nTOTAL ESTIMATE: $${state.grandTotal}`;
    return finalString;
}
