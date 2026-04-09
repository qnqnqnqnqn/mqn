#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

echo "🚀 跳一跳 APP 启动中..."
echo "📁 目录: $ROOT_DIR"
echo "🌐 地址: http://127.0.0.1:${PORT}/index.html"
echo "🛑 停止服务: Ctrl+C"

python3 -m http.server "$PORT"
