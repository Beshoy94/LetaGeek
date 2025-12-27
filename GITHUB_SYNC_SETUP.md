# Google Reviews Automated Sync Setup

Once you have pushed this project to a GitHub repository, follow these steps to enable the automatic daily sync of your Google reviews.

## 1. Get your Google API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named "LetaGeek Reviews".
3. Search for **"Places API"** and click **Enable**.
4. Go to **Credentials** -> **Create Credentials** -> **API Key**.
5. Copy this key. (You should restrict it to only the Places API for security).

## 2. Get your Google Place ID
1. Use the [Google Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder).
2. Search for "LetaGeek" and copy the ID (it looks like `ChIJ...`).

## 3. Configure GitHub Secrets
1. In your GitHub Repository, go to **Settings** -> **Secrets and variables** -> **Actions**.
2. Add a **New repository secret**:
   - Name: `GOOGLE_PLACES_API_KEY`
   - Value: (Paste your API key here)
3. Add another **New repository secret**:
   - Name: `GOOGLE_PLACE_ID`
   - Value: (Paste your Place ID here)

## 4. Enable GitHub Action
I have prepared the structure. When you are ready, I can help you create the `.github/workflows/sync-reviews.yml` file which will contain the automated script.

The script will:
- Run every 24 hours.
- Fetch the latest 5 reviews from Google.
- Update `data/reviews.json` in your repository.
- Re-deploy your GitHub Pages site automatically.
