#!/usr/bin/env bash
# Stop hook: 交付验收 — 如有未验证的变更则阻止退出
set -euo pipefail

# 读取hook传入的JSON（含 transcript_path, workspace 等）
INPUT=$(cat)
WORKSPACE=$(echo "$INPUT" | jq -r '.workspace // empty')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')

if [ -z "$WORKSPACE" ]; then
  exit 0
fi
cd "$WORKSPACE"

# ====== 1. 检查本轮是否有文件改动 ======
CHANGED=$(git diff --stat HEAD 2>/dev/null || true)
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | grep -v '^.claude/' || true)
STAGED=$(git diff --cached --stat 2>/dev/null || true)

if [ -z "$CHANGED" ] && [ -z "$UNTRACKED" ] && [ -z "$STAGED" ]; then
  # 无任何改动，允许结束
  exit 0
fi

# ====== 2. 有改动，检查是否已在对话中完成验证 ======
VERIFIED=false

# 检查transcript中是否有验证证据
check_transcript() {
  if [ -z "$TRANSCRIPT" ] || [ ! -f "$TRANSCRIPT" ]; then
    return 1
  fi

  # 搜索对话记录中的验证关键词（中文 & 英文）
  local patterns=(
    # 测试相关
    'npm test' 'npm run test' 'yarn test' 'pnpm test' 'go test' 'cargo test' 'pytest'
    '测试通过' '测试结果' 'test pass' 'test result' 'all tests'
    '0 failed' '0 failing' 'tests passing'
    # Lint / Typecheck
    'npm run lint' 'eslint' 'ruff' 'flake8' 'golangci-lint'
    'lint 通过' 'lint pass' 'no lint'
    'tsc' 'typecheck' 'mypy' 'pyright'
    'typecheck 通过' '类型检查' 'no type errors'
    # 构建验证
    'npm run build' 'yarn build' 'go build' 'cargo build'
    '构建成功' 'build success' 'built in'
    # 功能验证 / 手动测试
    '功能验证' '手动测试' '已验证' '验证通过'
    'dev server' '启动成功' 'localhost'
    '功能正常' '检查通过'
    # TODO 检查
    'TODO' 'FIXME' 'HACK'
    '没有遗留' 'no todo' 'no remaining'
    # 代码审查
    'review' '审查' '自查'
    # 通用验证结论
    '验证.*完成' '验证.*通过' '已确认' 'confirmed'
    'no error' 'no issue' '没有问题'
    '一切正常' '运行正常' 'ready'
  )

  for pattern in "${patterns[@]}"; do
    if grep -q -i "$pattern" "$TRANSCRIPT" 2>/dev/null; then
      return 0
    fi
  done

  return 1
}

if check_transcript; then
  exit 0
fi

# ====== 3. 验证未完成，输出提醒并阻止退出 ======
cat <<MSG

========================================
  STOP 被阻止 — 交付验收未完成
========================================

本轮改动了以下文件：
${CHANGED:-}
${UNTRACKED:+（未跟踪）$UNTRACKED}
${STAGED:+（已暂存）$STAGED}

请在结束前完成以下验证之一：
  • 运行测试并报告结果
  • 运行 lint / typecheck 并报告结果
  • 运行构建并确认成功
  • 启动服务进行功能验证
  • 检查是否有遗留 TODO/FIXME

验证完成后在对话中说明结果，再次尝试结束。

========================================
MSG

exit 2
