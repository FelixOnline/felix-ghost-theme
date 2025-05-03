import PhotoSwipe from 'photoswipe';

/**
 * Initialises PhotoSwipe for images matching the trigger selector,
 * grouping adjacent Ghost image and gallery cards.
 * @param {string} trigger - CSS selector for clickable images.
 */
export function lightbox(trigger) {
    const triggers = document.querySelectorAll(trigger);
    if (!triggers.length) {
        return; // No images match the selector
    }

    const onImageClick = async (event) => {
        event.preventDefault();
        const clickedImageElement = event.target;
        const clickedCard = clickedImageElement.closest('.kg-card');

        if (!clickedCard) {
            console.error(
                'PhotoSwipe: Could not find parent ".kg-card" for clicked image.',
                clickedImageElement
            );
            return;
        }

        const items = [];
        const imageElements = []; // Keep track of elements for index finding

        // Helper to collect image data from a card
        const collectImages = (card) => {
            card.querySelectorAll('img[src][width][height]').forEach((img) => {
                const width = parseInt(img.getAttribute('width'), 10);
                const height = parseInt(img.getAttribute('height'), 10);
                const src = img.getAttribute('src');

                // Only add if we have valid dimensions and src
                if (
                    src &&
                    !isNaN(width) &&
                    width > 0 &&
                    !isNaN(height) &&
                    height > 0
                ) {
                    items.push({
                        src: src,
                        width: width,
                        height: height,
                        element: img, // Store element for getThumbBoundsFn
                    });
                    imageElements.push(img);
                } else {
                    console.warn(
                        'PhotoSwipe: Skipping image due to missing or invalid src/width/height attributes.',
                        img
                    );
                }
            });
        };

        // Collect images from preceding adjacent cards (in reverse order)
        let prevCard = clickedCard.previousElementSibling;
        while (
            prevCard &&
            (prevCard.classList.contains('kg-image-card') ||
                prevCard.classList.contains('kg-gallery-card'))
        ) {
            collectImages(prevCard); // Add to main 'items' list
            prevCard = prevCard.previousElementSibling;
        }

        // Collect images from the clicked card itself
        collectImages(clickedCard);

        // Collect images from succeeding adjacent cards
        let nextCard = clickedCard.nextElementSibling;
        while (
            nextCard &&
            (nextCard.classList.contains('kg-image-card') ||
                nextCard.classList.contains('kg-gallery-card'))
        ) {
            collectImages(nextCard);
            nextCard = nextCard.nextElementSibling;
        }

        // Find the index of the genuinely clicked image element
        const clickedImageIndex = imageElements.findIndex(
            (el) => el === clickedImageElement
        );

        if (clickedImageIndex === -1 || items.length === 0) {
            console.error(
                'PhotoSwipe: Clicked image not found in collected items or no valid items found.'
            );
            return;
        }

        const pswp = new PhotoSwipe({
            dataSource: items,
            index: clickedImageIndex,
            bgOpacity: 0.9,
            zoom: false, // Hide zoom button
        });

        pswp.init();
    };

    // Add click listener to each trigger image
    triggers.forEach((triggerElement) => {
        triggerElement.addEventListener('click', onImageClick);
    });
}
