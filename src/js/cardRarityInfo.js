import { DEACTIVATE_BUTTON_TYPE_CLASS } from "./constant.js";

const CardRarityInfo = (() => {
  const cardRarity = {
    pUR: { isSelected: false, title: "P-UR", isProduce: true, rarity: "ur" },
    pSSR: { isSelected: false, title: "P-SSR", isProduce: true, rarity: "ssr" },
    pSR: { isSelected: false, title: "P-SR", isProduce: true, rarity: "sr" },
    sUR: { isSelected: false, title: "S-UR", isProduce: false, rarity: "ur" },
    sSSR: { isSelected: false, title: "S-SSR", isProduce: false, rarity: "ssr" },
    sSR: { isSelected: false, title: "S-SR", isProduce: false, rarity: "sr" },
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

export default CardRarityInfo;
