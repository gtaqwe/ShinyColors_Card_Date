var NOW_SELECT = 0;
var JSON_DATA;
var VIEW_LANGUAGE;
const DEFALUT_LANGUAGE = "ko";
const IDOL_TOTAL_COUNT = 25;

// 통상, 한정, 트와코레, 마이코레, 이벤트, 페스, 캠페인, 기타
var CARD_TYPE_COUNT_LIST = [0, 0, 0, 0, 0, 0, 0, 0];
var TABLE_BLANK_LAP_LIST = Array(IDOL_TOTAL_COUNT).fill(0);

$().ready(function () {
  init();
});

// document.body.addEventListener("onload", init());

async function init() {
  await getJSON("json/data.json").then(function (resp) {
    JSON_DATA = JSON.parse(resp);
  });

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

  // 사복, 페스의상 토글
  getToggleString($("#fesImgConvertBtn").is(":checked"));

  readTableBlankLapList();

  // 카드 수 리셋
  setCardTypeCountList();
  convertShowCardCount();
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
  var fesChk = $("#fesImgConvertBtn").is(":checked");
  getToggleString(fesChk);
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

  if (nowSelect == 11) {
    NOW_SELECT = 11;
    P_SSR();
  } else if (nowSelect == 12) {
    NOW_SELECT = 12;
    S_SSR();
  } else if (nowSelect == 13) {
    NOW_SELECT = 13;
    ALL_SSR();
  } else if (nowSelect == 21) {
    NOW_SELECT = 21;
    P_SR();
  } else if (nowSelect == 22) {
    NOW_SELECT = 22;
    S_SR();
  } else if (nowSelect == 23) {
    NOW_SELECT = 23;
    ALL_SR();
  } else if (nowSelect == 31) {
    NOW_SELECT = 31;
    ALL_P();
  } else if (nowSelect == 32) {
    NOW_SELECT = 32;
    ALL_S();
  } else if (nowSelect == 33) {
    NOW_SELECT = 33;
    ALL_CARD();
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
  } else if (cardType == "event") {
    CARD_TYPE_COUNT_LIST[4] += 1;
  } else if (cardType == "fes") {
    CARD_TYPE_COUNT_LIST[5] += 1;
  } else if (cardType == "campaign") {
    CARD_TYPE_COUNT_LIST[6] += 1;
  } else if (cardType == "other") {
    CARD_TYPE_COUNT_LIST[7] += 1;
  }
}

function setCardTypeCountList() {
  $(cardCount_permanent).text(CARD_TYPE_COUNT_LIST[0]);
  $(cardCount_limited).text(CARD_TYPE_COUNT_LIST[1]);
  $(cardCount_twilight).text(CARD_TYPE_COUNT_LIST[2]);
  $(cardCount_mysongs).text(CARD_TYPE_COUNT_LIST[3]);
  $(cardCount_event).text(CARD_TYPE_COUNT_LIST[4]);
  $(cardCount_fes).text(CARD_TYPE_COUNT_LIST[5]);
  $(cardCount_campaign).text(CARD_TYPE_COUNT_LIST[6]);
  $(cardCount_other).text(CARD_TYPE_COUNT_LIST[7]);

  // if($(showCardCountConvertBtn).is(":checked"))
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
 * 페스 이미지 세팅
 * (표, 프리뷰)
 */
function setFesImg(fesChk) {
  getToggleString(fesChk);
  updateDate(NOW_SELECT);
}

/**
 * 사복과 페스 일러 토글 텍스트 표시
 */
function getToggleString(fesChk) {
  var str;
  if (fesChk == true) {
    str = "fes_1";
  } else {
    str = "casual";
  }
  setLanguageById(VIEW_LANGUAGE, "#toggleStr", str);
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
    getToggleString(false);
  }
}

/**
 * P-SSR 표시
 */
function P_SSR() {
  var idolData = mergeCardData("P-SSR", true, false, false, false);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "pFirstImplementNote");
}

/**
 * S-SSR 표시
 */
function S_SSR() {
  var idolData = mergeCardData("S-SSR", false, false, true, false);
  CtlfesImgConvertBtn("s");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "sFirstImplementNote");
}

/**
 * P-SR 표시
 */
function P_SR() {
  var idolData = mergeCardData("P-SR", false, true, false, false);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "pFirstImplementNote");
}

/**
 * S-SR 표시
 */
function S_SR() {
  var idolData = mergeCardData("S-SR", false, false, false, true);
  CtlfesImgConvertBtn("s");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "sFirstImplementNote");
}

/**
 * 모든 카드 표시
 */
function ALL_CARD() {
  var idolData = mergeCardData("All", true, true, true, true);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "allFirstImplementNote");
}

/**
 * 모든 SSR 표시
 */
function ALL_SSR() {
  var idolData = mergeCardData("SSR", true, false, true, false);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "allFirstImplementNote");
}

/**
 * 모든 SR 표시
 */
