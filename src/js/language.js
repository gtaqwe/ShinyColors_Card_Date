import { LANGUAGE_DATA_PATH } from "./constant.js";
import * as Utility from "./utility.js";

const Language = (() => {
  let langData = {};
  let currentLang;
  const supportedLanguages = ["ko", "ja"];
  const defaultLang = "ko";

  async function init() {
    const browserLang = getBrowserLanguage();
    await setLanguage(browserLang);
  }

  async function setLanguage(langCode) {
    const finalLang = supportedLanguages.includes(langCode) ? langCode : defaultLang;
    langData = await Utility.getJSON(`${LANGUAGE_DATA_PATH}${finalLang}.json`);
    currentLang = finalLang;
  }

  function getTranslatedName(key) {
    return langData[key];
  }

  /**
   * 브라우저 언어 설정 Return
   * 예 : ko-kr -> ko
   */
  function getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage || defaultLang;
    const shortLang = lang.slice(0, 2).toLowerCase();
    return supportedLanguages.includes(shortLang) ? shortLang : defaultLang;
  }

  /**
   * 현재 언어 코드를 Return
   */
  function getCurrentLanguage() {
    return currentLang;
  }

  /**
   * 현재 언어 코드의 첫문자를 대문자로 변경해서 Return
   * ko -> Ko
   */
  function getCurrentLanguageFirstUpper() {
    return Utility.changeUpperFirst(currentLang);
  }

  function getLanguageData() {
    return langData;
  }

  function setLanguageInMenu() {
    $(`[data-lang]`).each(function () {
      $(this).html(getTranslatedName($(this).data("lang")));
    });
  }

  function setLanguageById(id, description) {
    $(id).html(getTranslatedName(description));
  }

  function setLanguageInTable(tableName) {
    $(`#${tableName} [data-lang]`).each(function () {
      $(this).html(getTranslatedName($(this).data("lang")));
    });
  }

  return {
    init,
    setLanguage,
    getTranslatedName,
    getCurrentLanguage,
    getCurrentLanguageFirstUpper,
    getLanguageData,
    setLanguageInMenu,
    setLanguageById,
    setLanguageInTable,
  };
})();

export default Language;
