// Konfigurasi API URL untuk production
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Theme Management
const ThemeManager = {
    init() {
        this.createThemeToggle();
        this.loadSavedTheme();
        this.applyThemeStyles();
    },

    createThemeToggle() {
        // Hapus toggle lama jika ada
        const oldToggle = document.querySelector('.theme-toggle');
        if (oldToggle) oldToggle.remove();

        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '🌙';
        themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        themeToggle.title = 'Toggle dark mode';
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        document.body.appendChild(themeToggle);
    },

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        const themeToggle = document.querySelector('.theme-toggle');
        
        themeToggle.innerHTML = isDark ? '☀️' : '🌙';
        themeToggle.style.background = isDark ? '#f39c12' : '#3498db';
        
        this.saveTheme(isDark ? 'dark' : 'light');
        this.applyThemeStyles();
    },

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = '☀️';
                themeToggle.style.background = '#f39c12';
            }
        } else {
            document.body.classList.remove('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = '🌙';
                themeToggle.style.background = '#3498db';
            }
        }
    },

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    },

    applyThemeStyles() {
        const isDark = document.body.classList.contains('dark-theme');
        
        // Update CSS variables based on theme
        const root = document.documentElement;
        if (isDark) {
            root.style.setProperty('--text', '#ecf0f1');
            root.style.setProperty('--text-light', '#bdc3c7');
            root.style.setProperty('--background', '#1a2530');
            root.style.setProperty('--white', '#2c3e50');
            root.style.setProperty('--border', '#34495e');
            root.style.setProperty('--light', '#34495e');
        } else {
            root.style.setProperty('--text', '#333333');
            root.style.setProperty('--text-light', '#666666');
            root.style.setProperty('--background', '#f9f9f9');
            root.style.setProperty('--white', '#ffffff');
            root.style.setProperty('--border', '#e9ecef');
            root.style.setProperty('--light', '#ecf0f1');
        }
    }
};

// Smooth scrolling untuk navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu jika terbuka
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu ketika klik di luar
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!e.target.closest('nav') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});

// Form submission dengan validasi dan loading state
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Validasi form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        submitButton.textContent = 'Mengirim...';
        submitButton.disabled = true;
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim()
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification('Pesan berhasil dikirim! Terima kasih telah menghubungi saya.', 'success');
                this.reset();
            } else {
                throw new Error(result.message || 'Terjadi kesalahan pada server');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan. Silakan coba lagi atau hubungi melalui email.', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Validasi form
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Reset previous errors
    clearErrors();
    
    let isValid = true;
    
    if (!name) {
        showError('name', 'Nama harus diisi');
        isValid = false;
    } else if (name.length < 2) {
        showError('name', 'Nama terlalu pendek');
        isValid = false;
    }
    
    if (!email) {
        showError('email', 'Email harus diisi');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'Format email tidak valid');
        isValid = false;
    }
    
    if (!subject) {
        showError('subject', 'Subjek harus diisi');
        isValid = false;
    } else if (subject.length < 5) {
        showError('subject', 'Subjek terlalu pendek');
        isValid = false;
    }
    
    if (!message) {
        showError('message', 'Pesan harus diisi');
        isValid = false;
    } else if (message.length < 10) {
        showError('message', 'Pesan terlalu pendek (minimal 10 karakter)');
        isValid = false;
    }
    
    return isValid;
}

// Validasi email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // Add error class
    field.classList.add('error');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    formGroup.appendChild(errorElement);
}

