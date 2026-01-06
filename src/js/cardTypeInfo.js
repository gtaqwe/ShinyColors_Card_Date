const CardTypeInfo = (() => {
  const cardType = {
    permanent: {
      identifier: "P",
      checkBox: "permanentCardChkBox",
      cellClass: undefined,
      number: 0,
    },
    limited: {
      identifier: "L",
      checkBox: "limitedCardChkBox",
      cellClass: "limit-card-cell",
      number: 0,
    },
    event: {
      identifier: "E",
      checkBox: "eventCardChkBox",
      cellClass: "event-card-cell",
      number: 0,
    },
    fes: {
      identifier: "F",
      checkBox: "gradeFesCardChkBox",
      cellClass: "gradeFes-card-cell",
      number: 0,
    },
    campaign: {
      identifier: "C",
      checkBox: "campaignCardChkBox",
      cellClass: "campaign-card-cell",
      number: 0,
    },
    other: {
      identifier: "O",
      checkBox: "otherCardChkBox",
      cellClass: "other-card-cell",
      number: 0,
    },
    twilight: {
      identifier: "Tw",
      checkBox: "twilightCardChkBox",
      cellClass: "twilight-card-cell",
      number: 0,
    },
    mysongs: {
      identifier: "My",
      checkBox: "mysongsCardChkBox",
      cellClass: "mysongs-card-cell",
      number: 0,
    },
    parallel: {
      identifier: "Pa",
      checkBox: "parallelCardChkBox",
      cellClass: "parallel-card-cell",
      number: 0,
    },
    casting: {
      identifier: "Ca",
      checkBox: "castingCardChkBox",
      cellClass: "casting-card-cell",
      number: 0,
    },
    prelude: {
      identifier: "Pr",
      checkBox: "preludeCardChkBox",
      cellClass: "prelude-card-cell",
      number: 0,
    },
  };

  function init() {
    Object.entries(cardType).forEach(([key, value]) => {
      const initNum = 0;
      $(`#cardCount_${key}`).text(initNum);
      value.number = initNum;
    });
  }

  function getCardTypeKeys() {
    return Object.keys(cardType);
  }

  function addCardTypeNumber(type, number) {
    cardType[type].number += number;
  }

  function addCardTypeNumberOne(type) {
    addCardTypeNumber(type, 1);
  }

  function getCardTypeIdentifier(type) {
    return cardType[type].identifier;
  }

  function getCardTypeNumber(type) {
    return cardType[type].number;
  }

  function getAllCardTypeNumber() {
    return Object.fromEntries(Object.entries(cardType).map(([key, value]) => [key, value.number]));
  }

  function getCardTypeCheckBox(type) {
    return cardType[type].checkBox;
  }

  function getCardTypeCellClass(type) {
    if (type in cardType) {
      return cardType[type].cellClass;
    }
    return undefined;
  }

  return {
    init,
    getCardTypeKeys,
    addCardTypeNumber,
    addCardTypeNumberOne,
    getCardTypeIdentifier,
    getCardTypeNumber,
    getAllCardTypeNumber,
    getCardTypeCheckBox,
    getCardTypeCellClass,
  };
})();

export default CardTypeInfo;
