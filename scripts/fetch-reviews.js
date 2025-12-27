const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;
const OUTPUT_FILE = path.join(__dirname, '../data/reviews.json');

if (!API_KEY || !PLACE_ID) {
    console.error('Error: GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID environment variables are required.');
    process.exit(1);
}

// Google Places API URL
// We strictly request the 'reviews' field to minimize data usage and latency
const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonResponse = JSON.parse(data);

            if (jsonResponse.status !== 'OK') {
                console.error(`API Error: ${jsonResponse.status}`, jsonResponse.error_message || '');
                process.exit(1);
            }

            const reviews = jsonResponse.result.reviews || [];

            // Transform data to match our frontend needs
            // We keep it simple to save space in the JSON file
            const formattedReviews = reviews.map(review => ({
                author_name: review.author_name,
                rating: review.rating,
                text: review.text,
                profile_photo_url: review.profile_photo_url,
                relative_time_description: review.relative_time_description
            }));

            // Write to file
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(formattedReviews, null, 4));
            console.log(`Successfully fetched ${formattedReviews.length} reviews and saved to ${OUTPUT_FILE}`);

        } catch (error) {
            console.error('Error parsing JSON:', error.message);
            process.exit(1);
        }
    });

}).on('error', (err) => {
    console.error('Network Error:', err.message);
    process.exit(1);
});
