/* 
   SENTINEL DYNAMIC INTERACTIONS for SOFTR 
   Add this to Settings -> Custom Code -> Footer 
*/

document.addEventListener("DOMContentLoaded", function() {
    
    // Function to enhance Payment Records with Failure Analysis
    const enhancePaymentCards = () => {
        // Find all cards that might contain payment info
        const cards = document.querySelectorAll('.sw-background-color-white');
        
        cards.forEach(card => {
            const cardText = card.innerText || "";
            
            // 1. Detect Failed Status
            if (cardText.includes("Failed")) {
                // Apply a reddish tint to indicate failure
                card.style.borderLeft = "4px solid #ef4444";
                
                // Check if we already injected the alert to avoid duplication
                if (card.querySelector('.failure-alert')) return;

                // 2. Fetch Failure Reason & Resolution Steps from the card's hidden fields or data attributes
                // (Note: In Softr, users can hide fields but they remain in the DOM)
                // We'll assume field labels like 'Failure Reason:' or similar
                const reasonMatch = cardText.match(/Failure Reason:\s*(.*)/i);
                const stepsMatch = cardText.match(/Resolution Steps:\s*(.*)/i);
                const txRefMatch = cardText.match(/TX Ref:\s*(.*)/i);
                
                const reason = reasonMatch ? reasonMatch[1] : "Declined by processor";
                const steps = stepsMatch ? stepsMatch[1] : "Please try another card or contact your bank.";
                const txRef = txRefMatch ? txRefMatch[1] : "";

                // 3. Inject Fintech Alert Box
                const alertHtml = `
                    <div class="failure-alert">
                        <div class="failure-alert-icon">!</div>
                        <div class="failure-alert-content">
                            <h4>Payment Issue Detected</h4>
                            <p><strong>Reason:</strong> ${reason}</p>
                            <p><strong>Recommendation:</strong> ${steps}</p>
                            <a href="https://sentinelengine.softr.app/repay?tx_ref=${txRef}" class="retry-button">
                                Retry Payment Now
                            </a>
                        </div>
                    </div>
                `;
                
                // Append before the end of the card
                card.insertAdjacentHTML('beforeend', alertHtml);
            }
            
            // 2. Detect Successful Status
            if (cardText.includes("সফল")) {
                card.style.borderLeft = "4px solid #10b981";
                // Add a checkmark maybe?
            }
        });
    };

    // Run on load and whenever Softr changes pages (SPA behavior)
    window.addEventListener('popstate', () => setTimeout(enhancePaymentCards, 500));
    
    // Initial Run
    setTimeout(enhancePaymentCards, 1000);

    // Watch for dynamic updates (Softr Lists often lazy load)
    const observer = new MutationObserver((mutations) => {
        enhancePaymentCards();
    });

    const targetNode = document.getElementById('content-area') || document.body;
    observer.observe(targetNode, { childList: true, subtree: true });
});
