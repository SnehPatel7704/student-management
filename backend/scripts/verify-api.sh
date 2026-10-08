#!/usr/bin/env bash
set -u

BASE_URL="${BASE_URL:-http://localhost:5000}"
RUN_ID="$(date +%s%N)"
EMAIL="vv-${RUN_ID}@example.com"
STUDENT_ID=""
BOOK_ID=""
FAILURES=0
PASSES=0
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

log_result() {
  local status="$1"
  local test_name="$2"
  local details="${3:-}"
  if [[ "$status" == "PASS" ]]; then
    PASSES=$((PASSES + 1))
    printf '[PASS] %s%s\n' "$test_name" "${details:+ - $details}"
  else
    FAILURES=$((FAILURES + 1))
    printf '[FAIL] %s%s\n' "$test_name" "${details:+ - $details}"
  fi
}

assert_status() {
  local test_name="$1"
  local expected="$2"
  local actual="$3"
  local details="${4:-}"
  if [[ "$actual" == "$expected" ]]; then
    log_result PASS "$test_name" "HTTP ${actual}${details:+; $details}"
  else
    log_result FAIL "$test_name" "Expected HTTP ${expected}, received HTTP ${actual}${details:+; $details}"
  fi
}

http_assert() {
  local test_name="$1"
  local expected="$2"
  local method="$3"
  local path="$4"
  local payload="${5:-}"
  local output_file="$TEMP_DIR/response.json"
  local status
  status=$(curl -sS -o "$output_file" -w '%{http_code}' -X "$method" \
    -H 'Content-Type: application/json' \
    --data "$payload" "$BASE_URL$path")
  if [[ "$status" == "$expected" ]]; then
    log_result PASS "$test_name" "HTTP ${status}; $(cat "$output_file")"
    return 0
  fi
  log_result FAIL "$test_name" "Expected HTTP ${expected}, received HTTP ${status}; $(cat "$output_file")"
  return 1
}

# TC-P01: Health Check
health_status=$(curl -sS -o "$TEMP_DIR/health.json" -w '%{http_code}' "$BASE_URL/health")
if [[ "$health_status" == "200" ]] && grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' "$TEMP_DIR/health.json" && grep -q '"database"[[:space:]]*:[[:space:]]*"connected"' "$TEMP_DIR/health.json"; then
  log_result PASS TC-P01 "Health and MongoDB status verified"
else
  log_result FAIL TC-P01 "Expected HTTP 200 with status ok and database connected"
fi

# TC-P02: Student Creation
create_response=$(curl -sS -o "$TEMP_DIR/create.json" -w '%{http_code}' -X POST "$BASE_URL/students" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Vandana Verifier\",\"email\":\"$EMAIL\",\"course\":\"CS101\",\"age\":22}")
if [[ "$create_response" == "201" ]]; then
  STUDENT_ID=$(node -e "const fs=require('fs'); const r=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(!r._id) process.exit(1); process.stdout.write(r._id)" "$TEMP_DIR/create.json")
  if [[ -n "$STUDENT_ID" ]]; then
    log_result PASS TC-P02 "Student created with HTTP 201; ID $STUDENT_ID"
  else
    log_result FAIL TC-P02 "HTTP 201 did not return a student ID"
  fi
else
  log_result FAIL TC-P02 "Expected HTTP 201, received HTTP $create_response"
fi

# TC-N01: Duplicate Email Validation
if [[ -n "$STUDENT_ID" ]]; then
  duplicate_status=$(curl -sS -o "$TEMP_DIR/duplicate.json" -w '%{http_code}' -X POST "$BASE_URL/students" \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"Vandana Verifier Duplicate\",\"email\":\"$EMAIL\",\"course\":\"CS101\",\"age\":23}")
  if [[ "$duplicate_status" == "400" ]] && grep -q '"success"[[:space:]]*:[[:space:]]*false' "$TEMP_DIR/duplicate.json"; then
    log_result PASS TC-N01 "Duplicate email rejected with HTTP 400"
  else
    log_result FAIL TC-N01 "Expected duplicate-email HTTP 400, received HTTP $duplicate_status"
  fi
else
  log_result FAIL TC-N01 "Skipped because student creation failed"
fi

# TC-N02: Age Boundary Enforcement: age 150 and age 0
for age in 150 0; do
  age_status=$(curl -sS -o "$TEMP_DIR/age-$age.json" -w '%{http_code}' -X POST "$BASE_URL/students" \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"Age Boundary\",\"email\":\"age-$age-$RUN_ID@example.com\",\"course\":\"CS101\",\"age\":$age}")
  if [[ "$age_status" == "400" ]] && grep -q '"success"[[:space:]]*:[[:space:]]*false' "$TEMP_DIR/age-$age.json"; then
    log_result PASS "TC-N02 age $age" "Schema boundary rejected with HTTP 400"
  else
    log_result FAIL "TC-N02 age $age" "Expected HTTP 400, received HTTP $age_status"
  fi
done

