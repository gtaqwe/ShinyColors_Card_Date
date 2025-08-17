const IdolData = (() => {
  let idolData = {};

  async function init() {
    idolData = await getJSON(`${IDOL_DATA_PATH}data.json`);
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
