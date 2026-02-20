: << 'CMDBLOCK'
@echo off
REM ============================================================================
REM 已弃用：自 Claude Code 2.1.x 起，此多语言包装器不再使用
REM ============================================================================
REM
REM Claude Code 2.1.x 更改了 Windows 的钩子执行模型：
REM
REM   之前 (2.0.x)：钩子以 shell:true 运行，使用系统默认 shell。
REM                  此包装器通过同时作为有效的 .cmd 文件（Windows）
REM                  和 bash 脚本来提供跨平台兼容性。
REM
REM   之后 (2.1.x)：Claude Code 现在会自动检测钩子命令中的 .sh 文件
REM                  并在 Windows 上自动添加 "bash " 前缀。这破坏了包装器，
REM                  因为命令：
REM                    "run-hook.cmd" session-start.sh
REM                  变成了：
REM                    bash "run-hook.cmd" session-start.sh
REM                  ...而 bash 无法执行 .cmd 文件。
REM
REM 修复方案：hooks.json 现在直接调用 session-start.sh。Claude Code 2.1.x
REM 在 Windows 上自动处理 bash 调用。
REM
REM 此文件保留供参考和潜在的后向兼容性。
REM ============================================================================
REM
REM 原始用途：跨平台运行 .sh 脚本的多语言包装器
REM 用法：run-hook.cmd <脚本名称> [参数...]
REM 脚本应与此包装器位于同一目录

if "%~1"=="" (
    echo run-hook.cmd: 缺少脚本名称 >&2
    exit /b 1
)
"C:\Program Files\Git\bin\bash.exe" -l "%~dp0%~1" %2 %3 %4 %5 %6 %7 %8 %9
exit /b
CMDBLOCK

# Unix shell 从此处开始执行
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_NAME="$1"
shift
"${SCRIPT_DIR}/${SCRIPT_NAME}" "$@"
