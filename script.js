// Main JavaScript file for Blood Bank System

class BloodBankSystem {
    constructor() {
        this.baseUrl = 'http://localhost/blood-bank-system/api';
        this.init();
    }

    init() {
        // Initialize common functionality
        this.initializeEventListeners();
        this.checkAuthStatus();
        this.loadBloodInventory();
    }

    // User Authentication Functions
    async loginUser(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('auth_token', data.data.token);
                localStorage.setItem('user_type', data.data.user_type);
                localStorage.setItem('user_id', data.data.user_id);
                window.location.href = 'dashboard.html';
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Login failed. Please try again.', 'danger');
        }
    }

    async registerDonor(donorData) {
        try {
            const response = await fetch(`${this.baseUrl}/register-donor.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(donorData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed' };
        }
    }

    // Blood Inventory Management
    async loadBloodInventory() {
        try {
            const response = await fetch(`${this.baseUrl}/get-inventory.php`);
            const data = await response.json();
            
            if (data.success) {
                this.displayInventory(data.data);
            }
        } catch (error) {
            console.error('Inventory load error:', error);
        }
    }

    displayInventory(inventory) {
        const container = document.getElementById('inventoryContainer');
        if (!container) return;

        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        
        container.innerHTML = bloodTypes.map(type => {
            const typeData = inventory.find(item => item.blood_type === type) || { quantity: 0 };
            const percentage = (typeData.quantity / 50) * 100; // Assuming 50 is max capacity
            const statusClass = typeData.quantity <= 5 ? 'low' : typeData.quantity <= 15 ? 'medium' : 'good';
            
            return `
                <div class="col-md-3 mb-4">
                    <div class="blood-type-card blood-type-${type.replace('+', 'plus').replace('-', 'minus')}">
                        <h3>${type}</h3>
                        <div class="mt-3">
                            <h4>${typeData.quantity} Units</h4>
                            <div class="progress mt-2" style="height: 10px;">
                                <div class="progress-bar bg-light" 
                                     style="width: ${Math.min(percentage, 100)}%"></div>
                            </div>
                            <p class="mt-2 mb-0">Status: <span class="badge bg-${statusClass === 'low' ? 'danger' : statusClass === 'medium' ? 'warning' : 'success'}">${statusClass.toUpperCase()}</span></p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Donor Search Functionality
    async searchDonors(criteria) {
        try {
            const response = await fetch(`${this.baseUrl}/search-donors.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(criteria)
            });

            const data = await response.json();
            
            if (data.success) {
                this.displayDonors(data.data);
                if (typeof window.initMap === 'function') {
                    window.initMap(data.data);
                }
            }
            return data;
        } catch (error) {
            console.error('Search error:', error);
            return { success: false, message: 'Search failed' };
        }
    }

    displayDonors(donors) {
        const container = document.getElementById('donorsList');
        if (!container) return;

        if (donors.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No donors found matching your criteria.</div>';
            return;
        }

        container.innerHTML = donors.map(donor => `
            <div class="donor-card fade-in">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="mb-1">${donor.full_name}</h5>
                        <p class="text-muted mb-1">
                            <span class="badge bg-danger">${donor.blood_type}</span>
                            <span class="ms-2"><i class="fas fa-venus-mars"></i> ${donor.gender}</span>
                            <span class="ms-2"><i class="fas fa-birthday-cake"></i> ${new Date(donor.date_of_birth).getFullYear()}</span>
                        </p>
                        <p class="mb-1"><i class="fas fa-map-marker-alt"></i> ${donor.city || 'Location not specified'}</p>
                        <p class="mb-1"><i class="fas fa-phone"></i> ${donor.contact_number}</p>
                        <p class="mb-0">
                            <span class="donor-availability ${donor.is_available ? 'available' : 'unavailable'}"></span>
                            ${donor.is_available ? 'Available for donation' : 'Currently unavailable'}
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="bloodBankSystem.sendAlertToDonor(${donor.donor_id})">
                                <i class="fas fa-bell"></i> Alert
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="bloodBankSystem.viewDonorDetails(${donor.donor_id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                        <p class="mt-2 text-muted small">Last donation: ${donor.last_donation_date || 'Never'}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Emergency Alert System
    async sendEmergencyAlert(alertData) {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                this.showAlert('Please login to send alerts', 'warning');
                return;
            }

            const response = await fetch(`${this.baseUrl}/send-emergency-alert.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(alertData)
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAlert('Emergency alert sent successfully!', 'success');
                // Send notifications to nearby donors
                this.notifyNearbyDonors(alertData);
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Alert sending error:', error);
            this.showAlert('Failed to send emergency alert', 'danger');
        }
    }

    async notifyNearbyDonors(alertData) {
        // This would integrate with SMS/Email services
        console.log('Notifying nearby donors:', alertData);
        // Implementation for Twilio/SMTP integration would go here
    }

    // Utility Functions
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.alert-container') || document.body;
        if (document.querySelector('.alert-container')) {
            container.prepend(alertDiv);
        } else {
            const tempContainer = document.createElement('div');
            tempContainer.className = 'alert-container position-fixed top-0 end-0 p-3';
            tempContainer.style.zIndex = '1050';
            tempContainer.appendChild(alertDiv);
            document.body.appendChild(tempContainer);
        }

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const currentPage = window.location.pathname;
        
        // Protect dashboard pages
        if (currentPage.includes('dashboard') && !token) {
            window.location.href = 'index.html';
        }
    }

    initializeEventListeners() {
        // Initialize any global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Auto-load data on specific pages
            if (window.location.pathname.includes('inventory')) {
                this.loadBloodInventory();
            }
        });
    }

    // Map Integration
    initializeDonorMap(donors = []) {
        const mapContainer = document.getElementById('donorMap');
        if (!mapContainer) return;

        // Default to Colombo, Sri Lanka
        const map = L.map('donorMap').setView([6.9271, 79.8612], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add donor markers
        donors.forEach(donor => {
            if (donor.latitude && donor.longitude) {
                const marker = L.marker([donor.latitude, donor.longitude])
                    .addTo(map)
                    .bindPopup(`
                        <strong>${donor.full_name}</strong><br>
                        Blood Type: ${donor.blood_type}<br>
                        Contact: ${donor.contact_number}<br>
                        Status: ${donor.is_available ? 'Available' : 'Unavailable'}
                    `);
            }
        });
    }

    // Logout function
    logout() {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Initialize the system
const bloodBankSystem = new BloodBankSystem();

// Global helper functions
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function validatePhoneNumber(phone) {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
}

function validateNIC(nic) {
    // Sri Lankan NIC validation
    const regex = /^[0-9]{9}[vVxX]?$|^[0-9]{12}$/;
    return regex.test(nic);
}