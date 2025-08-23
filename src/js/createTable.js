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
  const tableTitle = idolData.titleList.length == 1 ? idolData.titleList[0] : "";

  const maxColumnLength = Math.max(
    ...idolData.data.map(
      (v, idx) =>
        Number(v.card_data.length) + Number(ChangeCardLapInfo.getChangeCardLapByIndex(idx))
    )
  );

  const tableName = "date-table";

  const table = $("<table>", { id: tableName });

  const thead = $("<thead>");
  const headerRow = $("<tr>", { class: "tr-main-header" });

  const headers = tableHeader(tableTitle, maxColumnLength);
  headerRow.append(headers);
  thead.append(headerRow);

  const maxLap = Math.max(
    ...idolData.data.map(
      (v) => v.card_data.filter((cardObj) => cardObj.card_type != "first").length
    )
  );

  const tbody = $("<tbody>");

  for (let row = 0; row < idolData.data.length; row++) {
    const dataRow = $("<tr>", { class: "tr-main-data" });

    const cells = setCardData(idolData.data[row], maxColumnLength, row, maxLap);
    dataRow.append(cells);

    tbody.append(dataRow);
  }

  table.append(thead).append(tbody);

  $("#MAIN").html(table);

  if (!$(`#NOTE_SPACE`).length) {
    $("#CAPTURE_FRAME").append(`<div><span id="NOTE_SPACE"></span></div>`);
  }

  Language.setLanguageInTable(tableName);

  imgMapping(this);
}

/**
 * 메인표의 헤더 작성
 * (타이틀) | 차수변경(옵션) | 첫 실장 | 간격 | 1 | 간격 | 2 | 간격 | ... | n | 간격 |
 */
function tableHeader(title, columnLength) {
  const headerList = [];
  let maxLap = columnLength;

  headerList.push($("<th>", { class: "th-name-cell", id: "table-type" }).text(title));

  // 카드 차수 변경
  if ($(`#showChangeCardLapConvertBtn`).is(":checked")) {
    headerList.push($("<th>", { class: "th-seq-cell" }));
  }

  // 첫 실장 표시/비표시 설정
  if (!$(noShowRCardConvertBtn).is(":checked")) {
    headerList.push(
      $("<th>", { class: "th-header-title-cell", "data-lang": "firstImplementation" }).text(
        "첫 실장"
      )
    );

    headerList.push(
      $("<th>", { class: "th-header-interval-cell", "data-lang": "interval" }).text("간격")
    );

    maxLap--;
  }

  // 차수 표시
  for (let i = 0; i < maxLap; i++) {
    headerList.push($("<th>", { class: "th-header-title-cell" }).text(i + 1));

    headerList.push(
      $("<th>", { class: "th-header-interval-cell", "data-lang": "interval" }).text("간격")
    );
  }

  return headerList;
}

/**
 * 카드 차수 변경
 */
function changeCardLapCount(idolNum, value, min, max) {
  let val = value;

  if (value > max) {
    val = max;
  }

  if (value < min) {
    val = min;
  }

  ChangeCardLapInfo.setChangeCardLapByIdx(idolNum, val);
  updateDate();
}

/**
 * 카드 데이터의 표시와 카드간 사이의 간격일을 계산해서 표시
 */
