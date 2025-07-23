# MSW Implementation Plan - Issue #44

## Overview

This planning document outlines the implementation strategy for refactoring repository tests to use Mock Service Worker (MSW) instead of direct Supabase client mocking. This initiative will improve test maintainability, realism, and reliability.

## Problem Statement

### Current Issues with Supabase Client Mocking

- **Tight coupling**: Tests directly mock internal Supabase client methods
- **Fragile setup**: Complex method chaining mocks break easily with updates
- **Limited realism**: Doesn't validate actual HTTP requests/responses
- **Maintenance burden**: Each Supabase update may break existing mocks

### Benefits of MSW Approach

- **Network-level interception**: Tests actual HTTP requests to Supabase REST API
- **Realistic responses**: Mock responses match actual Supabase API format
- **Maintainable**: Less dependent on Supabase client internals
- **Reusable**: MSW handlers can be shared across test files
- **Better debugging**: Easier to identify network-related issues

## Implementation Phases

### Phase 1: Setup and Dependencies

**Priority**: High  
**Estimated Time**: 2-3 hours

#### Tasks

1. Install MSW dependencies

   ```bash
   npm install --save-dev msw
   ```

2. Create MSW configuration files:

   - `app/__tests__/mocks/msw/server.ts` - MSW server setup
   - `app/__tests__/mocks/msw/handlers.ts` - Request handlers
   - `app/__tests__/mocks/msw/factories.ts` - Test data factories

3. Update Vitest configuration to integrate MSW

   - Modify `vitest.config.ts` to include MSW setup
   - Add global test setup file

4. Create utility functions for common MSW operations

#### Deliverables

- [x] MSW installed and configured
- [x] Base handler structure created
- [x] Test data factories implemented
- [x] Vitest integration complete

### Phase 2: Refactor BaseRepository Tests ✅ COMPLETE

**Priority**: High  
**Estimated Time**: 4-5 hours

#### Current State Analysis

- File: `app/repositories/__tests__/BaseRepository.test.ts`
- ✅ Converted from direct Supabase client mocking to MSW patterns
- ✅ Tests CRUD operations, error handling, and logging with MSW

#### Refactoring Strategy

1. **✅ Replace Supabase mocks with MSW handlers**

   - ✅ Converted `mockSupabaseClient` usage to MSW request handlers
   - ✅ Created handlers for GET, POST, PATCH, DELETE operations

2. **✅ Implement test data factories**

   - ✅ Created factory functions for generating test data
   - ✅ Support different response scenarios (success, error, empty)

3. **✅ Preserve existing test coverage**

   - ✅ Maintained all current test scenarios
   - ✅ Log capturing pattern remains intact
   - ✅ Kept error handling test cases

4. **✅ Add request validation**
   - ✅ Verified correct HTTP methods are used
   - ✅ Validated request payloads and headers
   - ✅ Check URL construction and query parameters

#### Key Changes

- ✅ Removed `createMockSupabaseClient` calls
- ✅ Replaced `mockFrom.select.mockResolvedValue()` with MSW handlers
- ✅ Updated test setup to use MSW server
- ✅ Added request interceptors for validation

### Phase 3: Refactor MissionRepository Tests ✅ COMPLETE

**Priority**: High  
**Estimated Time**: 3-4 hours

#### Current State Analysis

- File: `app/repositories/__tests__/MissionRepository.test.ts`
- ✅ Converted from legacy Supabase mocking to MSW patterns
- ✅ All 23 tests now use HTTP request interception

#### Refactoring Strategy

1. **✅ Apply BaseRepository refactoring patterns**

   - ✅ Used established MSW handler patterns from Phase 2
   - ✅ Reused common test data factories

2. **✅ Handle mission-specific operations**

   - ✅ Created handlers for mission table operations
   - ✅ Support chapter relationship queries
   - ✅ Handle slug-based primary key operations

3. **✅ Maintain mission test scenarios**
   - ✅ Kept all existing test cases
   - ✅ Preserved error handling for mission-specific operations
   - ✅ Ensured relationship testing remains robust

### Phase 4: Enhanced Testing Features

**Priority**: Medium  
**Estimated Time**: 2-3 hours

#### Request Validation Enhancement

1. **HTTP Method Validation**

   - Verify correct REST methods (GET, POST, PATCH, DELETE)
   - Ensure proper HTTP status codes in responses

2. **Payload Validation**

   - Validate request body structure
   - Check query parameter construction
   - Verify header inclusion (Authorization, apikey, etc.)

3. **Error Scenario Testing**
   - Network failures (500, 503 errors)
   - Authentication failures (401, 403 errors)
   - Validation errors (422 errors)
   - Rate limiting scenarios (429 errors)

#### Advanced Mock Scenarios

1. **Dynamic Response Generation**

   - Implement handlers that modify responses based on request
   - Support CRUD operations that affect subsequent requests

2. **State Management in Tests**
   - Create handlers that maintain state across requests
   - Implement realistic database-like behavior