function ALL_SR() {
  var idolData = mergeCardData("SR", false, true, false, true);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "allFirstImplementNote");
}

/**
 * 모든 P 표시
 */
function ALL_P() {
  var idolData = mergeCardData("P", true, true, false, false);
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(VIEW_LANGUAGE, "#NOTE_SPACE", "pFirstImplementNote");
}

/**
 * 모든 S 표시
 */
function ALL_S() {
  var idolData = mergeCardData("S", false, false, true, true);
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
      // 단순 비교해서 소트시 브라우저 차이로
      // 표시가 다를 수 있기에 「<」, 「>」, 「=」를 모두 확인
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
function mergeCardData(tableTitle, pSSR, pSR, sSSR, sSR) {
  var totalList = JSON_DATA.map((idol) => {
    var tempList = [];

    if (pSSR) tempList = tempList.concat([...idol.P_SSR]);
    if (pSR) tempList = tempList.concat([...idol.P_SR]);
    if (sSSR) tempList = tempList.concat([...idol.S_SSR]);
    if (sSR) tempList = tempList.concat([...idol.S_SR]);

    var cardList = getCardList(tempList);

    // 이름 언어 : idol_(ko, ja, en)_name
    var idolName = idol.idol_ko_name;
    if (VIEW_LANGUAGE == "ja") {
      idolName = idol.idol_ja_name;
    }

    var obj = {
      idol_name: idolName,
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
      var fesChk = $("#fesImgConvertBtn").is(":checked"); // 일러스트 표시 모드
      var imgPath = "card_normal";

      // 카드명이 없는 경우 일러스트 프리뷰를 표시하지 않음
      if (imgNameAttr != "" && imgNameAttr != undefined) {
        // 페스 일러는 일반 일러스트 파일명에 "_f"를 추가
        // 페스 일러 체크, P 카드인 경우에 파일명 추가
        if (fesChk == true && imgAddrAttr.split("_")[1] == "p") {
          imgPath = "card_fes";
        }

        $("body").append(
          `<p id="preview"><img src="${getImgSrc(
            imgPath,
            imgAddrAttr
          )}" width="${imgWidth}" height="${imgHeight}"><br>${imgNameAttr}</p>`
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

    // console.log ((e.pageY + previewHeight) + ":" + ($(window).innerHeight() + $(document).scrollTop()))
    if (e.pageY + previewHeight > $(window).innerHeight() + $(document).scrollTop()) {
      $("#preview").css("top", e.pageY - xOffset - previewHeight + "px");
    } else {
      $("#preview").css("top", e.pageY - xOffset + "px");
    }

    // console.log ((e.pageX + previewWidth) + ":" + ($(window).innerWidth() + $(document).scrollLeft()))
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

    if ($("#permanentCardChkBox").is(":checked")) viewMode += "P";
    if ($("#limitedCardChkBox").is(":checked")) viewMode += "L";
    if ($("#twilightCardChkBox").is(":checked")) viewMode += "T";
    if ($("#mysongsCardChkBox").is(":checked")) viewMode += "M";
    if ($("#eventCardChkBox").is(":checked")) viewMode += "E";
    if ($("#gradeFesCardChkBox").is(":checked")) viewMode += "F";
    if ($("#campaignCardChkBox").is(":checked")) viewMode += "C";
    if ($("#otherCardChkBox").is(":checked")) viewMode += "O";

    if (NOW_SELECT == 11) captureName = frameName + "_P_SSR_" + viewMode + ".png";
    else if (NOW_SELECT == 12) captureName = frameName + "_S_SSR_" + viewMode + ".png";
    else if (NOW_SELECT == 13) captureName = frameName + "_SSR_" + viewMode + ".png";
    else if (NOW_SELECT == 21) captureName = frameName + "_P_SR_" + viewMode + ".png";
    else if (NOW_SELECT == 22) captureName = frameName + "_S_SR_" + viewMode + ".png";
    else if (NOW_SELECT == 23) captureName = frameName + "_SR_" + viewMode + ".png";
    else if (NOW_SELECT == 31) captureName = frameName + "_P_" + viewMode + ".png";
    else if (NOW_SELECT == 32) captureName = frameName + "_S_" + viewMode + ".png";
    else if (NOW_SELECT == 33) captureName = frameName + "_ALL_" + viewMode + ".png";

    $(frameId).css("overflow", "hidden");
    $("#convertSpan").css("display", "none");

    $("#BaseStartDateStr").text(getBaseDate("#BaseStartDate"));
    $("#BaseStartSpan").css("display", "none");
    $("#BaseStartDateStr").css("display", "");

    $("#BaseEndDateStr").text(getBaseDate("#BaseEndDate"));
    $("#BaseEndSpan").css("display", "none");
    $("#BaseEndDateStr").css("display", "");

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
  }
}

function downloadURI(uri, filename) {
  var link = document.createElement("a");
  link.download = filename;
  link.href = uri;
  link.click();
}
