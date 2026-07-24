// Keyed by the slideshow element itself; a plain object would coerce every
// element to the same "[object HTMLDivElement]" key and share one index.
const currentSlides = new Map();

function toggleExpand(card) {
    const wasExpanded = card.classList.contains('expanded');

    // Close all other cards
    document.querySelectorAll('.project-card').forEach(collapseCard);

    // Open this card if it wasn't already open
    if (!wasExpanded) {
        expandCard(card);
    }
}

function collapseCard(card) {
    card.classList.remove('expanded');

    const hint = card.querySelector('.expand-hint');
    if (hint) hint.textContent = 'Click to expand for more details';

    const trigger = card.querySelector('.project-content');
    if (trigger && trigger.hasAttribute('aria-expanded')) {
        trigger.setAttribute('aria-expanded', 'false');
    }

    const content = card.querySelector('.extended-content');
    if (!content) return;

    // An open card sits at max-height:none so it can never clip. Animating back
    // to 0 needs a concrete starting height, so pin it and force a reflow first.
    if (content.style.maxHeight === 'none') {
        content.style.maxHeight = content.scrollHeight + 'px';
        void content.offsetHeight;
    }
    content.style.maxHeight = '0px';
}

function expandCard(card) {
    card.classList.add('expanded');
    initSlideshow(card);

    const hint = card.querySelector('.expand-hint');
    if (hint) hint.textContent = 'Click again to minimize this tab';

    const trigger = card.querySelector('.project-content');
    if (trigger && trigger.hasAttribute('aria-expanded')) {
        trigger.setAttribute('aria-expanded', 'true');
    }

    const content = card.querySelector('.extended-content');
    if (!content) return;

    // Animate to the measured height rather than a fixed cap, then release the
    // cap entirely so tall or late-loading content is never cut off.
    content.style.maxHeight = content.scrollHeight + 'px';
    content.addEventListener('transitionend', function release(e) {
        if (e.propertyName !== 'max-height') return;
        content.removeEventListener('transitionend', release);
        if (card.classList.contains('expanded')) {
            content.style.maxHeight = 'none';
        }
    });
}

function initSlideshow(card) {
    const slideshow = card.querySelector('.slideshow');
    if (!slideshow || currentSlides.has(slideshow)) return;

    currentSlides.set(slideshow, 0);
    const indicators = card.querySelector('.slide-indicators');
    const slides = slideshow.querySelectorAll('.slide');

    // Create indicator dots
    indicators.innerHTML = '';
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'indicator' + (index === 0 ? ' active' : '');
        indicator.onclick = () => goToSlide(slideshow, index);
        indicators.appendChild(indicator);
    });
}

function changeSlide(btn, direction) {
    const slideshow = btn.parentElement;
    const slides = slideshow.querySelectorAll('.slide');
    const indicators = slideshow.parentElement.querySelectorAll('.indicator');

    let index = (currentSlides.get(slideshow) || 0) + direction;

    // Wrap around
    if (index >= slides.length) {
        index = 0;
    } else if (index < 0) {
        index = slides.length - 1;
    }

    currentSlides.set(slideshow, index);
    updateSlideshow(slideshow, slides, indicators);
}

function goToSlide(slideshow, index) {
    const slides = slideshow.querySelectorAll('.slide');
    const indicators = slideshow.parentElement.querySelectorAll('.indicator');

    currentSlides.set(slideshow, index);
    updateSlideshow(slideshow, slides, indicators);
}

function updateSlideshow(slideshow, slides, indicators) {
    const current = currentSlides.get(slideshow);

    // Update slide visibility
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === current);
    });

    // Update indicator dots
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === current);
    });
}

// Make each expandable card reachable and operable by keyboard. Applied here
// rather than in the markup so cards with nothing to expand are not announced
// as buttons.
function initCardControls() {
    document.querySelectorAll('.project-card').forEach(card => {
        const trigger = card.querySelector('.project-content');
        if (!trigger || !card.querySelector('.extended-content')) return;

        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-expanded', 'false');

        trigger.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault(); // stop Space from scrolling the page
                toggleExpand(card);
            }
        });
    });
}

initCardControls();