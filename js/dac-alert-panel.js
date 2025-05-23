// js/dac-alert-panel.js
jQuery(document).ready(function($) {
    const adminBarItem = $('.dac-admin-bar-item'); // This is the <a> element
    const panelOverlay = $('#dac-alert-panel-overlay');
    const panelContent = $('#dac-alert-panel-content');
    const closeButton = $('#dac-alert-panel-close');

    const tabButtons = $('.dac-tab-button');
    const tabPanes = $('.dac-tab-pane');
    const adminBarAlertLabel = $('#dac-admin-bar-alert-label'); // This is the <span> element for the text label
    const adminBarAlertIcon = $('#dac-admin-bar-alert-icon');   // This is the <span> element for the icon

    // Declare arrays to store alert data globally within this scope
    let cachedInfoAlerts = [];
    let cachedSuccessAlerts = [];
    let cachedErrorAlerts = [];
    let cachedTotalAlerts = [];

    // Function to update and display the alert counts and messages
    // This function now primarily collects and caches the data, and then populates the panel.
    function updateAlertDisplay() {
        // Clear previous cached data (important if this function were ever called again for dynamic updates)
        cachedInfoAlerts = [];
        cachedSuccessAlerts = [];
        cachedErrorAlerts = [];
        cachedTotalAlerts = [];

        // Select all elements that typically represent admin notices.
        const alertElements = $('.notice, .updated, .error, .success, .info, .notice-info, .notice-success, .notice-error, .notice-warning');

        // Filter out notices that are hidden (e.g., by JavaScript after dismissal).
        const visibleAlerts = alertElements.filter(function() {
            const $this = $(this);
            // Check for display and visibility CSS properties, and ensure element has dimensions.
            return $this.css('display') !== 'none' && $this.css('visibility') !== 'hidden' && $this.outerWidth() > 0 && $this.outerHeight() > 0;
        });

        visibleAlerts.each(function() { // Changed .forEach to .each
            const $this = $(this); // Reference to the original alert element on the dashboard
            // Clone the element deeply to attempt to copy event handlers and data.
            // This is crucial for making the HTML functional in the panel.
            const tempElement = $this.clone(true, true); // Deep clone with events and data
            
            // Remove common dismiss buttons or other interactive elements from the cloned element.
            // This is done on the clone to ensure the original alert on the dashboard is unaffected.
            tempElement.find('.notice-dismiss, .is-dismissible button').remove();
            
            // Get plain text for the total tab
            const alertText = tempElement.text().trim();

            // IMPORTANT: Add a check to skip empty alerts
            if (alertText === '') {
                return; // Skip this alert if its text content is empty after stripping dismiss buttons
            }

            // Add to total alerts list (as plain text for consistency in the total list)
            cachedTotalAlerts.push(alertText);

            // Now, classify for specific tabs
            if ($this.hasClass('notice-error') || $this.hasClass('error') || $this.hasClass('notice-warning')) {
                // For error/warning alerts, push the cloned jQuery object directly
                cachedErrorAlerts.push(tempElement);
            } else if ($this.hasClass('notice-success') || $this.hasClass('success')) {
                // For success alerts, push the cloned jQuery object directly
                cachedSuccessAlerts.push(tempElement);
            } else if ($this.hasClass('notice-info') || $this.hasClass('info') || $this.hasClass('notice') || $this.hasClass('updated')) {
                // For info/generic notices, push the cloned jQuery object directly
                cachedInfoAlerts.push(tempElement);
            }

            // After successfully cloning and processing, hide the original alert on the dashboard.
            $this.hide();
        });

        // Update counts in tab buttons
        $('#dac-info-count').text(cachedInfoAlerts.length);
        $('#dac-success-count').text(cachedSuccessAlerts.length);
        $('#dac-error-count').text(cachedErrorAlerts.length);
        $('#dac-total-count').text(cachedTotalAlerts.length);

        // Update the admin bar menu item text and color for both label and icon
        if (adminBarAlertLabel.length && adminBarAlertIcon.length) {
            if (cachedTotalAlerts.length > 0) {
                adminBarAlertLabel.text(`Alerts (${cachedTotalAlerts.length})`);
                adminBarAlertLabel.removeClass('dac-no-alerts').addClass('dac-has-alerts'); // Apply to label
                adminBarAlertIcon.removeClass('dac-no-alerts').addClass('dac-has-alerts');   // Apply to icon
            } else {
                adminBarAlertLabel.text('No Alerts');
                adminBarAlertLabel.removeClass('dac-has-alerts').addClass('dac-no-alerts'); // Apply to label
                adminBarAlertIcon.removeClass('dac-has-alerts').addClass('dac-no-alerts');   // Apply to icon
            }
        }

        // Function to populate a list or container and show/hide no-alerts message
        // This function now handles appending plain text in <li> or direct jQuery objects
        function populateAlertContent(targetSelector, alertsArray, isDirectElement = false) {
            const $target = $(targetSelector);
            const $noAlertsMessage = $target.next('.no-alerts-message'); // Assumes message is next sibling

            $target.empty(); // Clear previous alerts

            if (alertsArray.length > 0) {
                alertsArray.forEach(content => {
                    if (isDirectElement) {
                        // If it's a direct element (jQuery object), append it directly
                        $target.append(content);
                    } else {
                        // For plain text content, create a div and set its text
                        const listItem = $('<div>'); // Changed from <li> to <div>
                        listItem.text(content);
                        $target.append(listItem);
                    }
                });
                $noAlertsMessage.hide();
                $target.show();
            } else {
                $target.hide();
                $noAlertsMessage.show();
            }
        }

        // Populate each tab's alert content using cached data
        populateAlertContent('#dac-info-alerts-container', cachedInfoAlerts, true);
        populateAlertContent('#dac-success-alerts-container', cachedSuccessAlerts, true);
        populateAlertContent('#dac-error-alerts-container', cachedErrorAlerts, true); // Pass true for direct element appending
        populateAlertContent('#dac-total-alerts-list', cachedTotalAlerts); // Keep this as text for now
    }

    // Call updateAlertDisplay initially on document ready to preload data and hide alerts
    updateAlertDisplay();

    // Explicitly activate the Information tab after initial load
    // This ensures the correct tab is shown and marked active, overriding any default browser behavior
    // or previous states.
    // First, remove active from all to ensure a clean state
    tabButtons.removeClass('active');
    tabPanes.removeClass('active');
    // Then, add active to the desired default tab
    $('[data-tab="info-tab"]').addClass('active');
    $('#info-tab').addClass('active');


    // Tab switching logic
    tabButtons.on('click', function() {
        const $this = $(this);
        const targetTabId = $this.data('tab');

        // Remove active class from all buttons and panes
        tabButtons.removeClass('active');
        tabPanes.removeClass('active');

        // Add active class to the clicked button and corresponding pane
        $this.addClass('active');
        $('#' + targetTabId).addClass('active');
    });

    // Open the panel when the admin bar item is clicked
    adminBarItem.on('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        panelOverlay.addClass('is-open'); // Add class to show overlay and slide in panel
        // Removed call to updateAlertDisplay() here, as data is preloaded once.
    });

    // Close the panel when the close button is clicked
    closeButton.on('click', function() {
            panelOverlay.removeClass('is-open'); // Remove class to hide overlay and slide out panel
    });

    // Close the panel when clicking outside the content
    panelOverlay.on('click', function(e) {
        if ($(e.target).is(panelOverlay)) {
            panelOverlay.removeClass('is-open');
        }
    });

    // Close the panel with the Escape key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && panelOverlay.hasClass('is-open')) {
            panelOverlay.removeClass('is-open');
        }
    });
});
