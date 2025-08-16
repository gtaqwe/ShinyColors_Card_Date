$(function () {
  init();
});

/**
 * 초기화
 */
async function init() {
  JSON_DATA = await getJSON("src/json/data/data.json");
  IDOL_TOTAL_COUNT = JSON_DATA.length;
  TABLE_BLANK_LAP_LIST = Array(IDOL_TOTAL_COUNT).fill(0);

  // 선택한 카드레어리티 초기화
  CardRarity.init();

  // 초기 기준일
  // Start : 서비스 개시일
  // End : 현재 날짜
  $("#baseStartDate").val(SERVICE_START_DATE_STRING);
  $("#baseEndDate").val(getToday());

  // 언어 설정
  await initLanguage();

  setViewCheckboxSetting();
  readTableBlankLapList();

  // 카드 수 리셋
  setCardTypeCountList();
  convertShowCardCount();

  // 연도 프리셋 추가
  initDatePresetButton();

  setEventHandler();
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

  // 시작일 리셋 버튼
  $("#baseStartDateResetButton").on("click", () => baseDateReset("baseStartDate", "2018-04-24"));

  // 종료일 변경
  $("#baseEndDate").on("change", () => updateEndBaseDate());

  // 종료일 리셋 버튼
  $("#baseEndDateResetButton").on("click", () => baseDateReset("baseEndDate", getToday()));

  // 카드 차수 변경 표시
  $("#showChangeCardLapConvertBtn").on("change", () => changeCardLapConvertBtnValue());

  // 카드 차수 리셋 버튼
  $("#cardLapResetButton").on("click", () => clearTableBlankLapList());

  // 언어 변경 선택 버튼
  $("#languageSelect").on("change", async () => await changeLanguage("languageSelect"));

  // 페스 일러 표시
  $("#fesImgConvertBtn").on("change", () => setFesImg());
}

/**
 * 언어 설정 초기화
 */
