#!/usr/bin/env bash
set -euo pipefail

# taskID = 当前目录名
TASK_ID="$(basename "$PWD")"

# 注入环境变量（你之前用的是这个名）
export CLAUDE_CODE_TASK_LIST_ID="$TASK_ID"

echo "[claude.sh] CLAUDE_CODE_TASK_LIST_ID=$CLAUDE_CODE_TASK_LIST_ID"
exec claude "$@"


