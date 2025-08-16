const NONE_INTERVAL = Number.MIN_SAFE_INTEGER;

/**
 * 표 생성
 * idolData : IndexScripts.js의 function idolDataProcess참조
 */
function buildTable(idolData) {
  runBuildTable(idolData); // 메인표

  runBuildDateRank(idolData); // 랭킹표
}

/**
 * 메인표 작성
 */
function runBuildTable(idolData) {
  // 카드 정보가 존재 하지 않을 경우, 표를 작성하지 않음
  if (!idolData) {
    $("#MAIN").empty();
    return;
  }

  // 선택된 레어리티가 1개일때 표 타이틀을 설정
  // 그 외의 경우에는 공란
  const tableTitle = idolData.Title.length == 1 ? idolData.Title[0] : "";
  const rowLength = idolData.Data.length; // 아이돌 수

  const maxColumnLength = Math.max(
    ...idolData.Data.map((v, idx) => Number(v.card_data.length) + Number(TABLE_BLANK_LAP_LIST[idx]))
  );

  const tableName = "date-table";

  let table = `<table id="${tableName}">`;

  table += "<thead>";
  table += `<tr class="tr-main-header">`;

  table += tableHeader(tableTitle, maxColumnLength);

  table += "</tr>";
  table += "</thead>";
  table += "<tbody>";

  const maxLap = Math.max(
    ...idolData.Data.map(
      (v) => v.card_data.filter((cardObj) => cardObj.card_type != "first").length
    )
  );
  for (let row = 0; row < rowLength; row++) {
    table += `<tr class="tr-main-data">`;

    table += setCardData(idolData.Data[row], maxColumnLength, row, maxLap);

    table += "</tr>";
  }

  table += "</tbody>";
  table += "</table>";

  $("#MAIN").html(table);
  if (!$(`#NOTE_SPACE`).length) {
    $("#CAPTURE_FRAME").append(`<div><span id="NOTE_SPACE"></span></div>`);
  }

  setLanguageInTable(VIEW_LANGUAGE, tableName);

  imgMapping(this);
}

/**
 * 메인표의 헤더 작성
 * (타이틀) | 차수변경(옵션) | 첫 실장 | 간격 | 1 | 간격 | 2 | 간격 | ... | n | 간격 |
 */
function tableHeader(title, columnLength) {
  let resContent = `<th class="th-name-cell" id="table-type">${title}</th>`;

  // 카드 차수 변경
  if ($(`#showChangeCardLapConvertBtn`).is(":checked")) {
    resContent += `<th class="th-seq-cell"></th>`;
  }

  // 첫 실장 표시/비표시 설정
  if (!$(noShowRCardConvertBtn).is(":checked")) {
    resContent += `<th class="th-header-title-cell" data-lang="firstImplementation">첫 실장</th>`;
    resContent += `<th class="th-header-interval-cell" data-lang="interval">간격</th>`;

    columnLength--;
  }

  for (let i = 0; i < columnLength; i++) {
    resContent += `<th class="th-header-title-cell">${i + 1}</th>`;
    resContent += `<th class="th-header-interval-cell" data-lang="interval">간격</th>`;
  }

  return resContent;
}

/**
 * 카드 차수 변경
 */
function changeCardLapCount(idolNum, inputObj) {
  let val = Number(inputObj.value);

  if (val > Number(inputObj.max)) {
    val = Number(inputObj.max);
  }
  if (val < Number(inputObj.min)) {
    val = Number(inputObj.min);
  }

  TABLE_BLANK_LAP_LIST[idolNum] = val;

  saveTableBlankLapListInStorage();

  updateDate(NOW_SELECT);
}

/**
 * 카드 데이터의 표시와 카드간 사이의 간격일을 계산해서 표시
 */
