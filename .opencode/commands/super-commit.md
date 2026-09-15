---
description: Analyzes generated changes and performs one or several commits automatically
agent: build
---

Analyze the following changes detected in the repository:

File status:
!`git status -s`

Detail of unstaged changes:
!`git diff`

Detail of staged changes:
!`git diff --cached`

Your sole objective is to review the changes and execute git commands to save progress using Conventional Commits. Follow these rules strictly:

1. **No changes**: If there is nothing to commit, just say so and stop.
2. **Security check**: Never stage sensitive files like `.env`, `*.key`, `*.secret` or similar. Skip them and warn the user.
3. **Read untracked files**: If new untracked files appear in `git status`, read their content to understand them before deciding how to group them.
4. **Stage selectively**: Always use `git add <specific-file>` — never `git add .` or `git add -A`.
5. **Group logically**: Split into multiple commits if changes belong to different areas or concerns. Group into one if they represent a single unit of work.
6. **Conventional Commits format** with optional scope:
   - `<type>(<scope>): <message in spanish>`
   - Available types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `perf`, `chore`, `ci`, `build`, `revert`
   - Example: `feat(auth): añadir login con google`
7. **Commit message rules**:
   - Written in **Spanish**, imperative mood ("añadir" not "añadido")
   - Max 72 characters
   - Lowercase after the colon
8. **Action**: Execute `git add <file>` and `git commit -m "..."` directly. No long explanations.
