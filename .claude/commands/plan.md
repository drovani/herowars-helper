# Plan Command

Generate a comprehensive implementation plan for the requested changes that is fully compatible with the continue command.

## Usage

```
/plan <description of changes to implement>
```

## Examples

```
/plan run the typescript check and fix any errors
/plan implement user profile editing feature
/plan add dark mode toggle to the application
```

## Command Instructions

When this command is used, research the request, examine the code base to gain more context, and create a detailed markdown implementation plan in `.claude/` folder with the following structure that is fully compatible with the continue command:

### Required Plan Structure

```markdown
# Project Title

## Overview
Brief description of the project/task and its importance

## Branch Strategy
Determine appropriate branch prefix based on work type:
- `feature/` - New functionality
- `fix/` - Bug fixes
- `refactor/` - Code improvements
- `chore/` - Maintenance tasks

## Prerequisites
Files to examine and understand before starting

## Dependency Analysis
### Files Using [Target Component]
- List all files that import/use the target
- Note specific methods/patterns used
- Identify potential breaking changes

### Impact Assessment
- High/Medium/Low impact classification
- Estimated time per file
- Risk factors and mitigation strategies

## Phase 1: [Phase Name]
### 1.1 Task Name
- Specific actionable items
- Sub-tasks with clear outcomes

### 1.2 Another Task
- More specific items

## Phase 2: [Next Phase]
### 2.1 Task Name
- etc.

## Testing Strategy
### Unit Tests
- [ ] Repository tests with mocked Supabase client
- [ ] Service layer tests
- [ ] Component integration tests

### Integration Tests
- [ ] Database operations
- [ ] API endpoint testing
- [ ] Form validation testing

### Manual Testing Checklist
- [ ] Core functionality works
- [ ] Error handling works
- [ ] TypeScript compilation passes
- [ ] No runtime errors in browser console

## Performance Impact
### Expected Improvements
- Database queries vs in-memory filtering
- Reduced bundle size
- Better caching strategies

### Potential Regressions
- Network latency considerations
- Query optimization needs
- Memory usage patterns

## Code Review Checklist
### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Error handling follows project patterns
- [ ] No console.log statements in production code
- [ ] Proper logging with loglevel

### Architecture
- [ ] Follows repository pattern consistently
- [ ] Proper separation of concerns
- [ ] Database queries are optimized
- [ ] Error responses are user-friendly

## Documentation Updates
### Files to Update
- [ ] README.md - Update architecture section
- [ ] CLAUDE.md - Update repository status
- [ ] API documentation - New endpoints/methods
- [ ] Component documentation - Updated props/usage

### Comments and JSDoc
- [ ] Add JSDoc comments to new public methods
- [ ] Update inline comments for complex logic
- [ ] Document breaking changes

## Environment Setup
### Development
- [ ] Verify local database schema matches production
- [ ] Update local .env with required variables
- [ ] Run database migrations if needed

### Testing
- [ ] Verify test database is properly seeded
- [ ] Mock configurations are up to date
- [ ] Test data fixtures are valid

### Production Considerations
- [ ] Database migration scripts ready
- [ ] Feature flags configured if needed
- [ ] Monitoring alerts updated

## Rollback Plan
### If Migration Fails
1. Revert to previous commit: `git checkout [commit-hash]`
2. Restore service files from backup
3. Update imports back to original state

### Backup Strategy
- [ ] Create feature branch before starting
- [ ] Commit working state before major changes
- [ ] Document current working functionality

## Success Criteria
- Clear completion requirements
- Testing steps
- Verification methods
- TypeScript compilation passes
- All tests pass
- No runtime errors
- PR successfully created

## Completion
- PR creation and link display
- Update TodoWrite with completion status
- Commit progress with descriptive messages
```

### Plan Requirements

Include comprehensive references to:
- CLAUDE.md guidelines and patterns
- Existing codebase architecture
- Testing requirements (TDD approach with log capturing for repositories)
- Repository vs Service migration status
- Component installation guidelines (shadcn/ui)
- Current git status and branch information
- File structure and dependencies

### Progress Tracking Integration

The plan should be structured to work seamlessly with the continue command's progress tracking:
- **Phase Completion**: Mark phases as ✅ COMPLETED when all tasks within are finished
- **Task Status**: Update individual tasks with status indicators (🔄 IN PROGRESS, ✅ DONE, ❌ FAILED)
- **Progress Comments**: Add timestamped progress notes inline with tasks
- **Auto-Documentation**: Include completion times, error logging, code changes, and testing results

### Development Workflow Integration

Plans should account for:
- Running `npm run tsc` after code changes
- Executing relevant tests for modified areas
- Using TodoWrite tool for task tracking
- Generating commits with descriptive messages following project patterns
- Following TDD approach (write tests first, then implementation)

The plan should be comprehensive enough that the continue command can execute it step-by-step without additional clarification, with full progress tracking and documentation.