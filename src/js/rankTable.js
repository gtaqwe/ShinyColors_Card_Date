import CardCategoryInfo from "./cardCategoryInfo.js";
import Language from "./language.js";

import { NONE_INTERVAL, CARD_TYPE_MATRIX } from "./constant.js";

import * as Utility from "./utility.js";

/**
 * 랭킹표 작성
 */
export function createRankTable(idolData) {
  // 카드 정보가 존재 하지 않을 경우, 표를 작성하지 않음
  if (!idolData) {
    $("#MAIN_RANK").empty();
    $("#RANK").empty();
    return;
  }

  const intervalList = [];
  const rows = $("#date-table .tr-main-data");

  rows.each((idx, row) => {
    const name = $(row).find(".td-name-cell").text();
    const nowInterval = $(row).find(".now-interval");

    // 이하의 경우에는 랭킹 표시를 하지 않음 (「-」로 표시)
    // 1. 카드가 단 하나도 실장되지 않았을 경우 (R카드도 없는 경우)
    // 2. 랭킹표시 플래그가 False인 경우
    const isDisplayInterval = nowInterval.length > 0 && idolData.data[idx].displayRanking != false;

    intervalList.push({
      name: name,
      interval: isDisplayInterval ? Number(nowInterval.text()) : NONE_INTERVAL,
    });
  });

  const sortedListByInterval = [...intervalList].sort((a, b) =>
    Utility.compareByValueDesc(a.interval, b.interval)
  );
  const rankedIntervalList = intervalList.map((item) => {
    const rank = sortedListByInterval.findIndex((sortedItem) => sortedItem == item) + 1;
    return { ...item, rank: rank };
  });

  const borderStyle = {
    left: { "border-left": "1px solid #000000" },
    right: { "border-right": "1px solid #000000" },
  };

  // 메인표 옆에 표시 (아이돌의 위치는 바뀌지 않음)
  createSideRankTable(rankedIntervalList, borderStyle);

  // 랭킹표 타이틀에 선택한 레어리티를 모두 표시
  const tableTypeHeader = idolData.titleList.join("<br>");

  // 메인표와 별개로 표시 (아이돌의 위치가 랭크에 따라 바뀜)
  createSeparateRankTable(tableTypeHeader, rankedIntervalList, borderStyle);
}

/**
 * 랭킹에 따른 셀의 색 결정
 */
function selectCellColor(rankStr) {
  switch (rankStr) {
    case "1":
      // Red
      return { "background-color": "rgba(255, 0, 0, 0.4)" };
    case "2":
      // Orange
      return { "background-color": "rgba(255, 165, 0, 0.4)" };
    case "3":
      // Yellow
      return { "background-color": "rgba(255, 255, 0, 0.4)" };
    case "4":
      // Green
      return { "background-color": "rgba(0, 128, 0, 0.4)" };
    case "5":
      // Blue
      return { "background-color": "rgba(0, 0, 255, 0.4)" };
    case "6":
      // Indigo
      return { "background-color": "rgba(75, 0, 130, 0.4)" };
    case "7":
      // Violet
      return { "background-color": "rgba(238, 130, 238, 0.4)" };
    default:
      return {};
  }
}

/**
 * 메인표 옆의 랭킹표 (아이돌 순으로 랭킹 표시)
 */
function createSideRankTable(rankedIntervalList, borderStyle) {
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

  const th2 = $("<th>", {
    class: "th-rank",
    "data-lang": "rank",
  })
    .css(borderStyle.right)
    .css(borderStyle.left)
    .text("순위");

  const th3 = $("<th>", {
    class: "th-rank",
    "data-lang": "intervalDate",
  })
    .css(borderStyle.left)
    .text("간격일");

  tr.append(th1, th2, th3);
  thead.append(tr);

  const tbody = $("<tbody>");

  for (let i = 0; i < rankedIntervalList.length; i++) {
    const intervalData = rankedIntervalList[i];
    const nameStr = intervalData.name;
    let rankStr = "-";
    let intervalStr = "-";

    if (Number(intervalData.interval) != NONE_INTERVAL) {
      rankStr = String(intervalData.rank);
      intervalStr = String(intervalData.interval);
    }

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
function createSeparateRankTable(tableTypeHeader, rankedIntervalList, borderStyle) {
  const tableName = "rank-table-1";
  const table = $("<table>", { id: tableName });

  const thead = $("<thead>");
  const headTr1 = $("<tr>").append(
    $("<th>", { class: "th-rank", colspan: 3 }).append(tableTypeHeader)
  );

  // 선택한 카드타입 표시
  const selectedGachaTypeList = [];

  const cardCategoryKeys = CardCategoryInfo.getCardCategoryKeys();

  cardCategoryKeys.forEach((cardCategory) => {
    const checkBox = CardCategoryInfo.getCardCategoryCheckBox(cardCategory);
    if ($(`#${checkBox}`).is(":checked")) {
      selectedGachaTypeList.push(CardCategoryInfo.getCardCategoryIdentifier(cardCategory));
    }
  });

  const sortedIdentifierList = CardCategoryInfo.getSortedAllCardCategoryIdentifier();
  const cardCategoryTable = $("<table>", {
    id: "cardCategoryTable",
    class: "card-type-rank-table",
  });
  let cardCategoryIndex = 0;
  for (let row = 0; row < CARD_TYPE_MATRIX.ROW; row++) {
    const tr = $("<tr>", { class: "card-type-rank-tr" });
    for (let col = 0; col < CARD_TYPE_MATRIX.COLUMN; col++) {
      const cardCategoryIdentifier = sortedIdentifierList.find(
        (item) => item.index === cardCategoryIndex
      );

      $("<th>", { class: "card-type-rank-th" })
        .text(cardCategoryIdentifier?.identifier)
        .toggleClass(function () {
          return selectedGachaTypeList.find((key) => key === cardCategoryIdentifier?.identifier)
            ? "font-color-normal"
            : "font-color-transparent";
        })
        .appendTo(tr);

      cardCategoryIndex++;
    }
    cardCategoryTable.append(tr);
  }

  const headTr2 = $("<tr>").append(
    $("<th>", { class: "th-rank", colspan: 3 }).append(cardCategoryTable)
  );

  const headTr3 = $("<tr>").append(
    $("<th>", { class: "th-rank", colspan: 3 })
      .append(Utility.getISODateById("#baseStartDate"))
      .append("<br>~<br>")
      .append(Utility.getISODateById("#baseEndDate"))
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

  for (let i = 0; i < rankedIntervalList.length; i++) {
    const intervalData = rankedIntervalList.find((item) => item.rank == i + 1);
    const nameStr = intervalData.name;
    let rankStr = "-";
    let intervalStr = "-";

    if (Number(intervalData.interval) != NONE_INTERVAL) {
      rankStr = String(intervalData.rank);
      intervalStr = String(intervalData.interval);
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
