# Continue Command for Claude Code

## Usage

```bash
claude continue $ARGUMENTS
```

## Description

This command reads a markdown instruction file ($ARGUMENTS) and follows the steps outlined within it, updating the file with progress as tasks are completed. The command is designed to handle multi-phase project work where progress tracking is important.

## Key Features

### 1. Progress Tracking

- **Phase Completion**: Mark phases as ✅ COMPLETED when all tasks within are finished
- **Task Status**: Update individual tasks with status indicators (🔄 IN PROGRESS, ✅ DONE, ❌ FAILED)
- **Progress Comments**: Add timestamped progress notes inline with tasks

### 2. Auto-Documentation

- **Timestamp Progress**: Add completion times for phases and major tasks
- **Error Logging**: Document any issues encountered with solutions
- **Code Changes**: Note which files were modified and why
- **Testing Results**: Record test outcomes and any failures

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

- **ALWAYS** make a new branch before making any file changes
- If you are in the main branch, then **ALWAYS** make a new branch before making any file changes. The branch name should start with the type of work (feature, bug, refactor, docs), then have an "i" (for issue), the issue number, then a short slug of the title.
  - For example: `feature/i44-msw-implementation`
- **NEVER** try to reset the linked database; only reset the local database with `npx supabase db reset`
- Run `npm run tsc` after each task's code changes to check for Typescript errors
- Execute relevant tests for modified areas and ensure tests properly pass.
- Update todo tracking using TodoWrite tool
- Generate commits with descriptive messages

This command structure ensures comprehensive project execution while maintaining clear progress tracking and documentation throughout the process.
