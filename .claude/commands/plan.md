# Plan Command

Generate a comprehensive implementation plan for the requested changes.

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

When this command is used, create a detailed markdown implementation plan in `./claude/` folder with the following structure:

1. **Overview** - Brief description of the task
2. **Branch Strategy** - Determine appropriate branch prefix based on work type:
   - `feature/` - New functionality
   - `fix/` - Bug fixes
   - `refactor/` - Code improvements
   - `chore/` - Maintenance tasks
3. **Prerequisites** - Files to examine and understand
4. **Implementation Steps** - Detailed todo list with time estimates
5. **Testing Strategy** - Required tests (unit and integration per CLAUDE.md)
6. **Validation** - TypeScript checks, linting, build verification
7. **Completion** - PR creation and link display

Include references to:
- CLAUDE.md guidelines and patterns
- Existing codebase architecture
- Testing requirements (TDD approach)
- Repository vs Service migration status
- Component installation guidelines (shadcn/ui)

The plan should be comprehensive enough that future Claude can execute it step-by-step without additional clarification.