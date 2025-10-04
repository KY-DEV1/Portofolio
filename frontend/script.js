// Konfigurasi API URL untuk production
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

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
                navLinks.style.display = 'none';
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
        const isVisible = navLinks.style.display === 'flex';
        navLinks.style.display = isVisible ? 'none' : 'flex';
        hamburger.classList.toggle('active');
    });
}

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
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '5px';
    
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
    
    // Styling notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease';
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else {
        notification.style.backgroundColor = '#3498db';
    }
    
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

// Scroll animations dengan Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            
            // Function untuk animasi skill bars
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-level');
    
    skillBars.forEach((bar, index) => {
        const width = bar.getAttribute('data-width');
        if (width) {
            // Reset width to 0 untuk animasi
            bar.style.width = '0';
            
            // Animate after a delay
            setTimeout(() => {
                bar.style.width = width;
                bar.classList.add('animated');
                
                // Animate percentage counter
                const percentageElement = bar.closest('.skill-item').querySelector('.skill-percentage');
                if (percentageElement) {
                    animatePercentage(percentageElement, parseInt(width));
                }
            }, 300 + (index * 100));
        }
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
    
    stats.forEach(stat => {
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
        
        // Start counter ketika stat visible
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    statObserver.unobserve(entry.target);
                }
            });
        });
        
        statObserver.observe(stat.parentElement);
    });
}

// Filter portfolio items (jika ada filter nanti)
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class dari semua buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class ke button yang diklik
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Image lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Theme switcher (optional)
function initThemeSwitcher() {
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '🌙';
    themeToggle.className = 'theme-toggle';
    themeToggle.style.position = 'fixed';
    themeToggle.style.bottom = '20px';
    themeToggle.style.right = '20px';
    themeToggle.style.zIndex = '1000';
    themeToggle.style.background = 'var(--primary)';
    themeToggle.style.color = 'white';
    themeToggle.style.border = 'none';
    themeToggle.style.borderRadius = '50%';
    themeToggle.style.width = '50px';
    themeToggle.style.height = '50px';
    themeToggle.style.cursor = 'pointer';
    themeToggle.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeToggle.innerHTML = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
        
        // Save theme preference
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '☀️';
    }
    
    document.body.appendChild(themeToggle);
}

// CSS untuk dark theme
const darkThemeStyles = `
    .dark-theme {
        --primary: #3498db;
        --secondary: #1a2530;
        --accent: #e74c3c;
        --light: #2c3e50;
        --dark: #ecf0f1;
        background-color: #1a2530;
        color: #ecf0f1;
    }
    
    .dark-theme .skill-bar {
        background-color: #34495e;
    }
    
    .dark-theme .portfolio-item,
    .dark-theme .stat {
        background-color: #2c3e50;
        color: #ecf0f1;
    }
    
    .dark-theme .form-group input,
    .dark-theme .form-group textarea {
        background-color: #2c3e50;
        color: #ecf0f1;
        border-color: #34495e;
    }
    
    .dark-theme .form-group input:focus,
    .dark-theme .form-group textarea:focus {
        border-color: var(--primary);
    }
`;

// Add dark theme styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = darkThemeStyles;
document.head.appendChild(styleSheet);

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

// Initialize semua fungsi ketika DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    initTypingEffect();
    initCounterAnimation();
    initPortfolioFilter();
    initLazyLoading();
    initThemeSwitcher();
    initRealTimeValidation();
    
    // Add CSS untuk error states
    const errorStyles = `
        .form-group input.error,
        .form-group textarea.error {
            border-color: #e74c3c !important;
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
        }
        
        .form-group.focused input,
        .form-group.focused textarea {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
        }
        
        .nav-links a.active {
            color: var(--primary) !important;
        }
        
        @keyframes typing {
            from { width: 0 }
            to { width: 100% }
        }
        
        .typing-cursor {
            border-right: 2px solid var(--primary);
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { border-color: var(--primary) }
            51%, 100% { border-color: transparent }
        }
    `;
    
    const errorStyleSheet = document.createElement('style');
    errorStyleSheet.textContent = errorStyles;
    document.head.appendChild(errorStyleSheet);
});

// Handle page visibility (pause animations ketika tab tidak aktif)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('page-hidden');
    } else {
        document.body.classList.remove('page-hidden');
    }
});

// Export functions untuk testing (jika diperlukan)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        isValidEmail,
        showError,
        clearErrors,
        showNotification
    };
}

// Service Worker Registration (Progressive Web App)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Error boundary untuk catching JavaScript errors
window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', event.error);
    // Bisa dikirim ke error tracking service seperti Sentry
});

 // Performance monitoring
window.addEventListener('load', () => {
    // Measure page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
    
    // Send to analytics (contoh)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
            'name': 'load',
            'value': loadTime,
            'event_category': 'Load Time'
        });
    }
});


