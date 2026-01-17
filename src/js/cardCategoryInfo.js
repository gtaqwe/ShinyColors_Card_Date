const CardCategoryInfo = (() => {
  const cardCategory = {
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
    Object.entries(cardCategory).forEach(([key, value]) => {
      const initNum = 0;
      $(`#cardCount_${key}`).text(initNum);
      value.number = initNum;
    });
  }

  function getCardCategoryKeys() {
    return Object.keys(cardCategory);
  }

  function addCardCategoryNumber(type, number) {
    cardCategory[type].number += number;
  }

  function addCardCategoryNumberOne(type) {
    addCardCategoryNumber(type, 1);
  }

  function getCardCategoryIdentifier(type) {
    return cardCategory[type].identifier;
  }

  function getCardCategoryNumber(type) {
    return cardCategory[type].number;
  }

  function getAllCardCategoryNumber() {
    return Object.fromEntries(
      Object.entries(cardCategory).map(([key, value]) => [key, value.number])
    );
  }

  function getCardCategoryCheckBox(type) {
    return cardCategory[type].checkBox;
  }

  function getCardCategoryCellClass(type) {
    if (type in cardCategory) {
      return cardCategory[type].cellClass;
    }
    return undefined;
  }

  function getSortedAllCardCategoryIdentifier() {
    return Object.entries(cardCategory)
      .sort(([, a], [, b]) => {
        return a.index > b.index;
      })
      .map(([key, value]) => ({ key, index: value.index, identifier: value.identifier }));
  }

  return {
    init,
    getCardCategoryKeys,
    addCardCategoryNumber,
    addCardCategoryNumberOne,
    getCardCategoryIdentifier,
    getCardCategoryNumber,
    getAllCardCategoryNumber,
    getCardCategoryCheckBox,
    getCardCategoryCellClass,
    getSortedAllCardCategoryIdentifier,
  };
})();

export default CardCategoryInfo;