function setCardData(totalData, totalLen, idolNum, maxLap) {
  const contentList = [];

  contentList.push($("<td>", { class: "td-name-cell" }).text(totalData.idol_name));
  // let resContent = `<td class="td-name-cell">${totalData.idol_name}</td>`;

  // 카드 차수 밀어내기
  if ($(`#showChangeCardLapConvertBtn`).is(":checked")) {
    //   resContent += `<td class="td-seq-cell"><input type="number" min="0" max="${maxLap}" value="${ChangeCardLapInfo.getChangeCardLapByIndex(
    //     idolNum
    //   )}"
    //   style="height:10px; width:50px" onchange="changeCardLapCount(${idolNum},this)"></td>`;

    contentList.push(
      $("<td>", { class: "td-seq-cell" }).append(
        $("<input>", {
          type: "number",
          min: 0,
          max: maxLap,
          value: ChangeCardLapInfo.getChangeCardLapByIndex(idolNum),
        })
          .css({ height: "10px", width: "50px" })
          .on("change", (e) => {
            const input = e.currentTarget;
            changeCardLapCount(idolNum, Number(input.value), Number(input.min), Number(input.max));
          })
      )
    );
  }

  cardDataList = totalData.card_data;
  cardLen = totalData.card_data.length;

  for (let idx = 0; idx < totalLen - ChangeCardLapInfo.getChangeCardLapByIndex(idolNum); idx++) {
    const currDay = 24 * 60 * 60 * 1000;

    // 첫 실장 표시/비표시 설정에 따른 카드 차수 변경 표시
    if (
      (!$(noShowRCardConvertBtn).is(":checked") && idx == 1) ||
      ($(noShowRCardConvertBtn).is(":checked") && idx == 0)
    ) {
      for (let i = 0; i < ChangeCardLapInfo.getChangeCardLapByIndex(idolNum); i++) {
        contentList.push($("<td>"));
        contentList.push($("<td>"));
        // resContent += "<td></td><td></td>";
      }
    }

    if (idx < cardLen) {
      const cardDate = cardDataList[idx].card_date;
      const cardType = cardDataList[idx].card_type;
      const cardName = cardDataList[idx].card_name;
      const cardAddr = cardDataList[idx].card_addr;
      const psType = cardDataList[idx].ps_type;

      increaseCardTypeCount(cardType);

      // 한정, 이벤트, 페스, 캠페인, 기타 카드의 경우, 셀 색상을 타입에 맞춰 변경
      const cardDateCell = $("<td>");

      switch (cardType) {
        case "limited":
          cardDateCell.addClass("limit-card-cell");
          break;
        case "twilight":
          cardDateCell.addClass("twilight-card-cell");
          break;
        case "mysongs":
          cardDateCell.addClass("mysongs-card-cell");
          break;
        case "parallel":
          cardDateCell.addClass("parallel-card-cell");
          break;
        case "event":
          cardDateCell.addClass("event-card-cell");
          break;
        case "fes":
          cardDateCell.addClass("gradeFes-card-cell");
          break;
        case "campaign":
          cardDateCell.addClass("campaign-card-cell");
          break;
        case "other":
          cardDateCell.addClass("other-card-cell");
          break;
      }

      if (cardAddr) {
        cardDateCell.attr("addr", cardAddr);
      }

      if (cardName) {
        cardDateCell.attr("name", cardName);
      }

      if (psType) {
        cardDateCell.attr("ps", psType);
      }

      const div = $("<div>", { class: "cell-div" });

      // 아이콘 표시가 체크된 경우 아이콘을 표시하도록 추가
      if ($(iconImgConvertBtn).is(":checked") && cardAddr) {
        const isProduce = psType == "p";
        const isFes = $("#fesImgConvertBtn").is(":checked");
        const isCard = false;
        const imgPath = getImagePath(isProduce, isFes, isCard);

        const iconImage = $("<img>", {
          src: getImgSrc(imgPath, cardAddr),
        })
          .css({
            height: "72px",
            width: "72px",
          })
          .on("error", (e) => {
            e.currentTarget.src = "./img/assets/Blank_Icon.png";
          });

        div.append(iconImage).append("<br>");
      }

      if (cardDate) {
        div.append($("<span>").text(cardDate));
      }

      cardDateCell.append(div);

      contentList.push(cardDateCell);

      // 카드 일정 데이터가 있는 경우, 간격일을 계산
      // 최신 실장이 아닌 경우 다음 실장 카드와 카드 간격일 계산
      // 최신 실장인 경우, 기준일과의 간격일 계산
      if (cardDate) {
        if (idx == cardLen - 1 || cardDataList[idx + 1].card_date == "") {
          const dateAfter = calDate(getBaseDate("#baseEndDate"));
          const dateBefore = calDate(cardDate);

          contentList.push(
            $("<td>", {
              class: "now-interval",
            }).text((dateAfter.getTime() - dateBefore.getTime()) / currDay)
          );
        } else {
          const dateAfter = calDate(cardDataList[idx + 1].card_date);
          const dateBefore = calDate(cardDate);

          contentList.push(
            $("<td>", {
              class: "pre-interval",
            }).text((dateAfter.getTime() - dateBefore.getTime()) / currDay)
          );
        }
      }
      // 카드 일정 데이터가 없는 경우, Skip
      else {
        contentList.push($("<td>"));
      }
    } else {
      contentList.push($("<td>"));
      contentList.push($("<td>"));
    }
  }

  return contentList;
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
    if (nowInterval.length == 0 || idolData.data[rowIdx].display_ranking == false) {
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
  const tableType = idolData.titleList.join("<br>");

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

  Language.setLanguageInTable(tableName);
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
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("permanent");
  }
  if ($("#limitedCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("limited");
  }
  if ($("#twilightCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("twilight");
  }
  if ($("#mysongsCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("mysongs");
  }
  if ($("#parallelCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("parallel");
  }
  if ($("#eventCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("event");
  }
  if ($("#gradeFesCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("fes");
  }
  if ($("#campaignCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("campaign");
  }
  if ($("#otherCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += getGachaTypeSeparateChar();
    else gachaTypeStr = "";
    gachaTypeStr += CardTypeInfo.getCardTypeIdentifier("other");
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

  Language.setLanguageInTable(tableName);
}

function getGachaTypeSeparateChar() {
  return " ";
}
