import { vi } from 'vitest'

const routeRegistrations: any[] = []

// Mock Azure Functions so that we can hook into the route registration
// process and verify that the expected routes are registered
// in the functions file

export const mockAzureFunctions = {
  app: {
    get: vi.fn().mockImplementation((name, options) => {
      console.log('Route registered:', name, options)
      routeRegistrations.push({ method: 'get', name, options })
    }),
    post: vi.fn().mockImplementation((name, options) => {
      console.log('Route registered:', name, options)
      routeRegistrations.push({ method: 'post', name, options })
    }),
    put: vi.fn(),
    delete: vi.fn(),
  },
  InvocationContext: vi.fn(),
  HttpRequest: vi.fn(),
  HttpResponse: vi.fn(),
}

export { routeRegistrations }
export default mockAzureFunctions