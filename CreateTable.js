// 표 생성
// idolData : IndexScripts.js의 function idolDataProcess참조
function buildTable(idolData) {
    runBuildTable(idolData);    // 메인표
    runBuildDateRank();         // 랭킹표
}

// 메인표
function runBuildTable(idolData) {
    var tableTitle = idolData.Title;        // 카드 타입
    var rowLength = idolData.Data.length;   // 최대 카드 데이터 수
    var columnLength = idolData.Length;     // 아이돌 수

    var table = '<table id="date-table">';

    table += '<thead>';
    table += '<tr>';

    table += tableHeader(tableTitle, columnLength);

    table += '</tr>';
    table += '</thead>';
    table += '<tbody>';

    for (var row = 0; row < rowLength; row++) {
        table += '<tr>';

        table += calTerm(idolData.Data[row], columnLength);

        table += '</tr>';
    }

    table += '</tbody>';
    table += '</table>';

    document.getElementById('MAIN').innerHTML = table;

    imgMapping(this);
};

// 메인표 헤더
// (타이틀) | 첫 실장 | 간격 | 1 | 간격 | 2 | 간격 | ... | n | 간격 |
function tableHeader(title, len) {
    var resContent = '<th class="th-name-cell" id="table-type">' + title + '</th>';

    for (var i = 0; i < len; i++) {
        cellTitle = i;
        if (i == 0) cellTitle = '첫 실장'
        resContent += '<th>' + cellTitle + '</th>';
        resContent += '<th class="pre-term">' + '간격' + '</th>';
    }

    return resContent
}

// 카드 데이터 표시와 카드간 사이의 간격일을 계산해서 표시
function calTerm(totalData, totalLen) {
    var resContent = '<td class="td-name-cell">' + totalData.idol_name + '</td>';

    cardDataList = totalData.card_data;
    cardLen = totalData.card_data.length;
    for (var idx = 0; idx < totalLen; idx++) {
        var date1; // Before
        var date2; // After
        var currDay = 24 * 60 * 60 * 1000;
        var term;
        var termCode;

        if (idx < cardLen) {
            var cardDate = cardDataList[idx].card_date;
            var cardType = cardDataList[idx].card_type;
            var cardName = cardDataList[idx].card_name;
            var cardAddr = cardDataList[idx].card_addr;

            // 한정, 이벤트, 캠페인 카드의 경우, 셀 색상을 타입에 맞춰 변경
            if (cardType == "한정") {
                resContent += '<td class="limit-card-cell" ';
            }
            else if (cardType == "이벤트") {
                resContent += '<td class="event-card-cell" ';
            }
            else if (cardType == "캠페인") {
                resContent += '<td class="campaign-card-cell" ';
            }
            else {
                resContent += '<td ';
            }

            resContent += 'addr="' + cardAddr + '" name="' + cardName + '"' + '>' + cardDate + '</td>';

            // 카드 일정 데이터가 있는 경우, 간격일을 계산
            // 최신 실장이 아닌 경우 다음 실장 카드와 카드 간격일 계산
            // 최신 실장인 경우, 기준일과의 간격일 계산
            if (cardDate != '') {
                date1 = calDate(cardDate);

                if (idx == cardLen - 1 || cardDataList[idx + 1].card_date == '') {
                    date2 = calDate(getTargetDate());
                    term = (date2 - date1) / currDay;
                    termCode = '<td class="now-term">' + term + '</td>';
                }
                else {
                    date2 = calDate(cardDataList[idx + 1].card_date);
                    term = (date2 - date1) / currDay;
                    termCode = '<td class="pre-term">' + term + '</td>';
                }
            }
            // 카드 일정 데이터가 없는 경우, Skip
            else {
                termCode = '<td></td>';
            }
        }
        else {
            resContent += '<td></td>';
            termCode = '<td></td>';
        }

        resContent = resContent + termCode;
    }

    return resContent;
}

