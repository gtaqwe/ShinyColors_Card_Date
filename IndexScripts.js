var NOW_SELECT = 0;
var JSON_DATA;
var VIEW_LANGUAGE;
var IDOL_TOTAL_COUNT;
const DEFALUT_LANGUAGE = "ko";
const CARD_TYPE_CHAR = {
  permanent: "P",
  limited: "L",
  twilight: "Tw",
  mysongs: "My",
  parallel: "Pa",
  event: "E",
  fes: "F",
  campaign: "C",
  other: "O",
};
const GACHA_CATEGORY_COUNT = Object.keys(CARD_TYPE_CHAR).length;

// 카드 차수 변경 데이터의 배열
var TABLE_BLANK_LAP_LIST;

// 통상, 한정, 트와코레, 마이코레, 이벤트, 페스, 캠페인, 기타
var CARD_TYPE_COUNT_LIST = Array(GACHA_CATEGORY_COUNT).fill(0);

$().ready(function () {
  init();
});

// document.body.addEventListener("onload", init());

async function init() {
  await getJSON("json/data.json").then(function (resp) {
    JSON_DATA = JSON.parse(resp);
  });

  IDOL_TOTAL_COUNT = JSON_DATA.length;
  TABLE_BLANK_LAP_LIST = Array(IDOL_TOTAL_COUNT).fill(0);

  NOW_SELECT = 0;
  // 초기 기준일
  // Start : 서비스 개시일
  // End : 오늘
  $("#BaseStartDate").val("2018-04-24");
  $("#BaseEndDate").val(getToday());

  VIEW_LANGUAGE = getLanguage();

  // 지원하는 언어가 아닌 경우 한국어로 표시
  if (!(VIEW_LANGUAGE in $.lang)) VIEW_LANGUAGE = DEFALUT_LANGUAGE;

  // 수동으로 언어 설정시 선택한 언어로 표시
  if (getQuery() !== undefined && getQuery().lang !== undefined && getQuery().lang !== "") {
    if (getQuery().lang in $.lang) {
      VIEW_LANGUAGE = getQuery().lang;
      $("#languageSetting").css("display", "inline");
    }
  }
  setLanguage(VIEW_LANGUAGE);
  $("#languageSelect").val(VIEW_LANGUAGE).prop("selected", true);

  setViewCheckboxSetting();

  readTableBlankLapList();

  // 카드 수 리셋
  setCardTypeCountList();
  convertShowCardCount();

  // 연도 프리셋 추가
  initDatePresetButton();
}

/**
 * JSON 데이터 읽기
 */
function getJSON(jsonFile) {
  try {
    return new Promise(function (resolve, reject) {
      var request = new XMLHttpRequest();
      request.open("GET", jsonFile, true);
      request.onload = function () {
        if (request.status == 200) {
          resolve(request.responseText);
        } else {
          reject(Error(request.statusText));
        }
      };

      request.onerror = function () {
        reject(Error("Error fetching data."));
      };
      request.send();
    });
  } catch (err) {
    console.error(err);
  }
}

/**
 * 브라우저 언어 설정 Return
 */
function getLanguage() {
  return (navigator.language || navigator.userLanguage).substr(0, 2);
}

function setLanguage(currLang) {
  $("[data-lang]").each(function () {
    $(this).html($.lang[currLang][$(this).data("lang")]);
  });
}

function setLanguageById(currLang, id, str) {
  $(id).html($.lang[currLang][str]);
}

function setLanguageInTable(currLang, tableName) {
  $(`#${tableName} [data-lang]`).each(function () {
    $(this).html($.lang[currLang][$(this).data("lang")]);
  });
}

function changeLanguage() {
  VIEW_LANGUAGE = $("#languageSelect").val();
  setLanguage(VIEW_LANGUAGE);
  updateDate(NOW_SELECT);
}

/**
 * URL의 쿼리를 Object형식으로 취득
 * ~~/?a=a1&b=ab2 -> {a: a1, b: ab2}
 */
function getQuery() {
  var url = document.location.href;
  if (url.indexOf("?") == -1) return;

  var qs = url.substring(url.indexOf("?") + 1).split("&");
  for (var i = 0, result = {}; i < qs.length; i++) {
    qs[i] = qs[i].split("=");
    result[qs[i][0]] = decodeURIComponent(qs[i][1]);
  }
  return result;
}

