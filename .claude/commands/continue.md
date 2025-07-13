# Continue Command for Claude Code

## Usage
```bash
claude continue [instruction-file.md]
```

## Description
This command reads a markdown instruction file and follows the steps outlined within it, updating the file with progress as tasks are completed. The command is designed to handle multi-phase project work where progress tracking is important.

## Key Features

### 1. Progress Tracking
- **Phase Completion**: Mark phases as ✅ COMPLETED when all tasks within are finished
- **Task Status**: Update individual tasks with status indicators (🔄 IN PROGRESS, ✅ DONE, ❌ FAILED)
- **Progress Comments**: Add timestamped progress notes inline with tasks

### 2. Instruction File Format
The command expects markdown files with structured sections:

```markdown
# Project Title

## Overview
Brief description of the project/migration

## Phase 1: Phase Name
### 1.1 Task Name
- Specific actionable items
- Sub-tasks with clear outcomes

### 1.2 Another Task
- More specific items

## Phase 2: Next Phase
### 2.1 Task Name
- etc.

## Success Criteria
- Clear completion requirements
- Testing steps
- Verification methods
```

### 3. Auto-Documentation
- **Timestamp Progress**: Add completion times for phases and major tasks
- **Error Logging**: Document any issues encountered with solutions
- **Code Changes**: Note which files were modified and why
- **Testing Results**: Record test outcomes and any failures

## Additional Instructions for Instruction Files

Based on the equipment repository migration plan, here are additional instruction types that should be included:

### 4. **Dependency Analysis Section**
```markdown
## Dependency Analysis
### Files Using [Target Component]
- List all files that import/use the target
- Note specific methods/patterns used
- Identify potential breaking changes

### Impact Assessment
- High/Medium/Low impact classification
- Estimated time per file
- Risk factors and mitigation strategies
```

### 5. **Testing Strategy Section**
```markdown
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
```

### 6. **Rollback Plan Section**
```markdown
## Rollback Plan
### If Migration Fails
1. Revert to previous commit: `git checkout [commit-hash]`
2. Restore service files from backup
3. Update imports back to original state

### Backup Strategy
- [ ] Create feature branch before starting
- [ ] Commit working state before major changes
- [ ] Document current working functionality
```

### 7. **Performance Considerations**
```markdown
## Performance Impact
### Expected Improvements
- Database queries vs in-memory filtering
- Reduced bundle size
- Better caching strategies

### Potential Regressions
- Network latency considerations
- Query optimization needs
- Memory usage patterns
```

### 8. **Code Review Checklist**
```markdown
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
```

### 9. **Documentation Updates**
```markdown
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
```

### 10. **Environment-Specific Instructions**
```markdown
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
```

## Command Implementation Notes

### Error Handling
- If a task fails, mark it as ❌ FAILED with error details
- Continue with remaining tasks when possible
- Provide clear next steps for failed tasks

### Progress Persistence
- Save progress after each completed task by commiting the code
- Allow resuming from any point in the instruction file
- Maintain git history for each phase completion

### Integration with Development Workflow
- Run `npm run tsc` after each task's code changes
- Execute relevant tests for modified areas
- Update todo tracking using TodoWrite tool
- Generate commits with descriptive messages

This command structure ensures comprehensive project execution while maintaining clear progress tracking and documentation throughout the process.