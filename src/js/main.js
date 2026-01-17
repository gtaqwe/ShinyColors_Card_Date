import IdolData from "./idolData.js";
import ChangeCardLapInfo from "./changeCardLapInfo.js";
import CardRarityInfo from "./cardRarityInfo.js";
import CardCategoryInfo from "./cardCategoryInfo.js";
import Language from "./language.js";
import CaptureScreen from "./captureScreen.js";

import { SERVICE_START_DATE_STRING, CARD_RARITY_TYPE } from "./constant.js";

import { withUpdateTable } from "./updateTable.js";
import * as Utility from "./utility.js";

$(function () {
  init();
});

/**
 * 초기화
 */
async function init() {
  await IdolData.init();
  CaptureScreen.loadHtml2Canvas();
  ChangeCardLapInfo.init(IdolData.getIdolNumber());

  // 선택한 카드레어리티 초기화
  CardRarityInfo.init();

  // 초기 기준일
  // Start : 서비스 개시일
  // End : 현재 날짜
  $("#baseStartDate").val(SERVICE_START_DATE_STRING);
  $("#baseEndDate").val(Utility.getToday());

  // 언어 설정
  await initLanguage();

  // 카드 수 리셋
  CardCategoryInfo.init();
  convertShowCardCount();

  // 리셋 버튼 추가
  createResetButton();

  // 연도 프리셋 추가
  initDatePresetButton();

  setEventHandler();
}

/**
 * 리셋 버튼 생성
 */
function createResetButton() {
  // 카드 차수 리셋 버튼
  $("#changeCardLapSpan").append(
    $("<input>", {
      type: "button",
      id: "cardLapResetButton",
      value: "Reset",
      class: "ResetButton",
      click: withUpdateTable(ChangeCardLapInfo.reset),
    })
  );

  // 시작일 리셋 버튼
  $("#baseStartSpan").append(
    $("<input>", {
      type: "button",
      id: "baseStartDateResetButton",
      value: "Reset",
      class: "ResetButton",
      click: withUpdateTable(() => setBaseDate("baseStartDate", SERVICE_START_DATE_STRING)),
    })
  );

  // 종료일 리셋 버튼
  $("#baseEndSpan").append(
    $("<input>", {
      type: "button",
      id: "baseEndDateResetButton",
      value: "Reset",
      class: "ResetButton",
      click: withUpdateTable(() => setBaseDate("baseEndDate", Utility.getToday())),
    })
  );
}

/**
 * 각 버튼의 이벤트를 바인딩
 */
function setEventHandler() {
  // 카드 레어도 선택 버튼
  $("#pUrButton").on("click", withUpdateTable(setPUr));
  $("#sUrButton").on("click", withUpdateTable(setSUr));
  $("#pSsrButton").on("click", withUpdateTable(setPSsr));
  $("#sSsrButton").on("click", withUpdateTable(setSSsr));
  $("#pSrButton").on("click", withUpdateTable(setPSr));
  $("#sSrButton").on("click", withUpdateTable(setSSr));

  // 스크린샷 버튼
  $("#tableScreenCaptureButton").on("click", () => CaptureScreen.captureMainTableScreen());
  $("#rankScreenCaptureButton").on("click", () => CaptureScreen.captureRankTableScreen());

  // 시작일 변경
  $("#baseStartDate").on("change", withUpdateTable(updateStartBaseDate));

  // 종료일 변경
  $("#baseEndDate").on("change", withUpdateTable(updateEndBaseDate));

  // 아이콘 표시
  $("#iconImgConvertBtn").on("change", withUpdateTable());

  // 첫 실장 비표시
  $("#noShowRCardConvertBtn").on("change", withUpdateTable());

  // 카드 수 표시
  $("#showCardCountConvertBtn").on("change", withUpdateTable(convertShowCardCount));

  // 카드 차수 변경 표시
  $("#showChangeCardLapConvertBtn").on("change", withUpdateTable());

  // 페스 일러 표시
  $("#fesImgConvertBtn").on("change", withUpdateTable());

  // 카드 타입 체크박스 설정
  setViewCheckboxSetting();

  // 언어 변경 선택 버튼
  $("#languageSelect").on(
    "change",
    withUpdateTable(async () => await changeLanguage("languageSelect"))
  );
}

/**
 * 언어 설정 초기화
 */
async function initLanguage() {
  await Language.init();

  // Query Parameter로 언어 설정시 선택한 언어로 표시
  const query = Utility.getQuery();
  if (query.lang !== undefined) {
    await Language.setLanguage(query.lang);
    $("#languageSetting").css("display", "inline");
  }

  Language.setLanguageInMenu();

  $("#languageSelect").val(Language.getCurrentLanguage()).prop("selected", true);
}

async function changeLanguage(id) {
  await Language.setLanguage($(`#${id}`).val());
  Language.setLanguageInMenu();
}

/**
 * 연도 프리셋 버튼 초기화
 */
