import { vi, describe, it, expect, beforeEach } from 'vitest'
import { routeRegistrations } from './mocks/azure-functions'

describe('Azure GDT Functions Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Import the functions file to register the routes
    await import('../../src/functions/httpTrigger')
  })

  it('should register getProvenance route', () => {
    const getProvenanceRoute = routeRegistrations.find(
      r => r.name === 'getProvenance'
    )
    
    expect(getProvenanceRoute).toBeDefined()
    expect(getProvenanceRoute).toEqual({
      method: 'get',
      name: 'getProvenance',
      options: {
        authLevel: 'anonymous',
        route: 'provenance/{deviceKey}',
        handler: expect.any(Function)
      }
    })
  })

  // TODO: Test more routes

  it('should register all expected routes', () => {
    const expectedRoutes = [
      'getProvenance',
      'postProvenance',
      'upgradeProvenance',
      'getAttachment',
      'getAttachmentName',
      'getStatistics'
    ]

    expectedRoutes.forEach(routeName => {
      const route = routeRegistrations.find(r => r.name === routeName)
      expect(route, `Route ${routeName} should be registered`).toBeDefined()
    })
  })
})