// 기준일
function getTargetDate() {
    var targetDate = document.getElementById('TargetDate').valueAsDate;
    var nowYear = targetDate.getFullYear();
    var nowMonth = targetDate.getMonth() + 1;
    var nowDate = targetDate.getDate();

    return nowYear.toString() + '-' + nowMonth.toString().padStart(2, '0') + '-' + nowDate.toString().padStart(2, '0');
}

// 날짜 계산
function calDate(dateStr) {
    var dateAry = dateStr.split('-');
    var y = dateAry[0] - 1900;
    var m = dateAry[1] - 1;
    var d = dateAry[2];
    var date = new Date(y, m, d);

    return date;
}

// 랭킹표
function runBuildDateRank() {
    var targetTable = document.getElementById('date-table');
    var termAry = [];

    var names = targetTable.getElementsByClassName('td-name-cell');
    var terms = targetTable.getElementsByClassName('now-term');

    for (var i = 0; i < names.length; i++) {
        nameStr = names[i].innerHTML

        // 카드가 단 하나도 실장되지 않았을 경우 처리 (R카드도 없는 경우)
        if (terms[i] === undefined) {
            termAry.push([nameStr, ""])
        }
        else {
            termAry.push([nameStr, terms[i].innerHTML])
        }

    }

    buildDataRank(termAry);
}

function buildDataRank(termAry) {
    // old... : 오래된 순으로 랭킹 계산
    // new... : 최신 순으로 랭킹 계산

    var oldFirst = termAry.slice().sort(function (a, b) { return b[1] - a[1] });
    // var newFirst = termAry.slice().sort(function(a,b){return a-b});
    var oldRanks = termAry.map(function (v) { return oldFirst.indexOf(v) + 1 });
    // var newRanks = termAry.map(function(v){ return newFirst.indexOf(v)+1 });

    var borderStyle = {
        'left': 'border-left: 2px solid #000000;',
        'top': 'border-top: hidden;',
        'bottom': 'border-bottom: hidden;'
    }

    var tableType = document.getElementById('table-type').innerHTML

    // 0 : 메인표 옆에 표시 (아이돌의 위치는 바뀌지 않음)
    // 1 : 메인표와 별개로 표시 (아이돌의 위치가 바뀜)
    buildRankTable0(tableType, termAry, oldRanks, borderStyle);
    buildRankTable1(tableType, termAry, oldRanks, borderStyle);

}

function buildRankTable0(table, termAry, oldRanks, borderStyle) {
    var table = $('#date-table');
    var tableRows = table.find('tr')

    $(tableRows[0]).append('<th style="' + borderStyle.left + borderStyle.top + borderStyle.bottom + '"></th>');
    $(tableRows[0]).append('<th style="' + borderStyle.left + '">이름</th>');
    $(tableRows[0]).append('<th style="' + borderStyle.left + '">순위</th>');
    $(tableRows[0]).append('<th style="' + borderStyle.left + '">간격일</th>');

    for (var i = 0; i < termAry.length; i++) {
        var rankStr = oldRanks[i]
        var nameStr = termAry[i][0]
        var termStr = termAry[i][1]
        var tableIndex = i + 1

        var styleStr = borderStyle.left

        if (termAry[i] == '') rankStr = '미실장';

        if (rankStr == '1') styleStr += 'background-color: rgba(255, 0, 0, 0.4) ; '; // Red
        else if (rankStr == '2') styleStr += 'background-color: rgba(255, 165, 0, 0.4) ; '; // Orange
        else if (rankStr == '3') styleStr += 'background-color: rgba(255, 255, 0, 0.4) ; '; // Yellow
        else if (rankStr == '4') styleStr += 'background-color: rgba(0, 128, 0, 0.4) ; '; // Green
        else if (rankStr == '5') styleStr += 'background-color: rgba(0, 0, 255, 0.4) ; '; // Blue
        else if (rankStr == '6') styleStr += 'background-color: rgba(75, 0, 130, 0.4) ; '; // Indigo
        else if (rankStr == '7') styleStr += 'background-color: rgba(238, 130, 238, 0.4) ; '; // Violet

        $(tableRows[tableIndex]).append('<td style="' + borderStyle.left + borderStyle.bottom + '"></td>');
        $(tableRows[tableIndex]).append('<td style="' + styleStr + '">' + nameStr + '</td>');
        $(tableRows[tableIndex]).append('<td style="' + styleStr + '">' + rankStr + '</td>');
        $(tableRows[tableIndex]).append('<td style="' + styleStr + '">' + termStr + '</td>');
    }
}

