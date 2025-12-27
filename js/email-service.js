/**
 * LetaGeek Email Service
 * Handles Cloudinary uploads and Formspree submissions.
 */

const EmailService = {
    settings: {
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbzpCHAGf12UE61vvLhEmUPO1iKvM8q7Vh2euN3RoNYzzg9vLpvH8O1voku89lAmgJDT/exec',
        cloudinaryCloudName: 'dqszkzl3j',
        cloudinaryPreset: 'znjskcmw'
    },

    /**
     * Show UI Feedback Modal
     * @param {Object} status {title, message}
     * @param {String} type 'success' or 'error'
     */
    showFeedback: (status, type = 'success') => {
        let overlay = document.querySelector('.submission-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'submission-overlay';
            overlay.innerHTML = `
                <div class="success-card">
                    <div class="success-icon">
                        <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
                    </div>
                    <h3>${status.title}</h3>
                    <p>${status.message}</p>
                    <button class="btn btn-primary" onclick="this.closest('.submission-overlay').classList.remove('active')">Got it!</button>
                </div>
            `;
            document.body.appendChild(overlay);
            document.body.appendChild(overlay);
        } else {
            const icon = overlay.querySelector('.success-icon i');
            const title = overlay.querySelector('h3');
            const msg = overlay.querySelector('p');
            // Update content
            icon.className = `fas ${type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'}`;
            title.textContent = status.title;
            msg.innerHTML = status.message;
        }

        // Re-attach button handler to include new onClose if provided
        const btn = overlay.querySelector('button');
        btn.onclick = () => {
            overlay.classList.remove('active');
            if (status.onClose) status.onClose();
        };

        // Force reflow
        void overlay.offsetWidth;
        overlay.classList.add('active');
    },

    /**
     * Upload files to Cloudinary
     * @param {FileList} files 
     * @param {Function} onProgress (optional)
     * @returns {Promise<Array>} Array of secure_urls
     */
    uploadFiles: async (files, onProgress) => {
        let photoUrls = [];
        for (let i = 0; i < files.length; i++) {
            if (onProgress) onProgress(i + 1, files.length);

            const formData = new FormData();
            formData.append('file', files[i]);
            formData.append('upload_preset', EmailService.settings.cloudinaryPreset);

            try {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${EmailService.settings.cloudinaryCloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                if (data.secure_url) {
                    photoUrls.push(data.secure_url);
                } else {
                    throw new Error('No secure_url in response');
                }
            } catch (error) {
                console.error('Cloudinary upload failed:', error);
                // Continue with other files but warn
            }
        }
        return photoUrls;
    },

    /**
     * Submit Form to Formspree
     * @param {HTMLFormElement} form 
     * @param {Object} options { photoInputId, onLoading, onSuccess, onError }
     */
    submitForm: async (form, options = {}) => {
        const { photoInputId, onLoading } = options;

        // 1. Prepare UI
        if (onLoading) onLoading('Preparing...');

        let photoUrls = [];
        const fileInput = photoInputId ? document.getElementById(photoInputId) : null;

        // 2. Upload Photos
        if (fileInput && fileInput.files.length > 0) {
            photoUrls = await EmailService.uploadFiles(fileInput.files, (current, total) => {
                if (onLoading) onLoading(`Uploading photo ${current}/${total}...`);
            });

            if (photoUrls.length < fileInput.files.length) {
                console.warn(`Only ${photoUrls.length}/${fileInput.files.length} photos uploaded.`);
            }
        }

        // 3. Submit Data to Google Sheets
        if (onLoading) onLoading('Sending Request...');

        // Convert FormData to JSON (Google Script prefers JSON)
        const formData = new FormData(form);
        const rawData = Object.fromEntries(formData.entries());

        // Map fields to script expectations
        const data = {
            name: rawData.name,
            email: rawData.email,
            phone: rawData.phone,
            city: rawData.city,
            message: rawData['additional-info'] || rawData.message || '-',
            // Map hidden fields if they exist, or default
            totalEstimate: rawData['Total Estimate'] || rawData.totalEstimate || '-',
            serviceType: rawData['Quote Breakdown'] || rawData.serviceType || 'General Inquiry',
        };
        if (photoUrls.length > 0) {
            data.photoUrls = photoUrls.join('\n');
        } else {
            data.photoUrls = 'No photos uploaded';
        }

        // Add explicit calculated fields if they exist in the form (like hidden inputs)
        // or ensure they are caught by Object.fromEntries if they have name attributes.

        try {
            // "no-cors" mode is required for Google Scripts to avoid CORS errors in browser,
            // but it means we get an 'opaque' response (status 0). We assume success if no network error thrown.
            await fetch(EmailService.settings.googleScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Since we can't read the response in no-cors, we assume it worked.
            EmailService.showFeedback({
                title: 'Request Sent!',
                message: 'Success! We receive your request and sent you a confirmation email.',
                onClose: options.onModalClose
            });
            form.reset();
            if (options.onSuccess) options.onSuccess();

        } catch (error) {
            console.error('Submission failed:', error);
            EmailService.showFeedback({
                title: 'Submission Error',
                message: 'Ideally, this wouldn\'t happen. Please call us at (909) 257-7499 instead.'
            }, 'error');
            if (options.onError) options.onError(error);
        }
    }
};
