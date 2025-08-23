/**
 * 랭킹표 작성
 */
function createRankTable(idolData) {
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
    if (nowInterval.length == 0 || idolData.data[rowIdx].displayRanking == false) {
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

  console.log(intervalAry);

  const borderStyle = {
    left: { "border-left": "1px solid #000000" },
    right: { "border-right": "1px solid #000000" },
  };

  // 랭킹표 타이틀에 선택한 레어리티를 모두 표시
  const tableTypeHeader = idolData.titleList.join("<br>");

  // 메인표 옆에 표시 (아이돌의 위치는 바뀌지 않음)
  createSideRankTable(intervalAry, oldRanks, borderStyle);

  // 메인표와 별개로 표시 (아이돌의 위치가 바뀜)
  createSeparateRankTable(tableTypeHeader, intervalAry, oldRanks, borderStyle);
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
function createSideRankTable(intervalAry, oldRanks, borderStyle) {
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
function createSeparateRankTable(tableTypeHeader, intervalAry, oldRanks, borderStyle) {
  const tableName = "rank-table-1";
  const table = $("<table>", { id: tableName });

  const thead = $("<thead>");
  const headTr1 = $("<tr>").append(
    $("<th>", { class: "th-rank", colspan: 3 }).append(tableTypeHeader)
  );

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
