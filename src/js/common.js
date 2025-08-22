/**
 * JSON 데이터 읽기
 */
async function getJSON(jsonFile, cacheMode = "no-cache") {
  try {
    const response = await fetch(jsonFile, { cache: cacheMode });
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch JSON:", err);
    throw err;
  }
}

/**
 * URL의 쿼리를 Object형식으로 취득
 * https://example.com/?foo=bar&baz=qux -> {foo: bar, baz: qux}
 */
function getQuery() {
  const params = new URLSearchParams(window.location.search);

  // Query Parameter를 [key, value] 형태의 배열을 취득 후, Object형태로 변환 후 Return
  return Object.fromEntries(params.entries());
}

/**
 * 현재날짜를 ISO 8601형식(YYYY-MM-DD)으로 Return
 */
function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  // yyyy-MM-dd 형식
  return `${year}-${month}-${day}`;
}

/**
 * 날짜를 비교한 결과를 취득
 * A가 B보다 이전인 경우, 0보다 작음
 * A가 B보다 이후인 경우, 0보다 큼
 */
function getCompareValueByCardDate(dateA, dateB) {
  // 날짜 데이터가 존재 하지 않는 경우, 마지막에 위치하도록 무한으로 설정
  const timeA = dateA ? new Date(dateA).getTime() : Infinity;
  const timeB = dateB ? new Date(dateB).getTime() : Infinity;

  return timeA - timeB;
}
