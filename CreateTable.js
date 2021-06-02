function buildTable(idolData) {    
    runBuildTable(idolData);
    runBuildDateRank();
}

function runBuildTable(idolData) {
    var tableTitle = idolData.Title;
    var rowLength = idolData.Data.length;
    var columnLength = idolData.Length;

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

function calTerm(totalData, totalLen) {
    var resContent = '<td class="td-name-cell">' + totalData.idol_name + '</td>';

    cardDataList = totalData.card_data;
    cardLen = totalData.card_data.length;
    for (var idx = 0; idx < totalLen; idx++) {
        var date1;
        var date2;
        var currDay = 24 * 60 * 60 * 1000;
        var term;
        var termCode;

        if (idx < cardLen) {
            var cardDate = cardDataList[idx].card_date;
            var cardType = cardDataList[idx].card_type;
            var cardName = cardDataList[idx].card_name;
            var cardAddr = cardDataList[idx].card_addr;

        
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

function getTargetDate() {
    var targetDate = document.getElementById('TargetDate').valueAsDate;
    var nowYear = targetDate.getFullYear();
    var nowMonth = targetDate.getMonth() + 1;
    var nowDate = targetDate.getDate();

    return nowYear.toString() + '-' + nowMonth.toString().padStart(2, '0') + '-' + nowDate.toString().padStart(2, '0');
}

function calDate(dateStr) {
    var dateAry = dateStr.split('-');
    var y = dateAry[0] - 1900;
    var m = dateAry[1] - 1;
    var d = dateAry[2];
    var date = new Date(y, m, d);

    return date;
}

function runBuildDateRank() {
    var targetTable = document.getElementById('date-table');
    var termAry = [];

    var names = targetTable.getElementsByClassName('td-name-cell');
    var terms = targetTable.getElementsByClassName('now-term');

    for (var i = 0; i < names.length; i++) {
        nameStr = names[i].innerHTML

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

    buildRankTable0(tableType, termAry, oldRanks, borderStyle);
    // buildRankTable1(tableType, termAry, oldRanks, borderStyle);
    buildRankTable2(tableType, termAry, oldRanks, borderStyle);

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
    var table = '<table id="rank-table-1">';
    table += '<thead>';
    table += '<tr>';
    table += '<th colspan="3">' + tableType + '</th>';
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
        var rankStr = oldRanks[i];
        var nameStr = termAry[i][0];
        var termStr = termAry[i][1];

        var styleStr = borderStyle.left;

        if (termAry[i] == '') rankStr = '미실장';

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
    document.getElementById('RANK1').innerHTML = table;
}

function buildRankTable2(tableType, termAry, oldRanks, borderStyle) {
    var table = '<table id="rank-table-2">';
    table += '<thead>';
    table += '<tr>';
    table += '<th colspan="3">' + tableType + '</th>';
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
