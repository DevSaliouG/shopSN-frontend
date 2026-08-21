/**
 * UI Constants
 * Centralized magic numbers for UI behaviors
 */

/**
 * Debounce time for search input (ms)
 * Balances responsiveness vs API call frequency
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Maximum number of recent searches to store
 */
export const MAX_RECENT_SEARCHES = 10;

/**
 * Scroll threshold to show sticky bar (pixels)
 */
export const STICKY_BAR_SCROLL_THRESHOLD = 300;

/**
 * Default number of suggestions per category
 */
export const DEFAULT_SUGGESTIONS_LIMIT = 5;

/**
 * Category suggestions limit
 */
export const CATEGORY_SUGGESTIONS_LIMIT = 3;

/**
 * Animation durations (ms)
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 200,
  MEDIUM: 300,
  SLOW: 400
} as const;

/**
 * Toast display durations (ms)
 */
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 3000,
  WARNING: 4000
} as const;

/**
 * Blur delay for dropdowns (ms)
 * Allows click on dropdown items before close
 */
export const DROPDOWN_BLUR_DELAY = 200;

/**
 * Touch target minimum size (pixels)
 * Following WCAG 2.1 AA guidelines
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Swiper initialization delay (ms)
 * Ensures DOM is ready
 */
export const SWIPER_INIT_DELAY = 100;

/**
 * Zoom configuration
 */
export const ZOOM = {
  MAX_RATIO: 3,
  MIN_RATIO: 1,
  SCALE_HOVER: 1.8
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 12,
  MOBILE_PER_PAGE: 6
} as const;