/**
 * 당일 날짜를 yyyy-MM-dd 형식 String으로 Return
 */
function getToday() {
  var today = new Date();
  var nowYear = today.getFullYear();
  var nowMonth = today.getMonth() + 1;
  var nowDate = today.getDate();

  // yyyy-MM-dd 형식
  return (
    nowYear.toString() +
    "-" +
    nowMonth.toString().padStart(2, "0") +
    "-" +
    nowDate.toString().padStart(2, "0")
  );
}

/**
 * 카드 차수 변경이 True인 경우, localStorage에 저장된 데이터를 읽어서 반영
 * False인 경우, localStorage의 값을 반영하지 않음
 */
function readTableBlankLapList() {
  let nowChangeLapFlag = $(`#showChangeCardLapConvertBtn`).is(":checked");

  if (nowChangeLapFlag) {
    let localList = localStorage.getItem("TABLE_BLANK_LAP_LIST");
    if (localList !== null) {
      TABLE_BLANK_LAP_LIST = localList.split(",");
    }
  }
}

/**
 * 연도 프리셋 버튼 초기화
 */
function initDatePresetButton() {
  const startYear = 2018;
  const today = new Date();
  const nowYear = today.getFullYear();

  for (let i = 0; i < nowYear - startYear + 1; i++) {
    const targetYear = startYear + i;

    const startDate = `${targetYear}-01-01`;
    const endDate = targetYear == nowYear ? getToday() : `${targetYear}-12-31`;

    // 프리셋 버튼 추가
    $(`#datePresetField`).append(`
      <input
        type="button"
        value="${targetYear}"
        class="DatePresetButton"
        onclick="baseDateFullReset('BaseStartDate', '${startDate}','BaseEndDate', '${endDate}')"
      />`);
  }
}

/**
 * 체크박스 동작 설정
 */
function setViewCheckboxSetting() {
  // 전체 체크 클릭 시
  $("input:checkbox[name='showCardAllTypeChk']").click(function () {
    if ($("input:checkbox[name='showCardAllTypeChk']").is(":checked") == true) {
      $("input:checkbox[name='showCardTypeChk']").prop("checked", true);
    } else {
      $("input:checkbox[name='showCardTypeChk']").prop("checked", false);
    }
    updateDate(NOW_SELECT);
  });

  // 카드타입 클릭 시
  $("input:checkbox[name='showCardTypeChk']").click(function () {
    var allCnt = $("input:checkbox[name='showCardTypeChk']").length; // 카드타입 전체갯수
    var selCnt = $("input:checkbox[name='showCardTypeChk']:checked").length; // 카드타입 선택갯수

    if (allCnt == selCnt) {
      $("input:checkbox[name='showCardAllTypeChk']").prop("checked", true);
    } else {
      $("input:checkbox[name='showCardAllTypeChk']").prop("checked", false);
    }
    updateDate(NOW_SELECT);
  });

  // 표시 옵션 클릭
  $("input:checkbox[name='viewOptionChk']").click(function () {
    updateDate(NOW_SELECT);
  });
}

/**
 * TABLE_BLANK_LAP_LIST를 초기화(모든 데이터를 0으로 초기화)
 */
function resetTableBlankLapList() {
  TABLE_BLANK_LAP_LIST = Array(IDOL_TOTAL_COUNT).fill(0);
}

/**
 * TABLE_BLANK_LAP_LIST테이터를 localStorage에 저장
 */
function saveTableBlankLapListInStorage() {
  localStorage.setItem("TABLE_BLANK_LAP_LIST", TABLE_BLANK_LAP_LIST);
}

/**
 * localStorage를 Clear
 */
function clearStorage() {
  localStorage.clear();
}

/**
 * 카드 차수 변경 표시를 On/Off시의 동작
 * readTableBlankLapList를 실행 후
 * 표를 다시 읽기
 */
function changeCardLapConvertBtnValue() {
  readTableBlankLapList();

  updateDate(NOW_SELECT);
}

/**
 * 카드 차수 변경 표시를 초기화 했을 경우의 동작
 * localStorage를 Clear, TABLE_BLANK_LAP_LIST 초기화후
 * 표를 다시 읽기
 */
