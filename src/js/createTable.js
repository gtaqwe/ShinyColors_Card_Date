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

  // 카드 차수 밀어내기
  if ($(`#showChangeCardLapConvertBtn`).is(":checked")) {
    contentList.push(
      $("<td>", { class: "td-seq-cell" }).append(
        $("<input>", {
          type: "number",
          min: 0,
          max: maxLap,
          value: ChangeCardLapInfo.getChangeCardLapByIndex(idolNum),
        })
          .css({ height: 10, width: 50 })
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
    // 첫 실장 표시/비표시 설정에 따른 카드 차수 변경 표시
    if (
      (!$(noShowRCardConvertBtn).is(":checked") && idx == 1) ||
      ($(noShowRCardConvertBtn).is(":checked") && idx == 0)
    ) {
      for (let i = 0; i < ChangeCardLapInfo.getChangeCardLapByIndex(idolNum); i++) {
        contentList.push($("<td>"));
        contentList.push($("<td>"));
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

      if (cardAddr) cardDateCell.attr("addr", cardAddr);
      if (cardName) cardDateCell.attr("name", cardName);
      if (psType) cardDateCell.attr("ps", psType);

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
            height: 72,
            width: 72,
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
      const intervalTd = $("<td>");
      if (cardDate) {
        if (idx == cardLen - 1 || isBlank(cardDataList[idx + 1].card_date)) {
          intervalTd
            .addClass("now-interval")
            .text(getDateDiff(cardDate, getISODateById("#baseEndDate")));
        } else {
          intervalTd
            .addClass("pre-interval")
            .text(getDateDiff(cardDate, cardDataList[idx + 1].card_date));
        }
      }
      contentList.push(intervalTd);
    } else {
      contentList.push($("<td>"));
      contentList.push($("<td>"));
    }
  }

  return contentList;
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
    left: { "border-left": "1px solid #000000" },
    right: { "border-right": "1px solid #000000" },
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
  switch (rankStr) {
    case 1:
      // Red
      return { "background-color": "rgba(255, 0, 0, 0.4)" };
    case 2:
      // Orange
      return { "background-color": "rgba(255, 165, 0, 0.4)" };
    case 3:
      // Yellow
      return { "background-color": "rgba(255, 255, 0, 0.4)" };
    case 4:
      // Green
      return { "background-color": "rgba(0, 128, 0, 0.4)" };
    case 5:
      // Blue
      return { "background-color": "rgba(0, 0, 255, 0.4)" };
    case 6:
      // Indigo
      return { "background-color": "rgba(75, 0, 130, 0.4)" };
    case 7:
      // Violet
      return { "background-color": "rgba(238, 130, 238, 0.4)" };
    default:
      return {};
  }
}

/**
 * 메인표 옆의 랭킹표 (아이돌 순으로 랭킹 표시)
 */
function buildRankTable0(intervalAry, oldRanks, borderStyle) {
  const tableName = "rank-table-0";

  const table = $("<table>", { id: tableName });
  const thead = $("<thead>");

  const tr = $("<tr>").css({
    height: $("#date-table tr").eq(0).height(),
  });

  const th1 = $("<th>", {
    class: "th-rank",
    "data-lang": "name",
  })
    .css(borderStyle.right)
    .text("이름");

  const th2 = tr.append(
    $("<th>", {
      class: "th-rank",
      "data-lang": "rank",
    })
      .css(borderStyle.right)
      .css(borderStyle.left)
      .text("순위")
  );

  const th3 = tr.append(
    $("<th>", {
      class: "th-rank",
      "data-lang": "intervalDate",
    })
      .css(borderStyle.left)
      .text("간격일")
  );

  tr.append(th1, th2, th3);
  thead.append(tr);

  const tbody = $("<tbody>");

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

    const tr = $("<tr>").css({
      height: $("#date-table tr")
        .eq(i + 1)
        .height(),
    });

    const td1 = $("<td>")
      .css(borderStyle.right)
      .css(cellColor)
      .append($("<div>", { class: "cell-div" }).text(nameStr));

    const td2 = $("<td>")
      .css(borderStyle.right)
      .css(borderStyle.left)
      .css(cellColor)
      .append($("<div>", { class: "cell-div" }).text(rankStr));

    const td3 = $("<td>")
      .css(borderStyle.left)
      .css(cellColor)
      .append($("<div>", { class: "cell-div" }).text(intervalStr));

    tr.append(td1, td2, td3);
    tbody.append(tr);
  }

  table.append(thead, tbody);

  $("#MAIN_RANK").html(table);

  Language.setLanguageInTable(tableName);
}

/**
 * 메인 표 아래의 랭킹표 (현재 간격일 순으로 표시)
 */
function buildRankTable1(tableType, intervalAry, oldRanks, borderStyle) {
  const tableName = "rank-table-1";
  const table = $("<table>", { id: tableName });

  const thead = $("<thead>");
  const headTr1 = $("<tr>").append($("<th>", { class: "th-rank", colspan: 3, text: tableType }));

  // 선택한 카드타입 표시
  const selectedGachaTypeList = [];

  if ($("#permanentCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("permanent"));
  }
  if ($("#limitedCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("limited"));
  }
  if ($("#twilightCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("twilight"));
  }
  if ($("#mysongsCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("mysongs"));
  }
  if ($("#parallelCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("parallel"));
  }
  if ($("#eventCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("event"));
  }
  if ($("#gradeFesCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("fes"));
  }
  if ($("#campaignCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("campaign"));
  }
  if ($("#otherCardChkBox").is(":checked")) {
    selectedGachaTypeList.push(CardTypeInfo.getCardTypeIdentifier("other"));
  }

  const gachaTypeStr =
    selectedGachaTypeList.length > 0
      ? selectedGachaTypeList.join(" ")
      : Language.getTranslatedName("notSet");

  const headTr2 = $("<tr>").append($("<th>", { class: "th-rank", colspan: 3 }).text(gachaTypeStr));

  const headTr3 = $("<tr>").append(
    $("<th>", { class: "th-rank", colspan: 3 })
      .append(getISODateById("#baseStartDate"))
      .append("<br>~<br>")
      .append(getISODateById("#baseEndDate"))
  );

  const headTr4 = $("<tr>");

  const th1 = $("<th>", { class: "th-rank", "data-lang": "name" })
    .css(borderStyle.right)
    .text("이름");

  const th2 = $("<th>", { class: "th-rank", "data-lang": "rank" })
    .css(borderStyle.right)
    .css(borderStyle.left)
    .text("순위");

  const th3 = $("<th>", { class: "th-rank", "data-lang": "intervalDate" })
    .css(borderStyle.left)
    .text("간격일");

  headTr4.append(th1, th2, th3);

  thead.append(headTr1, headTr2, headTr3, headTr4);

  const tbody = $("<tbody>");

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

    const tr = $("<tr>");

    const td1 = $("<td>")
      .css(borderStyle.right)
      .css(cellColor)
      .append($("<div>", { class: "cell-div" }).text(nameStr));

    const td2 = $("<td>")
      .css(borderStyle.right)
      .css(borderStyle.left)
      .css(cellColor)
      .append($("<div>", { class: "cell-div" }).text(rankStr));

    const td3 = $("<td>")
      .css(borderStyle.left)
      .css(cellColor)
      .append($("<div>", { class: "cell-div" }).text(intervalStr));

    tr.append(td1, td2, td3);
    tbody.append(tr);
  }

  table.append(thead, tbody);

  $("#RANK").html(table);

  Language.setLanguageInTable(tableName);
}