### Phase 5: Implementation Checklist ✅ COMPLETE

**Priority**: Medium  
**Estimated Time**: 1-2 hours

#### Verification Tasks

- [x] All existing tests pass with MSW implementation
- [x] Test coverage remains at 100% for repositories
- [x] No direct Supabase client mocking remains
- [x] Log capturing pattern works correctly
- [x] Error handling scenarios are maintained
- [x] TypeScript compilation succeeds
- [x] Test execution time is acceptable

#### Quality Assurance

- [x] Run full test suite: `npm run test:run`
- [x] Generate coverage report: `npm run test:coverage`
- [x] Verify no console noise during tests
- [x] Check TypeScript compilation: `npm run tsc`

### Phase 6: Advanced Testing Scenarios

**Priority**: Low  
**Estimated Time**: 2-4 hours

#### Integration Testing Enhancement

1. **Multi-Repository Scenarios**

   - Test scenarios involving multiple repositories
   - Validate cross-table relationship operations

2. **Performance Testing**

   - Implement request timing validation
   - Add handlers for testing query optimization

3. **Edge Case Coverage**
   - Large dataset responses
   - Pagination scenarios
   - Concurrent request handling

## File Structure

```
app/
├── __tests__/
│   ├── mocks/
│   │   ├── msw/
│   │   │   ├── server.ts          # MSW server configuration
│   │   │   ├── handlers.ts        # Request handlers
│   │   │   ├── factories.ts       # Test data factories
│   │   │   └── utils.ts           # MSW utility functions
│   │   └── supabase.ts            # [DEPRECATED - to be removed]
│   └── setup.ts                   # Global test setup with MSW
├── repositories/
│   └── __tests__/
│       ├── BaseRepository.test.ts  # Refactored to use MSW
│       └── MissionRepository.test.ts # Refactored to use MSW
└── vitest.config.ts               # Updated with MSW configuration
```

## Technical Considerations

### MSW Handler Patterns

```typescript
// Example handler structure
export const handlers = [
  // GET requests
  http.get("/rest/v1/mission", ({ request }) => {
    // Handler implementation
  }),

  // POST requests
  http.post("/rest/v1/mission", ({ request }) => {
    // Handler implementation
  }),

  // Error scenarios
  http.get("/rest/v1/mission", () => {
    return HttpResponse.json({ error: "Network error" }, { status: 500 });
  }),
];
```

### Test Data Factories

```typescript
// Example factory pattern
export const createMissionData = (overrides = {}) => ({
  slug: "test-mission",
  name: "Test Mission",
  chapter_id: 1,
  energy_cost: 6,
  ...overrides,
});
```

### Request Validation Utilities

```typescript
// Example validation helper
export const validateSupabaseRequest = (request: Request) => {
  expect(request.headers.get("apikey")).toBeDefined();
  expect(request.headers.get("Authorization")).toBeDefined();
  expect(request.url).toContain("/rest/v1/");
};
```

## Migration Strategy

### Step-by-Step Approach

1. **Parallel Implementation**: Keep existing tests running while building MSW versions
2. **Incremental Testing**: Test each phase thoroughly before proceeding
3. **Rollback Plan**: Maintain ability to revert if issues arise
4. **Documentation**: Update testing documentation with new patterns

### Risk Mitigation

- **Test Coverage Monitoring**: Ensure no regression in coverage
- **Performance Impact**: Monitor test execution time
- **CI/CD Compatibility**: Verify all tests pass in automated environments
- **Team Knowledge Transfer**: Document new patterns for team understanding

## Success Criteria ✅ COMPLETE

### Functional Requirements

- [x] All existing repository tests pass with MSW
- [x] Test coverage maintains 100% for repository files
- [x] Test execution time does not significantly increase
- [x] No direct Supabase client mocking remains in codebase

### Technical Requirements

- [x] MSW properly intercepts Supabase REST API calls
- [x] Request validation works correctly
- [x] Error scenarios are properly handled
- [x] Log capturing pattern is preserved
- [x] TypeScript compilation succeeds without errors

### Documentation Requirements

- [x] Updated CLAUDE.md with MSW testing patterns
- [x] Code comments explain MSW setup and usage
- [x] Examples provided for future test development

## Timeline Estimate

**Total Estimated Time**: 14-21 hours

- **Phase 1**: 2-3 hours (Setup)
- **Phase 2**: 4-5 hours (BaseRepository)
- **Phase 3**: 3-4 hours (MissionRepository)
- **Phase 4**: 2-3 hours (Enhanced features)
- **Phase 5**: 1-2 hours (Verification)
- **Phase 6**: 2-4 hours (Advanced scenarios)

## Next Steps

1. **Immediate**: Begin Phase 1 implementation (MSW setup)
2. **Short-term**: Complete Phases 2-3 (core repository refactoring)
3. **Medium-term**: Implement Phases 4-5 (enhanced features and verification)
4. **Long-term**: Consider Phase 6 based on project needs and feedback

---

_This planning document will be updated as implementation progresses and new requirements are discovered._
