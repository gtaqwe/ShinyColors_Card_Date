const CardRarity = (() => {
  const cardRarity = {
    pUR: { isSelected: false, title: "P-UR", ps: "p", rarity: "ur" },
    pSSR: { isSelected: false, title: "P-SSR", ps: "p", rarity: "ssr" },
    pSR: { isSelected: false, title: "P-SR", ps: "p", rarity: "sr" },
    sUR: { isSelected: false, title: "S-UR", ps: "s", rarity: "ur" },
    sSSR: { isSelected: false, title: "S-SSR", ps: "s", rarity: "ssr" },
    sSR: { isSelected: false, title: "S-SR", ps: "s", rarity: "sr" },
  };

  function init() {
    Object.values(cardRarity).forEach((item) => {
      item.isSelected = false;
    });
  }

  function getCardRarity() {
    return cardRarity;
  }

  function getSelectedCardRarity() {
    return Object.values(cardRarity).filter((item) => item.isSelected);
  }

  function getIsSelectedByCardRarity(targetCardRarity) {
    return cardRarity[targetCardRarity]?.isSelected;
  }

  function updateSelectOn(targetCardRarity, id, className) {
    cardRarity[targetCardRarity].isSelected = true;
    $(`#${id}`).removeClass(DEACTIVATE_BUTTON_TYPE_CLASS).addClass(className);
  }

  function updateSelectOff(targetCardRarity, id, className) {
    cardRarity[targetCardRarity].isSelected = false;
    $(`#${id}`).removeClass(className).addClass(DEACTIVATE_BUTTON_TYPE_CLASS);
  }

  function isAllNotSelectedCardRarity() {
    return Object.values(cardRarity).every((item) => !item.isSelected);
  }

  return {
    init,
    getCardRarity,
    getIsSelectedByCardRarity,
    updateSelectOn,
    updateSelectOff,
    getSelectedCardRarity,
    isAllNotSelectedCardRarity,
  };
})();