function setCardData(totalData, totalLen, idolNum, maxLap) {
  let resContent = `<td class="td-name-cell">${totalData.idol_name}</td>`;

  // 카드 차수 밀어내기
  if ($(`#showChangeCardLapConvertBtn`).is(":checked")) {
    resContent += `<td class="td-seq-cell"><input type="number" min="0" max="${maxLap}" value="${TABLE_BLANK_LAP_LIST[idolNum]}"
    style="height:10px; width:50px" onchange="changeCardLapCount(${idolNum},this)"></td>`;
  }

  cardDataList = totalData.card_data;
  cardLen = totalData.card_data.length;

  for (let i = 0; i < TABLE_BLANK_LAP_LIST[idolNum]; i++) {
    totalLen--;
  }

  for (let idx = 0; idx < totalLen; idx++) {
    const currDay = 24 * 60 * 60 * 1000;
    let dateBefore;
    let dateAfter;
    let interval;
    let intervalCode;

    // 첫 실장 표시/비표시 설정에 따른 카드 차수 변경 표시
    if (
      (!$(noShowRCardConvertBtn).is(":checked") && idx == 1) ||
      ($(noShowRCardConvertBtn).is(":checked") && idx == 0)
    ) {
      for (let i = 0; i < TABLE_BLANK_LAP_LIST[idolNum]; i++) {
        resContent += "<td></td><td></td>";
      }
    }

    if (idx < cardLen) {
      const cardDate = cardDataList[idx].card_date;
      const cardType = cardDataList[idx].card_type;
      const cardName = cardDataList[idx].card_name;
      const cardAddr = cardDataList[idx].card_addr;
      const psType = cardDataList[idx].ps_type;

      countCardType(cardType);

      // 한정, 이벤트, 페스, 캠페인, 기타 카드의 경우, 셀 색상을 타입에 맞춰 변경
      if (cardType == "limited") {
        resContent += '<td class="limit-card-cell" ';
      } else if (cardType == "twilight") {
        resContent += '<td class="twilight-card-cell" ';
      } else if (cardType == "mysongs") {
        resContent += '<td class="mysongs-card-cell" ';
      } else if (cardType == "parallel") {
        resContent += '<td class="parallel-card-cell" ';
      } else if (cardType == "event") {
        resContent += '<td class="event-card-cell" ';
      } else if (cardType == "fes") {
        resContent += '<td class="gradeFes-card-cell" ';
      } else if (cardType == "campaign") {
        resContent += '<td class="campaign-card-cell" ';
      } else if (cardType == "other") {
        resContent += '<td class="other-card-cell" ';
      } else {
        resContent += "<td ";
      }

      if (cardAddr) {
        resContent += `addr="${cardAddr}" `;
      }

      if (cardName) {
        resContent += `name="${cardName}" `;
      }

      if (psType) {
        resContent += `ps="${psType}" `;
      }

      resContent += `>`;

      resContent += `<div class="cell-div">`;

      // 아이콘 표시가 체크된 경우 아이콘을 표시하도록 추가
      if ($(iconImgConvertBtn).is(":checked") && cardAddr) {
        const style = `style= "width:72px; height:72px"`;
        const onerror = `onerror = "this.src='./img/assets/Blank_Icon.png'"`;

        let imgPath = "";
        // 아이콘 패스 지정
        if (psType == "p") {
          // 프로듀스 아이콘
          imgPath = "produce_idol";
          if ($(fesImgConvertBtn).is(":checked")) {
            // 페스 아이콘
            imgPath += "/fes_icon";
          } else {
            // 사복 아이콘
            imgPath += "/icon";
          }
        } else {
          // 서포트 아이콘
          imgPath = "support_idol/icon";
        }

        resContent += `<img src="${getImgSrc(imgPath, cardAddr)}" ${style} ${onerror}><br>`;
      }
      // cardDate가 존재할때 표시
      if (cardDate) {
        resContent += `${cardDate}`;
      }
      resContent += `</div></td>`;

      // 카드 일정 데이터가 있는 경우, 간격일을 계산
      // 최신 실장이 아닌 경우 다음 실장 카드와 카드 간격일 계산
      // 최신 실장인 경우, 기준일과의 간격일 계산
      if (cardDate) {
        dateBefore = calDate(cardDate);

        if (idx == cardLen - 1 || cardDataList[idx + 1].card_date == "") {
          dateAfter = calDate(getBaseDate("#baseEndDate"));
          interval = (dateAfter.getTime() - dateBefore.getTime()) / currDay;
          intervalCode = `<td class="now-interval">${interval}</td>`;
        } else {
          dateAfter = calDate(cardDataList[idx + 1].card_date);
          interval = (dateAfter.getTime() - dateBefore.getTime()) / currDay;
          intervalCode = `<td class="pre-interval">${interval}</td>`;
        }
      }
      // 카드 일정 데이터가 없는 경우, Skip
      else {
        intervalCode = "<td></td>";
      }
    } else {
      resContent += "<td></td>";
      intervalCode = "<td></td>";
    }

    resContent = resContent + intervalCode;
  }

  return resContent;
}

