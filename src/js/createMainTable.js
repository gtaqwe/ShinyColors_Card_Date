/**
 * 메인표 작성
 */
function createMainTable(idolData) {
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
      (v, idx) => Number(v.cardData.length) + Number(ChangeCardLapInfo.getChangeCardLapByIndex(idx))
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
    ...idolData.data.map((v) => v.cardData.filter((cardObj) => cardObj.cardType != "first").length)
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

  contentList.push($("<td>", { class: "td-name-cell" }).text(totalData.idolName));

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

  cardDataList = totalData.cardData;
  cardLen = totalData.cardData.length;

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
      const cardDate = cardDataList[idx].cardDate;
      const cardType = cardDataList[idx].cardType;
      const cardName = cardDataList[idx].cardName;
      const cardAddr = cardDataList[idx].cardAddr;
      const psType = cardDataList[idx].psType;

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
        if (idx == cardLen - 1 || isBlank(cardDataList[idx + 1].cardDate)) {
          intervalTd
            .addClass("now-interval")
            .text(getDateDiff(cardDate, getISODateById("#baseEndDate")));
        } else {
          intervalTd
            .addClass("pre-interval")
            .text(getDateDiff(cardDate, cardDataList[idx + 1].cardDate));
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
