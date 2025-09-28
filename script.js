// AI-Based Animal Type Classification System - JavaScript
// Supporting the Rashtriya Gokul Mission

// Global variables
let selectedImage = null;
let isClassifying = false;

// ============================================================================
// MOBILE MENU FUNCTIONALITY
// ============================================================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuButton = event.target.closest('button[onclick="toggleMobileMenu()"]');
    
    if (mobileMenu && !mobileMenu.contains(event.target) && !menuButton) {
        mobileMenu.classList.add('hidden');
    }
});

// ============================================================================
// IMAGE UPLOAD AND PREVIEW FUNCTIONALITY
// ============================================================================

function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file (PNG, JPG, JPEG)');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
    }
    
    // Create FileReader to preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedImage = file;
        showImagePreview(e.target.result);
        enableClassifyButton();
        hideError();
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageSrc) {
    const previewContainer = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    
    if (previewContainer && previewImg) {
        previewImg.src = imageSrc;
        previewContainer.classList.remove('hidden');
        previewContainer.classList.add('fade-in');
    }
}

function clearImage() {
    selectedImage = null;
    
    // Hide preview
    const previewContainer = document.getElementById('image-preview');
    if (previewContainer) {
        previewContainer.classList.add('hidden');
    }
    
    // Clear file input
    const fileInput = document.getElementById('image-input');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Disable classify button
    disableClassifyButton();
    
    // Hide results and error messages
    hideResults();
    hideError();
}

function enableClassifyButton() {
    const classifyBtn = document.getElementById('classify-btn');
    if (classifyBtn) {
        classifyBtn.disabled = false;
        classifyBtn.classList.remove('disabled:bg-gray-400', 'disabled:cursor-not-allowed');
        classifyBtn.classList.add('hover:bg-green-700');
    }
}

function disableClassifyButton() {
    const classifyBtn = document.getElementById('classify-btn');
    if (classifyBtn) {
        classifyBtn.disabled = true;
        classifyBtn.classList.add('disabled:bg-gray-400', 'disabled:cursor-not-allowed');
        classifyBtn.classList.remove('hover:bg-green-700');
    }
}

// ============================================================================
// DRAG AND DROP FUNCTIONALITY
// ============================================================================

function initializeDragAndDrop() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-input');
    
    if (!uploadArea || !fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        uploadArea.classList.add('dragover');
    }
    
    function unhighlight(e) {
        uploadArea.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleImageUpload({ target: { files: files } });
        }
    }
}

// ============================================================================
// CLASSIFICATION FUNCTIONALITY
// ============================================================================

async function classifyImage() {
    if (!selectedImage || isClassifying) {
        return;
    }
    
    isClassifying = true;
    showLoading();
    hideResults();
    hideError();
    
    try {
    
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        // ============================================================================
        // API CALL - Replace with actual endpoint
        // ============================================================================
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // ============================================================================
        // END OF API INTEGRATION SECTION
        // ============================================================================
        
        // For demo purposes, simulate API response if actual API is not available
        if (response.status === 404 || !result) {
            console.log('API not available, using demo data');
            const demoResult = generateDemoResult();
            displayResults(demoResult);
        } else {
            displayResults(result);
        }
        
    } catch (error) {
        console.error('Classification error:', error);
        
        // Show demo results if API is not available
        if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
            console.log('API not available, showing demo results');
            const demoResult = generateDemoResult();
            displayResults(demoResult);
        } else {
            showError('Failed to classify image. Please try again.');
        }
    } finally {
        isClassifying = false;
        hideLoading();
    }
}

function generateDemoResult() {
    // Demo data for testing when API is not available
    const breeds = [
        { name: 'Gir', confidence: 0.92 },
        { name: 'Sahiwal', confidence: 0.85 },
        { name: 'Red Sindhi', confidence: 0.78 },
        { name: 'Tharparkar', confidence: 0.72 },
        { name: 'Kankrej', confidence: 0.68 }
    ];
    
    // Shuffle and take top 3
    const shuffled = breeds.sort(() => 0.5 - Math.random());
    const top3 = shuffled.slice(0, 3).sort((a, b) => b.confidence - a.confidence);
    
    return {
        predicted_breed: top3[0].name,
        confidence: Math.round(top3[0].confidence * 100),
        top_predictions: top3.map((breed, index) => ({
            breed: breed.name,
            confidence: Math.round(breed.confidence * 100),
            rank: index + 1
        }))
    };
}

