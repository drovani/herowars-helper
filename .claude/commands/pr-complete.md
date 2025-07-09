# PR Complete Command

Analyze a GitHub Pull Request and perform a squash merge with auto-generated commit message and description.

## Usage
```
pr-complete [PR_NUMBER]
```

## Arguments
- `PR_NUMBER` (required): The GitHub Pull Request number to analyze and merge

## What this command does:
1. Analyzes the specified PR to understand the changes made
2. Generates a commit message (max 125 characters, starting with "Merge PR[NUMBER]: ")
3. Creates an extended description (max 300 words) summarizing the changes
4. Performs a squash merge using the generated commit message and description
5. Does NOT modify the PR title or description

## Examples
```bash
# Analyze and merge PR 42
pr-complete 42

# Analyze and merge PR 123
pr-complete 123
```

## Requirements
- GitHub CLI (`gh`) must be authenticated
- User must have merge permissions for the repository
- PR must be ready for merge (all checks passing, approved, etc.)

## Output
The command will:
- Show the generated commit message and description before merging
- Perform the squash merge automatically
- Confirm successful merge completion
- Delete local branch for this PR, switch to `main` and pull the updates.

## Safety Note
This command will permanently merge and close the PR. Use with caution and ensure you have reviewed the PR contents before running.