function clearTableBlankLapList() {
  clearStorage();

  resetTableBlankLapList();

  updateDate(NOW_SELECT);
}

/**
 * VIEW_SELECT의 표시타입 체크 변경
 * 0 : undefined
 * 1 : P-SSR
 * 2 : S-SSR
 * 3 : P-SR
 * 4 : S-SR
 * 5 : ALL
 * 6 : SSR
 * 7 : SR
 * 8 : P
 * 9 : S
 */
function updateDate(nowSelect) {
  resetCardTypeCountList();

  switch (nowSelect) {
    case 11:
      NOW_SELECT = 11;
      P_SSR();
      break;
    case 12:
      NOW_SELECT = 12;
      S_SSR();
      break;
    case 13:
      NOW_SELECT = 13;
      ALL_SSR();
      break;
    case 21:
      NOW_SELECT = 21;
      P_SR();
      break;
    case 22:
      NOW_SELECT = 22;
      S_SR();
      break;
    case 23:
      NOW_SELECT = 23;
      ALL_SR();
      break;
    case 31:
      NOW_SELECT = 31;
      ALL_P();
      break;
    case 32:
      NOW_SELECT = 32;
      ALL_S();
      break;
    case 33:
      NOW_SELECT = 33;
      ALL_CARD();
      break;
    case 41:
      NOW_SELECT = 41;
      P_UR();
      break;
    case 42:
      NOW_SELECT = 42;
      S_UR();
      break;
    case 43:
      NOW_SELECT = 43;
      ALL_UR();
      break;
  }

  setCardTypeCountList();
  convertShowCardCount();
}

// CARD_TYPE_COUNT_LIST를 리셋
function resetCardTypeCountList() {
  CARD_TYPE_COUNT_LIST = Array(CARD_TYPE_COUNT_LIST.length).fill(0);
}

// 카드 타입 확인 후 CARD_TYPE_COUNT_LIST에 카운트
function countCardType(cardType) {
  if (cardType == "permanent") {
    CARD_TYPE_COUNT_LIST[0] += 1;
  } else if (cardType == "limited") {
    CARD_TYPE_COUNT_LIST[1] += 1;
  } else if (cardType == "twilight") {
    CARD_TYPE_COUNT_LIST[2] += 1;
  } else if (cardType == "mysongs") {
    CARD_TYPE_COUNT_LIST[3] += 1;
  } else if (cardType == "parallel") {
    CARD_TYPE_COUNT_LIST[4] += 1;
  } else if (cardType == "event") {
    CARD_TYPE_COUNT_LIST[5] += 1;
  } else if (cardType == "fes") {
    CARD_TYPE_COUNT_LIST[6] += 1;
  } else if (cardType == "campaign") {
    CARD_TYPE_COUNT_LIST[7] += 1;
  } else if (cardType == "other") {
    CARD_TYPE_COUNT_LIST[8] += 1;
  }
}

function setCardTypeCountList() {
  $(cardCount_permanent).text(CARD_TYPE_COUNT_LIST[0]);
  $(cardCount_limited).text(CARD_TYPE_COUNT_LIST[1]);
  $(cardCount_twilight).text(CARD_TYPE_COUNT_LIST[2]);
  $(cardCount_mysongs).text(CARD_TYPE_COUNT_LIST[3]);
  $(cardCount_parallel).text(CARD_TYPE_COUNT_LIST[4]);
  $(cardCount_event).text(CARD_TYPE_COUNT_LIST[5]);
  $(cardCount_fes).text(CARD_TYPE_COUNT_LIST[6]);
  $(cardCount_campaign).text(CARD_TYPE_COUNT_LIST[7]);
  $(cardCount_other).text(CARD_TYPE_COUNT_LIST[8]);
}

function convertShowCardCount() {
  if ($(showCardCountConvertBtn).is(":checked")) {
    $(cardCountTR).css("display", "");
  } else {
    $(cardCountTR).css("display", "none");
  }
}

/**
 * 카드 표시 시작일과 종료일 비교
 * 시작일이 종료일보다 클 경우 시작일을 종료일로 변경
 */
