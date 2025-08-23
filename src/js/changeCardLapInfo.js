const ChangeCardLapInfo = (() => {
  const changeCardLap = [];

  function init(num) {
    changeCardLap.length = 0;
    changeCardLap.push(...Array(num).fill(0));
  }

  function reset() {
    changeCardLap.fill(0);
  }

  function setChangeCardLapByIdx(idx, val) {
    changeCardLap[idx] = val;
  }

  function getChangeCardLap() {
    return changeCardLap;
  }

  function getChangeCardLapByIndex(idx) {
    return changeCardLap[idx];
  }

  return {
    init,
    reset,
    getChangeCardLap,
    setChangeCardLapByIdx,
    getChangeCardLapByIndex,
  };
})();
