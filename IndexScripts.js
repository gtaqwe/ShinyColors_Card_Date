var nowSelect = 0;
var jsonData;

document.body.addEventListener("onload", init());

async function init() {
    await getJSON("json/data.json").then(function(resp) {
        jsonData = JSON.parse(resp);
    });

    nowSelect = 0;
    document.getElementById("TargetDate").valueAsDate = new Date(getToday());

    var fesChk = $('#fesImgConvertBtn').is(':checked');
    getToggleString(fesChk);
}

function getJSON(jsonFile) {
    try {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', jsonFile, true);
            request.onload = function () {
                if (request.status == 200) {
                    resolve(request.responseText);
                } else {
                    reject(Error(request.statusText));
                }
            };

            request.onerror = function () {
                reject(Error('Error fetching data.'));
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

    return nowYear.toString() + '-' + nowMonth.toString().padStart(2, '0') + '-' + nowDate.toString().padStart(2, '0');
}

function updateDate(nowSelect) {
    if (nowSelect == 1) {
        P_SSR();
    }
    else if (nowSelect == 2) {
        S_SSR();
    }
    else if (nowSelect == 3) {
        P_SR();
    }
    else if (nowSelect == 4) {
        S_SR();
    }
}

function getSelectVal() {
    var val
    if (nowSelect == 1 || nowSelect == 3) {
        val = "p";
    }
    else if (nowSelect == 2 || nowSelect == 4) {
        val = "s";
    }
    return val;
}

function getToggleString(fesChk) {
    if (fesChk == true) {
        $("#toggleStr").html("페스");
    }
    else {
        $("#toggleStr").html("사복");
    }
}

function CtlfesImgConvertBtn(ps) {
    if (ps == "p") {
        document.getElementById("fesImgConvertBtn").disabled = false;
    }
    else if (ps == "s") {
        document.getElementById("fesImgConvertBtn").checked = false;
        document.getElementById("fesImgConvertBtn").disabled = true;
        getToggleString(false);
    }

}

function P_SSR() {
    buildTable(jsonData.P_SSR);

    document.getElementById('NOTE_SPACE').innerText = '※ P카드의 첫 실장일은 「白いツバサ」 실장일';
    nowSelect = 1;

    CtlfesImgConvertBtn("p");
}

function P_SR() {
    buildTable(jsonData.P_SR);

    document.getElementById('NOTE_SPACE').innerText = '※ P카드의 첫 실장일은 「白いツバサ」 실장일';
    nowSelect = 3;

    CtlfesImgConvertBtn("p");
}

function S_SSR() {
    buildTable(jsonData.S_SSR);

    document.getElementById('NOTE_SPACE').innerText = '※ S카드의 첫 실장일은 「283プロのヒナ」 실장일';
    nowSelect = 2;

    CtlfesImgConvertBtn("s");
}

function S_SR() {
    buildTable(jsonData.S_SR);

    document.getElementById('NOTE_SPACE').innerText = '※ S카드의 첫 실장일은 「283プロのヒナ」 실장일';
    nowSelect = 4;

    CtlfesImgConvertBtn("s");
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
    $("#date-table td").hover(function (e) {
        var imgAddrAttr = $(this).closest('td').attr('addr');
        var imgNameAttr = $(this).closest('td').attr('name');
        var fesChk = $("#fesImgConvertBtn").is(":checked");
        if (fesChk == true) {
            imgAddrAttr += "_f";
        }

        if (imgNameAttr != "" && imgNameAttr != undefined) {
            $("body").append("<p id='preview'><img src='img/" + imgAddrAttr
                + ".png' width='" + imgWidth + "' height='" + imgHeight + "'><br>" + imgNameAttr + "</p>");
            $("#preview")
                .css("top", (e.pageY - xOffset) + "px")
                .css("left", (e.pageX + yOffset) + "px")
                .fadeIn("fast");
        }

    },
        function () {
            $("#preview").remove();
        });
    $("#date-table td").mousemove(function (e) {
        var previewWidth = $("#preview").width();
        var previewHeight = $("#preview").height();

        // console.log ((e.pageY + previewHeight) + ":" + ($(window).innerHeight() + $(document).scrollTop()))
        if ((e.pageY + previewHeight) > ($(window).innerHeight() + $(document).scrollTop())) {
            $("#preview").css("top", (e.pageY - xOffset - previewHeight) + "px")
        }
        else {
            $("#preview").css("top", (e.pageY - xOffset) + "px")
        }

        // console.log ((e.pageX + previewWidth) + ":" + ($(window).innerWidth() + $(document).scrollLeft()))
        if ((e.pageX + previewWidth) > ($(window).innerWidth() + $(document).scrollLeft())) {
            $("#preview").css("left", (e.pageX - yOffset - previewWidth) + "px");
        }
        else {
            $("#preview").css("left", (e.pageX + yOffset) + "px");
        }

        if ((e.pageY + previewHeight) > ($(window).innerHeight() + $(document).scrollTop()) &&
            (e.pageX + previewWidth) > ($(window).innerWidth() + $(document).scrollLeft())) {
            $("#preview")
                .css("top", (e.pageY - xOffset - previewHeight - xOffset) + "px")
                .css("left", (e.pageX - yOffset - previewWidth) + "px");
        }
    });
}
//////////////////////////////////////////////////

function captureScreen(frameName) {

    if (nowSelect != 0) {
        var captureName;
        var frameId;

        if (frameName == 'TABLE') frameId = '#CAPTURE_FRAME'
        else if (frameName == 'RANK') frameId = '#RANK'

        if (nowSelect == 1) captureName = frameName + "_P_SSR.png";
        else if (nowSelect == 2) captureName = frameName + "_S_SSR.png";
        else if (nowSelect == 3) captureName = frameName + "_P_SR.png";
        else if (nowSelect == 4) captureName = frameName + "_S_SR.png";

        document.getElementById("convertSpan").style.display= 'none';

        html2canvas(document.querySelector(frameId), { scrollY: -window.scrollY, scrollX: -window.scrollX }).then(canvas => {
            downloadURI(canvas.toDataURL('image/png'), captureName);
        });

        document.getElementById("convertSpan").style.display= '';
    }
}

function downloadURI(uri, filename) {
    var link = document.createElement('a');
    link.download = filename;
    link.href = uri;
    link.click();
}
