import axios from 'axios'
import { logger } from './logger.js'

/**
 * Function to create a new customer.
 *
 * @param {object} customerData - The customer data to create.
 * @returns {Promise<object>} The created customer data.
 * @throws {Error} Throws an error if creating the customer fails.
 */
async function createCustomer (customerData) {
  try {
    const response = await makeRequest(`${process.env.CLIENT_API_ENDPOINT}`, 'POST', customerData)
    logger.info(`Created a new customer: ${customerData.name}`)
    return response
  } catch (error) {
    logger.error(`Failed to create customer: ${error.message}`)
    throw new Error(`Failed to create customer: ${error.message}`)
  }
}

/**
 * Function to read a customer by name.
 *
 * @param {string} customerName - The name of the customer to read.
 * @returns {Promise<object>} The customer data.
 * @throws {Error} Throws an error if reading the customer fails.
 */
async function readCustomer (customerName) {
  try {
    const response = await makeRequest(process.env.CLIENT_API_ENDPOINT, 'GET', null, { name: customerName })
    logger.info(`Read customer: ${customerName}`)
    return response
  } catch (error) {
    logger.error(`Failed to read customer: ${error.message}`)
    throw new Error(`Failed to read customer: ${error.message}`)
  }
}

/**
 * Function to update an existing customer.
 *
 * @param {object} customerData - The customer data to update.
 * @returns {Promise<object>} The updated customer data.
 * @throws {Error} Throws an error if updating the customer fails.
 */
async function updateCustomer (customerData) {
  try {
    const response = await makeRequest(`${process.env.CLIENT_API_ENDPOINT}/${customerData.id}`, 'PUT', customerData)
    logger.info(`Updated customer: ${customerData.name}`)
    return response
  } catch (error) {
    logger.error(`Failed to update customer: ${error.message}`)
    throw new Error(`Failed to update customer: ${error.message}`)
  }
}

/**
 * Function to delete an existing customer(NOT IN USE).
 *
 * @param {object} customerData - The customer data to delete.
 * @returns {Promise<object>} The deleted customer data.
 * @throws {Error} Throws an error if deleting the customer fails.
 */
async function deleteCustomer (customerData) {
  try {
    const response = await makeRequest(`${process.env.CLIENT_API_ENDPOINT}/${customerData.id}`, 'DELETE', customerData)
    logger.info(`Deleted customer: ${customerData.name}`)
    return response
  } catch (error) {
    logger.error(`Failed to delete customer: ${error.message}`)
    throw new Error(`Failed to delete customer: ${error.message}`)
  }
}

/**
 * Function to make an API request and handle rate limiting.
 *
 * @param {string} url - The API endpoint URL.
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE).
 * @param {object} customerData - The customer data for the request body.
 * @param {string} customerName Name of the customer.
 * @returns {Promise<object>} The response data.
 * @throws {Error} Throws an error if the API request fails.
 */
async function makeRequest (url, method, customerData, customerName = {}) {
  try {
    const response = await axios({
      method,
      url,
      headers: {
        Authorization: process.env.CLIENT_API_KEY,
        'Content-Type': 'application/jsoncharset=utf-8'
      },
      data: customerData,
      params: customerName
    })

    return response.data
  } catch (error) {
    // This code has only been simulated/manually tested.
    if (error.response && error.response.status === 429) {
      // Handle rate limiting gracefully with exponential backoff
      const retryAfter = parseInt(error.response.headers['retry-after'], 10)
      const waitTime = Math.pow(2, retryAfter) * 1000
      logger.warn(`Rate limit exceeded. Waiting for ${waitTime / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      // Retry the request
      return makeRequest(url, method, customerData)
    } else {
      logger.error(`Request failed: ${error.message}`)
      throw new Error(`Request failed: ${error.message}`)
    }
  }
}

// Export the functions for use in other modules
export { createCustomer, readCustomer, updateCustomer, deleteCustomer }
