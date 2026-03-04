#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TMP_DIR="$(mktemp -d)"
SERVER_LOG="$TMP_DIR/server.log"
PORT="${TEST_PORT:-5060}"
RESULTS_DIR="${RESULTS_DIR:-}"
SUMMARY_FILE=""

if [[ -n "$RESULTS_DIR" ]]; then
  mkdir -p "$RESULTS_DIR"
  SUMMARY_FILE="$RESULTS_DIR/summary.txt"
  : > "$SUMMARY_FILE"
fi

log_summary() {
  local line="$1"
  echo "$line"
  if [[ -n "$SUMMARY_FILE" ]]; then
    echo "$line" >> "$SUMMARY_FILE"
  fi
}

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

save_artifact() {
  local src="$1"
  local dest_name="$2"
  if [[ -n "$RESULTS_DIR" && -f "$src" ]]; then
    cp "$src" "$RESULTS_DIR/$dest_name"
  fi
}

start_server() {
  local worker_cmd="${1:-}"

  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi

  : > "$SERVER_LOG"

  if [[ -n "$worker_cmd" ]]; then
    PORT="$PORT" FACESWAP_WORKER_CMD="$worker_cmd" node server.js > "$SERVER_LOG" 2>&1 &
  else
    PORT="$PORT" node server.js > "$SERVER_LOG" 2>&1 &
  fi
  SERVER_PID=$!

  for _ in {1..40}; do
    if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done

  log_summary "No se pudo iniciar server"
  cat "$SERVER_LOG"
  save_artifact "$SERVER_LOG" "server-start-error.log"
  return 1
}

create_assets() {
  mkdir -p "$TMP_DIR/assets"
  ffmpeg -f lavfi -i color=c=red:s=320x240:d=1 -frames:v 1 "$TMP_DIR/assets/photo.png" -y -loglevel error
  ffmpeg -f lavfi -i testsrc=duration=2:size=320x240:rate=24 -f lavfi -i sine=frequency=440:duration=2 \
    -c:v libx264 -pix_fmt yuv420p -c:a aac "$TMP_DIR/assets/input.mp4" -y -loglevel error

  save_artifact "$TMP_DIR/assets/photo.png" "asset-photo.png"
  save_artifact "$TMP_DIR/assets/input.mp4" "asset-input.mp4"
}

run_flow() {
  local expected_mode="$1"
  local label="$2"

  local create_resp="$TMP_DIR/create-${label}.json"
  curl -fsS -X POST "http://127.0.0.1:${PORT}/api/jobs/faceswap" \
    -F "photo=@$TMP_DIR/assets/photo.png" \
    -F "video=@$TMP_DIR/assets/input.mp4" \
    -F "identityStrength=0.9" \
    -F "temporalSmoothing=medium" \
    -F "restoration=low" \
    -F "targetPerson=auto" > "$create_resp"

  local job_id
  job_id="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["id"])' "$create_resp")"

  local status=""
  local status_resp="$TMP_DIR/status-${label}.json"
  for _ in {1..80}; do
    curl -fsS "http://127.0.0.1:${PORT}/api/jobs/${job_id}" > "$status_resp"
    status="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["status"])' "$status_resp")"
    if [[ "$status" == "completed" ]]; then
      break
    fi
    if [[ "$status" == "failed" ]]; then
      log_summary "Job falló (${label})"
      cat "$status_resp"
      save_artifact "$create_resp" "create-${label}.json"
      save_artifact "$status_resp" "status-${label}.json"
      save_artifact "$SERVER_LOG" "server-${label}.log"
      return 1
    fi
    sleep 0.5
  done

  if [[ "$status" != "completed" ]]; then
    log_summary "Timeout esperando completion (${label})"
    cat "$status_resp"
    save_artifact "$create_resp" "create-${label}.json"
    save_artifact "$status_resp" "status-${label}.json"
    save_artifact "$SERVER_LOG" "server-${label}.log"
    return 1
  fi

  local mode
  mode="$(python3 -c 'import json,sys; print((json.load(open(sys.argv[1])).get("metadata") or {}).get("mode", ""))' "$status_resp")"
  if [[ "$mode" != "$expected_mode" ]]; then
    log_summary "Modo inesperado para ${label}: esperado=${expected_mode} obtenido=${mode}"
    cat "$status_resp"
    save_artifact "$create_resp" "create-${label}.json"
    save_artifact "$status_resp" "status-${label}.json"
    save_artifact "$SERVER_LOG" "server-${label}.log"
    return 1
  fi

  local output_file="$TMP_DIR/output-${label}.mp4"
  curl -fsS "http://127.0.0.1:${PORT}/api/jobs/${job_id}/result" -o "$output_file"

  local duration
  duration="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$output_file")"
  if [[ -z "$duration" ]]; then
    log_summary "No se pudo leer duración output (${label})"
    return 1
  fi

  save_artifact "$create_resp" "create-${label}.json"
  save_artifact "$status_resp" "status-${label}.json"
  save_artifact "$output_file" "output-${label}.mp4"
  save_artifact "$SERVER_LOG" "server-${label}.log"

  log_summary "OK ${label}: job_id=${job_id} status=${status} mode=${mode} duration=${duration}"
}

create_assets

start_server ""
run_flow "default-pass-through" "default"

start_server "python3 workers/faceswap_worker.py"
run_flow "external-worker" "worker"

log_summary "OK runtime faceswap API (2 escenarios)"

if [[ -n "$RESULTS_DIR" ]]; then
  log_summary "Resultados guardados en: $RESULTS_DIR"
fi
