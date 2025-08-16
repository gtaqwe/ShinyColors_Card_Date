const cardTypeIdentifier = {
  PERMANENT: "P",
  LIMITED: "L",
  TWILIGHT: "Tw",
  MY_SONGS: "My",
  PARALLEL: "Pa",
  EVENT: "E",
  FES: "F",
  CAMPAIGN: "C",
  OTHER: "O",
};

const cardRarityType = {
  P_UR: "pUR",
  P_SSR: "pSSR",
  P_SR: "pSR",
  S_UR: "sUR",
  S_SSR: "sSSR",
  S_SR: "sSR",
};
const GACHA_CATEGORY_COUNT = Object.keys(cardTypeIdentifier).length;
const SERVICE_START_DATE_STRING = "2018-04-24";
const DEACTIVATE_BUTTON_TYPE_CLASS = "DeactivateButton";

let JSON_DATA;
let IDOL_TOTAL_COUNT;

// 카드 차수 변경 데이터의 배열
let TABLE_BLANK_LAP_LIST;

// 통상, 한정, 트와코레, 마이코레, 이벤트, 페스, 캠페인, 기타
let CARD_TYPE_COUNT_LIST = Array(GACHA_CATEGORY_COUNT).fill(0);
