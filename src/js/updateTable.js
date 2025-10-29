import IdolData from "./idolData.js";
import CardRarityInfo from "./cardRarityInfo.js";
import CardTypeInfo from "./cardTypeInfo.js";
import Language from "./language.js";

import { CARD_RARITY_TYPE, PS_STATUS } from "./constant.js";

import * as Utility from "./utility.js";

import * as MainTable from "./mainTable.js";
import * as RankTable from "./rankTable.js";

export function withUpdateTable(handler) {
  return async function (...args) {
    // handler가 함수일 경우만 실행
    if (typeof handler == "function") {
      await handler(...args);
    }
    updateDateTable();
    updateCardTypeCountListTable();
  };
}

function updateDateTable() {
  CardTypeInfo.init();

  // 선택한 레어리티 정보를 취득
  const selectedRarity = CardRarityInfo.getSelectedCardRarity();

  const idolData = selectedRarity.length != 0 ? getSelectedCardDataInfo(selectedRarity) : undefined;

  const isSelectedProduce = selectedRarity.some((v) => v.ps == PS_STATUS.PRODUCE);

  // 페스 일러스트로 표시 체크 박스의 선택가능/불가능을 설정
  updateFesImgConvertButtonStatus(isSelectedProduce);

  // 메인표 작성
  MainTable.createMainTable(idolData);

  // 랭킹표 작성
  RankTable.createRankTable(idolData);

  // 선택한 레어리티가 없는 경우, 하단 메세지를 표시하지 않음
  if (selectedRarity.length == 0) {
    $("#NOTE_SPACE").empty();
  } else {
    // 표 하단의 비고
    const ps = isSelectedProduce ? PS_STATUS.PRODUCE : PS_STATUS.SUPPORT;
    Language.setLanguageById("#NOTE_SPACE", `${ps}FirstImplementNote`);
  }
}

function getSelectedCardDataInfo(selectedRarity) {
  // 선택한 레어리티의 타이틀을 모두 취득
  const tableTitleList = selectedRarity.map((v) => v.title);

  // 선택 레어리티의 카드리스트를 취득
  const selectedCardData = mergeCardData();

  return {
    titleList: tableTitleList,
    data: selectedCardData,
  };
}

/**
 * 페스 일러스트 표시 버튼의 선택 가능/불가 업데이트
 * 프로듀스 타입을 선택 한 경우에는 버튼 활성화
 * 프로듀스 타입을 선택하지 않은 경우에는 버튼 비활성화
 */
function updateFesImgConvertButtonStatus(isSelectedProduce) {
  const fesImgConvertBtn = $("#fesImgConvertBtn");

  if (isSelectedProduce) {
    fesImgConvertBtn.prop("disabled", false);
  } else {
    fesImgConvertBtn.prop("checked", false);
    fesImgConvertBtn.prop("disabled", true);
  }
}

/**
 * 전체 카드의 데이터를 추출, 재가공
 */
function mergeCardData() {
  const idolData = IdolData.getIdolData();
  return idolData.map((idol) => {
    let firstList = [];
    let tempCardList = [];

    // P UR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_UR)) {
      const idolList = [...idol.P_UR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // P SSR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_SSR)) {
      const idolList = [...idol.P_SSR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // P SR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.P_SR)) {
      const idolList = [...idol.P_SR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S UR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_UR)) {
      const idolList = [...idol.S_UR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S SSR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_SSR)) {
      const idolList = [...idol.S_SSR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // S SR
    if (CardRarityInfo.getIsSelectedByCardRarity(CARD_RARITY_TYPE.S_SR)) {
      const idolList = [...idol.S_SR];
      firstList = firstList.concat(idolList.shift());
      tempCardList = tempCardList.concat([...idolList]);
    }

    // 첫실장 데이터가 복수 있을시, 최초의 첫실장만 취득
    const firstImplementation = firstList
      .filter((v) => v)
      .sort((a, b) => {
        return Utility.compareByCardDateAsc(a.cardDate, b.cardDate);
      })
      .shift();

    // 첫실장을 카드 리스트의 처음에 추가
    if (firstImplementation) {
      tempCardList.unshift(firstImplementation);
    }

    return {
      idolName: idol[`idol${Language.getCurrentLanguageFirstUpper()}Name`],
      displayRanking: idol.displayRanking,
      cardData: getCardList(tempCardList),
    };
  });
}

/**
 * 조건에 해당되는 카드를 Filter, Sort 후 리스트로 Return
 */
function getCardList(cardAry) {
  return (
    cardAry
      .map((card, idx) => {
        const cardType = card.cardType;
        // 첫 실장(R) 표시하기 위해 return
        if (cardType == "first" && idx == 0 && !$("#noShowRCardConvertBtn").is(":checked")) {
          return card;
        }

        // VIEW_SELECT의 체크 타입 체크에 맞춰 데이터를 Return
        const checkBox = CardTypeInfo.getCardTypeCheckBox(cardType);
        if (checkBox && $(`#${checkBox}`).is(":checked")) {
          return card;
        }
      })
      // 존재하지 않는 데이터 제거
      .filter((v) => v)
      // 중복되는 first를 정리
      .filter(
        (v) =>
          v.cardType == "first" ||
          (new Date(v.cardDate) >= new Date($("#baseStartDate").val()) &&
            new Date(v.cardDate) <= new Date($("#baseEndDate").val()))
      )
      .sort((a, b) => {
        // 오래된 순으로 정렬
        return Utility.compareByCardDateAsc(a.cardDate, b.cardDate);
      })
  );
}

/**
 * 현재 표시 중인 카드 수를 갱신
 */
function updateCardTypeCountListTable() {
  const cardTypeInfo = CardTypeInfo.getAllCardTypeNumber();

  Object.keys(cardTypeInfo).forEach((key) => {
    $(`#cardCount_${key}`).text(CardTypeInfo.getCardTypeNumber(key));
  });
}
