// Animation and Interactive Effects
class LifeFlowAnimations {
    constructor() {
        this.initScrollAnimations();
        this.initCounters();
        this.initParallax();
        this.initTypingEffect();
        this.initProgressBars();
    }

    initScrollAnimations() {
        // Add scroll-triggered animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-visible');
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe elements with animate-on-scroll class
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    initCounters() {
        // Animated counters
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const increment = target / 200;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.innerText = Math.ceil(current);
                    setTimeout(updateCounter, 1);
                } else {
                    counter.innerText = target;
                }
            };
            
            // Start when in viewport
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
            
            observer.observe(counter);
        });
    }

    initParallax() {
        // Simple parallax effect for hero sections
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    initTypingEffect() {
        // Typing effect for hero text
        const typingElement = document.getElementById('typing-effect');
        if (!typingElement) return;
        
        const texts = JSON.parse(typingElement.dataset.texts || '["Save Lives", "Connect Donors", "Emergency Response"]');
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                setTimeout(type, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                setTimeout(type, 500);
            } else {
                const speed = isDeleting ? 50 : 100;
                setTimeout(type, speed);
            }
        }
        
        setTimeout(type, 1000);
    }

    initProgressBars() {
        // Animate progress bars
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.transition = 'width 1.5s ease-in-out';
                bar.style.width = width;
            }, 500);
        });
    }

    // Blood cell animation
    createBloodCells() {
        const container = document.querySelector('.blood-cells');
        if (!container) return;
        
        for (let i = 0; i < 10; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Random properties
            const size = Math.random() * 20 + 10;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const duration = Math.random() * 20 + 20;
            const delay = Math.random() * 5;
            
            cell.style.width = `${size}px`;
            cell.style.height = `${size}px`;
            cell.style.left = `${left}%`;
            cell.style.top = `${top}%`;
            cell.style.animationDuration = `${duration}s`;
            cell.style.animationDelay = `${delay}s`;
            
            container.appendChild(cell);
        }
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animations = new LifeFlowAnimations();
    animations.createBloodCells();
    
    // Remove preloader
    window.addEventListener('load', () => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 1000);
        }
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
            
            localStorage.setItem('theme', newTheme);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'dark' ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
    }
});