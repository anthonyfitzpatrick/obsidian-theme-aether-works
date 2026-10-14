#!/usr/bin/env bash
# PostToolUse hook: lint the project after Claude writes or edits a file.
# Exit 2 sends stderr back to Claude so it can fix the violation immediately,
# rather than the problem surviving until the pre-commit hook or CI.
cd "$CLAUDE_PROJECT_DIR" || exit 0
[ -d node_modules/oxlint ] || exit 0

if ! output=$(npm run --silent lint 2>&1); then
	echo "Lint found violations:" >&2
	echo "$output" >&2
	exit 2
fi
exit 0
