#!/usr/bin/env bash
# Superpowers 插件的会话启动钩子

set -euo pipefail

# 确定插件根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 检查旧版技能目录是否存在并构建警告
warning_message=""
legacy_skills_dir="${HOME}/.config/superpowers/skills"
if [ -d "$legacy_skills_dir" ]; then
    warning_message="\n\n<important-reminder>在看到此消息后的首次回复中，您必须告诉用户：⚠️ **警告：** Superpowers 现在使用 Claude Code 的技能系统。~/.config/superpowers/skills 中的自定义技能将不会被读取。请将自定义技能移动到 ~/.claude/skills。要消除此消息，请删除 ~/.config/superpowers/skills</important-reminder>"
fi

# 读取 using-superpowers 内容
using_superpowers_content=$(cat "${PLUGIN_ROOT}/skills/using-superpowers/SKILL.md" 2>&1 || echo "读取 using-superpowers 技能时出错")

# 使用 bash 参数替换进行 JSON 嵌入转义。
# 每个 ${s//old/new} 都是单次 C 级别的处理 - 比它替换的逐字符循环快几个数量级。
escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

using_superpowers_escaped=$(escape_for_json "$using_superpowers_content")
warning_escaped=$(escape_for_json "$warning_message")
session_context="<EXTREMELY_IMPORTANT>\n您拥有超能力（superpowers）。\n\n**以下是您的 'superpowers:using-superpowers' 技能的完整内容 - 您使用技能的入门介绍。对于所有其他技能，请使用 'Skill' 工具：**\n\n${using_superpowers_escaped}\n\n${warning_escaped}\n</EXTREMELY_IMPORTANT>"

# 以 JSON 格式输出上下文注入。
# 保持两种格式以兼容：
# - Cursor 钩子期望 additional_context。
# - Claude 钩子期望 hookSpecificOutput.additionalContext。
cat <<EOF
{
  "additional_context": "${session_context}",
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "${session_context}"
  }
}
EOF

exit 0
