document.addEventListener('DOMContentLoaded', () => {
    const reviewsTrack = document.getElementById('reviews-track');
    const prevBtn = document.getElementById('reviews-prev');
    const nextBtn = document.getElementById('reviews-next');

    if (!reviewsTrack) return;

    // Function to render stars
    function getStarsHTML(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    // Initialize Carousel Logic
    function initCarousel() {
        const scrollAmount = 350 + 30; // Card width (350) + gap (30)

        // Manual Navigation
        nextBtn?.addEventListener('click', () => {
            reviewsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            resetAutoScroll();
        });

        prevBtn?.addEventListener('click', () => {
            reviewsTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            resetAutoScroll();
        });

        // Auto Scroll
        let autoScrollTimer;

        function startAutoScroll() {
            autoScrollTimer = setInterval(() => {
                // If we've reached the end (approx), scroll back to start
                if (reviewsTrack.scrollLeft + reviewsTrack.clientWidth >= reviewsTrack.scrollWidth - 10) {
                    reviewsTrack.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    reviewsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }, 5000); // 5 seconds
        }

        function resetAutoScroll() {
            clearInterval(autoScrollTimer);
            startAutoScroll();
        }

        // Pause on hover/touch
        reviewsTrack.addEventListener('mouseenter', () => clearInterval(autoScrollTimer));
        reviewsTrack.addEventListener('touchstart', () => clearInterval(autoScrollTimer));

        // Resume on leave
        reviewsTrack.addEventListener('mouseleave', () => startAutoScroll());
        reviewsTrack.addEventListener('touchend', () => startAutoScroll());

        // Start initially
        startAutoScroll();
    }

    // Fetch reviews from JSON
    fetch('data/reviews.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Clear loading state
            reviewsTrack.innerHTML = '';

            if (data.length === 0) {
                reviewsTrack.innerHTML = '<div class="loading-reviews">No reviews found yet.</div>';
                return;
            }

            // Create and append review cards
            data.forEach(review => {
                const card = document.createElement('div');
                card.className = 'review-card';

                card.innerHTML = `
                    <div class="review-header">
                        <img src="${review.profile_photo_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + review.author_name}" 
                             alt="${review.author_name}" class="review-avatar">
                        <div class="review-meta">
                            <h4>${review.author_name}</h4>
                            <span>${review.relative_time_description}</span>
                        </div>
                    </div>
                    <div class="review-stars">
                        ${getStarsHTML(review.rating)}
                    </div>
                    <p class="review-text">"${review.text}"</p>
                `;

                reviewsTrack.appendChild(card);
            });

            // Initialize carousel after content is loaded
            initCarousel();
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
            reviewsTrack.innerHTML = '<div class="loading-reviews">Unable to load reviews at this time. Please check back later!</div>';
        });
});
