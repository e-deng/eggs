/**
 * Utility functions for handling image URLs that may be stored as JSON strings
 */

/**
 * Safely parses image URLs from various formats
 * Handles cases where the image_url might be:
 * - An array of strings
 * - A JSON string
 * - A double-encoded JSON string
 * - An array containing a JSON string
 * - A single string
 * @param {any} imageUrl - The image_url value from the database
 * @returns {string[]} Array of image URLs
 */
export function parseImageUrls(imageUrl) {
  if (!imageUrl) {
    return []
  }

  // If it's already an array, check if it contains JSON strings that need parsing
  if (Array.isArray(imageUrl)) {
    // If the array has only one element and it's a JSON string, parse it
    if (imageUrl.length === 1 && typeof imageUrl[0] === 'string' && imageUrl[0].startsWith('[')) {
      try {
        const parsed = JSON.parse(imageUrl[0])
        // If the parsed result is still a string that looks like JSON, parse it again
        if (typeof parsed === 'string' && parsed.startsWith('[')) {
          try {
            const doubleParsed = JSON.parse(parsed)
            return Array.isArray(doubleParsed) ? doubleParsed : [parsed]
          } catch (e) {
            return [imageUrl[0]] // Fallback to original string
          }
        } else {
          return Array.isArray(parsed) ? parsed : [parsed]
        }
      } catch (e) {
        return imageUrl // Return original array
      }
    }
    // If it's a regular array of URLs, return it
    return imageUrl
  }

  // If it's not a string, return empty array
  if (typeof imageUrl !== 'string') {
    console.warn('Unexpected image_url type:', typeof imageUrl, imageUrl)
    return []
  }

  // If it doesn't start with '[', it's a single image URL
  if (!imageUrl.startsWith('[')) {
    return [imageUrl]
  }

  // Try to parse the JSON string
  try {
    let parsed = JSON.parse(imageUrl)
    
    // If the parsed result is still a string that looks like JSON, parse it again
    if (typeof parsed === 'string' && parsed.startsWith('[')) {
      try {
        parsed = JSON.parse(parsed)
      } catch (e) {
        return [imageUrl] // Fallback to original string
      }
    }
    
    // Ensure the result is an array
    if (Array.isArray(parsed)) {
      return parsed
    } else if (typeof parsed === 'string') {
      return [parsed]
    } else {
      return []
    }
  } catch (e) {
    return [imageUrl] // Fallback to original string
  }
}

/**
 * Safely gets the first image URL from various formats
 * @param {any} imageUrl - The image_url value from the database
 * @returns {string|null} First image URL or null if none
 */
export function getFirstImageUrl(imageUrl) {
  const urls = parseImageUrls(imageUrl)
  return urls.length > 0 ? urls[0] : null
}

/**
 * Checks if the image_url contains multiple images
 * @param {any} imageUrl - The image_url value from the database
 * @returns {boolean} True if multiple images, false otherwise
 */
export function hasMultipleImages(imageUrl) {
  const urls = parseImageUrls(imageUrl)
  return urls.length > 1
} 