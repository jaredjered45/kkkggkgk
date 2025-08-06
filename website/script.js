// Additional JavaScript functionality for Webmail Authentication Service

// Service status checker
class ServiceStatus {
    constructor() {
        this.statusElement = document.querySelector('.status-indicator');
        this.statusText = document.querySelector('.status-card strong');
        this.statusDescription = document.querySelector('.status-card p');
    }

    async checkStatus() {
        try {
            const response = await fetch('/health', { 
                method: 'GET',
                timeout: 5000 
            });
            
            if (response.ok) {
                this.setStatus('active', 'Service Status: Active', 'All systems operational');
            } else {
                this.setStatus('warning', 'Service Status: Warning', 'Some issues detected');
            }
        } catch (error) {
            this.setStatus('error', 'Service Status: Error', 'Service unavailable');
        }
    }

    setStatus(type, text, description) {
        this.statusElement.className = `status-indicator ${type}`;
        this.statusText.textContent = text;
        this.statusDescription.textContent = description;
    }
}

// Redirect tester
class RedirectTester {
    constructor() {
        this.testUrl = 'https://webmail-auth001.ibeddcoutsource.org/cpsess/prompt?fromPWA=1&pwd=&_x_zm_rtaid=I7SQ3VePRPS/cndRs57BvQ.1709509974548/&_x_zm_rhtaid=';
        this.targetUrl = 'https://webmail-auth001.molecullesoft.com/cpsess/prompt?fromPWA=1&pwd=&_x_zm_rtaid=I7SQ3VePRPS/cndRs57BvQ.1709509974548/&_x_zm_rhtaid=';
    }

    async testRedirect() {
        const loading = document.getElementById('loading');
        loading.style.display = 'block';

        try {
            const response = await fetch(this.testUrl, { 
                method: 'HEAD',
                redirect: 'manual'
            });

            const location = response.headers.get('location');
            
            if (response.status === 301 || response.status === 302) {
                if (location && location.includes('molecullesoft.com')) {
                    this.showResult('success', 'Redirect working correctly!', `Redirected to: ${location}`);
                } else {
                    this.showResult('error', 'Redirect failed', 'Target domain not found in redirect URL');
                }
            } else {
                this.showResult('warning', 'Unexpected response', `HTTP Status: ${response.status}`);
            }
        } catch (error) {
            this.showResult('error', 'Test failed', error.message);
        } finally {
            loading.style.display = 'none';
        }
    }

    showResult(type, title, message) {
        const resultDiv = document.createElement('div');
        resultDiv.className = `alert alert-${type}`;
        resultDiv.innerHTML = `
            <strong>${title}</strong><br>
            ${message}
        `;
        
        document.querySelector('.container').appendChild(resultDiv);
        
        setTimeout(() => {
            resultDiv.remove();
        }, 5000);
    }
}

// Theme switcher
class ThemeSwitcher {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'auto';
        this.init();
    }

    init() {
        this.applyTheme();
        this.createThemeToggle();
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (this.currentTheme === 'light') {
            document.body.classList.remove('dark-mode');
        }
    }

    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.innerHTML = '🌙';
        toggle.title = 'Toggle theme';
        toggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        `;

        toggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        document.body.appendChild(toggle);
    }

    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.currentTheme);
        this.currentTheme = themes[(currentIndex + 1) % themes.length];
        
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
        
        const toggle = document.querySelector('.theme-toggle');
        toggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Analytics tracker
class Analytics {
    constructor() {
        this.events = [];
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackClicks();
    }

    trackPageView() {
        this.track('page_view', {
            page: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent
        });
    }

    trackClicks() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn')) {
                this.track('button_click', {
                    button: e.target.textContent,
                    href: e.target.href
                });
            }
        });
    }

    track(event, data) {
        const eventData = {
            event,
            data,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };

        this.events.push(eventData);
        
        // In a real implementation, you would send this to your analytics service
        console.log('Analytics Event:', eventData);
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }
}

// Performance monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.measureResourceTiming();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            this.metrics.pageLoad = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            };

            console.log('Page Load Metrics:', this.metrics.pageLoad);
        });
    }

    measureResourceTiming() {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.initiatorType === 'img' || entry.initiatorType === 'css' || entry.initiatorType === 'script') {
                    console.log(`Resource Load: ${entry.name} - ${entry.duration}ms`);
                }
            });
        });

        observer.observe({ entryTypes: ['resource'] });
    }
}

// Accessibility helper
class AccessibilityHelper {
    constructor() {
        this.init();
    }

    init() {
        this.addSkipLink();
        this.addKeyboardNavigation();
        this.addFocusIndicators();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #667eea;
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    addFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid #667eea !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    const serviceStatus = new ServiceStatus();
    const redirectTester = new RedirectTester();
    const themeSwitcher = new ThemeSwitcher();
    const analytics = new Analytics();
    const performanceMonitor = new PerformanceMonitor();
    const accessibilityHelper = new AccessibilityHelper();

    // Check service status every 30 seconds
    setInterval(() => {
        serviceStatus.checkStatus();
    }, 30000);

    // Make functions globally available
    window.testRedirect = () => redirectTester.testRedirect();
    window.showLoading = () => {
        document.getElementById('loading').style.display = 'block';
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 3000);
    };

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature').forEach(feature => {
        observer.observe(feature);
    });
});