function buildRankTable1(tableType, termAry, oldRanks, borderStyle) {
    var table = '<table id="rank-table-2">';
    table += '<thead>';
    table += '<tr>';
    table += '<th colspan="3">' + tableType + '</th>';
    table += '</tr>';

    // 선택한 카드타입 표시
    const notSelectStr = "미선택"
    var gachaTypeStr = notSelectStr
    if ($("#permanentCardChkBox").is(":checked")) {
        gachaTypeStr = ""
        gachaTypeStr += "P"
    }
    if ($("#limitedCardChkBox").is(":checked")) {
        if (gachaTypeStr != notSelectStr) gachaTypeStr += " "
        else gachaTypeStr = ""
        gachaTypeStr += "L"
    }
    if ($("#eventCardChkBox").is(":checked")) {
        if (gachaTypeStr != notSelectStr) gachaTypeStr += " "
        else gachaTypeStr = ""
        gachaTypeStr += "E"
    }
    if ($("#campaignCardChkBox").is(":checked")) {
        if (gachaTypeStr != notSelectStr) gachaTypeStr += " "
        else gachaTypeStr = ""
        gachaTypeStr += "C"
    }

    table += '<tr>';
    table += '<th colspan="3">' + gachaTypeStr + '</th>';
    table += '</tr>';

    table += '<tr>';
    table += '<th colspan="3">' + getTargetDate() + '</th>';
    table += '</tr>';

    table += '<tr>';
    table += '<th style="' + borderStyle.left + '">이름</th>';
    table += '<th style="' + borderStyle.left + '">순위</th>';
    table += '<th style="' + borderStyle.left + '">간격일</th>';
    table += '</tr>';
    table += '</thead>';

    table += '<tbody>';

    for (var i = 0; i < termAry.length; i++) {
        var rankIndex = oldRanks.indexOf(i + 1);
        var rankStr = oldRanks[rankIndex];
        var nameStr = termAry[rankIndex][0];
        var termStr = termAry[rankIndex][1];

        var styleStr = borderStyle.left;

        if (termAry[rankIndex] == '') rankStr = '미실장';

        if (rankStr == '1') styleStr += 'background-color: rgba(255, 0, 0, 0.4) ; '; // Red
        else if (rankStr == '2') styleStr += 'background-color: rgba(255, 165, 0, 0.4) ; '; // Orange
        else if (rankStr == '3') styleStr += 'background-color: rgba(255, 255, 0, 0.4) ; '; // Yellow
        else if (rankStr == '4') styleStr += 'background-color: rgba(0, 128, 0, 0.4) ; '; // Green
        else if (rankStr == '5') styleStr += 'background-color: rgba(0, 0, 255, 0.4) ; '; // Blue
        else if (rankStr == '6') styleStr += 'background-color: rgba(75, 0, 130, 0.4) ; '; // Indigo
        else if (rankStr == '7') styleStr += 'background-color: rgba(238, 130, 238, 0.4) ; '; // Violet

        table += '<tr>';
        table += '<td style="' + styleStr + '">' + nameStr + '</td>';
        table += '<td style="' + styleStr + '">' + rankStr + '</td>';
        table += '<td style="' + styleStr + '">' + termStr + '</td>';
        table += '</tr>';
    }

    table += '</tbody>';
    table += '</table>';
    document.getElementById('RANK').innerHTML = table;
}
