var nowSelect = 0;
var jsonData;

document.body.addEventListener("onload", init());

async function init() {
    await getJSON("json/data.json").then(function(resp) {
        jsonData = JSON.parse(resp);
    });

    nowSelect = 0;
    document.getElementById("TargetDate").valueAsDate = new Date(getToday());

    var fesChk = $("#fesImgConvertBtn").is(":checked");
    getToggleString(fesChk);
}

function getJSON(jsonFile) {
    try {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("GET", jsonFile, true);
            request.onload = function() {
                if (request.status == 200) {
                    resolve(request.responseText);
                } else {
                    reject(Error(request.statusText));
                }
            };

            request.onerror = function() {
                reject(Error("Error fetching data."));
            };
            request.send();
        });
    } catch (err) {
        console.error(err);
    }
}

function getToday() {
    var today = new Date();
    var nowYear = today.getFullYear();
    var nowMonth = today.getMonth() + 1;
    var nowDate = today.getDate();

    // yyyy-mm-dd 형식
    return (
        nowYear.toString() +
        "-" +
        nowMonth.toString().padStart(2, "0") +
        "-" +
        nowDate.toString().padStart(2, "0")
    );
}

// VIEW_SELECT의 표시타입 체크 변경
function updateDate(nowSelect) {
    if (nowSelect == 1) {
        P_SSR();
    } else if (nowSelect == 2) {
        S_SSR();
    } else if (nowSelect == 3) {
        P_SR();
    } else if (nowSelect == 4) {
        S_SR();
    }
}

function getToggleString(fesChk) {
    if (fesChk == true) {
        $("#toggleStr").html("페스");
    } else {
        $("#toggleStr").html("사복");
    }
}

// 표시 일러스트 변경 (사복 - 페스)
// S의 경우 사복으로 고정
function CtlfesImgConvertBtn(ps) {
    if (ps == "p") {
        document.getElementById("fesImgConvertBtn").disabled = false;
    } else if (ps == "s") {
        document.getElementById("fesImgConvertBtn").checked = false;
        document.getElementById("fesImgConvertBtn").disabled = true;
        getToggleString(false);
    }
}

function P_SSR() {
    var idolData = idolDataProcess(jsonData.P_SSR);
    buildTable(idolData);

    document.getElementById("NOTE_SPACE").innerText = "※ P카드의 첫 실장일은 「白いツバサ」 실장일";
    nowSelect = 1;

    CtlfesImgConvertBtn("p");
}

function P_SR() {
    var idolData = idolDataProcess(jsonData.P_SR);
    buildTable(idolData);

    document.getElementById("NOTE_SPACE").innerText = "※ P카드의 첫 실장일은 「白いツバサ」 실장일";
    nowSelect = 3;

    CtlfesImgConvertBtn("p");
}

function S_SSR() {
    var idolData = idolDataProcess(jsonData.S_SSR);
    buildTable(idolData);

    document.getElementById("NOTE_SPACE").innerText =
        "※ S카드의 첫 실장일은 「283プロのヒナ」 실장일";
    nowSelect = 2;

    CtlfesImgConvertBtn("s");
}

function S_SR() {
    var idolData = idolDataProcess(jsonData.S_SR);
    buildTable(idolData);

    document.getElementById("NOTE_SPACE").innerText =
        "※ S카드의 첫 실장일은 「283プロのヒナ」 실장일";
    nowSelect = 4;

    CtlfesImgConvertBtn("s");
}

// Json파일의 데이터추출, 재가공
function idolDataProcess(jsonData) {
    var tableTitle = jsonData.header_title;
    var maxColumnLen = 0;
    var idolList = jsonData.idol_list;
    var rowLength = idolList.length;

    totalList = [];
    // 아이돌 수
    for (var i = 0; i < rowLength; i++) {
        var targetList = [];

        // 아이돌별 카드 수
        for (var j = 0; j < idolList[i].card_data.length; j++) {
            var cardType = idolList[i].card_data[j].card_type;

            if (cardType == "첫실장") {
                targetList.push(idolList[i].card_data[j]);
            }

            // VIEW_SELECT의 체크 타입 체크에 맞춰 데이터를 Push
            if (cardType == "통상" && $("#permanentCardChkBox").is(":checked")) {
                targetList.push(idolList[i].card_data[j]);
            } else if (cardType == "한정" && $("#limitedCardChkBox").is(":checked")) {
                targetList.push(idolList[i].card_data[j]);
            } else if (cardType == "이벤트" && $("#eventCardChkBox").is(":checked")) {
                targetList.push(idolList[i].card_data[j]);
            } else if (cardType == "페스" && $("#gradeFesCardChkBox").is(":checked")) {
                targetList.push(idolList[i].card_data[j]);
            } else if (cardType == "캠페인" && $("#campaignCardChkBox").is(":checked")) {
                targetList.push(idolList[i].card_data[j]);
            }
        }

        var obj = {
            // 이름 언어 : idol_(ko, ja, en)_name
            idol_name: idolList[i].idol_ko_name,
            card_data: targetList
        };
        totalList.push(obj);

        // 표에 표시할 열의 개수를 설정
        if (targetList.length > maxColumnLen) maxColumnLen = targetList.length;
    }

    // 표시할 데이터
    // Title : 카드 타입 (P-SSR, S-SSR, P-SR, S-SR)
    // Length : 최대 열 수
    // Data : 표시할 카드 데이터
    var selectedData = {
        Title: tableTitle,
        Length: maxColumnLen,
        Data: totalList
    };

    return selectedData;
}

