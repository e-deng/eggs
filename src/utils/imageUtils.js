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
 * - A URL-encoded JSON string
 * - A single string
 * @param {any} imageUrl - The image_url value from the database
 * @returns {string[]} Array of image URLs
 */
export function parseImageUrls(imageUrl) {
  if (!imageUrl) {
    return []
  }

  // Helper function to validate if a string is a valid URL
  const isValidUrl = (str) => {
    try {
      const url = new URL(str)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  // If it's already an array, check if it contains JSON strings that need parsing
  if (Array.isArray(imageUrl)) {
    // Process each element in the array
    const processedUrls = []
    for (const item of imageUrl) {
      if (typeof item === 'string') {
        if (item.startsWith('[')) {
          // This is a JSON string that needs parsing
          try {
            const parsed = JSON.parse(item)
            if (Array.isArray(parsed)) {
              // Filter out any malformed URLs and only keep valid ones
              const validUrls = parsed.filter(url => 
                typeof url === 'string' && 
                (url.startsWith('http://') || url.startsWith('https://'))
              )
              processedUrls.push(...validUrls)
            } else if (typeof parsed === 'string' && 
                      (parsed.startsWith('http://') || parsed.startsWith('https://'))) {
              processedUrls.push(parsed)
            }
          } catch (e) {
            console.error('Failed to parse JSON string:', e)
            // Don't add malformed items
          }
        } else if (item.startsWith('http://') || item.startsWith('https://')) {
          // This is a regular valid URL
          processedUrls.push(item)
        }
        // Skip malformed strings that don't start with http/https
      } else if (typeof item === 'string' && 
                (item.startsWith('http://') || item.startsWith('https://'))) {
        processedUrls.push(item)
      }
    }
    return validateAndFilterUrls(processedUrls)
  }

  // If it's a string, check if it's a URL-encoded JSON array
  if (typeof imageUrl === 'string') {
    // Check if it's a URL-encoded JSON array (starts with [%22)
    if (imageUrl.startsWith('[%22') || imageUrl.startsWith('["')) {
      try {
        // First decode the URL encoding
        const decoded = decodeURIComponent(imageUrl)
        
        // Then parse the JSON
        const parsed = JSON.parse(decoded)
        if (Array.isArray(parsed)) {
          return validateAndFilterUrls(parsed)
        } else {
          return validateAndFilterUrls([parsed])
        }
      } catch (e) {
        console.error('Failed to parse URL-encoded JSON:', e)
        return [imageUrl]
      }
    }
    
    // If it doesn't start with '[', check if it's a valid URL
    if (!imageUrl.startsWith('[')) {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return validateAndFilterUrls([imageUrl])
      } else {
        // Invalid URL format
        return []
      }
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
      
      // Ensure the result is an array and filter out invalid URLs
      if (Array.isArray(parsed)) {
        return validateAndFilterUrls(parsed)
      } else if (typeof parsed === 'string' && 
                (parsed.startsWith('http://') || parsed.startsWith('https://'))) {
        return validateAndFilterUrls([parsed])
      } else {
        return []
      }
    } catch (e) {
      return [imageUrl] // Fallback to original string
    }
  }

  // If it's not a string, return empty array
  if (typeof imageUrl !== 'string') {
    console.warn('Unexpected image_url type:', typeof imageUrl, imageUrl)
    return []
  }

  // Fallback: return empty array
  return []
}

// Final validation function to ensure all URLs are valid
function validateAndFilterUrls(urls) {
  if (!Array.isArray(urls)) return []
  
  return urls.filter(url => {
    if (typeof url !== 'string') return false
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false
    
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  })
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