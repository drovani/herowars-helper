// ABOUTME: MSW server configuration for testing - sets up request interception in Node.js environment
// ABOUTME: Provides centralized mock server setup for Supabase REST API calls during testing

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configure MSW server for Node.js environment (tests)
export const server = setupServer(...handlers)

// Export server instance for manual control in tests
export { handlers } from './handlers'
export { resetStores, setEquipmentStore, setMissionStore, setChapterStore, getEquipmentStore, getMissionStore, getChapterStore } from './handlers'
export * from './factories'
export * from './utils'