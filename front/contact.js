// Step 1: Check if the script is running at all.
console.log("contact.js script loaded and running!");

document.addEventListener('DOMContentLoaded', function() {
    // Step 2: Check if the DOMContentLoaded event fired.
    console.log("DOMContentLoaded event fired.");

    const form = document.getElementById('contact-form');
    const messageEl = document.getElementById('form-message');
    // Find the submit button within the form
    const submitButton = form.querySelector('button[type="submit"]');

    // Step 3: Check if the form and button elements were found.
    if (form && submitButton) {
        console.log("Form element found:", form);
        console.log("Submit button found:", submitButton);
    } else {
        console.error("CRITICAL: Form or Submit Button was NOT found!");
        return; 
    }

    // --- NEW DEBUGGING STEP ---
    // Add a direct click listener to the button to see if it registers a click.
    submitButton.addEventListener('click', function() {
        console.log("SUCCESS! The submit button click was detected.");
    });
    // --- END NEW DEBUGGING STEP ---


    form.addEventListener('submit', async function(event) {
        // Step 4: Check if the submit event is being captured.
        console.log("Submit button clicked, form submission captured!");

        event.preventDefault(); // Prevent the default form submission

        const formData = {
            name: form.name.value,
            phone: form.phone.value,
            email: form.email.value,
            submittedAt: new Date().toISOString()
        };

        console.log("Form data collected:", formData);

        const backendUrl = '/api/submit-form';

        try {
            console.log("Attempting to send data to backend...");
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            console.log("Received response from backend.");


            const result = await response.json();

            if (response.ok) {
                messageEl.textContent = 'Thank you! Your message has been sent.';
                messageEl.style.color = '#7CFC00'; // Green
                form.reset();
            } else {
                throw new Error(result.message || 'Something went wrong.');
            }
        } catch (error) {
            console.error("An error occurred during fetch:", error);
            messageEl.textContent = `Error: ${error.message}`;
            messageEl.style.color = '#FF6347'; // Red
        }
        
        messageEl.style.display = 'block';
    });
});