function updateBaseDate(changedBase, nowSelect) {
  var serviceStartDate = new Date("2018-04-24");
  var baseStartDate = new Date($("#BaseStartDate").val());
  var baseEndDate = new Date($("#BaseEndDate").val());

  // 시작일 변경 시 종료일 이후로 할 수 없음
  if (changedBase == "start" && baseStartDate.getTime() > baseEndDate.getTime()) {
    $("#BaseStartDate").val($("#BaseEndDate").val());
  }

  // 종료일 변경 시 시작일 이전으로 할 수 없음
  if (changedBase == "end" && baseStartDate.getTime() > baseEndDate.getTime()) {
    $("#BaseEndDate").val($("#BaseStartDate").val());
  }

  // 시작일이 서비스 개시일보다 이전의 경우, 서비스 개시일로 변경
  if (baseStartDate.getTime() < serviceStartDate.getTime()) {
    $("#BaseStartDate").val("2018-04-24");
  }

  updateDate(nowSelect);
}

/**
 * 기준일을 재설정
 */
function baseDateReset(id, inputDate) {
  $(`#${id}`).val(inputDate);
  updateDate(NOW_SELECT);
}

/**
 * 시작일 / 종료일을 모두 재설정
 */
function baseDateFullReset(startId, startInputDate, endtId, endInputDate) {
  $(`#${startId}`).val(startInputDate);
  $(`#${endtId}`).val(endInputDate);
  updateDate(NOW_SELECT);
}

/**
 * 페스 이미지 세팅
 * (표, 프리뷰)
 */
function setFesImg() {
  updateDate(NOW_SELECT);
}

/**
 * 표시 일러스트 변경 (사복 - 페스)
 * S의 경우 사복으로 고정
 */
function CtlfesImgConvertBtn(ps) {
  if (ps == "p") {
    document.getElementById("fesImgConvertBtn").disabled = false;
  } else if (ps == "s") {
    document.getElementById("fesImgConvertBtn").checked = false;
    document.getElementById("fesImgConvertBtn").disabled = true;
  }
}

/**
 * P-UR 표시
 */
function P_UR() {
  const displayObj = {
    pUR: true,
    pSSR: false,
    pSR: false,
    sUR: false,
    sSSR: false,
    sSR: false,
  };
  const idolData = mergeCardData("P-UR", displayObj);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "pFirstImplementNote");
}

/**
 * S-UR 표시
 */
function S_UR() {
  const displayObj = {
    pUR: false,
    pSSR: false,
    pSR: false,
    sUR: true,
    sSSR: false,
    sSR: false,
  };
  const idolData = mergeCardData("S-UR", displayObj);
  CtlfesImgConvertBtn("s");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "sFirstImplementNote");
}

/**
 * P-SSR 표시
 */
function P_SSR() {
  const displayObj = {
    pUR: false,
    pSSR: true,
    pSR: false,
    sUR: false,
    sSSR: false,
    sSR: false,
  };
  const idolData = mergeCardData("P-SSR", displayObj);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "pFirstImplementNote");
}

/**
 * S-SSR 표시
 */
function S_SSR() {
  const displayObj = {
    pUR: false,
    pSSR: false,
    pSR: false,
    sUR: false,
    sSSR: true,
    sSR: false,
  };
  const idolData = mergeCardData("S-SSR", displayObj);
  CtlfesImgConvertBtn("s");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "sFirstImplementNote");
}

/**
 * P-SR 표시
 */
function P_SR() {
  const displayObj = {
    pUR: false,
    pSSR: false,
    pSR: true,
    sUR: false,
    sSSR: false,
    sSR: false,
  };
  const idolData = mergeCardData("P-SR", displayObj);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "pFirstImplementNote");
}

/**
 * S-SR 표시
 */
function S_SR() {
  const displayObj = {
    pUR: false,
    pSSR: false,
    pSR: false,
    sUR: false,
    sSSR: false,
    sSR: true,
  };
  const idolData = mergeCardData("S-SR", displayObj);
  CtlfesImgConvertBtn("s");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "sFirstImplementNote");
}

/**
 * 모든 카드 표시
 */
function ALL_CARD() {
  const displayObj = {
    pUR: true,
    pSSR: true,
    pSR: true,
    sUR: true,
    sSSR: true,
    sSR: true,
  };
  const idolData = mergeCardData("All", displayObj);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "allFirstImplementNote");
}

