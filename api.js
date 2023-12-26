import axios from 'axios'
import { logger } from './logger.js'

/**
 * Function to fetch all customers from API1 through pagination, using the lastSyncDate as a filter.
 *
 * @param {string|null} lastSyncDate - The last synchronization date to filter by.
 * @returns {Promise<Array>} An array of customer objects.
 * @throws {Error} Throws an error if fetching customers fails.
 */
async function fetchAllAPI1Customers (lastSyncDate) {
  try {
    const customers = []
    let offset = 0
    let hasNextPage = true

    while (hasNextPage) {
      const response = await axios.get(process.env.CUSTOMER_API_ENDPOINT, {
        headers: {
          Authorization: process.env.CUSTOMER_API_KEY
        },
        params: {
          offset,
          updatedAt: lastSyncDate
        }
      })

      customers.push(...response.data)

      if (response.data.length < 10) {
        hasNextPage = false
      } else {
        offset += 10
      }
    }

    logger.info(`Fetched ${customers.length} customers from API1`)
    return customers
  } catch (error) {
    throw new Error(`Failed to fetch customers from API1: ${error.message}`)
  }
}

export { fetchAllAPI1Customers }