/**
 * 설정한 기준일을 Return
 */
function getBaseDate(dateId) {
  const baseEndDate = new Date($(dateId).val());

  return baseEndDate.toISOString().slice(0, 10);
}

/**
 * 입력한 날짜 문자열을 Date형으로 Return
 */
function calDate(dateStr) {
  return new Date(dateStr);
}

/**
 * 랭킹표 작성
 */
function runBuildDateRank(idolData) {
  // 카드 정보가 존재 하지 않을 경우, 표를 작성하지 않음
  if (!idolData) {
    $("#MAIN_RANK").empty();
    $("#RANK").empty();
    return;
  }

  const intervalAry = [];
  const rows = $("#date-table .tr-main-data");

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    nameStr = $(`#date-table .tr-main-data:eq(${rowIdx}) .td-name-cell`).text();

    // 이하의 경우에는 랭킹 표시를 하지 않음 (「-」로 표시)
    // 1. 카드가 단 하나도 실장되지 않았을 경우 (R카드도 없는 경우)
    // 2. 랭킹표시 플래그가 False인 경우
    const nowInterval = $(`#date-table .tr-main-data:eq(${rowIdx}) .now-interval`);
    if (nowInterval.length == 0 || idolData.Data[rowIdx].display_ranking == false) {
      intervalAry.push([nameStr, NONE_INTERVAL]);
    } else {
      intervalAry.push([nameStr, Number(nowInterval.text())]);
    }
  }

  // 원본 배열을 바꾸지 않도록 하기위해 slice()사용
  const oldFirst = intervalAry.slice().sort((a, b) => b[1] - a[1]);
  const oldRanks = intervalAry.map(function (v) {
    return oldFirst.indexOf(v) + 1;
  });

  const borderStyle = {
    left: "border-left: 1px solid #000000;",
    right: "border-right: 1px solid #000000;",
  };

  // 랭킹표 타이틀에 선택한 레어리티를 모두 표시
  const tableType = idolData.Title.join("<br>");

  // 0 : 메인표 옆에 표시 (아이돌의 위치는 바뀌지 않음)
  // 1 : 메인표와 별개로 표시 (아이돌의 위치가 바뀜)
  buildRankTable0(intervalAry, oldRanks, borderStyle);
  buildRankTable1(tableType, intervalAry, oldRanks, borderStyle);
}

/**
 * 랭킹에 따른 셀의 색 결정
 */
function selectCellColor(rankStr) {
  // Red
  if (rankStr == "1") return "background-color: rgba(255, 0, 0, 0.4); ";
  // Orange
  else if (rankStr == "2") return "background-color: rgba(255, 165, 0, 0.4); ";
  // Yellow
  else if (rankStr == "3") return "background-color: rgba(255, 255, 0, 0.4); ";
  // Green
  else if (rankStr == "4") return "background-color: rgba(0, 128, 0, 0.4); ";
  // Blue
  else if (rankStr == "5") return "background-color: rgba(0, 0, 255, 0.4); ";
  // Indigo
  else if (rankStr == "6") return "background-color: rgba(75, 0, 130, 0.4); ";
  // Violet
  else if (rankStr == "7") return "background-color: rgba(238, 130, 238, 0.4); ";
  else return "";
}

/**
 * 메인표 옆의 랭킹표 (아이돌 순으로 랭킹 표시)
 */