function displayResults(result) {
    const resultsContainer = document.getElementById('results');
    const predictedBreed = document.getElementById('predicted-breed');
    const confidence = document.getElementById('confidence');
    const topPredictions = document.getElementById('top-predictions');
    
    if (!resultsContainer || !predictedBreed || !confidence || !topPredictions) {
        return;
    }
    
    // Display primary result
    predictedBreed.textContent = result.predicted_breed || result.breed || 'Unknown';
    confidence.textContent = `${result.confidence || 0}% confidence`;
    
    // Display top 3 predictions
    topPredictions.innerHTML = '';
    
    if (result.top_predictions && result.top_predictions.length > 0) {
        result.top_predictions.forEach((prediction, index) => {
            const predictionElement = createPredictionElement(prediction, index + 1);
            topPredictions.appendChild(predictionElement);
        });
    } else {
        // Fallback if top_predictions is not available
        const prediction = {
            breed: result.predicted_breed || result.breed || 'Unknown',
            confidence: result.confidence || 0
        };
        const predictionElement = createPredictionElement(prediction, 1);
        topPredictions.appendChild(predictionElement);
    }
    
    // Show results with animation
    resultsContainer.classList.remove('hidden');
    resultsContainer.classList.add('fade-in');
}

function createPredictionElement(prediction, rank) {
    const div = document.createElement('div');
    div.className = 'result-item bg-gray-50 border border-gray-200 rounded-lg p-4';
    
    const confidenceColor = prediction.confidence >= 80 ? 'text-green-600' : 
                           prediction.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';
    
    div.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <span class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    ${rank}
                </span>
                <span class="font-semibold text-gray-800">${prediction.breed}</span>
            </div>
            <span class="font-medium ${confidenceColor}">
                ${prediction.confidence}%
            </span>
        </div>
    `;
    
    return div;
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

function showResults() {
    const results = document.getElementById('results');
    if (results) {
        results.classList.remove('hidden');
    }
}

function hideResults() {
    const results = document.getElementById('results');
    if (results) {
        results.classList.add('hidden');
    }
}

function showError(message) {
    const errorContainer = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorContainer && errorText) {
        errorText.textContent = message;
        errorContainer.classList.remove('hidden');
        errorContainer.classList.add('fade-in');
    }
}

function hideError() {
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
        errorContainer.classList.add('hidden');
    }
}

// ============================================================================
// FAQ ACCORDION FUNCTIONALITY
// ============================================================================

function toggleFAQ(faqId) {
    const content = document.getElementById(`${faqId}-content`);
    const icon = document.getElementById(`${faqId}-icon`);
    
    if (!content || !icon) return;
    
    const isHidden = content.classList.contains('hidden');
    
    // Close all other FAQ items
    const allContents = document.querySelectorAll('[id$="-content"]');
    const allIcons = document.querySelectorAll('[id$="-icon"]');
    
    allContents.forEach(item => {
        if (item.id !== `${faqId}-content`) {
            item.classList.add('hidden');
        }
    });
    
    allIcons.forEach(item => {
        if (item.id !== `${faqId}-icon`) {
            item.classList.remove('rotated');
        }
    });
    
    // Toggle current FAQ item
    if (isHidden) {
        content.classList.remove('hidden');
        icon.classList.add('rotated');
    } else {
        content.classList.add('hidden');
        icon.classList.remove('rotated');
    }
}

// ============================================================================
// CONTACT FORM FUNCTIONALITY
// ============================================================================

function initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', handleContactFormSubmit);
}

function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Validate form
    if (!data.name || !data.email || !data.message) {
        showFormMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!isValidEmail(data.email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Simulate form submission (replace with actual backend integration)
    showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
    
    // Reset form
    event.target.reset();
}

function showFormMessage(message, type) {
    const messageContainer = document.getElementById('form-message');
    const messageText = document.getElementById('form-message-text');
    
    if (!messageContainer || !messageText) return;
    
    messageText.textContent = message;
    messageContainer.className = `p-4 rounded-lg ${type === 'success' ? 'message-success' : 'message-error'}`;
    messageContainer.classList.remove('hidden');
    messageContainer.classList.add('fade-in');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageContainer.classList.add('hidden');
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize drag and drop
    initializeDragAndDrop();
    
    // Initialize contact form
    initializeContactForm();
    
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
    
    // Add loading states to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            if (this.type === 'submit' && !this.disabled) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
            }
        });
    });
    
    // Add fade-in animation to elements on scroll
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
    
    // Observe elements for animation
    document.querySelectorAll('.bg-white, .bg-green-50, .bg-blue-50').forEach(el => {
        observer.observe(el);
    });
    
    console.log('AI-Based Animal Type Classification System initialized');
    console.log('Supporting the Rashtriya Gokul Mission');
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    // You can add error reporting here
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    // You can add error reporting here
});

// ============================================================================
// EXPORT FOR TESTING (if using modules)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleImageUpload,
        classifyImage,
        toggleFAQ,
        generateDemoResult,
        isValidEmail
    };
}