/**
 * 모든 UR 표시
 */
function ALL_UR() {
  const displayObj = {
    pUR: true,
    pSSR: false,
    pSR: false,
    sUR: true,
    sSSR: false,
    sSR: false,
  };
  const idolData = mergeCardData("UR", displayObj);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "allFirstImplementNote");
}

/**
 * 모든 SSR 표시
 */
function ALL_SSR() {
  const displayObj = {
    pUR: false,
    pSSR: true,
    pSR: false,
    sUR: false,
    sSSR: true,
    sSR: false,
  };
  const idolData = mergeCardData("SSR", displayObj);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "allFirstImplementNote");
}

/**
 * 모든 SR 표시
 */
function ALL_SR() {
  const displayObj = {
    pUR: false,
    pSSR: false,
    pSR: true,
    sUR: false,
    sSSR: false,
    sSR: true,
  };
  const idolData = mergeCardData("SR", displayObj);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "allFirstImplementNote");
}

/**
 * 모든 P 표시
 */
function ALL_P() {
  const displayObj = {
    pUR: true,
    pSSR: true,
    pSR: true,
    sUR: false,
    sSSR: false,
    sSR: false,
  };
  const idolData = mergeCardData("P", displayObj);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "pFirstImplementNote");
}

/**
 * 모든 S 표시
 */
function ALL_S() {
  const displayObj = {
    pUR: false,
    pSSR: false,
    pSR: false,
    sUR: true,
    sSSR: true,
    sSR: true,
  };
  const idolData = mergeCardData("S", displayObj);
  CtlfesImgConvertBtn("s");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "sFirstImplementNote");
}

/**
 * 조건에 해당되는 카드를 Filter, Sort 후 리스트로 Return
 */
