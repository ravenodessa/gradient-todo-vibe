 # Architecture rules

- Keep task rows memoized and apply desktop density only at the md breakpoint so mobile editing and controls remain unchanged.
- Render the desktop sync status into the header with a React portal from TodoApp so the existing sync hook remains the single source of live status.