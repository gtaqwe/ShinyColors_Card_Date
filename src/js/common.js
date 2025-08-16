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