function buildRankTable0(intervalAry, oldRanks, borderStyle) {
  const tableName = "rank-table-0";
  let table = `<table id="${tableName}">`;
  table += "<thead>";

  table += `<tr style="height:${$("#date-table tr").eq(0).height()}px">`;
  table += `<th class="th-rank" style="${borderStyle.right}" data-lang="name">이름</th>`;
  table += `<th class="th-rank" style="${borderStyle.right}${borderStyle.left}" data-lang="rank">순위</th>`;
  table += `<th class="th-rank" style="${borderStyle.left}" data-lang="intervalDate">간격일</th>`;
  table += "</tr>";
  table += "</thead>";

  table += "<tbody>";

  for (let i = 0; i < intervalAry.length; i++) {
    const nameStr = intervalAry[i][0];
    let rankStr = "-";
    let intervalStr = "-";

    if (Number(intervalAry[i][1]) != NONE_INTERVAL) {
      rankStr = oldRanks[i];
      intervalStr = intervalAry[i][1];
    }

    if (intervalAry[i] == "") rankStr = "미실장";
    const cellColor = selectCellColor(rankStr);

    table += `<tr style="height:${$("#date-table tr")
      .eq(i + 1)
      .height()}px">`;
    table += `<td style="${borderStyle.right}${cellColor}"><div class="cell-div">${nameStr}</div></td>`;
    table += `<td style="${borderStyle.right}${borderStyle.left}${cellColor}"><div class="cell-div">${rankStr}</div></td>`;
    table += `<td style="${borderStyle.left}${cellColor}"><div class="cell-div">${intervalStr}</div></td>`;
    table += "</tr>";
  }

  table += "</tbody>";
  table += "</table>";
  $("#MAIN_RANK").html(table);

  setLanguageInTable(VIEW_LANGUAGE, tableName);
}

/**
 * 메인 표 아래의 랭킹표 (현재 간격일 순으로 표시)
 */
function buildRankTable1(tableType, intervalAry, oldRanks, borderStyle) {
  const tableName = "rank-table-1";
  let table = `<table id="${tableName}">`;
  table += "<thead>";
  table += "<tr>";
  table += `<th class="th-rank" colspan="3">${tableType}</th>`;
  table += "</tr>";

  // 선택한 카드타입 표시
  const notSelectStr = "미선택";
  let gachaTypeStr = notSelectStr;
  if ($("#permanentCardChkBox").is(":checked")) {
    gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.PERMANENT;
  }
  if ($("#limitedCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.LIMITED;
  }
  if ($("#twilightCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.TWILIGHT;
  }
  if ($("#mysongsCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.MY_SONGS;
  }
  if ($("#parallelCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.PARALLEL;
  }
  if ($("#eventCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.EVENT;
  }
  if ($("#gradeFesCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.FES;
  }
  if ($("#campaignCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.CAMPAIGN;
  }
  if ($("#otherCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += cardTypeIdentifier.OTHER;
  }

  table += "<tr>";
  table += `<th class="th-rank" colspan="3">${gachaTypeStr}</th>`;
  table += "</tr>";

  table += "<tr>";
  table += `<th class="th-rank" colspan="3">
  ${getBaseDate("#baseStartDate")}<br />
  ~<br />
  ${getBaseDate("#baseEndDate")}</th>`;
  table += "</tr>";

  table += "<tr>";
  table += `<th class="th-rank" style="${borderStyle.right}" data-lang="name">이름</th>`;
  table += `<th class="th-rank" style="${borderStyle.right}${borderStyle.left}" data-lang="rank">순위</th>`;
  table += `<th class="th-rank" style="${borderStyle.left}" data-lang="intervalDate">간격일</th>`;
  table += "</tr>";
  table += "</thead>";

  table += "<tbody>";

  for (let i = 0; i < intervalAry.length; i++) {
    const rankIndex = oldRanks.indexOf(i + 1);
    const nameStr = intervalAry[rankIndex][0];
    let rankStr = "-";
    let intervalStr = "-";

    if (Number(intervalAry[rankIndex][1]) != NONE_INTERVAL) {
      rankStr = oldRanks[rankIndex];
      intervalStr = intervalAry[rankIndex][1];
    }

    const cellColor = selectCellColor(rankStr);

    table += "<tr>";
    table += `<td style="${borderStyle.right}${cellColor}">${nameStr}</td>`;
    table += `<td style="${borderStyle.right}${borderStyle.left}${cellColor}">${rankStr}</td>`;
    table += `<td style="${borderStyle.left}${cellColor}">${intervalStr}</td>`;
    table += "</tr>";
  }

  table += "</tbody>";
  table += "</table>";
  $("#RANK").html(table);

  setLanguageInTable(VIEW_LANGUAGE, tableName);
}

function getGachaTypeSeparateChar() {
  return " ";
}
