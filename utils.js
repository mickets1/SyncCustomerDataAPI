import fs from 'fs'
import { logger } from './logger.js'

/**
 * Function to sleep for a specified amount of time in milliseconds.
 *
 * @param {number} ms - The time to sleep in milliseconds.
 * @returns {Promise<void>} A Promise that resolves after the specified time.
 */
function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Create or update a JSON file to store the last synchronization date
const lastSyncDateFile = 'last_sync_date.json'

/**
 * Save the last synchronization date to a JSON file.
 *
 * @param {string} date - The last synchronization date to save.
 */
function saveLastSyncDate (date) {
  fs.writeFileSync(lastSyncDateFile, JSON.stringify({ lastSyncDate: date }))
}

/**
 * Load the last synchronization date from a JSON file.
 *
 * @returns {string|null} The last synchronization date or null if not found.
 */
function loadLastSyncDate () {
  try {
    const data = fs.readFileSync(lastSyncDateFile, 'utf8')
    return JSON.parse(data).lastSyncDate
  } catch (err) {
    return null // If the file doesn't exist or is corrupted, return null
  }
}

/**
 * Calculate the maximum "updatedAt" timestamp from an array of customers.
 *
 * @param {Array<object>} customers - An array of customer objects with an "updatedAt" property.
 * @param {string} lastSyncDate - The last synchronization date to compare against.
 * @returns {string|null} The maximum "updatedAt" timestamp or null if no valid timestamp is found.
 */
function calculateMaxUpdatedAt (customers, lastSyncDate) {
  let maxUpdatedAt = null
  let noNewUpdates = true
  const parsedLastSyncDate = Date.parse(lastSyncDate)

  for (const customer of customers) {
    const updatedAt = customer.updatedAt

    // Check if updatedAt is a valid date and if it's greater than the current maxUpdatedAt
    if (updatedAt && (!maxUpdatedAt || Date.parse(updatedAt) > parsedLastSyncDate)) {
      maxUpdatedAt = updatedAt
      noNewUpdates = false
    }
  }

  if (!noNewUpdates) {
    logger.info('No new updates found greater than lastSyncDate.')
    return maxUpdatedAt
  }

  return maxUpdatedAt
}

export { sleep, saveLastSyncDate, loadLastSyncDate, calculateMaxUpdatedAt }
