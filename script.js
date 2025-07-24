// Bucket List App JavaScript
class BucketListApp {
    constructor() {
        this.wishes = JSON.parse(localStorage.getItem('bucketListWishes')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.wishInput = document.getElementById('wishInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.addBtn = document.getElementById('addBtn');
        this.wishesContainer = document.getElementById('wishesContainer');
        this.emptyState = document.getElementById('emptyState');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.totalCount = document.getElementById('totalCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.completedCount = document.getElementById('completedCount');
        
        // Modal elements
        this.editModal = document.getElementById('editModal');
        this.editWishInput = document.getElementById('editWishInput');
        this.editCategorySelect = document.getElementById('editCategorySelect');
        this.closeModal = document.getElementById('closeModal');
        this.saveEdit = document.getElementById('saveEdit');
        this.cancelEdit = document.getElementById('cancelEdit');
    }

    bindEvents() {
        // Add wish
        this.addBtn.addEventListener('click', () => this.addWish());
        this.wishInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addWish();
        });

        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Modal events
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEdit.addEventListener('click', () => this.closeEditModal());
        this.saveEdit.addEventListener('click', () => this.saveEditedWish());
        
        // Close modal on outside click
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.editModal.classList.contains('show')) {
                this.closeEditModal();
            }
        });
    }

    addWish() {
        const text = this.wishInput.value.trim();
        const category = this.categorySelect.value;

        if (!text) {
            this.showNotification('Please enter your dream!', 'error');
            return;
        }

        const wish = {
            id: Date.now(),
            text: text,
            category: category,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.wishes.unshift(wish);
        this.saveToStorage();
        this.render();
        
        // Clear input
        this.wishInput.value = '';
        this.categorySelect.value = 'personal';
        
        this.showNotification('Dream added to your bucket list! ✨', 'success');
    }

    toggleComplete(id) {
        const wish = this.wishes.find(w => w.id === id);
        if (wish) {
            wish.completed = !wish.completed;
            this.saveToStorage();
            this.render();
            
            const message = wish.completed ? 
                'Congratulations! Dream achieved! 🎉' : 
                'Dream moved back to pending 📝';
            this.showNotification(message, 'success');
        }
    }

    deleteWish(id) {
        if (confirm('Are you sure you want to delete this dream?')) {
            this.wishes = this.wishes.filter(w => w.id !== id);
            this.saveToStorage();
            this.render();
            this.showNotification('Dream removed from your list', 'info');
        }
    }

    editWish(id) {
        const wish = this.wishes.find(w => w.id === id);
        if (wish) {
            this.editingId = id;
            this.editWishInput.value = wish.text;
            this.editCategorySelect.value = wish.category;
            this.showEditModal();
        }
    }

    saveEditedWish() {
        const text = this.editWishInput.value.trim();
        const category = this.editCategorySelect.value;

        if (!text) {
            this.showNotification('Please enter your dream!', 'error');
            return;
        }

        const wish = this.wishes.find(w => w.id === this.editingId);
        if (wish) {
            wish.text = text;
            wish.category = category;
            this.saveToStorage();
            this.render();
            this.closeEditModal();
            this.showNotification('Dream updated successfully! ✏️', 'success');
        }
    }

    showEditModal() {
        this.editModal.classList.add('show');
        this.editWishInput.focus();
    }

    closeEditModal() {
        this.editModal.classList.remove('show');
        this.editingId = null;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredWishes() {
        switch (this.currentFilter) {
            case 'completed':
                return this.wishes.filter(w => w.completed);
            case 'pending':
                return this.wishes.filter(w => !w.completed);
            default:
                return this.wishes;
        }
    }

    render() {
        const filteredWishes = this.getFilteredWishes();
        
        // Update stats
        this.updateStats();
        
        // Clear container
        this.wishesContainer.innerHTML = '';
        
        if (filteredWishes.length === 0) {
            this.showEmptyState();
            return;
        }

        // Render wishes
        filteredWishes.forEach(wish => {
            const wishElement = this.createWishElement(wish);
            this.wishesContainer.appendChild(wishElement);
        });
    }

    createWishElement(wish) {
        const div = document.createElement('div');
        div.className = `wish-item ${wish.completed ? 'completed' : ''}`;
        
        const categoryEmoji = this.getCategoryEmoji(wish.category);
        
        div.innerHTML = `
            <div class="category-badge category-${wish.category}">
                ${categoryEmoji} ${wish.category.charAt(0).toUpperCase() + wish.category.slice(1)}
            </div>
            <div class="wish-text">${this.escapeHtml(wish.text)}</div>
            <div class="wish-actions">
                <button class="action-btn complete-btn" onclick="app.toggleComplete(${wish.id})">
                    <i class="fas ${wish.completed ? 'fa-undo' : 'fa-check'}"></i>
                    ${wish.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="action-btn edit-btn" onclick="app.editWish(${wish.id})">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="action-btn delete-btn" onclick="app.deleteWish(${wish.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `;
        
        return div;
    }

    getCategoryEmoji(category) {
        const emojis = {
            personal: '🌟',
            travel: '✈️',
            career: '💼',
            health: '💪',
            learning: '📚',
            adventure: '🏔️',
            creative: '🎨',
            relationships: '❤️'
        };
        return emojis[category] || '🌟';
    }

    showEmptyState() {
        let message = '';
        switch (this.currentFilter) {
            case 'completed':
                message = 'No completed dreams yet. Start achieving your goals!';
                break;
            case 'pending':
                message = 'No pending dreams. Add some new goals to work towards!';
                break;
            default:
                message = 'Your bucket list is empty. Start adding your dreams and watch them come to life!';
        }
        
        this.wishesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-magic"></i>
                </div>
                <h3>No dreams found</h3>
                <p>${message}</p>
            </div>
        `;
    }

    updateStats() {
        const total = this.wishes.length;
        const completed = this.wishes.filter(w => w.completed).length;
        const pending = total - completed;
        
        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.pendingCount.textContent = pending;
    }

    saveToStorage() {
        localStorage.setItem('bucketListWishes', JSON.stringify(this.wishes));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '300px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            info: '#3498db'
        };
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BucketListApp();
});

// Add some sample data for first-time users
if (!localStorage.getItem('bucketListWishes')) {
    const sampleWishes = [
        {
            id: 1,
            text: "Learn a new language fluently",
            category: "learning",
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            text: "Travel to Japan and see cherry blossoms",
            category: "travel",
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            text: "Run a marathon",
            category: "health",
            completed: false,
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('bucketListWishes', JSON.stringify(sampleWishes));
}
