<?php
/**
 * Plugin Name: Dashboard Alert Panel
 * Plugin URI:  https://github.com/sflwa/dashboard-alert-panel/
 * Description: Moved WordPress Admin Alerts & Notices to a Sidebar Panel
 * Version:     1.0
 * Author:      South Florida Web Advisors
 * Author URI:  https://sflwa.net
 * License: GPLv2 or later
 * Requires at least: 6.7
 * Tested up to: 6.8
 * Stable tag: 1.0
 * Text Domain: dashboard-alert-panel
 */

// Exit if accessed directly to prevent unauthorized access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Adds a custom menu item to the WordPress admin bar.
 */
function dac_add_admin_bar_menu() {
    global $wp_admin_bar;

    // Only add the menu item if the user is logged in and in the admin area.
    if ( ! is_admin() || ! is_user_logged_in() ) {
        return;
    }

    $wp_admin_bar->add_menu( array(
        'id'    => 'dac-alert-panel',
        // Updated title to include a span with a default 'dac-no-alerts' class
        'title' => '<span class="ab-icon dashicons-before dashicons-warning" id="dac-admin-bar-alert-icon"></span><span class="ab-label dac-no-alerts" id="dac-admin-bar-alert-label">No Alerts</span>',
        'href'  => '#', // This will be handled by JavaScript to open the panel.
        'meta'  => array(
            'title' => __( 'View Dashboard Alerts', 'dashboard-alert-panel' ),
            'class' => 'dac-admin-bar-item', // Custom class for JS targeting.
        ),
    ) );
}
add_action( 'admin_bar_menu', 'dac_add_admin_bar_menu', 999 ); // Add at a lower priority to appear towards the end.

/**
 * Enqueues the necessary scripts and styles for the alert panel.
 */
function dac_enqueue_admin_scripts() {
    // Only enqueue in the admin area.
    if ( ! is_admin() ) {
        return;
    }

    // Enqueue our custom JavaScript.
    wp_enqueue_script(
        'dac-alert-panel-script',
        plugins_url( 'js/dac-alert-panel.js', __FILE__ ), // We'll create this file.
        array( 'jquery' ), // jQuery is a dependency for simplicity here.
        '1.0',
        true // Load in the footer.
    );

    // Enqueue our custom CSS.
    wp_enqueue_style(
        'dac-alert-panel-style',
        plugins_url( 'css/dac-alert-panel.css', __FILE__ ), // We'll create this file.
        array(),
        '1.0'
    );
}
add_action( 'admin_enqueue_scripts', 'dac_enqueue_admin_scripts' );

/**
 * Outputs the HTML structure for the hidden alert panel (slide-out).
 */
function dac_alert_panel_html() {
    // Only output in the admin area.
    if ( ! is_admin() ) {
        return;
    }
    ?>
    <div id="dac-alert-panel-overlay">
        <div id="dac-alert-panel-content">
            <button id="dac-alert-panel-close" class="dashicons-before dashicons-no-alt" title="<?php esc_attr_e( 'Close', 'dashboard-alert-panel' ); ?>"></button>
            <h3 class="panel-title"><?php esc_html_e( 'Dashboard Alerts Summary', 'dashboard-alert-panel' ); ?></h3>

            <div class="dac-tabs">
                <div class="dac-tab-buttons">
                    <button class="dac-tab-button active" data-tab="total-tab"><?php esc_html_e( 'Total', 'dashboard-alert-panel' ); ?> (<span id="dac-total-count">0</span>)</button>
                    <button class="dac-tab-button" data-tab="info-tab"><?php esc_html_e( 'Information', 'dashboard-alert-panel' ); ?> (<span id="dac-info-count">0</span>)</button>
                    <button class="dac-tab-button" data-tab="success-tab"><?php esc_html_e( 'Success', 'dashboard-alert-panel' ); ?> (<span id="dac-success-count">0</span>)</button>
                    <button class="dac-tab-button" data-tab="error-tab"><?php esc_html_e( 'Alerts/Errors', 'dashboard-alert-panel' ); ?> (<span id="dac-error-count">0</span>)</button>
                </div>
                <div class="dac-tab-content">
                    <div id="total-tab" class="dac-tab-pane active">
                        <h4><?php esc_html_e( 'All Active Alerts', 'dashboard-alert-panel' ); ?></h4>
                        <div id="dac-total-alerts-list"></div>
                        <p class="no-alerts-message" style="display:none;"><?php esc_html_e( 'No active alerts found.', 'dashboard-alert-panel' ); ?></p>
                    </div>
                    <div id="info-tab" class="dac-tab-pane">
                        <h4><?php esc_html_e( 'Information Alerts', 'dashboard-alert-panel' ); ?></h4>
                        <div id="dac-info-alerts-container"></div>
                        <p class="no-alerts-message" style="display:none;"><?php esc_html_e( 'No information alerts found.', 'dashboard-alert-panel' ); ?></p>
                    </div>
                    <div id="success-tab" class="dac-tab-pane">
                        <h4><?php esc_html_e( 'Success Alerts', 'dashboard-alert-panel' ); ?></h4>
                        <div id="dac-success-alerts-container"></div>
                        <p class="no-alerts-message" style="display:none;"><?php esc_html_e( 'No success alerts found.', 'dashboard-alert-panel' ); ?></p>
                    </div>
                    <div id="error-tab" class="dac-tab-pane">
                        <h4><?php esc_html_e( 'Alerts and Errors', 'dashboard-alert-panel' ); ?></h4>
                        <div id="dac-error-alerts-container"></div>
                        <p class="no-alerts-message" style="display:none;"><?php esc_html_e( 'No alerts or errors found.', 'dashboard-alert-panel' ); ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}
add_action( 'admin_footer', 'dac_alert_panel_html' ); // Add to the admin footer.
