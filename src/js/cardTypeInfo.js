const CardTypeInfo = (() => {
  const cardType = {
    permanent: {
      identifier: "P",
      checkBox: "permanentCardChkBox",
      cellClass: undefined,
      number: 0,
      index: 0,
    },
    limited: {
      identifier: "L",
      checkBox: "limitedCardChkBox",
      cellClass: "limit-card-cell",
      number: 0,
      index: 1,
    },
    event: {
      identifier: "E",
      checkBox: "eventCardChkBox",
      cellClass: "event-card-cell",
      number: 0,
      index: 2,
    },
    fes: {
      identifier: "F",
      checkBox: "gradeFesCardChkBox",
      cellClass: "gradeFes-card-cell",
      number: 0,
      index: 3,
    },
    campaign: {
      identifier: "C",
      checkBox: "campaignCardChkBox",
      cellClass: "campaign-card-cell",
      number: 0,
      index: 4,
    },
    other: {
      identifier: "O",
      checkBox: "otherCardChkBox",
      cellClass: "other-card-cell",
      number: 0,
      index: 5,
    },
    twilight: {
      identifier: "Tw",
      checkBox: "twilightCardChkBox",
      cellClass: "twilight-card-cell",
      number: 0,
      index: 6,
    },
    mysongs: {
      identifier: "My",
      checkBox: "mysongsCardChkBox",
      cellClass: "mysongs-card-cell",
      number: 0,
      index: 7,
    },
    parallel: {
      identifier: "Pa",
      checkBox: "parallelCardChkBox",
      cellClass: "parallel-card-cell",
      number: 0,
      index: 8,
    },
    casting: {
      identifier: "Ca",
      checkBox: "castingCardChkBox",
      cellClass: "casting-card-cell",
      number: 0,
      index: 9,
    },
    prelude: {
      identifier: "Pr",
      checkBox: "preludeCardChkBox",
      cellClass: "prelude-card-cell",
      number: 0,
      index: 10,
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

  function getSortedAllCardTypeIdentifier() {
    return Object.entries(cardType)
      .sort(([, a], [, b]) => {
        return a.index > b.index;
      })
      .map(([key, value]) => ({ key, index: value.index, identifier: value.identifier }));
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
    getSortedAllCardTypeIdentifier,
  };
})();

export default CardTypeInfo;
