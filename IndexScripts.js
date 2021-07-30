var nowSelect = 0;
var jsonData;
var viewLanguage;
const defalutLanguage = "ko";

$().ready(function () {
  init();
});

// document.body.addEventListener("onload", init());

async function init() {
  await getJSON("json/data.json").then(function (resp) {
    jsonData = JSON.parse(resp);
  });

  nowSelect = 0;
  document.getElementById("TargetDate").valueAsDate = new Date(getToday());

  viewLanguage = getLanguage();

  // 지원하는 언어가 아닌 경우 한국어로 표시
  if (!(viewLanguage in $.lang)) viewLanguage = defalutLanguage;

  // 수동으로 언어 설정시 선택한 언어로 표시
  if (getQuery() !== undefined && getQuery().lang !== undefined && getQuery().lang !== "") {
    if (getQuery().lang in $.lang) {
      viewLanguage = getQuery().lang;
      $("#languageSetting").css("display", "inline");
    }
  }
  setLanguage(viewLanguage);
  $("#languageSelect").val(viewLanguage).prop("selected", true);

  var fesChk = $("#fesImgConvertBtn").is(":checked");
  getToggleString(fesChk);
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

function changeLanguage() {
  viewLanguage = $("#languageSelect").val();
  setLanguage(viewLanguage);
  var fesChk = $("#fesImgConvertBtn").is(":checked");
  getToggleString(fesChk);
  updateDate(nowSelect);
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
 * VIEW_SELECT의 표시타입 체크 변경
 */
function updateDate(nowSelect) {
  if (nowSelect == 1) {
    P_SSR();
  } else if (nowSelect == 2) {
    S_SSR();
  } else if (nowSelect == 3) {
    P_SR();
  } else if (nowSelect == 4) {
    S_SR();
  } else if (nowSelect == 5) {
    ALL_CARD();
  }
}

/**
 * 페스 이미지 세팅
 * (표, 프리뷰)
 */
function setFesImg(fesChk) {
  getToggleString(fesChk);
  updateDate(nowSelect);
}

/**
 * 사복과 페스 일러 토글 텍스트 표시
 */
function getToggleString(fesChk) {
  var str;
  if (fesChk == true) {
    str = "fes";
  } else {
    str = "casual";
  }
  setLanguageById(viewLanguage, "#toggleStr", str);
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
  var idolData = idolDataProcess("P_SSR");
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(viewLanguage, "#NOTE_SPACE", "pFirstImplementNote");
  nowSelect = 1;

  setLanguage(viewLanguage);
}

/**
 * P-SR 표시
 */
function P_SR() {
  var idolData = idolDataProcess("P_SR");
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  nowSelect = 3;

  setLanguage(viewLanguage);
}

/**
 * S-SSR 표시
 */
function S_SSR() {
  var idolData = idolDataProcess("S_SSR");
  CtlfesImgConvertBtn("s");
  buildTable(idolData);

  setLanguageById(viewLanguage, "#NOTE_SPACE", "sFirstImplementNote");
  nowSelect = 2;

  setLanguage(viewLanguage);
}

/**
 * S-SR 표시
 */
function S_SR() {
  var idolData = idolDataProcess("S_SR");
  CtlfesImgConvertBtn("s");
  buildTable(idolData);

  setLanguageById(viewLanguage, "#NOTE_SPACE", "sFirstImplementNote");
  nowSelect = 4;

  setLanguage(viewLanguage);
}

/**
 * 모든 카드 표시
 */
function ALL_CARD() {
  var idolData = mergeAllCardData();
  CtlfesImgConvertBtn("p");
  buildTable(idolData);

  setLanguageById(viewLanguage, "#NOTE_SPACE", "allFirstImplementNote");
  nowSelect = 5;

  setLanguage(viewLanguage);
}

/**
 * 전체 카드의 데이터를 추출, 재가공
 */
function mergeAllCardData() {
  var maxColumnLen = 0;
  var totalList = jsonData.map((idol) => {
    var cardList = [...idol.P_SSR, ...idol.P_SR, ...idol.S_SSR, ...idol.S_SR]
      .map((card, idx) => {
        var cardType = card.card_type;
        // 가장 첫실장만 배열에 추가
        if (cardType == "첫실장" && idx == 0) {
          return card;
        }

        // VIEW_SELECT의 체크 타입 체크에 맞춰 데이터를 Return
        if (cardType == "통상" && $("#permanentCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "한정" && $("#limitedCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "이벤트" && $("#eventCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "페스" && $("#gradeFesCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "캠페인" && $("#campaignCardChkBox").is(":checked")) {
          return card;
        }
      })
      // undefined 데이터 제거
      .filter((v) => v !== undefined)
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
      });

    // 이름 언어 : idol_(ko, ja, en)_name
    var idolName = idol.idol_ko_name;
    if (viewLanguage == "ja") {
      idolName = idol.idol_ja_name;
    }

    var obj = {
      idol_name: idolName,
      card_data: cardList,
    };

    // 표에 표시할 열의 개수를 설정
    if (cardList.length > maxColumnLen) maxColumnLen = cardList.length;

    return obj;
  });

  var tableTitle = "All";

  // 표시할 데이터
  // Title : 카드 타입 (P-SSR, S-SSR, P-SR, S-SR)
  // Length : 최대 열 수
  // Data : 표시할 카드 데이터
  var selectedData = {
    Title: tableTitle,
    Length: maxColumnLen,
    Data: totalList,
  };

  return selectedData;
}

// 각 타입의 카드 데이터추출, 재가공
function idolDataProcess(cardGrade) {
  var maxColumnLen = 0;
  totalList = jsonData.map((idol) => {
    var cardList = idol[cardGrade]
      .map((card) => {
        var cardType = card.card_type;
        if (cardType == "첫실장") {
          return card;
        }

        // VIEW_SELECT의 체크 타입 체크에 맞춰 데이터를 Return
        if (cardType == "통상" && $("#permanentCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "한정" && $("#limitedCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "이벤트" && $("#eventCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "페스" && $("#gradeFesCardChkBox").is(":checked")) {
          return card;
        } else if (cardType == "캠페인" && $("#campaignCardChkBox").is(":checked")) {
          return card;
        }
      })
      // undefined 데이터 제거
      .filter((v) => v !== undefined);

    // 이름 언어 : idol_(ko, ja, en)_name
    var idolName = idol.idol_ko_name;
    if (viewLanguage == "ja") {
      idolName = idol.idol_ja_name;
    }

    var obj = {
      idol_name: idolName,
      card_data: cardList,
    };

    // 표에 표시할 열의 개수를 설정
    if (cardList.length > maxColumnLen) maxColumnLen = cardList.length;

    return obj;
  });

  var tableTitle = cardGrade.replace("_", "-");

  // 표시할 데이터
  // Title : 카드 타입 (P-SSR, S-SSR, P-SR, S-SR)
  // Length : 최대 열 수
  // Data : 표시할 카드 데이터
  var selectedData = {
    Title: tableTitle,
    Length: maxColumnLen,
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
      var imgPath = "card";

      // 카드명이 없는 경우 일러스트 프리뷰를 표시하지 않음
      if (imgNameAttr != "" && imgNameAttr != undefined) {
        // 페스 일러는 일반 일러스트 파일명에 "_f"를 추가
        // 페스 일러 체크, P 카드인 경우에 파일명 추가
        if (fesChk == true && imgAddrAttr.split("_")[1] == "p") {
          imgPath += "_fes";
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
  if (nowSelect != 0) {
    var captureName;
    var frameId;
    var viewMode = "";

    if (frameName == "TABLE") frameId = "#CAPTURE_FRAME";
    else if (frameName == "RANK") frameId = "#RANK";

    if ($("#permanentCardChkBox").is(":checked")) viewMode += "P";
    if ($("#limitedCardChkBox").is(":checked")) viewMode += "L";
    if ($("#eventCardChkBox").is(":checked")) viewMode += "E";
    if ($("#gradeFesCardChkBox").is(":checked")) viewMode += "F";
    if ($("#campaignCardChkBox").is(":checked")) viewMode += "C";

    if (nowSelect == 1) captureName = frameName + "_P_SSR_" + viewMode + ".png";
    else if (nowSelect == 2) captureName = frameName + "_S_SSR_" + viewMode + ".png";
    else if (nowSelect == 3) captureName = frameName + "_P_SR_" + viewMode + ".png";
    else if (nowSelect == 4) captureName = frameName + "_S_SR_" + viewMode + ".png";
    else if (nowSelect == 5) captureName = frameName + "_ALL_" + viewMode + ".png";

    document.getElementById("convertSpan").style.display = "none";

    document.getElementById("TargetDateStr").innerHTML = getTargetDate();
    document.getElementById("TargetDate").style.display = "none";
    document.getElementById("TargetDateStr").style.display = "";

    html2canvas(document.querySelector(frameId), {
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
    }).then((canvas) => {
      downloadURI(canvas.toDataURL("image/png"), captureName);
    });

    document.getElementById("convertSpan").style.display = "";

    document.getElementById("TargetDate").style.display = "";
    document.getElementById("TargetDateStr").style.display = "none";
  }
}

function downloadURI(uri, filename) {
  var link = document.createElement("a");
  link.download = filename;
  link.href = uri;
  link.click();
}
