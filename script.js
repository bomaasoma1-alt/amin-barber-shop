// Queue System Data
let queue = [];
let nextTicketNumber = 1;
const serviceWaitTimes = {
    'Low Fade - 300 دج': 15,
    'Mid Fade - 300 دج': 15,
    'High Fade - 300 دج': 15,
    'French Crop - 300 دج': 15,
    'Taper Fade - 300 دج': 15,
    'Hair + Beard - 500 دج': 25
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadQueueFromStorage();
    setupEventListeners();
    updateQueueDisplay();
    updateStats();
    
    // Update queue display every 5 seconds
    setInterval(updateQueueDisplay, 5000);
    setInterval(updateStats, 5000);
});

// Event Listeners
function setupEventListeners() {
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', handleBooking);
    }

    // Book Now buttons
    const bookButtons = document.querySelectorAll('.btn-book');
    bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.booking-section').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Handle Booking
function handleBooking(e) {
    e.preventDefault();

    const name = document.getElementById('customerName').value.trim();
    const service = document.getElementById('serviceType').value;

    if (!name || !service) {
        alert('يرجى ملء جميع الحقول');
        return;
    }

    // Create ticket
    const ticket = {
        id: Date.now(),
        ticketNumber: nextTicketNumber++,
        name: name,
        service: service,
        timestamp: new Date(),
        waitTime: serviceWaitTimes[service] || 15
    };

    queue.push(ticket);
    saveQueueToStorage();
    updateQueueDisplay();
    updateStats();

    // Clear form
    document.getElementById('bookingForm').reset();
    document.getElementById('customerName').focus();

    // Show success message
    showNotification(`تم إضافتك للطابور برقم تذكرة ${ticket.ticketNumber}`);
}

// Cancel Ticket
function cancelTicket(ticketId) {
    if (confirm('هل أنت متأكد من إلغاء التذكرة؟')) {
        queue = queue.filter(ticket => ticket.id !== ticketId);
        saveQueueToStorage();
        updateQueueDisplay();
        updateStats();
        showNotification('تم إلغاء التذكرة بنجاح');
    }
}

// Update Queue Display
function updateQueueDisplay() {
    const queueList = document.getElementById('queueList');
    
    if (queue.length === 0) {
        queueList.innerHTML = '<p class="empty-queue">الطابور فارغ حالياً</p>';
        return;
    }

    queueList.innerHTML = queue.map((ticket, index) => {
        const waitMinutes = calculateWaitTime(index);
        return `
            <div class="queue-item">
                <div class="queue-item-number">#${ticket.ticketNumber}</div>
                <div class="queue-item-details">
                    <div class="queue-item-name">${ticket.name}</div>
                    <div class="queue-item-service">${ticket.service}</div>
                    <div class="queue-item-position">${index === 0 ? 'قيد الخدمة الآن' : `أمامك ${index} أشخاص`}</div>
                </div>
                <div class="queue-item-wait">
                    <div class="wait-time">${waitMinutes} د</div>
                    <div class="wait-label">وقت الانتظار</div>
                </div>
                <button class="btn-cancel" onclick="cancelTicket(${ticket.id})">إلغاء</button>
            </div>
        `;
    }).join('');
}

// Calculate Wait Time
function calculateWaitTime(position) {
    let totalWait = 0;
    for (let i = 0; i < position && i < queue.length; i++) {
        totalWait += queue[i].waitTime;
    }
    return totalWait;
}

// Update Statistics
function updateStats() {
    // Total in queue
    document.getElementById('totalInQueue').textContent = queue.length;

    // Average wait time
    if (queue.length > 0) {
        const totalWait = queue.reduce((sum, ticket) => sum + ticket.waitTime, 0);
        const avgWait = Math.ceil(totalWait / queue.length);
        document.getElementById('avgWaitTime').textContent = avgWait;
    } else {
        document.getElementById('avgWaitTime').textContent = '0';
    }

    // Next ticket number
    document.getElementById('nextTicket').textContent = nextTicketNumber;
}

// Local Storage Functions
function saveQueueToStorage() {
    localStorage.setItem('barberQueue', JSON.stringify({
        queue: queue,
        nextTicketNumber: nextTicketNumber
    }));
}

function loadQueueFromStorage() {
    const stored = localStorage.getItem('barberQueue');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            queue = data.queue || [];
            nextTicketNumber = data.nextTicketNumber || 1;
        } catch (e) {
            console.error('Error loading queue data:', e);
        }
    }
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #d4af37;
        color: #1a1a1a;
        padding: 15px 25px;
        border-radius: 5px;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutLeft 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Smooth Scrolling for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        }
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.style.display = 'none';
        }
    });
});