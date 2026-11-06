#!/bin/bash
# PostToolUse: after an edit to a .ts/.tsx file, run tsc (whole project) + eslint (that file).
# Exit 2 sends the errors back to Claude so they get fixed right away.
input=$(cat)
file=$(printf '%s' "$input" | python3 -I -c 'import json,sys; d=json.load(sys.stdin); print((d.get("tool_input") or {}).get("file_path",""))' 2>/dev/null)
case "$file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac
case "$file" in
  */node_modules/*|*/reference/*|*/research/*) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" || exit 0
out=$(npx tsc --noEmit 2>&1 | head -30)
lint=$(npx eslint --no-warn-ignored --quiet "$file" 2>&1 | head -30)
lint_status=${PIPESTATUS[0]}
if [ -n "$out" ] || [ -n "$lint" ]; then
  printf 'Type/lint check failed after editing %s\n%s\n%s\n' "$file" "$out" "$lint" >&2
  exit 2
fi
exit 0