function getCardList(cardAry) {
  return (
    cardAry
      .map((card, idx) => {
        var cardType = card.card_type;
        if (cardType == "first" && idx == 0 && !$(noShowRCardConvertBtn).is(":checked")) {
          return card;
        }

        // VIEW_SELECT의 체크 타입 체크에 맞춰 데이터를 Return
        if (cardType == "permanent" && $("#permanentCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "limited" && $("#limitedCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "twilight" && $("#twilightCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "mysongs" && $("#mysongsCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "parallel" && $("#parallelCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "event" && $("#eventCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "fes" && $("#gradeFesCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "campaign" && $("#campaignCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "other" && $("#otherCardChkBox").is(":checked")) {
          return card;
        }
      })
      // undefined 데이터 제거
      .filter((v) => v !== undefined)
      .filter(
        (v) =>
          v.card_type == "first" ||
          (new Date(v.card_date) >= new Date($("#BaseStartDate").val()) &&
            new Date(v.card_date) <= new Date($("#BaseEndDate").val()))
      )
      // 오래된 순으로 정렬
      // 단순 비교로 정렬하는 경우
      // 브라우저 차이로 인한 표시의 차이가 있을 가능성이 있기에 「<」, 「>」, 「=」를 모두 확인
      .sort((a, b) => {
        if (a.card_date < b.card_date) {
          return -1;
        } else if (a.card_date > b.card_date) {
          return 1;
        } else {
          return 0;
        }
      })
  );
}

/**
 * 전체 카드의 데이터를 추출, 재가공
 */
function mergeCardData(tableTitle, displayObj) {
  const pUR = displayObj.pUR;
  const sUR = displayObj.sUR;
  const pSSR = displayObj.pSSR;
  const sSSR = displayObj.sSSR;
  const pSR = displayObj.pSR;
  const sSR = displayObj.sSR;

  var totalList = JSON_DATA.map((idol) => {
    var firstList = [];
    var tempCardList = [];

    // P UR
    if (pUR) {
      let idolList = [...idol.P_UR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // P SSR
    if (pSSR) {
      let idolList = [...idol.P_SSR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // P SR
    if (pSR) {
      let idolList = [...idol.P_SR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S UR
    if (sUR) {
      let idolList = [...idol.S_UR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S SSR
    if (sSSR) {
      let idolList = [...idol.S_SSR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S SR
    if (sSR) {
      let idolList = [...idol.S_SR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // 첫실장 데이터가 복수 있을시, 최초의 첫실장만 취득
    let firstImplementation = firstList
      .filter((v) => v)
      .sort((a, b) => {
        // card_date가 존재하지 않는 경우, 마지막에 위치하도록 처리
        aDate = new Date(a.card_date ? a.card_date : 8640000000000000);
        bDate = new Date(b.card_date ? b.card_date : 8640000000000000);

        if (aDate < bDate) {
          // a가 b보다 이전
          return -1;
        } else if (aDate > bDate) {
          // a가 b보다 이후
          return 1;
        } else {
          return 0;
        }
      })
      .shift();

    // 첫실장을 카드 리스트의 처음에 추가
    tempCardList.unshift(firstImplementation);

    var cardList = getCardList(tempCardList);

    // 이름 언어 : idol_(ko, ja, en)_name
    var idolName = idol.idol_ko_name;
    if (VIEW_LANGUAGE == "ja") {
      idolName = idol.idol_ja_name;
    }

    var obj = {
      idol_name: idolName,
      display_ranking: idol.display_ranking,
      card_data: cardList,
    };

    return obj;
  });

  // 표시할 데이터
  // Title : 카드 타입 (P-SSR, S-SSR, P-SR, S-SR)
  // Data : 표시할 카드 데이터
  var selectedData = {
    Title: tableTitle,
    Data: totalList,
  };

  return selectedData;
}

//////////////////////////////////////////////////

/**
 * 마우스 포인트 위치에 따라 이미지 프리뷰
 */
function imgMapping() {
  /* CONFIG */

  var xOffset = 10;
  var yOffset = 20;
  var imgWidth = 320;
  var imgHeight = 180;

  // these 2 variable determine popup's distance from the cursor
  // you might want to adjust to get the right result

  /* END CONFIG */

  // 마우스 포인트가 위치한 셀에 해당하는 일러스트의 프리뷰 표시
  $("#date-table td").hover(
    function (e) {
      var imgAddrAttr = $(this).closest("td").attr("addr"); // 이미지 파일명
      var imgNameAttr = $(this).closest("td").attr("name"); // 카드명
      var fesChk = $("#fesImgConvertBtn").is(":checked"); // 페스 일러스트 표시 모드
      var psType = $(this).closest("td").attr("ps"); // 카드명

      var imgPath;
      // 일러 패스 지정
      if (psType == "p") {
        // 프로듀스 일러
        imgPath = "produce_idol";
        if (fesChk) {
          // 페스 일러
          imgPath += "/fes_card";
        } else {
          // 사복 일러
          imgPath += "/card";
        }
      } else {
        // 서포트 일러
        imgPath = "support_idol/card";
      }

      // 카드명이 없는 경우 일러스트 프리뷰를 표시하지 않음
      if (imgNameAttr) {
        $("body").append(
          `<p id="preview"><img src="${getImgSrc(
            imgPath,
            imgAddrAttr
          )}" width="${imgWidth}" height="${imgHeight}" onerror = "this.src='./img/assets/Blank_Card.png'"><br>${imgNameAttr}</p>`
        );
        $("#preview")
          .css("top", e.pageY - xOffset + "px")
          .css("left", e.pageX + yOffset + "px")
          .fadeIn("fast");
      }
    },
    // 마우스 포인트가 해당 셀에 위치하지 않으면 비표시
    function () {
      $("#preview").remove();
    }
  );

  // 마우스 포인트 위치에 따라 프리뷰 이동
  $("#date-table td").mousemove(function (e) {
    var previewWidth = $("#preview").width();
    var previewHeight = $("#preview").height();

    if (e.pageY + previewHeight > $(window).innerHeight() + $(document).scrollTop()) {
      $("#preview").css("top", e.pageY - xOffset - previewHeight + "px");
    } else {
      $("#preview").css("top", e.pageY - xOffset + "px");
    }

    if (e.pageX + previewWidth > $(window).innerWidth() + $(document).scrollLeft()) {
      $("#preview").css("left", e.pageX - yOffset - previewWidth + "px");
    } else {
      $("#preview").css("left", e.pageX + yOffset + "px");
    }

    if (
      e.pageY + previewHeight > $(window).innerHeight() + $(document).scrollTop() &&
      e.pageX + previewWidth > $(window).innerWidth() + $(document).scrollLeft()
    ) {
      $("#preview")
        .css("top", e.pageY - xOffset - previewHeight - xOffset + "px")
        .css("left", e.pageX - yOffset - previewWidth + "px");
    }
  });
}

function getImgSrc(path, addr) {
  return `./img/${path}/${addr}.png`;
}

//////////////////////////////////////////////////

/**
 * 표 캡쳐, 다운로드 처리
 */
function captureScreen(frameName) {
  if (NOW_SELECT != 0) {
    var captureName;
    var frameId;
    var viewMode = "";

    let nowChangeLapFlag = $(`#showChangeCardLapConvertBtn`).is(":checked");

    if (nowChangeLapFlag == true) {
      $(`#showChangeCardLapConvertBtn`).prop("checked", false);
      updateDate(NOW_SELECT);
    }

    if (frameName == "TABLE") frameId = "#CAPTURE_FRAME";
    else if (frameName == "RANK") frameId = "#RANK";

    if ($("#permanentCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.permanent;
    if ($("#limitedCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.limited;
    if ($("#twilightCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.twilight;
    if ($("#mysongsCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.mysongs;
    if ($("#parallelCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.parallel;
    if ($("#eventCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.event;
    if ($("#gradeFesCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.fes;
    if ($("#campaignCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.campaign;
    if ($("#otherCardChkBox").is(":checked")) viewMode += CARD_TYPE_CHAR.other;

    switch (NOW_SELECT) {
      case 11:
        captureName = frameName + "_P_SSR_" + viewMode + ".png";
        break;
      case 12:
        captureName = frameName + "_S_SSR_" + viewMode + ".png";
        break;
      case 13:
        captureName = frameName + "_SSR_" + viewMode + ".png";
        break;
      case 21:
        captureName = frameName + "_P_SR_" + viewMode + ".png";
        break;
      case 22:
        captureName = frameName + "_S_SR_" + viewMode + ".png";
        break;
      case 23:
        captureName = frameName + "_SR_" + viewMode + ".png";
        break;
      case 31:
        captureName = frameName + "_P_" + viewMode + ".png";
        break;
      case 32:
        captureName = frameName + "_S_" + viewMode + ".png";
        break;
      case 33:
        captureName = frameName + "_ALL_" + viewMode + ".png";
        break;
      case 41:
        captureName = frameName + "_P_UR_" + viewMode + ".png";
        break;
      case 42:
        captureName = frameName + "_S_UR_" + viewMode + ".png";
        break;
      case 43:
        captureName = frameName + "_UR_" + viewMode + ".png";
        break;
    }

    $(frameId).css("overflow", "hidden");
    $("#convertSpan").css("display", "none");

    $("#BaseStartDateStr").text(getBaseDate("#BaseStartDate"));
    $("#BaseStartSpan").css("display", "none");
    $("#BaseStartDateStr").css("display", "");

    $("#BaseEndDateStr").text(getBaseDate("#BaseEndDate"));
    $("#BaseEndSpan").css("display", "none");
    $("#BaseEndDateStr").css("display", "");

    $("#ALL_TYPE_SELECT").css("display", "none");
    $("#DATE_PRESET").css("display", "none");

    html2canvas(document.querySelector(frameId), {
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
    }).then((canvas) => {
      downloadURI(canvas.toDataURL("image/png"), captureName);
    });

    if (nowChangeLapFlag == true) {
      $(`#showChangeCardLapConvertBtn`).prop("checked", nowChangeLapFlag);
      updateDate(NOW_SELECT);
    }

    $(frameId).css("overflow", "");
    $("#convertSpan").css("display", "");

    $("#BaseStartSpan").css("display", "");
    $("#BaseStartDateStr").css("display", "none");

    $("#BaseEndSpan").css("display", "");
    $("#BaseEndDateStr").css("display", "none");

    $("#ALL_TYPE_SELECT").css("display", "");
    $("#DATE_PRESET").css("display", "");
  }
}

function downloadURI(uri, filename) {
  var link = document.createElement("a");
  link.download = filename;
  link.href = uri;
  link.click();
}