function initDatePresetButton() {
  const startYear = SERVICE_START_DATE_STRING.split("-")[0];
  const nowYear = new Date().getFullYear();

  for (let targetYear = startYear; targetYear <= nowYear; targetYear++) {
    const startDate = targetYear == startYear ? SERVICE_START_DATE_STRING : `${targetYear}-01-01`;
    const endDate = targetYear == nowYear ? Utility.getToday() : `${targetYear}-12-31`;

    // 프리셋 버튼 추가
    const presetButton = $("<input>", {
      type: "button",
      id: `presetButton_${targetYear}`,
      value: targetYear,
      class: "DatePresetButton",
      click: withUpdateTable(() =>
        setAllBaseDate("baseStartDate", startDate, "baseEndDate", endDate)
      ),
    });

    $(`#datePresetField`).append(presetButton);
  }
}

/**
 * 체크박스 동작 설정
 */
function setViewCheckboxSetting() {
  // 전체 체크 클릭 시
  $("input[type='checkbox'][name='showCardAllTypeChk']").on(
    "change",
    withUpdateTable((e) => {
      const target = e.currentTarget;
      if ($(target).is(":checked")) {
        $("input[type='checkbox'][name='showCardCategoryChk']").prop("checked", true);
      } else {
        $("input[type='checkbox'][name='showCardCategoryChk']").prop("checked", false);
      }
    })
  );

  // 카드타입을 모두 선택 했을 시, 전체 체크 버튼을 체크
  // 카드타입이 하나라도 빠졌을 시, 전체 체크 버튼을 체크해제
  $("input[type='checkbox'][name='showCardCategoryChk']").on(
    "change",
    withUpdateTable(() => {
      const showCardCategoryChk = $("input[type='checkbox'][name='showCardCategoryChk']");
      const isAllChecked =
        showCardCategoryChk.length == showCardCategoryChk.filter(":checked").length;

      $("input[type='checkbox'][name='showCardAllTypeChk']").prop("checked", isAllChecked);
    })
  );
}

/**
 * P-SSR 표시
 */
function setPSsr() {
  const buttonId = "pSsrButton";
  const buttonClassName = "PButton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_SSR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.P_SSR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.P_SSR, buttonId, buttonClassName);
  }
}

/**
 * S-SSR 표시
 */
function setSSsr() {
  const buttonId = "sSsrButton";
  const buttonClassName = "SButton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_SSR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.S_SSR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.S_SSR, buttonId, buttonClassName);
  }
}

/**
 * P-SR 표시
 */
function setPSr() {
  const buttonId = "pSrButton";
  const buttonClassName = "PButton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_SR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.P_SR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.P_SR, buttonId, buttonClassName);
  }
}

/**
 * S-SR 표시
 */
function setSSr() {
  const buttonId = "sSrButton";
  const buttonClassName = "SButton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_SR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.S_SR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.S_SR, buttonId, buttonClassName);
  }
}

/**
 * P-UR 표시
 */
function setPUr() {
  const buttonId = "pUrButton";
  const buttonClassName = "PButton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_UR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.P_UR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.P_UR, buttonId, buttonClassName);
  }
}

/**
 * S-UR 표시
 */
function setSUr() {
  const buttonId = "sUrButton";
  const buttonClassName = "SButton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_UR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.S_UR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.S_UR, buttonId, buttonClassName);
  }
}

function convertShowCardCount() {
  if ($("#showCardCountConvertBtn").is(":checked")) {
    $(".cardCountTrClass").css("display", "");
  } else {
    $(".cardCountTrClass").css("display", "none");
  }
}

function updateStartBaseDate() {
  const serviceStartDate = new Date(SERVICE_START_DATE_STRING);
  const baseStartDate = new Date($("#baseStartDate").val());
  const baseEndDate = new Date($("#baseEndDate").val());

  // 시작일이 유효하지 않은 경우 서비스 개시일로 변경
  if (isNaN(baseStartDate.getTime())) {
    $("#baseStartDate").val(SERVICE_START_DATE_STRING);
  }

  // 시작일 변경 시 종료일 이후로 할 수 없음
  if (baseStartDate.getTime() > baseEndDate.getTime()) {
    $("#baseStartDate").val($("#baseEndDate").val());
  }

  // 시작일이 서비스 개시일보다 이전의 경우, 서비스 개시일로 변경
  if (baseStartDate.getTime() < serviceStartDate.getTime()) {
    $("#baseStartDate").val(SERVICE_START_DATE_STRING);
  }
}

function updateEndBaseDate() {
  const baseStartDate = new Date($("#baseStartDate").val());
  const baseEndDate = new Date($("#baseEndDate").val());

  // 종료일이 유효하지 않은 경우 현재 날짜로 변경
  if (isNaN(baseEndDate.getTime())) {
    $("#baseEndDate").val(Utility.getToday());
  }

  // 종료일 변경 시 시작일 이전으로 할 수 없음
  if (baseStartDate.getTime() > baseEndDate.getTime()) {
    $("#baseEndDate").val($("#baseStartDate").val());
  }
}

/**
 * 기준일을 재설정
 */
function setBaseDate(id, inputDate) {
  $(`#${id}`).val(inputDate);
}

/**
 * 시작일 / 종료일을 모두 재설정
 */
function setAllBaseDate(startId, startInputDate, endId, endInputDate) {
  $(`#${startId}`).val(startInputDate);
  $(`#${endId}`).val(endInputDate);
}