# TC-P04: Query and Pagination
query_status=$(curl -sS -o "$TEMP_DIR/query.json" -w '%{http_code}' "$BASE_URL/students?page=1&limit=5&search=Vandana")
if [[ "$query_status" == "200" ]] && grep -q '"pagination"' "$TEMP_DIR/query.json" && grep -q '"total"' "$TEMP_DIR/query.json" && grep -q '"totalPages"' "$TEMP_DIR/query.json"; then
  log_result PASS TC-P04 "Pagination metadata returned with HTTP 200"
else
  log_result FAIL TC-P04 "Expected structured pagination metadata with HTTP 200"
fi

# TC-P03: Bulk Delete
if [[ -n "$STUDENT_ID" ]]; then
  bulk_delete_status=$(curl -sS -o "$TEMP_DIR/delete.json" -w '%{http_code}' -X POST "$BASE_URL/students/bulk-delete" \
    -H 'Content-Type: application/json' \
    -d "{\"ids\":[\"$STUDENT_ID\"]}")
  if [[ "$bulk_delete_status" == "200" ]] && grep -q '"deletedCount"' "$TEMP_DIR/delete.json"; then
    log_result PASS TC-P03 "Bulk delete returned HTTP 200"
  else
    log_result FAIL TC-P03 "Expected bulk-delete HTTP 200, received HTTP $bulk_delete_status"
  fi
else
  log_result FAIL TC-P03 "Skipped because student creation failed"
fi

# TC-N03: Malformed ObjectId
malformed_status=$(curl -sS -o "$TEMP_DIR/malformed.json" -w '%{http_code}' "$BASE_URL/students/invalid_id")
if [[ "$malformed_status" == "400" ]] && grep -q 'success.*false' "$TEMP_DIR/malformed.json"; then
  log_result PASS TC-N03 "Malformed ObjectId handled with HTTP 400"
else
  log_result FAIL TC-N03 "Expected malformed ObjectId HTTP 400, received HTTP $malformed_status"
fi

# TC-N04: Non-existent Record
unmapped_id="000000000000000000000001"
update_status=$(curl -sS -o "$TEMP_DIR/not-found.json" -w '%{http_code}' -X PUT "$BASE_URL/students/$unmapped_id" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Unmapped Student"}')
if [[ "$update_status" == "404" ]] && grep -q 'success.*false' "$TEMP_DIR/not-found.json"; then
  log_result PASS TC-N04 "Unmapped valid ObjectId returns HTTP 404"
else
  log_result FAIL TC-N04 "Expected unmapped-record HTTP 404, received HTTP $update_status"
fi

# Additional negative safety checks for inventory and exam bounds
book_status=$(curl -sS -o "$TEMP_DIR/book.json" -w '%{http_code}' -X POST "$BASE_URL/books" \
  -H 'Content-Type: application/json' \
  -d "{\"isbn\":\"VANDANA-BOOK-$RUN_ID\",\"title\":\"Verification Copy\",\"author\":\"Campusdesk\",\"category\":\"Test\",\"totalCopies\":1,\"availableCopies\":0}")
if [[ "$book_status" == "201" ]]; then
  BOOK_ID=$(node -e "const fs=require('fs'); const r=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(!r._id) process.exit(1); process.stdout.write(r._id)" "$TEMP_DIR/book.json")
  issue_status=$(curl -sS -o "$TEMP_DIR/inventory.json" -w '%{http_code}' -X POST "$BASE_URL/library/issue" \
    -H 'Content-Type: application/json' \
    -d "{\"book\":\"$BOOK_ID\",\"student\":\"000000000000000000000002\",\"dueDate\":\"2030-01-01T00:00:00.000Z\"}")
  if [[ "$issue_status" == "400" ]] && grep -q 'No copies are available' "$TEMP_DIR/inventory.json"; then
    log_result PASS TC-N05 "Inventory safety rejects zero available copies with HTTP 400"
  else
    log_result FAIL TC-N05 "Expected inventory safety HTTP 400, received HTTP $issue_status"
  fi
else
  log_result FAIL TC-N05 "Could not create zero-availability book"
fi

grade_status=$(curl -sS -o "$TEMP_DIR/grade.json" -w '%{http_code}' -X POST "$BASE_URL/grades" \
  -H 'Content-Type: application/json' \
  -d '{"student":"000000000000000000000003","course":"000000000000000000000004","examType":"Final","marksObtained":101,"maxMarks":100}')
if [[ "$grade_status" == "400" ]] && grep -q 'success.*false' "$TEMP_DIR/grade.json"; then
  log_result PASS TC-N06 "Grade boundary rejects marks above maxMarks with HTTP 400"
else
  log_result FAIL TC-N06 "Expected grade-boundary HTTP 400, received HTTP $grade_status"
fi

printf '\nValidation summary: %d passed, %d failed\n' "$PASSES" "$FAILURES"
if [[ "$FAILURES" -gt 0 ]]; then
  exit 1
fi
exit 0
