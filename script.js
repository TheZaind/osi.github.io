document.addEventListener('DOMContentLoaded', () => {
    const pageElements = document.querySelectorAll('.osi-layer, .osi-exercise'); // Select both info and exercise sections
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentPageIndex = 0;
    const completedExercises = new Set(); // Use a Set for efficient add/check

    // Function to be called from iframe when an exercise is completed
    window.exerciseCompletedSuccessfully = function() {
        console.log(`Exercise on page index ${currentPageIndex} completed successfully.`);
        completedExercises.add(currentPageIndex);
        nextBtn.disabled = false; // Explicitly enable it
    }

    function showPage(index) {
        pageElements.forEach((page, i) => {
            if (i === index) {
                page.classList.add('active-layer');
                page.style.display = 'block';
            } else {
                page.classList.remove('active-layer');
                page.style.display = 'none';
            }
        });
        // Update currentPageIndex *before* calling updateButtonStates
        currentPageIndex = index;
        updateButtonStates();
    }

    function updateButtonStates() {
        prevBtn.disabled = currentPageIndex === 0;

        const currentPageElement = pageElements[currentPageIndex];
        if (currentPageElement.classList.contains('osi-exercise')) {
            if (completedExercises.has(currentPageIndex)) {
                nextBtn.disabled = false; // Already completed
            } else {
                nextBtn.disabled = true; // Not yet completed
            }
        } else {
            // For info pages, 'Next' is enabled unless it's the last page.
            nextBtn.disabled = currentPageIndex === pageElements.length - 1;
        }
        
        // This final check ensures 'Next' is always disabled on the very last page.
        if (currentPageIndex === pageElements.length - 1) {
            nextBtn.disabled = true;
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentPageIndex > 0) {
            showPage(currentPageIndex - 1); // Pass the target index directly
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPageIndex < pageElements.length - 1) {
            // Check if the current page is an exercise and if the next button is somehow enabled without completion (should not happen with current logic)
            // This click should only proceed if nextBtn is not disabled.
            if (!nextBtn.disabled) {
                showPage(currentPageIndex + 1); // Pass the target index directly
            }
        }
    });

    // Initial setup
    if (pageElements.length > 0) {
        showPage(currentPageIndex);
    } else {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }

    console.log("OSI-Modell Lernplattform Skript geladen und initialisiert (mit Übungslogik).");
});