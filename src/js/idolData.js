import { IDOL_DATA_PATH } from "./constant.js";
import * as Utility from "./utility.js";

const IdolData = (() => {
  let idolData = {};

  async function init() {
    idolData = await Utility.getJSON(`${IDOL_DATA_PATH}data.json`);
  }

  function getIdolData() {
    return idolData;
  }

  function getIdolNumber() {
    return idolData.length;
  }

  return {
    init,
    getIdolData,
    getIdolNumber,
  };
})();

export default IdolData;
