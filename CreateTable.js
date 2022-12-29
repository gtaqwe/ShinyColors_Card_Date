/**
 * 표 생성
 * idolData : IndexScripts.js의 function idolDataProcess참조
 */
function buildTable(idolData) {
  runBuildTable(idolData); // 메인표
  // setLanguage(VIEW_LANGUAGE);

  runBuildDateRank(); // 랭킹표
  // setLanguage(VIEW_LANGUAGE);
}

/**
 * 메인표 작성
 */
function runBuildTable(idolData) {
  var tableTitle = idolData.Title; // 카드 타입
  var rowLength = idolData.Data.length; // 아이돌 수
  var columnLength = idolData.Length; // 최대 카드 데이터 수

  const tableName = "date-table";

  var table = `<table id="${tableName}">`;

  table += "<thead>";
  table += `<tr class="tr-main-header">`;

  table += tableHeader(tableTitle, columnLength);

  table += "</tr>";
  table += "</thead>";
  table += "<tbody>";

  for (var row = 0; row < rowLength; row++) {
    table += `<tr class="tr-main-data">`;

    table += setCardData(idolData.Data[row], columnLength);

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
 * (타이틀) | 첫 실장 | 간격 | 1 | 간격 | 2 | 간격 | ... | n | 간격 |
 */
function tableHeader(title, columnLength) {
  var resContent = `<th class="th-name-cell" id="table-type">${title}</th>`;

  // 첫 실장 표시/비표시 설정
  if (!$(noShowRCardConvertBtn).is(":checked")) {
    resContent += `<th class="th-header-title-cell" data-lang="firstImplementation">첫 실장</th>`;
    resContent += `<th class="th-header-interval-cell" data-lang="interval">간격</th>`;

    columnLength--;
  }

  for (var i = 0; i < columnLength; i++) {
    resContent += `<th class="th-header-title-cell">${i + 1}</th>`;

    resContent += `<th class="th-header-interval-cell" data-lang="interval">간격</th>`;
  }

  return resContent;
}

/**
 * 카드 데이터의 표시와 카드간 사이의 간격일을 계산해서 표시
 */
function setCardData(totalData, totalLen) {
  var resContent = `<td class="td-name-cell">${totalData.idol_name}</td>`;

  cardDataList = totalData.card_data;
  cardLen = totalData.card_data.length;
  for (var idx = 0; idx < totalLen; idx++) {
    var dateBefore; // Before
    var dateAfter; // After
    var currDay = 24 * 60 * 60 * 1000;
    var interval;
    var intervalCode;

    if (idx < cardLen) {
      var cardDate = cardDataList[idx].card_date;
      var cardType = cardDataList[idx].card_type;
      var cardName = cardDataList[idx].card_name;
      var cardAddr = cardDataList[idx].card_addr;
      var cardRerun = cardDataList[idx].card_rerun;

      var rerunVal = $(`input[name="showRerun"]:checked`).val();
      var cardRerunStr = cardRerun.toString();

      countCardType(cardType);

      // 한정, 이벤트, 페스, 캠페인, 기타 카드의 경우, 셀 색상을 타입에 맞춰 변경
      if (cardType == "limited") {
        // 복각 표시 라디오버튼에 따라 복각 표시 스타일 지정
        if (rerunVal != "" && (rerunVal == "all" || rerunVal == cardRerunStr)) {
          resContent += `<td class="card-rerun-${cardRerunStr}-cell" `;
        } else {
          resContent += '<td class="limit-card-cell" ';
        }
      } else if (cardType == "twilight") {
        resContent += '<td class="twilight-card-cell" ';
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

      resContent += `addr="${cardAddr}" name="${cardName}">`;

      // 복각 표시 라디오버튼에 따라 복각 표시 스타일 지정
      // 캡쳐시 box-shadow에 버그가 있기 때문에 div로 스타일 변경
      if (
        cardType == "limited" &&
        rerunVal != "" &&
        (rerunVal == "all" || rerunVal == cardRerunStr)
      ) {
        resContent += `<div class="cell-div-limit">`;
      } else {
        resContent += `<div class="cell-div">`;
      }

      // 아이콘 표시가 체크된 경우 아이콘을 표시하도록 추가
      if ($(iconImgConvertBtn).is(":checked") && cardAddr != "" && cardAddr != undefined) {
        var style = `style= "width:72px; height:72px"`;
        var onerror = `onerror = "this.src='./img/assets/Blank_Idol.png'"`;

        var imgPath = "icon_normal";
        if ($(fesImgConvertBtn).is(":checked") && cardAddr.split("_")[1] == "p") {
          imgPath = "icon_fes";
        }
        resContent += `<img src="${getImgSrc(imgPath, cardAddr)}" ${style} ${onerror}><br>`;
      }
      resContent += `${cardDate}</div></td>`;

      // 카드 일정 데이터가 있는 경우, 간격일을 계산
      // 최신 실장이 아닌 경우 다음 실장 카드와 카드 간격일 계산
      // 최신 실장인 경우, 기준일과의 간격일 계산
      if (cardDate != "") {
        dateBefore = calDate(cardDate);

        if (idx == cardLen - 1 || cardDataList[idx + 1].card_date == "") {
          dateAfter = calDate(getBaseDate("#BaseEndDate"));
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
  var baseEndDate = new Date($(dateId).val());

  return baseEndDate.toISOString().slice(0, 10);
}

/**
 * 입력한 날짜 문자열을 Date형으로 Return
 */
function calDate(dateStr) {
  return new Date(dateStr);
}

/**
 * 랭킹표 작성 시작
 */
function runBuildDateRank() {
  var intervalAry = [];
  var rows = $("#date-table .tr-main-data");

  for (var i = 0; i < rows.length; i++) {
    nameStr = $(`#date-table .tr-main-data:eq(${i}) .td-name-cell`).text();

    // 카드가 단 하나도 실장되지 않았을 경우 처리 (R카드도 없는 경우)
    var nowInterval = $(`#date-table .tr-main-data:eq(${i}) .now-interval`);
    if (nowInterval.length == 0) {
      intervalAry.push([nameStr, Number.MIN_VALUE]);
    } else {
      intervalAry.push([nameStr, Number(nowInterval.text())]);
    }
  }

  buildDataRank(intervalAry);
}

/**
 * 랭킹 정렬 후 실제 랭킹표 작성
 */
function buildDataRank(intervalAry) {
  // old... : 오래된 순으로 랭킹 계산
  // new... : 최신 순으로 랭킹 계산

  // 원본 배열을 바꾸지 않도록 하기위해 slice()사용
  var oldFirst = intervalAry.slice().sort((a, b) => b[1] - a[1]);
  // var newFirst = intervalAry.slice().sort(function(a,b){return a-b});
  var oldRanks = intervalAry.map(function (v) {
    return oldFirst.indexOf(v) + 1;
  });
  // var newRanks = intervalAry.map(function (v) {
  //   return newFirst.indexOf(v) + 1;
  // });

  var borderStyle = {
    left: "border-left: 1px solid #000000;",
    right: "border-right: 1px solid #000000;",
  };

  var tableType = $("#table-type").text();

  // 0 : 메인표 옆에 표시 (아이돌의 위치는 바뀌지 않음)
  // 1 : 메인표와 별개로 표시 (아이돌의 위치가 바뀜)
  buildRankTable0(tableType, intervalAry, oldRanks, borderStyle);
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
function buildRankTable0(_tableType, intervalAry, oldRanks, borderStyle) {
  const tableName = "rank-table-0";
  var table = `<table id="${tableName}">`;
  table += "<thead>";

  table += `<tr style="height:${$("#date-table tr").eq(0).height()}px">`;
  table += `<th class="th-rank" style="${borderStyle.right}" data-lang="name">이름</th>`;
  table += `<th class="th-rank" style="${borderStyle.right}${borderStyle.left}" data-lang="rank">순위</th>`;
  table += `<th class="th-rank" style="${borderStyle.left}" data-lang="intervalDate">간격일</th>`;
  table += "</tr>";
  table += "</thead>";

  table += "<tbody>";

  for (var i = 0; i < intervalAry.length; i++) {
    var rankStr = "-";
    var nameStr = intervalAry[i][0];
    var intervalStr = "-";

    if (Number(intervalAry[i][1]) != Number.MIN_VALUE) {
      rankStr = oldRanks[i];
      intervalStr = intervalAry[i][1];
    }

    if (intervalAry[i] == "") rankStr = "미실장";
    var cellColor = selectCellColor(rankStr);

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
  var table = `<table id="${tableName}">`;
  table += "<thead>";
  table += "<tr>";
  table += `<th class="th-rank" colspan="3">${tableType}</th>`;
  table += "</tr>";

  // 선택한 카드타입 표시
  const notSelectStr = "미선택";
  var gachaTypeStr = notSelectStr;
  if ($("#permanentCardChkBox").is(":checked")) {
    gachaTypeStr = "";
    gachaTypeStr += "P";
  }
  if ($("#limitedCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += " ";
    else gachaTypeStr = "";
    gachaTypeStr += "L";
  }
  if ($("#twilightCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += " ";
    else gachaTypeStr = "";
    gachaTypeStr += "T";
  }
  if ($("#eventCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += " ";
    else gachaTypeStr = "";
    gachaTypeStr += "E";
  }
  if ($("#gradeFesCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += " ";
    else gachaTypeStr = "";
    gachaTypeStr += "F";
  }
  if ($("#campaignCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += " ";
    else gachaTypeStr = "";
    gachaTypeStr += "C";
  }
  if ($("#otherCardChkBox").is(":checked")) {
    if (gachaTypeStr != notSelectStr) gachaTypeStr += " ";
    else gachaTypeStr = "";
    gachaTypeStr += "O";
  }

  table += "<tr>";
  table += `<th class="th-rank" colspan="3">${gachaTypeStr}</th>`;
  table += "</tr>";

  table += "<tr>";
  table += `<th class="th-rank" colspan="3">
  ${getBaseDate("#BaseStartDate")}<br />
  ~<br />
  ${getBaseDate("#BaseEndDate")}</th>`;
  table += "</tr>";

  table += "<tr>";
  table += `<th class="th-rank" style="${borderStyle.right}" data-lang="name">이름</th>`;
  table += `<th class="th-rank" style="${borderStyle.right}${borderStyle.left}" data-lang="rank">순위</th>`;
  table += `<th class="th-rank" style="${borderStyle.left}" data-lang="intervalDate">간격일</th>`;
  table += "</tr>";
  table += "</thead>";

  table += "<tbody>";

  for (var i = 0; i < intervalAry.length; i++) {
    var rankIndex = oldRanks.indexOf(i + 1);
    var rankStr = "-";
    var nameStr = intervalAry[rankIndex][0];
    var intervalStr = "-";

    if (Number(intervalAry[rankIndex][1]) != Number.MIN_VALUE) {
      rankStr = oldRanks[rankIndex];
      intervalStr = intervalAry[rankIndex][1];
    }

    if (intervalAry[rankIndex] == "") rankStr = "미실장";
    var cellColor = selectCellColor(rankStr);

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