//////////////////////////////////////////////////
/*
 * Image preview script
 * powered by jQuery (http://www.jquery.com)
 *
 * written by Alen Grakalic (http://cssglobe.com)
 *
 * for more info visit http://cssglobe.com/post/1695/easiest-tooltip-and-image-preview-using-jquery
 *
 */

function imgMapping() {
    /* CONFIG */

    var xOffset = 10;
    var yOffset = 20;
    var imgWidth = 320;
    var imgHeight = 180;

    // these 2 variable determine popup's distance from the cursor
    // you might want to adjust to get the right result

    /* END CONFIG */

    // 마우스 포인트가 위치한 셀에 해당하는 일러스트의 프리뷰 표시
    $("#date-table td").hover(
        function(e) {
            var imgAddrAttr = $(this)
                .closest("td")
                .attr("addr"); // 이미지 파일명
            var imgNameAttr = $(this)
                .closest("td")
                .attr("name"); // 카드명
            var fesChk = $("#fesImgConvertBtn").is(":checked"); // 일러스트 표시 모드

            // 페스 일러는 일반 일러스트 파일명에 "_f"를 추가
            if (fesChk == true) {
                imgAddrAttr += "_f";
            }

            // 카드명이 없는 경우 일러스트 프리뷰를 표시하지 않음
            if (imgNameAttr != "" && imgNameAttr != undefined) {
                $("body").append(
                    "<p id='preview'><img src='img/" +
                        imgAddrAttr +
                        ".png' width='" +
                        imgWidth +
                        "' height='" +
                        imgHeight +
                        "'><br>" +
                        imgNameAttr +
                        "</p>"
                );
                $("#preview")
                    .css("top", e.pageY - xOffset + "px")
                    .css("left", e.pageX + yOffset + "px")
                    .fadeIn("fast");
            }
        },
        // 마우스 포인트가 해당 셀에 위치하지 않으면 비표시
        function() {
            $("#preview").remove();
        }
    );

    // 마우스 포인트 위치에 따라 프리뷰 이동
    $("#date-table td").mousemove(function(e) {
        var previewWidth = $("#preview").width();
        var previewHeight = $("#preview").height();

        // console.log ((e.pageY + previewHeight) + ":" + ($(window).innerHeight() + $(document).scrollTop()))
        if (e.pageY + previewHeight > $(window).innerHeight() + $(document).scrollTop()) {
            $("#preview").css("top", e.pageY - xOffset - previewHeight + "px");
        } else {
            $("#preview").css("top", e.pageY - xOffset + "px");
        }

        // console.log ((e.pageX + previewWidth) + ":" + ($(window).innerWidth() + $(document).scrollLeft()))
        if (e.pageX + previewWidth > $(window).innerWidth() + $(document).scrollLeft()) {
            $("#preview").css("left", e.pageX - yOffset - previewWidth + "px");
        } else {
            $("#preview").css("left", e.pageX + yOffset + "px");
        }

        if (
            e.pageY + previewHeight > $(window).innerHeight() + $(document).scrollTop() &&
            e.pageX + previewWidth > $(window).innerWidth() + $(document).scrollLeft()
        ) {
            $("#preview")
                .css("top", e.pageY - xOffset - previewHeight - xOffset + "px")
                .css("left", e.pageX - yOffset - previewWidth + "px");
        }
    });
}
//////////////////////////////////////////////////

// Div 캡쳐 버튼 처리
function captureScreen(frameName) {
    if (nowSelect != 0) {
        var captureName;
        var frameId;
        var viewMode = "";

        if (frameName == "TABLE") frameId = "#CAPTURE_FRAME";
        else if (frameName == "RANK") frameId = "#RANK";

        if ($("#permanentCardChkBox").is(":checked")) viewMode += "P";
        if ($("#limitedCardChkBox").is(":checked")) viewMode += "L";
        if ($("#eventCardChkBox").is(":checked")) viewMode += "E";
        if ($("#gradeFesCardChkBox").is(":checked")) viewMode += "F";
        if ($("#campaignCardChkBox").is(":checked")) viewMode += "C";

        if (nowSelect == 1) captureName = frameName + "_P_SSR_" + viewMode + ".png";
        else if (nowSelect == 2) captureName = frameName + "_S_SSR_" + viewMode + ".png";
        else if (nowSelect == 3) captureName = frameName + "_P_SR_" + viewMode + ".png";
        else if (nowSelect == 4) captureName = frameName + "_S_SR_" + viewMode + ".png";

        document.getElementById("convertSpan").style.display = "none";

        html2canvas(document.querySelector(frameId), {
            scrollY: -window.scrollY,
            scrollX: -window.scrollX
        }).then(canvas => {
            downloadURI(canvas.toDataURL("image/png"), captureName);
        });

        document.getElementById("convertSpan").style.display = "";
    }
}

function downloadURI(uri, filename) {
    var link = document.createElement("a");
    link.download = filename;
    link.href = uri;
    link.click();
}
