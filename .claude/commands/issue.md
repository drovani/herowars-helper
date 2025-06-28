# Claude "issue" command

This command takes the argument for the number of the issue in Github repository associated with this code base.

## Instructions

Do the following steps in order. Do not skip any steps or change the order.

1. Open issue #$ARGUMENTS, analyze it and create a plan for implementing it. Do not start making any changes, yet.
2. ALWAYS ask me any clarifying questions that you think would be helpful to know before starting work. If you have no questions, ask me to review your plan and approve it.
3. Then, refine the plan as needed and add that plan as a comment to issue #$ARGUMENTS.
4. Create a new branch for the work, implement the changes, commit them to the branch. You may make multiple commits, if it aids in creating tests, completing the coding changes, then validating the tests pass.
5. Push the branch to origin and create a comprehensive PR for the work. You do not need to confirm with me if you should create the PR. Go ahead and submit it for review. Be sure to add appropriate Labels and add me as a reviewer.

## Additional Notes

- Avoid needing to use the `node` CLI command.