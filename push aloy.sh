SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"
git add -A
git commit -m "update"
git push
sleep 1