async function initLanguage() {
  await Language.init();

  // Query Parameter로 언어 설정시 선택한 언어로 표시
  const query = getQuery();
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
 * 카드 차수 변경이 True인 경우, localStorage에 저장된 데이터를 읽어서 반영
 * False인 경우, localStorage의 값을 반영하지 않음
 */
function readTableBlankLapList() {
  const nowChangeLapFlag = $(`#showChangeCardLapConvertBtn`).is(":checked");

  if (nowChangeLapFlag) {
    const localList = localStorage.getItem("TABLE_BLANK_LAP_LIST");
    if (localList !== null) {
      TABLE_BLANK_LAP_LIST = localList.split(",");
    }
  }
}

/**
 * 연도 프리셋 버튼 초기화
 */
function initDatePresetButton() {
  const startYear = SERVICE_START_DATE_STRING.split("-")[0];
  const nowYear = new Date().getFullYear();

  for (let targetYear = startYear; targetYear <= nowYear; targetYear++) {
    const startDate = `${targetYear}-01-01`;
    const endDate = targetYear == nowYear ? getToday() : `${targetYear}-12-31`;

    // 프리셋 버튼 추가
    $(`#datePresetField`).append(`
      <input
        type="button"
        value="${targetYear}"
        class="DatePresetButton"
        onclick="baseDateFullReset('baseStartDate', '${startDate}','baseEndDate', '${endDate}')"
      />`);
  }
}

/**
 * 체크박스 동작 설정
 */
function setViewCheckboxSetting() {
  // 전체 체크 클릭 시
  $("input:checkbox[name='showCardAllTypeChk']").click(function () {
    if ($("input:checkbox[name='showCardAllTypeChk']").is(":checked")) {
      $("input:checkbox[name='showCardTypeChk']").prop("checked", true);
    } else {
      $("input:checkbox[name='showCardTypeChk']").prop("checked", false);
    }
    updateDate();
  });

  // 카드타입 클릭 시
  $("input:checkbox[name='showCardTypeChk']").click(function () {
    const allCnt = $("input:checkbox[name='showCardTypeChk']").length; // 카드타입 전체갯수
    const selCnt = $("input:checkbox[name='showCardTypeChk']:checked").length; // 카드타입 선택갯수

    if (allCnt == selCnt) {
      $("input:checkbox[name='showCardAllTypeChk']").prop("checked", true);
    } else {
      $("input:checkbox[name='showCardAllTypeChk']").prop("checked", false);
    }
    updateDate();
  });

  // 표시 옵션 클릭
  $("input:checkbox[name='viewOptionChk']").click(function () {
    updateDate();
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

  updateDate();
}

/**
 * 카드 차수 변경 표시를 초기화 했을 경우의 동작
 * localStorage를 Clear, TABLE_BLANK_LAP_LIST 초기화후
 * 표를 다시 읽기
 */
function clearTableBlankLapList() {
  clearStorage();

  resetTableBlankLapList();

  updateDate();
}

/**
 * P-SSR 표시
 */
function setPSsr() {
  const buttonId = "pSsrButton";
  const buttonClassName = "Pbutton";

  if (CardRarity.getIsSelectedByCardRarity(cardRarityType.P_SSR)) {
    CardRarity.updateSelectOff(cardRarityType.P_SSR, buttonId, buttonClassName);
  } else {
    CardRarity.updateSelectOn(cardRarityType.P_SSR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * S-SSR 표시
 */
function setSSsr() {
  const buttonId = "sSsrButton";
  const buttonClassName = "Sbutton";

  if (CardRarity.getIsSelectedByCardRarity(cardRarityType.S_SSR)) {
    CardRarity.updateSelectOff(cardRarityType.S_SSR, buttonId, buttonClassName);
  } else {
    CardRarity.updateSelectOn(cardRarityType.S_SSR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * P-SR 표시
 */
function setPSr() {
  const buttonId = "pSrButton";
  const buttonClassName = "Pbutton";

  if (CardRarity.getIsSelectedByCardRarity(cardRarityType.P_SR)) {
    CardRarity.updateSelectOff(cardRarityType.P_SR, buttonId, buttonClassName);
  } else {
    CardRarity.updateSelectOn(cardRarityType.P_SR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * S-SR 표시
 */
function setSSr() {
  const buttonId = "sSrButton";
  const buttonClassName = "Sbutton";

  if (CardRarity.getIsSelectedByCardRarity(cardRarityType.S_SR)) {
    CardRarity.updateSelectOff(cardRarityType.S_SR, buttonId, buttonClassName);
  } else {
    CardRarity.updateSelectOn(cardRarityType.S_SR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * P-UR 표시
 */
function setPUr() {
  const buttonId = "pUrButton";
  const buttonClassName = "Pbutton";

  if (CardRarity.getIsSelectedByCardRarity(cardRarityType.P_UR)) {
    CardRarity.updateSelectOff(cardRarityType.P_UR, buttonId, buttonClassName);
  } else {
    CardRarity.updateSelectOn(cardRarityType.P_UR, buttonId, buttonClassName);
  }

  updateDate();
}

/**
 * S-UR 표시
 */
function setSUr() {
  const buttonId = "sUrButton";
  const buttonClassName = "Sbutton";

  if (CardRarity.getIsSelectedByCardRarity(cardRarityType.S_UR)) {
    CardRarity.updateSelectOff(cardRarityType.S_UR, buttonId, buttonClassName);
  } else {
    CardRarity.updateSelectOn(cardRarityType.S_UR, buttonId, buttonClassName);
  }

  updateDate();
}

function updateDate() {
  resetCardTypeCountList();

  // 선택한 레어리티 정보를 취득
  const selectedRarity = CardRarity.getSelectedCardRarity();

  // 선택한 레어리티가 1개인 경우, 해당 타이틀을 표 타이틀로 설정
  // 그 외에는 공란으로 설정
  const tableTitleList = selectedRarity.map((v) => v.title);

  // 선택한 레어리티가 없거나, 프로듀스가 선택되어있는 경우
  // 페스 일러스트 표시 체크가 가능하도록 설정
  const ps =
    selectedRarity.length == 0 || selectedRarity.filter((v) => v.ps == "p").length > 0 ? "p" : "s";

  // 선택 레어리티의 카드리스트를 취득
  const idolData = mergeCardData(tableTitleList);

  // 페스 일러스트로 표시 체크 박스의 선택가능/불가능을 설정
  CtlfesImgConvertBtn(ps);

  // 표 작성
  buildTable(idolData);

  Language.setLanguageById("#NOTE_SPACE", `${ps}FirstImplementNote`);

  // 카드 정보가 존재 하지 않을 경우, 메세지를 표시하지 않음
  if (!idolData) {
    $("#NOTE_SPACE").empty();
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
    $("#baseEndDate").val(getToday());
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
function baseDateFullReset(startId, startInputDate, endtId, endInputDate) {
  $(`#${startId}`).val(startInputDate);
  $(`#${endtId}`).val(endInputDate);
  updateDate();
}

/**
 * 페스 이미지 세팅
 * (표, 프리뷰)
 */
function setFesImg() {
  updateDate();
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
 * 조건에 해당되는 카드를 Filter, Sort 후 리스트로 Return
 */
function getCardList(cardAry) {
  return (
    cardAry
      .map((card, idx) => {
        const cardType = card.card_type;
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
      // 존재하지 않는 데이터 제거
      .filter((v) => v)
      .filter(
        (v) =>
          v.card_type == "first" ||
          (new Date(v.card_date) >= new Date($("#baseStartDate").val()) &&
            new Date(v.card_date) <= new Date($("#baseEndDate").val()))
      )
      // 오래된 순으로 정렬
      // 단순 비교로 정렬하는 경우
      // 브라우저 차이로 인한 표시의 차이가 있을 가능성이 있기에 「<」, 「>」, 「=」를 모두 확인
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
  );
}

/**
 * 전체 카드의 데이터를 추출, 재가공
 */
function mergeCardData(tableTitleList) {
  const selectedCardRarity = CardRarity.getSelectedCardRarity();

  // 선택된 항목이 없다면 undefined를 return
  if (selectedCardRarity.length == 0) {
    return;
  }

  const totalList = JSON_DATA.map((idol) => {
    let firstList = [];
    let tempCardList = [];

    // P UR
    if (CardRarity.getIsSelectedByCardRarity(cardRarityType.P_UR)) {
      const idolList = [...idol.P_UR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // P SSR
    if (CardRarity.getIsSelectedByCardRarity(cardRarityType.P_SSR)) {
      const idolList = [...idol.P_SSR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // P SR
    if (CardRarity.getIsSelectedByCardRarity(cardRarityType.P_SR)) {
      const idolList = [...idol.P_SR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S UR
    if (CardRarity.getIsSelectedByCardRarity(cardRarityType.S_UR)) {
      const idolList = [...idol.S_UR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S SSR
    if (CardRarity.getIsSelectedByCardRarity(cardRarityType.S_SSR)) {
      const idolList = [...idol.S_SSR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S SR
    if (CardRarity.getIsSelectedByCardRarity(cardRarityType.S_SR)) {
      const idolList = [...idol.S_SR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // 첫실장 데이터가 복수 있을시, 최초의 첫실장만 취득
    const firstImplementation = firstList
      .filter((v) => v)
      .sort((a, b) => {
        // card_date가 존재하지 않는 경우, 마지막에 위치하도록 처리
        const aDate = new Date(a.card_date ? a.card_date : 8640000000000000);
        const bDate = new Date(b.card_date ? b.card_date : 8640000000000000);

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
    if (firstImplementation) {
      tempCardList.unshift(firstImplementation);
    }

    return {
      idol_name: idol[`idol_${Language.getCurrentLanguage()}_name`],
      display_ranking: idol.display_ranking,
      card_data: getCardList(tempCardList),
    };
  });

  // 표시할 데이터
  // Title : 카드 레어도 (P-SSR, S-SSR 등)
  // Data : 표시할 카드 데이터
  const selectedCardData = {
    title: tableTitleList,
    data: totalList,
  };

  return selectedCardData;
}

/**
 * 마우스 포인트 위치에 따라 이미지 프리뷰
 */
function imgMapping() {
  const xOffset = 10;
  const yOffset = 20;
  const imgWidth = 320;
  const imgHeight = 180;

  // 마우스 포인트가 위치한 셀에 해당하는 일러스트의 프리뷰 표시
  $("#date-table td").hover(
    function (e) {
      const imgAddrAttr = $(this).closest("td").attr("addr"); // 이미지 파일명
      const imgNameAttr = $(this).closest("td").attr("name"); // 카드명
      const fesChk = $("#fesImgConvertBtn").is(":checked"); // 페스 일러스트 표시 모드
      const psType = $(this).closest("td").attr("ps"); // 카드명

      let imgPath = "";
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
    const nowPreview = $("#preview");
    const previewWidth = nowPreview.width();
    const previewHeight = nowPreview.height();

    if (e.pageY + previewHeight > $(window).innerHeight() + $(document).scrollTop()) {
      nowPreview.css("top", e.pageY - xOffset - previewHeight + "px");
    } else {
      nowPreview.css("top", e.pageY - xOffset + "px");
    }

    if (e.pageX + previewWidth > $(window).innerWidth() + $(document).scrollLeft()) {
      nowPreview.css("left", e.pageX - yOffset - previewWidth + "px");
    } else {
      nowPreview.css("left", e.pageX + yOffset + "px");
    }

    if (
      e.pageY + previewHeight > $(window).innerHeight() + $(document).scrollTop() &&
      e.pageX + previewWidth > $(window).innerWidth() + $(document).scrollLeft()
    ) {
      nowPreview
        .css("top", e.pageY - xOffset - previewHeight - xOffset + "px")
        .css("left", e.pageX - yOffset - previewWidth + "px");
    }
  });
}

function getImgSrc(path, addr) {
  return `./img/${path}/${addr}.png`;
}

/**
 * 표 캡쳐, 다운로드 처리
 */
function captureScreen(frameName) {
  // 선택된 표시 타입이 하나도 없는 경우 스킵
  if (CardRarity.isAllNotSelectedCardRarity()) {
    return;
  }

  let captureName = "";
  let frameId = "";

  const nowChangeLapFlag = $(`#showChangeCardLapConvertBtn`).is(":checked");

  if (nowChangeLapFlag) {
    $(`#showChangeCardLapConvertBtn`).prop("checked", false);
    updateDate();
  }

  if (frameName == "TABLE") frameId = "#CAPTURE_FRAME";
  else if (frameName == "RANK") frameId = "#RANK";

  captureName = getCaptureFileName(frameName);

  $(frameId).css("overflow", "hidden");
  cssDisplayOff("#convertSpan");

  $("#baseStartDateStr").text(getBaseDate("#baseStartDate"));
  cssDisplayOff("#baseStartSpan");
  cssDisplayOn("#baseStartDateStr");

  $("#baseEndDateStr").text(getBaseDate("#baseEndDate"));
  cssDisplayOff("#baseEndSpan");
  cssDisplayOn("#baseEndDateStr");

  cssDisplayOff("#CAPTURE_BUTTON");
  cssDisplayOff("#VIEW_OPTION");
  cssDisplayOff("#ALL_TYPE_SELECT");
  cssDisplayOff("#DATE_PRESET");

  html2canvas(document.querySelector(frameId), {
    scrollY: -window.scrollY,
    scrollX: -window.scrollX,
  }).then((canvas) => {
    downloadURI(canvas.toDataURL("image/png"), captureName);
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

function getCaptureFileName(title) {
  const d = new Date();

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");

  return `${title}_${yyyy}${mm}${dd}${hh}${mi}${ss}${ms}.png`;
}
