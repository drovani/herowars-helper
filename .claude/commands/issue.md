# Issue Command

Analyze and resolve a GitHub issue by implementing the necessary code changes, tests, and creating a pull request.

## Usage

```
issue [ISSUE_NUMBER]
```

## Arguments

- `ISSUE_NUMBER` (required): The GitHub issue number to analyze and resolve

## What this command does:

1. Retrieves issue details using `gh issue view` to understand the problem
2. **ALWAYS** Creates a new branch for this feature, bug, or other enhancement.
3. Analyzes the issue description, requirements, and acceptance criteria
4. Searches the codebase for relevant files and existing implementations
5. Implements the necessary code changes to resolve the issue
6. Writes and runs unit tests (`npm run test`) to verify the fix works correctly
7. Ensures all code passes TypeScript type checking (`npm run tsc`)
8. Creates a descriptive commit message following project conventions
9. Pushes changes and creates a pull request linked to the original issue
10. **Links the issue and PR** using GitHub CLI for proper tracking and automatic closure

## Examples

```bash
# Analyze and fix issue 15
issue 15

# Resolve bug report in issue 42
issue 42

# Implement feature request from issue 123
issue 123
```

## Requirements

- GitHub CLI (`gh`) must be authenticated
- User must have write permissions to the repository
- Issue must contain sufficient detail to understand the problem/requirement
- Development environment must be properly set up with dependencies

## Output

The command will:

- Display issue details and analysis of the problem
- Show which files are being modified during implementation
- Report test results and type checking status
- Confirm successful commit and PR creation
- Provide the PR URL for review
- Confirm issue and PR linking with assignee and labels

## Implementation Steps

1. **Issue Analysis**: Fetch and parse issue details to understand requirements
2. **Codebase Search**: Identify relevant files and existing patterns
3. **Code Implementation**: Make necessary changes following project conventions
4. **Testing**: Write and execute tests to validate the solution
5. **Quality Checks**: Run linting and type checking to ensure code quality
6. **Documentation**: Update documentation if the change affects user-facing features
7. **Commit & PR**: Create meaningful commit message and pull request
8. **Issue Linking**: Link the issue and PR using GitHub CLI commands:
   - Add assignee to both issue and PR: `gh issue edit [ISSUE_NUMBER] --add-assignee [USERNAME]`
   - Add appropriate labels to PR that are on the issue: `gh pr edit [PR_NUMBER] --add-label "enhancement"`
   - Update PR description with "Resolves #[ISSUE_NUMBER]" for automatic closure

## Safety Notes

- **ALWAYS** creates a new branch for changes (never commits directly to main)
- Runs comprehensive tests before creating the PR
- Links the PR to the original issue for proper tracking
- Follows the project's coding standards and conventions
