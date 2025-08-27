import CardRarityInfo from "./cardRarityInfo.js";
import * as Utility from "./utility.js";

const CaptureScreen = (() => {
  /**
   * html2canvas 라이브러리를 읽기
   */
  function loadHtml2Canvas() {
    const deferred = $.Deferred();

    if (window.html2canvas) {
      deferred.resolve(window.html2canvas);
    } else {
      $.getScript("https://html2canvas.hertzen.com/dist/html2canvas.min.js")
        .done(function () {
          deferred.resolve(window.html2canvas);
        })
        .fail(function () {
          deferred.reject(new Error("Failed to load html2canvas"));
        });
    }

    return deferred.promise();
  }

  /**
   * 메인 표 캡쳐
   */
  function captureMainTableScreen() {
    // 선택된 표시 타입이 하나도 없는 경우 스킵
    if (CardRarityInfo.isAllNotSelectedCardRarity()) {
      return;
    }

    const frameName = "TABLE";
    const frameId = "#CAPTURE_FRAME";

    const nowChangeLapFlag = $(`#showChangeCardLapConvertBtn`).is(":checked");

    if (nowChangeLapFlag) {
      $(`#showChangeCardLapConvertBtn`).prop("checked", !nowChangeLapFlag).change();
    }

    const captureOffIdList = [
      "#convertSpan",
      "#baseStartSpan",
      "#baseEndSpan",
      "#CAPTURE_BUTTON",
      "#VIEW_OPTION",
      "#ALL_TYPE_SELECT",
      "#DATE_PRESET",
    ];

    const captureOnIdList = ["#baseStartDateStr", "#baseEndDateStr"];

    $(frameId).css("overflow", "hidden");

    $("#baseStartDateStr").text(Utility.getISODateById("#baseStartDate"));
    $("#baseEndDateStr").text(Utility.getISODateById("#baseEndDate"));

    cssDisplayOffByIdList(captureOffIdList);
    cssDisplayOnByIdList(captureOnIdList);

    // 실제 표를 캡쳐 후 다운로드
    window
      .html2canvas(document.querySelector(frameId), {
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
      })
      .then((canvas) => {
        const dataURL = canvas.toDataURL("image/png");
        const fileName = getCaptureFileName(frameName);
        downloadURI(dataURL, fileName);
      })
      .catch((err) => {
        console.error("html2canvas rendering failed:", err);
      });

    if (nowChangeLapFlag) {
      $(`#showChangeCardLapConvertBtn`).prop("checked", nowChangeLapFlag).change();
    }

    $(frameId).css("overflow", "");

    cssDisplayOnByIdList(captureOffIdList);
    cssDisplayOffByIdList(captureOnIdList);
  }

  /**
   * 랭킹 표 캡쳐
   */
  function captureRankTableScreen() {
    // 선택된 표시 타입이 하나도 없는 경우 스킵
    if (CardRarityInfo.isAllNotSelectedCardRarity()) {
      return;
    }

    const frameName = "RANK";
    const frameId = "#RANK";

    // 실제 표를 캡쳐 후 다운로드
    window
      .html2canvas(document.querySelector(frameId), {
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
      })
      .then((canvas) => {
        const dataURL = canvas.toDataURL("image/png");
        const fileName = getCaptureFileName(frameName);
        downloadURI(dataURL, fileName);
      })
      .catch((err) => {
        console.error("html2canvas rendering failed:", err);
      });
  }

  function cssDisplayOnByIdList(idList) {
    idList.forEach((id) => $(id).css("display", ""));
  }

  function cssDisplayOffByIdList(idList) {
    idList.forEach((id) => $(id).css("display", "none"));
  }

  function downloadURI(uri, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = uri;
    link.click();
  }

  function getCaptureFileName(name) {
    const d = new Date();

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    const ms = String(d.getMilliseconds()).padStart(3, "0");

    return `${name}_${yyyy}${mm}${dd}${hh}${mi}${ss}${ms}.png`;
  }

  return {
    loadHtml2Canvas,
    captureMainTableScreen,
    captureRankTableScreen,
  };
})();

export default CaptureScreen;
