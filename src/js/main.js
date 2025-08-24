import IdolData from "./idolData.js";
import ChangeCardLapInfo from "./changeCardLapInfo.js";
import CardRarityInfo from "./cardRarityInfo.js";
import CardTypeInfo from "./cardTypeInfo.js";
import Language from "./language.js";

import { SERVICE_START_DATE_STRING, CARD_RARITY_TYPE } from "./constant.js";

import * as Utility from "./utility.js";
import * as MainTable from "./mainTable.js";
import * as RankTable from "./rankTable.js";

$(function () {
  init();
});

/**
 * 초기화
 */
async function init() {
  await IdolData.init();
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
  setCardTypeCountList();
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
      class: "Resetbutton",
      click: () => {
        ChangeCardLapInfo.reset();
        updateDate();
      },
    })
  );

  // 시작일 리셋 버튼
  $("#baseStartSpan").append(
    $("<input>", {
      type: "button",
      id: "baseStartDateResetButton",
      value: "Reset",
      class: "Resetbutton",
      click: () => baseDateReset("baseStartDate", SERVICE_START_DATE_STRING),
    })
  );

  // 종료일 리셋 버튼
  $("#baseEndSpan").append(
    $("<input>", {
      type: "button",
      id: "baseEndDateResetButton",
      value: "Reset",
      class: "Resetbutton",
      click: () => baseDateReset("baseEndDate", Utility.getToday()),
    })
  );
}

/**
 * 각 버튼의 이벤트를 바인딩
 */
function setEventHandler() {
  // 카드 레어도 선택 버튼
  $("#pUrButton").on("click", () => setPUr());
  $("#sUrButton").on("click", () => setSUr());
  $("#pSsrButton").on("click", () => setPSsr());
  $("#sSsrButton").on("click", () => setSSsr());
  $("#pSrButton").on("click", () => setPSr());
  $("#sSrButton").on("click", () => setSSr());

  // 스크린샷 버튼
  $("#tableScreenCaptureButton").on("click", () => captureScreen("TABLE"));
  $("#rankScreenCaptureButton").on("click", () => captureScreen("RANK"));

  // 시작일 변경
  $("#baseStartDate").on("change", () => updateStartBaseDate());

  // 종료일 변경
  $("#baseEndDate").on("change", () => updateEndBaseDate());

  // 카드 수 표시
  $("#showCardCountConvertBtn").on("change", () => convertShowCardCount());

  // 카드 차수 변경 표시
  $("#showChangeCardLapConvertBtn").on("change", () => updateDate());

  // 언어 변경 선택 버튼
  $("#languageSelect").on("change", async () => await changeLanguage("languageSelect"));

  // 페스 일러 표시
  $("#fesImgConvertBtn").on("change", () => updateDate());

  // 카드 타입 체크박스 설정
  setViewCheckboxSetting();
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
  updateDate();
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
      click: () => setBaseDate("baseStartDate", startDate, "baseEndDate", endDate),
    });

    $(`#datePresetField`).append(presetButton);
  }
}

/**
 * 체크박스 동작 설정
 */
function setViewCheckboxSetting() {
  // 전체 체크 클릭 시
  $("input[type='checkbox'][name='showCardAllTypeChk']").on("change", function () {
    if ($(this).is(":checked")) {
      $("input[type='checkbox'][name='showCardTypeChk']").prop("checked", true);
    } else {
      $("input[type='checkbox'][name='showCardTypeChk']").prop("checked", false);
    }
    updateDate();
  });

  // 카드타입을 모두 선택 했을 시, 전체 체크 버튼을 체크
  // 카드타입이 하나라도 빠졌을 시, 전체 체크 버튼을 체크해제
  $("input[type='checkbox'][name='showCardTypeChk']").on("change", function () {
    const showCardTypeChk = $("input[type='checkbox'][name='showCardTypeChk']");
    const isAllChecked = showCardTypeChk.length == showCardTypeChk.filter(":checked").length;

    $("input[type='checkbox'][name='showCardAllTypeChk']").prop("checked", isAllChecked);

    updateDate();
  });

  // 표시 옵션 클릭
  $("input[type='checkbox'][name='viewOptionChk']").on("change", function () {
    updateDate();
  });
}

/**
 * P-SSR 표시
 */
