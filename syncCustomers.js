import { fetchAllAPI1Customers } from './api.js'
import { createCustomer, readCustomer, updateCustomer } from './data.js'
import { saveLastSyncDate, loadLastSyncDate, calculateMaxUpdatedAt } from './utils.js'
import { logger } from './logger.js'

let numItemsUpdated = 0
let numItemsCreated = 0
let numChunks = 0
let numErrors = 0

/**
 * Synchronize customers between two APIs using the last synchronization date.
 *
 * @returns {Promise<void>} A promise that resolves when synchronization is complete.
 */
async function syncCustomers () {
  try {
    const lastSyncDate = loadLastSyncDate()
    const allCustomers = await fetchAllAPI1Customers(lastSyncDate)

    // Chunk the customer data into arrays of 5 items each for parallel processing
    const customerChunks = chunkArray(allCustomers, process.env.MAX_CONCURRENT_REQUESTS)

    // Process each chunk of customers in parallel
    await Promise.all(customerChunks.map(processCustomerChunk))

    const maxUpdatedAt = calculateMaxUpdatedAt(allCustomers, lastSyncDate)
    saveLastSyncDate(maxUpdatedAt)

    logger.info('Synchronization process completed.')

    // Log statistics
    return await statistics()
  } catch (error) {
    logger.error('Sync failed: ' + error.message)
  }
}

/**
 * Logs important statistics about the synchronization process.
 */
async function statistics () {
  logger.info(`Number of Items Updated: ${numItemsUpdated}`)
  logger.info(`Number of Items Created: ${numItemsCreated}`)
  logger.info(`Number of Chunks Processed: ${numChunks}`)
  logger.info(`Number of Errors Encountered: ${numErrors}`)
}

/**
 * Process a chunk of customer data in parallel.
 *
 * @param {Array<object>} chunk - An array of customer data to process.
 * @returns {Promise<void>} A promise that resolves when processing is complete.
 */
async function processCustomerChunk (chunk) {
  const chunkPromises = chunk.map(syncCustomerData)
  await Promise.all(chunkPromises)
}

/**
 * Synchronize customer data between two APIs.
 *
 * @param {object} customerAPI1 - The customer data from API1.
 * @returns {Promise<void>} A promise that resolves when synchronization is complete.
 */
async function syncCustomerData (customerAPI1) {
  try {
    const existingApi2Customer = await readCustomer(customerAPI1.name)

    const api2CustomerData = {
      name: customerAPI1.name,
      activeAt: customerAPI1.activeAt,
      arr: customerAPI1.arr,
      teamMemberId: customerAPI1.teamMemberId
    }

    if (existingApi2Customer.length > 0) {
      api2CustomerData.id = existingApi2Customer[0].id
      await updateCustomer(api2CustomerData)
      numItemsUpdated++
    } else {
      await createCustomer(api2CustomerData)
      numItemsCreated++
    }

    logger.info('Sync completed for customer: ' + customerAPI1.name)
  } catch (error) {
    logger.error('Error synchronizing customer: ' + error.message)
    numErrors++
  }
}

/**
 * Chunk an array into smaller arrays of a specified size.
 *
 * @param {Array} array - The input array to be chunked.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array} An array of smaller arrays.
 */
function chunkArray (array, chunkSize) {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }

  numChunks = chunks[0].length
  return chunks
}

await syncCustomers()

export { syncCustomers }
