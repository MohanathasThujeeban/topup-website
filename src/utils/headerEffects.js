// Cursor Trail Effect - Disabled for better usability
export const initializeCursorTrail = () => {
  // Cursor trail has been disabled to improve pointer accuracy and user experience
  // Return empty cleanup function
  return () => {};
};

// Header Interactive Effects
export const initializeHeaderEffects = () => {
  // Add interactive hover effects to navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-2px)';
      link.style.textShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateY(0)';
      link.style.textShadow = 'none';
    });
  });

  // Add magnetic effect to buttons
  const magneticButtons = document.querySelectorAll('.btn-animated');
  
  magneticButtons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0) scale(1)';
    });
  });

  // Add ripple effect to clickable elements
  const addRippleEffect = (element) => {
    element.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        top: ${y}px;
        left: ${x}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  };

  // Apply ripple effect to buttons and links
  document.querySelectorAll('button, .btn-animated, .cart-icon').forEach(addRippleEffect);
};

// Smooth scroll progress indicator
export const initializeScrollProgress = () => {
  const progressBar = document.querySelector('.scroll-indicator');
  
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      progressBar.style.width = `${Math.min(progress, 100)}%`;
      progressBar.style.opacity = scrollTop > 100 ? '1' : '0';
    };
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
    
    return () => window.removeEventListener('scroll', updateProgress);
  }
};