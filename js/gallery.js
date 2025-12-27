/**
 * LetaGeek Projects Gallery & Lightbox Logic
 */

const carouselTrack = document.querySelector('.carousel-track');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

// --- CAROUSEL SCROLLING ---
if (carouselTrack) {
    const scrollAmount = 350; // Card width + gap

    nextBtn.addEventListener('click', () => {
        carouselTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        carouselTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // Optional: Auto-scroll
    let autoScroll = setInterval(() => {
        if (carouselTrack.scrollLeft + carouselTrack.clientWidth >= carouselTrack.scrollWidth) {
            carouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            carouselTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }, 5000);

    // Stop auto-scroll on user interaction
    carouselTrack.addEventListener('mousedown', () => clearInterval(autoScroll));
    carouselTrack.addEventListener('touchstart', () => clearInterval(autoScroll));
}

// --- LIGHTBOX LOGIC ---
function openLightbox(card) {
    const img = card.querySelector('img');

    lightboxImg.src = img.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});