// Clear all errors
function clearErrors() {
    // Remove error classes
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
        field.classList.remove('error');
    });
    
    // Remove error messages
    document.querySelectorAll('.error-message').forEach(error => {
        error.remove();
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
    
    // Close on click
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Function untuk animasi skill bars
function initSkillBars() {
    const skillProgresses = document.querySelectorAll('.skill-progress');
    
    // Reset semua progress bar ke 0
    skillProgresses.forEach(progress => {
        progress.style.width = '0%';
    });
    
    // Observer untuk skill section
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate skill bars dengan delay bertahap
                skillProgresses.forEach((progress, index) => {
                    const width = progress.getAttribute('data-width') + '%';
                    
                    setTimeout(() => {
                        progress.style.width = width;
                        
                        // Animate percentage text
                        const percentageElement = progress.closest('.skill-item').querySelector('.skill-percentage');
                        if (percentageElement) {
                            animatePercentageCounter(percentageElement, parseInt(progress.getAttribute('data-width')));
                        }
                    }, index * 200);
                });
                
                // Stop observing setelah di-trigger
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    });
    
    observer.observe(skillsSection);
}

// Function untuk animasi counter persentase
function animatePercentageCounter(element, targetValue) {
    let current = 0;
    const duration = 1500;
    const steps = 60;
    const increment = targetValue / steps;
    const stepDuration = duration / steps;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            element.textContent = targetValue + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '%';
        }
    }, stepDuration);
}

// Scroll animations dengan Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Navbar background on scroll dengan throttling
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            const header = document.querySelector('header');
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                header.style.background = 'rgba(44, 62, 80, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
                header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            } else {
                header.style.background = 'var(--secondary)';
                header.style.backdropFilter = 'none';
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }
            
            // Update active navigation link
            updateActiveNavLink();
            
            scrollTimeout = null;
        }, 10);
    }
});

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Typing effect untuk hero section
function initTypingEffect() {
    const heroText = document.querySelector('.hero-text h1');
    if (!heroText) return;
    
    const originalText = heroText.innerHTML;
    const highlightedText = originalText.replace(
        /<span class="highlight">(.*?)<\/span>/,
        '<span class="highlight typing-cursor">$1</span>'
    );
    
    heroText.innerHTML = highlightedText;
    
    const typingCursor = document.querySelector('.typing-cursor');
    if (typingCursor) {
        setTimeout(() => {
            typingCursor.style.borderRight = 'none';
        }, 2000);
    }
}

// Counter animation untuk stats
function initCounterAnimation() {
    const stats = document.querySelectorAll('.stat h3');
    
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.textContent);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        stat.textContent = Math.floor(current) + '+';
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.textContent = target + '+';
                    }
                };
                
                updateCounter();
                statObserver.unobserve(stat);
            }
        });
    }, {
        threshold: 0.5
    });
    
    stats.forEach(stat => {
        statObserver.observe(stat);
    });
}

// Form input real-time validation
function initRealTimeValidation() {
    const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            // Remove error state saat user mengetik
            input.classList.remove('error');
            const errorMessage = input.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
        
        // Add focus effects
        input.addEventListener('focus', () => {
            input.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentNode.classList.remove('focused');
        });
    });
}

// Portfolio item hover effects
function initPortfolioHover() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize semua fungsi ketika DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Theme Manager FIRST
    ThemeManager.init();
    
    // Observe elements for animation
    document.querySelectorAll('section, .portfolio-item, .skill-item, .stat, .skill-category').forEach(el => {
        observer.observe(el);
    });
    
    // Initialize berbagai fitur
    initTypingEffect();
    initCounterAnimation();
    initSkillBars();
    initRealTimeValidation();
    initPortfolioHover();
    updateActiveNavLink();
    
    // Setup skill bars data attributes
    document.querySelectorAll('.skill-progress').forEach(progress => {
        const width = progress.getAttribute('data-width');
        progress.setAttribute('data-width', width);
    });
    
    console.log('Website initialized with theme support! 🎨');
});

// Handle page visibility (pause animations ketika tab tidak aktif)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('page-hidden');
    } else {
        document.body.classList.remove('page-hidden');
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    // Measure page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
});

// Error boundary untuk catching JavaScript errors
window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', event.error);
});

// Resize handler
window.addEventListener('resize', () => {
    // Close mobile menu pada resize ke desktop
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Keyboard shortcuts untuk theme
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + T untuk toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        ThemeManager.toggleTheme();
    }
});

console.log('Website profile loaded successfully! 🚀');
