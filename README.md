## Optimized Node.js application for synchronizing customer information between two APIs, focusing on production use.
(The actual endpoints for this API has been redacted but can be adjusted to similar implementations)

## Implemented Logging Packages:

Logging statements using Winston have been incorporated throughout the code to facilitate tracking of code execution, issue identification, and runtime behavior understanding.

##  Handling Large Data Volumes:

Optimizations have been introduced to efficiently handle large data volumes. The code processes data in chunks and implements parallel processing for noticeable performance improvements.

## Dealing with Throttle Limits:

Exponential backoff and retries are implemented when a 429 HTTP status code occurs. The wait time is calculated based on the "retry-after" header provided by the API. 

## Smart Usage of API Filters:

The code stores the last synchronization date locally, utilizing it in subsequent script runs to fetch only newly updated items. This ensures efficient use of API filters.

## Optimizing for Parallel Execution:

The code is enhanced to handle concurrent execution of up to n items in parallel. This significantly speeds up data retrieval and processing, leading to improved overall performance.

## Logging Script Statistics:

At the conclusion of the synchronization process, the code logs important statistics, including the number of items updated, items created, number of chunks processed, and errors encountered.

## Install & Run
Change the .env file.
Update the code to reflect your specific API's configurations.

npm i
npm start