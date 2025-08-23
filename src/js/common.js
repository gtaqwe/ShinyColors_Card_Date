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
  return getISODate(new Date());
}

/**
 * 지정한 날짜를 ISO 8601형식(YYYY-MM-DD)으로 Return
 */
function getISODate(dateStr) {
  const targetDate = new Date(dateStr);

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");

  // yyyy-MM-dd 형식
  return `${year}-${month}-${day}`;
}

/**
 * 지정한 오브젝트의 ID로부터 날짜 정보를 취득하여 ISO 8601형식(YYYY-MM-DD)으로 Return
 */
function getISODateById(id) {
  return getISODate(new Date($(id).val()));
}

function compareByValueAsc(itemA, itemB) {
  const aValue = itemA ? itemA : Infinity;
  const bValue = itemB ? itemB : Infinity;

  return aValue - bValue;
}

function compareByValueDesc(itemA, itemB) {
  const aValue = itemA ? itemA : Infinity;
  const bValue = itemB ? itemB : Infinity;

  return bValue - aValue;
}

/**
 * 날짜를 비교한 결과를 취득
 * A가 B보다 이전인 경우, 0보다 작음
 * A가 B보다 이후인 경우, 0보다 큼
 */
function compareByCardDateAsc(before, after) {
  // 날짜 데이터가 존재 하지 않는 경우, 마지막에 위치하도록 무한으로 설정
  const beforeTime = before ? new Date(before).getTime() : Infinity;
  const afterTime = after ? new Date(after).getTime() : Infinity;

  return compareByValueAsc(beforeTime, afterTime);
}

/**
 * 날짜의 차이를 취득
 */
function getDateDiff(before, after) {
  // 하루를 밀리초(ms)로 변환 = 86400000
  return (new Date(after) - new Date(before)) / 86400000;
}

/**
 * 공백에 해당되는 문자열인지 확인
 */
function isBlank(str) {
  return !str || /^\s*$/.test(str);
}

/**
 * 첫 글자만 대문자로 변경, 나머지는 그대로
 */
function changeUpperFirst(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}