function setPSsr() {
  const buttonId = "pSsrButton";
  const buttonClassName = "Pbutton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_SSR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.P_SSR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.P_SSR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * S-SSR 표시
 */
function setSSsr() {
  const buttonId = "sSsrButton";
  const buttonClassName = "Sbutton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_SSR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.S_SSR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.S_SSR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * P-SR 표시
 */
function setPSr() {
  const buttonId = "pSrButton";
  const buttonClassName = "Pbutton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_SR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.P_SR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.P_SR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * S-SR 표시
 */
function setSSr() {
  const buttonId = "sSrButton";
  const buttonClassName = "Sbutton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_SR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.S_SR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.S_SR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * P-UR 표시
 */
function setPUr() {
  const buttonId = "pUrButton";
  const buttonClassName = "Pbutton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_UR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.P_UR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.P_UR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * S-UR 표시
 */
function setSUr() {
  const buttonId = "sUrButton";
  const buttonClassName = "Sbutton";

  if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_UR)) {
    CardRarityInfo.updateSelectOff(CARD_RARITY_TYPE.S_UR, buttonId, buttonClassName);
  } else {
    CardRarityInfo.updateSelectOn(CARD_RARITY_TYPE.S_UR, buttonId, buttonClassName);
  }

  updateDate();
}

export function updateDate() {
  CardTypeInfo.init();

  // 선택한 레어리티 정보를 취득
  const selectedRarity = CardRarityInfo.getSelectedCardRarity();

  const idolData = selectedRarity.length != 0 ? getSelectedCardDataInfo(selectedRarity) : undefined;

  // 페스 일러스트로 표시 체크 박스의 선택가능/불가능을 설정
  const ps = selectedRarity.filter((v) => v.ps == "p").length > 0 ? "p" : "s";

  changeForFesImgConvertButton(ps);

  // 메인표 작성
  MainTable.createMainTable(idolData);

  // 랭킹표 작성
  RankTable.createRankTable(idolData);

  Language.setLanguageById("#NOTE_SPACE", `${ps}FirstImplementNote`);

  // 선택한 레어리티가 없는 경우, 하단 메세지를 표시하지 않음
  if (selectedRarity.length == 0) {
    $("#NOTE_SPACE").empty();
  }

  setCardTypeCountList();
}

function getSelectedCardDataInfo(selectedRarity) {
  // 선택한 레어리티의 타이틀을 모두 취득
  const tableTitleList = selectedRarity.map((v) => v.title);

  // 선택 레어리티의 카드리스트를 취득
  const selectedCardData = mergeCardData();

  return {
    titleList: tableTitleList,
    data: selectedCardData,
  };
}

function setCardTypeCountList() {
  const cardTypeInfo = CardTypeInfo.getAllCardTypeNumber();

  Object.keys(cardTypeInfo).forEach((key) => {
    $(`#cardCount_${key}`).text(CardTypeInfo.getCardTypeNumber(key));
  });
}

function convertShowCardCount() {
  if ($("#showCardCountConvertBtn").is(":checked")) {
    cssDisplayOn("#cardCountTr");
  } else {
    cssDisplayOff("#cardCountTr");
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

  updateDate();
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

  updateDate();
}

/**
 * 기준일을 재설정
 */
function baseDateReset(id, inputDate) {
  $(`#${id}`).val(inputDate);
  updateDate();
}

/**
 * 시작일 / 종료일을 모두 재설정
 */
function setBaseDate(startId, startInputDate, endtId, endInputDate) {
  $(`#${startId}`).val(startInputDate);
  $(`#${endtId}`).val(endInputDate);

  updateDate();
}

/**
 * 표시 일러스트 변경 (사복 - 페스)
 * S의 경우 사복으로 고정
 */
function changeForFesImgConvertButton(ps) {
  if (ps == "p") {
    $("#fesImgConvertBtn").prop("disabled", false);
  } else if (ps == "s") {
    $("#fesImgConvertBtn").prop("checked", false);
    $("#fesImgConvertBtn").prop("disabled", true);
  }
}

/**
 * 조건에 해당되는 카드를 Filter, Sort 후 리스트로 Return
 */
function getCardList(cardAry) {
  const cardTypeCheckBoxes = {
    permanent: "permanentCardChkBox",
    limited: "limitedCardChkBox",
    twilight: "twilightCardChkBox",
    mysongs: "mysongsCardChkBox",
    parallel: "parallelCardChkBox",
    event: "eventCardChkBox",
    fes: "gradeFesCardChkBox",
    campaign: "campaignCardChkBox",
    other: "otherCardChkBox",
  };

  return (
    cardAry
      .map((card, idx) => {
        const cardType = card.cardType;
        if (cardType == "first" && idx == 0 && !$("#noShowRCardConvertBtn").is(":checked")) {
          return card;
        }

        // VIEW_SELECT의 체크 타입 체크에 맞춰 데이터를 Return
        if (cardTypeCheckBoxes[cardType] && $(`#${cardTypeCheckBoxes[cardType]}`).is(":checked")) {
          return card;
        }
      })
      // 존재하지 않는 데이터 제거
      .filter((v) => v)
      .filter(
        (v) =>
          v.cardType == "first" ||
          (new Date(v.cardDate) >= new Date($("#baseStartDate").val()) &&
            new Date(v.cardDate) <= new Date($("#baseEndDate").val()))
      )
      .sort((a, b) => {
        // 오래된 순으로 정렬
        return Utility.compareByCardDateAsc(a.cardDate, b.cardDate);
      })
  );
}

/**
 * 전체 카드의 데이터를 추출, 재가공
 */
function mergeCardData() {
  const idolData = IdolData.getIdolData();
  return idolData.map((idol) => {
    let firstList = [];
    let tempCardList = [];

    // P UR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_UR)) {
      const idolList = [...idol.P_UR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // P SSR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_SSR)) {
      const idolList = [...idol.P_SSR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // P SR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_SR)) {
      const idolList = [...idol.P_SR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S UR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_UR)) {
      const idolList = [...idol.S_UR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S SSR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_SSR)) {
      const idolList = [...idol.S_SSR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S SR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_SR)) {
      const idolList = [...idol.S_SR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // 첫실장 데이터가 복수 있을시, 최초의 첫실장만 취득
    const firstImplementation = firstList
      .filter((v) => v)
      .sort((a, b) => {
        return Utility.compareByCardDateAsc(a.cardDate, b.cardDate);
      })
      .shift();

    // 첫실장을 카드 리스트의 처음에 추가
    if (firstImplementation) {
      tempCardList.unshift(firstImplementation);
    }

    return {
      idolName: idol[`idol${Utility.changeUpperFirst(Language.getCurrentLanguage())}Name`],
      displayRanking: idol.displayRanking,
      cardData: getCardList(tempCardList),
    };
  });
}

/**
 * 표 캡쳐, 다운로드 처리
 */
function captureScreen(frameName) {
  // 선택된 표시 타입이 하나도 없는 경우 스킵
  if (CardRarityInfo.isAllNotSelectedCardRarity()) {
    return;
  }

  const frameMap = { TABLE: "#CAPTURE_FRAME", RANK: "#RANK" };
  const frameId = frameMap[frameName] || "";

  const nowChangeLapFlag = $(`#showChangeCardLapConvertBtn`).is(":checked");

  if (nowChangeLapFlag) {
    $(`#showChangeCardLapConvertBtn`).prop("checked", false);
    updateDate();
  }

  const captureName = getCaptureFileName(frameName);

  $(frameId).css("overflow", "hidden");
  cssDisplayOff("#convertSpan");

  $("#baseStartDateStr").text(Utility.getISODateById("#baseStartDate"));
  cssDisplayOff("#baseStartSpan");
  cssDisplayOn("#baseStartDateStr");

  $("#baseEndDateStr").text(Utility.getISODateById("#baseEndDate"));
  cssDisplayOff("#baseEndSpan");
  cssDisplayOn("#baseEndDateStr");

  cssDisplayOff("#CAPTURE_BUTTON");
  cssDisplayOff("#VIEW_OPTION");
  cssDisplayOff("#ALL_TYPE_SELECT");
  cssDisplayOff("#DATE_PRESET");

  // 라이브러리를 읽은 후 표를 캡쳐해서 다운로드
  // 캡쳐에 사용하는 라이브러리는 캡쳐 동작에만 사용하기 때문에 해당 동작할때만 읽기 처리를 수행
  loadHtml2Canvas()
    .done(function (html2canvas) {
      html2canvas(document.querySelector(frameId), {
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
      })
        .then((canvas) => {
          const dataURL = canvas.toDataURL("image/png");
          downloadURI(dataURL, captureName);
        })
        .catch((err) => {
          console.error("html2canvas rendering failed:", err);
        });
    })
    .fail(function (err) {
      console.error("Failed to load html2canvas:", err);
    });

  if (nowChangeLapFlag) {
    $(`#showChangeCardLapConvertBtn`).prop("checked", nowChangeLapFlag);
    updateDate();
  }

  $(frameId).css("overflow", "");
  cssDisplayOn("#convertSpan");

  cssDisplayOn("#baseStartSpan");
  cssDisplayOff("#baseStartDateStr");

  cssDisplayOn("#baseEndSpan");
  cssDisplayOff("#baseEndDateStr");

  cssDisplayOn("#CAPTURE_BUTTON");
  cssDisplayOn("#VIEW_OPTION");
  cssDisplayOn("#ALL_TYPE_SELECT");
  cssDisplayOn("#DATE_PRESET");
}

function cssDisplayOn(id) {
  $(id).css("display", "");
}

function cssDisplayOff(id) {
  $(id).css("display", "none");
}

function downloadURI(uri, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = uri;
  link.click();
}

function getCaptureFileName(name) {
  const d = new Date();

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");

  return `${name}_${yyyy}${mm}${dd}${hh}${mi}${ss}${ms}.png`;
}

/**
 * html2canvas 라이브러리를 읽기
 */
function loadHtml2Canvas() {
  const deferred = $.Deferred();

  if (window.html2canvas) {
    deferred.resolve(window.html2canvas);
  } else {
    $.getScript("https://html2canvas.hertzen.com/dist/html2canvas.min.js")
      .done(function () {
        deferred.resolve(window.html2canvas);
      })
      .fail(function () {
        deferred.reject(new Error("Failed to load html2canvas"));
      });
  }

  return deferred.promise();
}
