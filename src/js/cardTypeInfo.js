const CardTypeInfo = (() => {
  const cardType = {
    permanent: { identifier: "P", number: 0 },
    limited: { identifier: "L", number: 0 },
    twilight: { identifier: "Tw", number: 0 },
    mysongs: { identifier: "My", number: 0 },
    parallel: { identifier: "Pa", number: 0 },
    event: { identifier: "E", number: 0 },
    fes: { identifier: "F", number: 0 },
    campaign: { identifier: "C", number: 0 },
    other: { identifier: "O", number: 0 },
  };

  function init() {
    Object.values(cardType).forEach((item) => {
      item.number = 0;
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

  return {
    init,
    getCardTypeKeys,
    addCardTypeNumber,
    addCardTypeNumberOne,
    getCardTypeIdentifier,
    getCardTypeNumber,
    getAllCardTypeNumber,
  };
})();
