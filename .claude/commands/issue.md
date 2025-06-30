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
2. Analyzes the issue description, requirements, and acceptance criteria
3. Searches the codebase for relevant files and existing implementations
4. Implements the necessary code changes to resolve the issue
5. Writes and runs unit tests (`npm run test`) to verify the fix works correctly
6. Ensures all code passes TypeScript type checking (`npm run tsc`)
7. Creates a descriptive commit message following project conventions
8. Pushes changes and creates a pull request linked to the original issue

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

## Implementation Steps
1. **Issue Analysis**: Fetch and parse issue details to understand requirements
2. **Codebase Search**: Identify relevant files and existing patterns
3. **Code Implementation**: Make necessary changes following project conventions
4. **Testing**: Write and execute tests to validate the solution
5. **Quality Checks**: Run linting and type checking to ensure code quality
6. **Documentation**: Update documentation if the change affects user-facing features
7. **Commit & PR**: Create meaningful commit message and pull request

## Safety Notes
- Always creates a new branch for changes (never commits directly to main)
- Runs comprehensive tests before creating the PR
- Links the PR to the original issue for proper tracking
- Follows the project's coding standards and conventions