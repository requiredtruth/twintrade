/* Gains SDK 1.8.10 math subset; see GAINS-SDK-LICENSE.txt */
(function(){const modules={
"index.js":[function(require,module,exports){
Object.assign(exports,require("./trade"));
Object.assign(exports,require("./constants"));
Object.assign(exports,require("./utils"));
Object.assign(exports,require("./backend"));
Object.assign(exports,require("./pricing"));
Object.assign(exports,require("./contracts/types"));
Object.assign(exports,require("./contracts/utils/pairs"));
Object.assign(exports,require("./backend/tradingVariables/converter"));
Object.assign(exports,require("./markets/oi/converter"));
},{"./trade": "trade/index.js", "./constants": "constants.js", "./utils": "utils/index.js", "./backend": "backend/index.js", "./pricing": "pricing/index.js", "./contracts/types": "contracts/types/index.js", "./contracts/utils/pairs": "contracts/utils/pairs.js", "./backend/tradingVariables/converter": "backend/tradingVariables/converter.js", "./markets/oi/converter": "markets/oi/converter.js"}],
"trade/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./fees"), exports);
__exportStar(require("./pnl/index"), exports);
__exportStar(require("./spread"), exports);
__exportStar(require("./liquidation"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./oiWindows"), exports);
__exportStar(require("./priceImpact"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./effectiveLeverage"), exports);
__exportStar(require("./counterTrade"), exports);

},{"./fees": "trade/fees/index.js", "./pnl/index": "trade/pnl/index.js", "./spread": "trade/spread.js", "./liquidation": "trade/liquidation/index.js", "./types": "trade/types.js", "./oiWindows": "trade/oiWindows.js", "./priceImpact": "trade/priceImpact/index.js", "./utils": "trade/utils.js", "./effectiveLeverage": "trade/effectiveLeverage/index.js", "./counterTrade": "trade/counterTrade/index.js"}],
"trade/fees/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidFundingRate = exports.createFundingFeeContext = exports.convertTradeInitialAccFundingFees = exports.convertPairGlobalParamsArray = exports.convertPairGlobalParams = exports.convertPairFundingFeeDataArray = exports.convertPairFundingFeeData = exports.convertFundingFeeParamsArray = exports.convertFundingFeeParams = exports.getTradeFundingFees = exports.getTradeFundingFeesCollateralSimple = exports.getTradeFundingFeesCollateral = exports.getPairPendingAccFundingFees = exports.getLongShortAprMultiplier = exports.getAvgFundingRatePerSecondP = exports.getSecondsToReachZeroRate = exports.getCurrentFundingVelocityPerYear = exports.FundingFees = exports.buildBorrowingV2Context = exports.fetchBorrowingV2DataForPairs = exports.createBorrowingV2ContextFromArrays = exports.createBorrowingV2ContextFromContract = exports.fetchAllBorrowingV2Data = exports.fetchPairPendingAccBorrowingFeesV2 = exports.fetchTradeBorrowingFeesCollateralV2 = exports.fetchPairBorrowingFeeDataV2 = exports.fetchBorrowingFeeParamsV2 = exports.aprToBorrowingRateV2 = exports.borrowingRateToAPRV2 = exports.isValidBorrowingRateV2 = exports.createBorrowingV2Context = exports.convertTradeInitialAccFeesArrayV2 = exports.convertTradeInitialAccFeesV2 = exports.convertPairBorrowingFeeDataArrayV2 = exports.convertPairBorrowingFeeDataV2 = exports.convertBorrowingFeeParamsArrayV2 = exports.convertBorrowingFeeParamsV2 = exports.BORROWING_V2_PRECISION = exports.MAX_BORROWING_RATE_PER_SECOND_V2 = exports.getPairBorrowingFeesV2 = exports.getTradeBorrowingFeesCollateralV2 = exports.getPairPendingAccBorrowingFeesV2 = exports.borrowingFeeV2Utils = exports.BorrowingFeeV2 = exports.encodeUiRealizedPnlData = exports.encodeTradeFeesData = exports.convertUiRealizedPnlDataArray = exports.convertUiRealizedPnlData = exports.convertTradeFeesDataArray = exports.convertTradeFeesData = void 0;
exports.FUNDING_FEES_PRECISION = exports.calculateVelocityFromSkew = exports.aprToFundingRate = exports.fundingRateToAPR = void 0;
__exportStar(require("./borrowing"), exports);
__exportStar(require("./tiers"), exports);
__exportStar(require("./trading"), exports);
__exportStar(require("../../markets/holdingFees"), exports);
// TradeFeesData and UiRealizedPnlData converters
var converter_1 = require("./converter");
Object.defineProperty(exports, "convertTradeFeesData", { enumerable: true, get: function () { return converter_1.convertTradeFeesData; } });
Object.defineProperty(exports, "convertTradeFeesDataArray", { enumerable: true, get: function () { return converter_1.convertTradeFeesDataArray; } });
Object.defineProperty(exports, "convertUiRealizedPnlData", { enumerable: true, get: function () { return converter_1.convertUiRealizedPnlData; } });
Object.defineProperty(exports, "convertUiRealizedPnlDataArray", { enumerable: true, get: function () { return converter_1.convertUiRealizedPnlDataArray; } });
Object.defineProperty(exports, "encodeTradeFeesData", { enumerable: true, get: function () { return converter_1.encodeTradeFeesData; } });
Object.defineProperty(exports, "encodeUiRealizedPnlData", { enumerable: true, get: function () { return converter_1.encodeUiRealizedPnlData; } });
// Borrowing V2 exports with explicit naming to avoid conflicts
var borrowingV2_1 = require("./borrowingV2");
Object.defineProperty(exports, "BorrowingFeeV2", { enumerable: true, get: function () { return borrowingV2_1.BorrowingFeeV2; } });
Object.defineProperty(exports, "borrowingFeeV2Utils", { enumerable: true, get: function () { return borrowingV2_1.borrowingFeeV2Utils; } });
Object.defineProperty(exports, "getPairPendingAccBorrowingFeesV2", { enumerable: true, get: function () { return borrowingV2_1.getPairPendingAccBorrowingFees; } });
Object.defineProperty(exports, "getTradeBorrowingFeesCollateralV2", { enumerable: true, get: function () { return borrowingV2_1.getTradeBorrowingFeesCollateral; } });
Object.defineProperty(exports, "getPairBorrowingFeesV2", { enumerable: true, get: function () { return borrowingV2_1.getPairBorrowingFees; } });
Object.defineProperty(exports, "MAX_BORROWING_RATE_PER_SECOND_V2", { enumerable: true, get: function () { return borrowingV2_1.MAX_BORROWING_RATE_PER_SECOND; } });
Object.defineProperty(exports, "BORROWING_V2_PRECISION", { enumerable: true, get: function () { return borrowingV2_1.BORROWING_V2_PRECISION; } });
var converter_2 = require("./borrowingV2/converter");
Object.defineProperty(exports, "convertBorrowingFeeParamsV2", { enumerable: true, get: function () { return converter_2.convertBorrowingFeeParams; } });
Object.defineProperty(exports, "convertBorrowingFeeParamsArrayV2", { enumerable: true, get: function () { return converter_2.convertBorrowingFeeParamsArray; } });
Object.defineProperty(exports, "convertPairBorrowingFeeDataV2", { enumerable: true, get: function () { return converter_2.convertPairBorrowingFeeData; } });
Object.defineProperty(exports, "convertPairBorrowingFeeDataArrayV2", { enumerable: true, get: function () { return converter_2.convertPairBorrowingFeeDataArray; } });
Object.defineProperty(exports, "convertTradeInitialAccFeesV2", { enumerable: true, get: function () { return converter_2.convertTradeInitialAccFees; } });
Object.defineProperty(exports, "convertTradeInitialAccFeesArrayV2", { enumerable: true, get: function () { return converter_2.convertTradeInitialAccFeesArray; } });
Object.defineProperty(exports, "createBorrowingV2Context", { enumerable: true, get: function () { return converter_2.createBorrowingV2Context; } });
Object.defineProperty(exports, "isValidBorrowingRateV2", { enumerable: true, get: function () { return converter_2.isValidBorrowingRate; } });
Object.defineProperty(exports, "borrowingRateToAPRV2", { enumerable: true, get: function () { return converter_2.borrowingRateToAPR; } });
Object.defineProperty(exports, "aprToBorrowingRateV2", { enumerable: true, get: function () { return converter_2.aprToBorrowingRate; } });
// Contract utilities re-exported for convenience
var fetcher_1 = require("./borrowingV2/fetcher");
Object.defineProperty(exports, "fetchBorrowingFeeParamsV2", { enumerable: true, get: function () { return fetcher_1.fetchBorrowingFeeParamsV2; } });
Object.defineProperty(exports, "fetchPairBorrowingFeeDataV2", { enumerable: true, get: function () { return fetcher_1.fetchPairBorrowingFeeDataV2; } });
Object.defineProperty(exports, "fetchTradeBorrowingFeesCollateralV2", { enumerable: true, get: function () { return fetcher_1.fetchTradeBorrowingFeesCollateralV2; } });
Object.defineProperty(exports, "fetchPairPendingAccBorrowingFeesV2", { enumerable: true, get: function () { return fetcher_1.fetchPairPendingAccBorrowingFeesV2; } });
Object.defineProperty(exports, "fetchAllBorrowingV2Data", { enumerable: true, get: function () { return fetcher_1.fetchAllBorrowingV2Data; } });
Object.defineProperty(exports, "createBorrowingV2ContextFromContract", { enumerable: true, get: function () { return fetcher_1.createBorrowingV2ContextFromContract; } });
Object.defineProperty(exports, "createBorrowingV2ContextFromArrays", { enumerable: true, get: function () { return fetcher_1.createBorrowingV2ContextFromArrays; } });
Object.defineProperty(exports, "fetchBorrowingV2DataForPairs", { enumerable: true, get: function () { return fetcher_1.fetchBorrowingV2DataForPairs; } });
var builder_1 = require("./borrowingV2/builder");
Object.defineProperty(exports, "buildBorrowingV2Context", { enumerable: true, get: function () { return builder_1.buildBorrowingV2Context; } });
// Funding Fees exports
var fundingFees_1 = require("./fundingFees");
Object.defineProperty(exports, "FundingFees", { enumerable: true, get: function () { return fundingFees_1.FundingFees; } });
Object.defineProperty(exports, "getCurrentFundingVelocityPerYear", { enumerable: true, get: function () { return fundingFees_1.getCurrentFundingVelocityPerYear; } });
Object.defineProperty(exports, "getSecondsToReachZeroRate", { enumerable: true, get: function () { return fundingFees_1.getSecondsToReachZeroRate; } });
Object.defineProperty(exports, "getAvgFundingRatePerSecondP", { enumerable: true, get: function () { return fundingFees_1.getAvgFundingRatePerSecondP; } });
Object.defineProperty(exports, "getLongShortAprMultiplier", { enumerable: true, get: function () { return fundingFees_1.getLongShortAprMultiplier; } });
Object.defineProperty(exports, "getPairPendingAccFundingFees", { enumerable: true, get: function () { return fundingFees_1.getPairPendingAccFundingFees; } });
Object.defineProperty(exports, "getTradeFundingFeesCollateral", { enumerable: true, get: function () { return fundingFees_1.getTradeFundingFeesCollateral; } });
Object.defineProperty(exports, "getTradeFundingFeesCollateralSimple", { enumerable: true, get: function () { return fundingFees_1.getTradeFundingFeesCollateralSimple; } });
Object.defineProperty(exports, "getTradeFundingFees", { enumerable: true, get: function () { return fundingFees_1.getTradeFundingFees; } });
var converter_3 = require("./fundingFees/converter");
Object.defineProperty(exports, "convertFundingFeeParams", { enumerable: true, get: function () { return converter_3.convertFundingFeeParams; } });
Object.defineProperty(exports, "convertFundingFeeParamsArray", { enumerable: true, get: function () { return converter_3.convertFundingFeeParamsArray; } });
Object.defineProperty(exports, "convertPairFundingFeeData", { enumerable: true, get: function () { return converter_3.convertPairFundingFeeData; } });
Object.defineProperty(exports, "convertPairFundingFeeDataArray", { enumerable: true, get: function () { return converter_3.convertPairFundingFeeDataArray; } });
Object.defineProperty(exports, "convertPairGlobalParams", { enumerable: true, get: function () { return converter_3.convertPairGlobalParams; } });
Object.defineProperty(exports, "convertPairGlobalParamsArray", { enumerable: true, get: function () { return converter_3.convertPairGlobalParamsArray; } });
Object.defineProperty(exports, "convertTradeInitialAccFundingFees", { enumerable: true, get: function () { return converter_3.convertTradeInitialAccFundingFees; } });
Object.defineProperty(exports, "createFundingFeeContext", { enumerable: true, get: function () { return converter_3.createFundingFeeContext; } });
Object.defineProperty(exports, "isValidFundingRate", { enumerable: true, get: function () { return converter_3.isValidFundingRate; } });
Object.defineProperty(exports, "fundingRateToAPR", { enumerable: true, get: function () { return converter_3.fundingRateToAPR; } });
Object.defineProperty(exports, "aprToFundingRate", { enumerable: true, get: function () { return converter_3.aprToFundingRate; } });
Object.defineProperty(exports, "calculateVelocityFromSkew", { enumerable: true, get: function () { return converter_3.calculateVelocityFromSkew; } });
Object.defineProperty(exports, "FUNDING_FEES_PRECISION", { enumerable: true, get: function () { return converter_3.FUNDING_FEES_PRECISION; } });

},{"./borrowing": "trade/fees/borrowing/index.js", "./tiers": "trade/fees/tiers/index.js", "./trading": "trade/fees/trading/index.js", "../../markets/holdingFees": "markets/holdingFees/index.js", "./converter": "trade/fees/converter.js", "./borrowingV2": "trade/fees/borrowingV2/index.js", "./borrowingV2/converter": "trade/fees/borrowingV2/converter.js", "./borrowingV2/fetcher": "trade/fees/borrowingV2/fetcher.js", "./borrowingV2/builder": "trade/fees/borrowingV2/builder.js", "./fundingFees": "trade/fees/fundingFees/index.js", "./fundingFees/converter": "trade/fees/fundingFees/converter.js"}],
"trade/fees/borrowing/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowingFee = exports.borrowingFeeUtils = exports.withinMaxGroupOi = exports.getBorrowingFee = void 0;
const __1 = require("../../..");
/**
 * @dev Calculates borrowing fees using v1 model (block-based with groups)
 * @dev Still actively used by markets that haven't migrated to v2
 * @dev Uses dynamic collateral OI - converts OI to USD for fee calculations
 * @param posDai Position size in collateral
 * @param pairIndex Trading pair index (required)
 * @param long Whether position is long
 * @param initialAccFees Initial accumulated fees when trade was opened
 * @param context Context with current block, fee data, and collateral price
 * @returns Borrowing fee in collateral tokens
 */
const getBorrowingFee = (posDai, pairIndex, long, initialAccFees, currentPairPrice, context) => {
    if (pairIndex === undefined) {
        throw new Error("pairIndex is required for borrowing fee calculations");
    }
    const { pairs, groups } = context;
    if (!groups || !pairs || !pairs[pairIndex]) {
        return 0;
    }
    const pairGroups = pairs[pairIndex].groups;
    const firstPairGroup = pairGroups?.length > 0 ? pairGroups[0] : undefined;
    let fee = 0;
    if (!firstPairGroup || firstPairGroup.block > initialAccFees.block) {
        const openInterest = (0, __1.getPairTotalOisDynamicCollateral)(pairIndex, {
            pairOis: context.pairOis,
            currentPairPrice,
        });
        fee =
            (!firstPairGroup
                ? getPairPendingAccFee(pairIndex, context.currentBlock, long, {
                    pairs,
                    openInterest: {
                        long: openInterest.long,
                        short: openInterest.short,
                        max: context.pairOis[pairIndex].maxCollateral,
                    },
                    collateralPriceUsd: context.collateralPriceUsd,
                })
                : long
                    ? firstPairGroup.pairAccFeeLong
                    : firstPairGroup.pairAccFeeShort) - initialAccFees.accPairFee;
    }
    for (let i = pairGroups.length; i > 0; i--) {
        const { deltaGroup, deltaPair, beforeTradeOpen } = getPairGroupAccFeesDeltas(i - 1, pairGroups, initialAccFees, pairIndex, long, currentPairPrice, {
            currentBlock: context.currentBlock,
            groups,
            pairs,
            collateralPriceUsd: context.collateralPriceUsd,
            pairOis: context.pairOis,
        });
        fee += Math.max(deltaGroup, deltaPair);
        if (beforeTradeOpen) {
            break;
        }
    }
    return (posDai * fee) / 100;
};
exports.getBorrowingFee = getBorrowingFee;
/**
 * @dev This function uses static OI which doesn't reflect current market values
 * @dev The v10 contracts use dynamic OI (beforeV10 + afterV10Token * currentPrice)
 */
const withinMaxGroupOi = (pairIndex, long, positionSizeCollateral, context) => {
    const { groups, pairs } = context;
    if (!groups || !pairs) {
        return false;
    }
    const g = groups[getPairGroupIndex(pairIndex, { pairs })].oi;
    return (g.max == 0 || (long ? g.long : g.short) + positionSizeCollateral <= g.max);
};
exports.withinMaxGroupOi = withinMaxGroupOi;
const getPairGroupIndex = (pairIndex, context) => {
    const { pairs } = context;
    if (!pairs[pairIndex]) {
        return 0;
    }
    const pairGroups = pairs[pairIndex].groups;
    return pairGroups.length == 0 ? 0 : pairGroups[0].groupIndex;
};
const getPairPendingAccFees = (pairIndex, currentBlock, context) => {
    const { pairs, openInterest: { long, short }, collateralPriceUsd, } = context;
    const pair = pairs[pairIndex];
    return getPendingAccFees(pair.accFeeLong, pair.accFeeShort, long, short, pair.feePerBlock, currentBlock, pair.accLastUpdatedBlock, context.openInterest.max, pair.feeExponent, pair.feePerBlockCap, collateralPriceUsd);
};
const getPairPendingAccFee = (pairIndex, currentBlock, long, context) => {
    const { accFeeLong, accFeeShort } = getPairPendingAccFees(pairIndex, currentBlock, context);
    return long ? accFeeLong : accFeeShort;
};
const getGroupPendingAccFees = (groupIndex, currentBlock, context) => {
    const { groups, collateralPriceUsd } = context;
    const group = groups[groupIndex];
    return getPendingAccFees(group.accFeeLong, group.accFeeShort, group.oi.long, group.oi.short, group.feePerBlock, currentBlock, group.accLastUpdatedBlock, group.oi.max, group.feeExponent, undefined, // no fee caps for groups
    collateralPriceUsd);
};
const getGroupPendingAccFee = (groupIndex, currentBlock, long, context) => {
    const { accFeeLong, accFeeShort } = getGroupPendingAccFees(groupIndex, currentBlock, context);
    return long ? accFeeLong : accFeeShort;
};
const getPairGroupAccFeesDeltas = (i, pairGroups, initialFees, pairIndex, long, currentPairPrice, context) => {
    const group = pairGroups[i];
    const beforeTradeOpen = group.block < initialFees.block;
    let deltaGroup, deltaPair;
    if (i == pairGroups.length - 1) {
        const { currentBlock, groups, pairs, collateralPriceUsd } = context;
        const openInterest = (0, __1.getPairTotalOisDynamicCollateral)(pairIndex, {
            pairOis: context.pairOis,
            currentPairPrice,
        });
        deltaGroup = getGroupPendingAccFee(group.groupIndex, currentBlock, long, {
            groups,
            collateralPriceUsd,
        });
        deltaPair = getPairPendingAccFee(pairIndex, currentBlock, long, {
            pairs,
            openInterest: {
                long: openInterest.long,
                short: openInterest.short,
                max: context.pairOis[pairIndex].maxCollateral,
            },
            collateralPriceUsd,
        });
    }
    else {
        const nextGroup = pairGroups[i + 1];
        if (beforeTradeOpen && nextGroup.block <= initialFees.block) {
            return { deltaGroup: 0, deltaPair: 0, beforeTradeOpen };
        }
        deltaGroup = long
            ? nextGroup.prevGroupAccFeeLong
            : nextGroup.prevGroupAccFeeShort;
        deltaPair = long ? nextGroup.pairAccFeeLong : nextGroup.pairAccFeeShort;
    }
    if (beforeTradeOpen) {
        deltaGroup -= initialFees.accGroupFee;
        deltaPair -= initialFees.accPairFee;
    }
    else {
        deltaGroup -= long ? group.initialAccFeeLong : group.initialAccFeeShort;
        deltaPair -= long ? group.pairAccFeeLong : group.pairAccFeeShort;
    }
    return { deltaGroup, deltaPair, beforeTradeOpen };
};
const getPendingAccFees = (accFeeLong, accFeeShort, oiLong, oiShort, feePerBlock, currentBlock, accLastUpdatedBlock, maxOi, feeExponent, feeCaps, // as percentage: eg minP: 0.1 = 10%, maxP: 0.5 = 50%
collateralPriceUsd) => {
    const moreShorts = oiLong < oiShort;
    const blockDistance = currentBlock > accLastUpdatedBlock ? currentBlock - accLastUpdatedBlock : 0;
    // If block distance is zero nothing changes
    if (blockDistance === 0) {
        return {
            accFeeLong,
            accFeeShort,
            deltaLong: 0,
            deltaShort: 0,
        };
    }
    // Convert OI to USD if collateral price is provided (dynamic collateral OI)
    const oiLongUsd = collateralPriceUsd ? oiLong * collateralPriceUsd : oiLong;
    const oiShortUsd = collateralPriceUsd
        ? oiShort * collateralPriceUsd
        : oiShort;
    const maxOiUsd = collateralPriceUsd ? maxOi * collateralPriceUsd : maxOi;
    const netOi = Math.abs(oiLongUsd - oiShortUsd);
    // Calculate minimum and maximum effective oi (using USD values if available)
    const { minP, maxP } = getFeePerBlockCaps(feeCaps);
    const minNetOi = maxOiUsd * minP;
    const maxNetOi = maxOiUsd * maxP;
    // Calculate the minimum acc fee delta (applies to both sides)
    const minDelta = minNetOi > 0
        ? getPendingAccFeesDelta(blockDistance, feePerBlock, minNetOi, maxOiUsd, feeExponent)
        : 0;
    // Calculate the actual acc fee (using capped oi of 100% or less)
    const delta = netOi > minNetOi
        ? getPendingAccFeesDelta(blockDistance, feePerBlock, Math.min(netOi, maxNetOi), // if netOi > cap, use cap
        maxOiUsd, feeExponent)
        : minDelta;
    const [deltaLong, deltaShort] = moreShorts
        ? [minDelta, delta]
        : [delta, minDelta];
    return {
        accFeeLong: accFeeLong + deltaLong,
        accFeeShort: accFeeShort + deltaShort,
        deltaLong,
        deltaShort,
    };
};
const getPendingAccFeesDelta = (blockDistance, feePerBlock, netOi, maxOi, feeExponent) => {
    return maxOi > 0 && feeExponent > 0
        ? feePerBlock * blockDistance * (netOi / maxOi) ** feeExponent
        : 0;
};
const getFeePerBlockCaps = (cap) => {
    return {
        minP: cap?.minP || 0,
        maxP: cap?.maxP && cap.maxP > 0 ? cap.maxP : 1,
    };
};
const getBorrowingDataActiveFeePerBlock = (val) => {
    const { long, short, max } = val.oi;
    const { minP, maxP } = getFeePerBlockCaps("feePerBlockCap" in val ? val.feePerBlockCap : undefined);
    // Calculate the effective open interest
    // If minP > 0 then netOi has to be at least minP * maxOi
    // If maxP > 0 then netOi cannot be more than maxP * maxOi
    const effectiveOi = Math.min(Math.max(Math.abs(long - short), max * minP), max * maxP);
    return val.feePerBlock * (effectiveOi / max) ** val.feeExponent;
};
const getActiveFeePerBlock = (pair, group) => {
    const pairFeePerBlock = getBorrowingDataActiveFeePerBlock(pair);
    if (!group) {
        return pairFeePerBlock;
    }
    const groupFeePerBlock = getBorrowingDataActiveFeePerBlock(group);
    return Math.max(pairFeePerBlock, groupFeePerBlock);
};
exports.borrowingFeeUtils = {
    getPairGroupAccFeesDeltas,
    getPairPendingAccFees,
    getPairPendingAccFee,
    getGroupPendingAccFees,
    getGroupPendingAccFee,
    getPendingAccFees,
    getActiveFeePerBlock,
    getBorrowingDataActiveFeePerBlock,
    getPairGroupIndex,
    getPendingAccFeesDelta,
    getFeePerBlockCaps,
};
exports.BorrowingFee = __importStar(require("./types"));
__exportStar(require("./converter"), exports);
__exportStar(require("./builder"), exports);

},{"../../..": "index.js", "./types": "trade/fees/borrowing/types.js", "./converter": "trade/fees/borrowing/converter.js", "./builder": "trade/fees/borrowing/builder.js"}],
"trade/fees/borrowing/types.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/fees/borrowing/converter.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFeePerBlockCap = exports.convertGroupBorrowingFees = exports.convertGroupBorrowingData = exports.convertGroupBorrowingFee = exports.convertPairBorrowingFees = exports.convertPairBorrowingFee = exports.convertPairGroupBorrowingFee = void 0;
const borrowingFees_1 = require("../../../contracts/utils/borrowingFees");
const convertPairGroupBorrowingFee = (pairGroup) => ({
    groupIndex: pairGroup.groupIndex,
    name: (0, borrowingFees_1.getBorrowingGroupName)(pairGroup.groupIndex),
    initialAccFeeLong: parseFloat(pairGroup.initialAccFeeLong.toString()) / 1e10,
    initialAccFeeShort: parseFloat(pairGroup.initialAccFeeShort.toString()) / 1e10,
    prevGroupAccFeeLong: parseFloat(pairGroup.prevGroupAccFeeLong.toString()) / 1e10,
    prevGroupAccFeeShort: parseFloat(pairGroup.prevGroupAccFeeShort.toString()) / 1e10,
    pairAccFeeLong: parseFloat(pairGroup.pairAccFeeLong.toString()) / 1e10,
    pairAccFeeShort: parseFloat(pairGroup.pairAccFeeShort.toString()) / 1e10,
    block: pairGroup.block,
});
exports.convertPairGroupBorrowingFee = convertPairGroupBorrowingFee;
const convertPairBorrowingFee = (pair, pairOi, pairGroup, feeCap) => ({
    ...(0, exports.convertGroupBorrowingData)(pair, pairOi),
    groups: pairGroup.map(value => (0, exports.convertPairGroupBorrowingFee)(value)),
    feePerBlockCap: (0, exports.convertFeePerBlockCap)(feeCap),
});
exports.convertPairBorrowingFee = convertPairBorrowingFee;
const convertPairBorrowingFees = ([pairs, pairOi, pairGroups, feeCaps]) => pairs.map((value, ix) => (0, exports.convertPairBorrowingFee)(value, pairOi[ix], pairGroups[ix], feeCaps[ix]));
exports.convertPairBorrowingFees = convertPairBorrowingFees;
const convertGroupBorrowingFee = (group, groupOi) => (0, exports.convertGroupBorrowingData)(group, groupOi);
exports.convertGroupBorrowingFee = convertGroupBorrowingFee;
const convertGroupBorrowingData = (obj, oi) => ({
    oi: {
        long: parseFloat(oi.long.toString()) / 1e10,
        short: parseFloat(oi.short.toString()) / 1e10,
        max: parseFloat(oi.max.toString()) / 1e10,
    },
    feePerBlock: obj.feePerBlock / 1e10,
    accFeeLong: parseFloat(obj.accFeeLong.toString()) / 1e10,
    accFeeShort: parseFloat(obj.accFeeShort.toString()) / 1e10,
    accLastUpdatedBlock: obj.accLastUpdatedBlock,
    feeExponent: obj.feeExponent,
});
exports.convertGroupBorrowingData = convertGroupBorrowingData;
const convertGroupBorrowingFees = ([groups, groupOis]) => groups.map((value, ix) => (0, exports.convertGroupBorrowingFee)(value, groupOis[ix]));
exports.convertGroupBorrowingFees = convertGroupBorrowingFees;
const convertFeePerBlockCap = (feeCap) => ({
    minP: feeCap.minP ? parseFloat(feeCap.minP.toString()) / 1e3 / 100 : 0,
    maxP: feeCap.maxP ? parseFloat(feeCap.maxP.toString()) / 1e3 / 100 : 1,
});
exports.convertFeePerBlockCap = convertFeePerBlockCap;

},{"../../../contracts/utils/borrowingFees": "contracts/utils/borrowingFees.js"}],
"contracts/utils/borrowingFees.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllPairAndGroupBorrowingFees = exports.fetchGroupBorrowingFees = exports.fetchAllPairBorrowingFees = exports.getBorrowingGroupName = void 0;
const trade_1 = require("../../trade");
const getBorrowingGroupName = (groupIndex) => {
    const groupNamesByIndex = [
        "Crypto Core",
        "Crypto Altcoins",
        "Forex USD Majors",
        "Forex USD-Quoted Majors",
        "Forex EUR Majors",
        "Indices",
        "Stocks",
        "Commodities",
        "Forex USD Minors",
        "Forex Nordic",
        "Forex GBP Majors",
        "Forex AUD",
        "Forex NZD",
        "Crypto Degen",
    ];
    return groupNamesByIndex[groupIndex - 1] || "Unknown";
};
exports.getBorrowingGroupName = getBorrowingGroupName;
const fetchAllPairBorrowingFees = async (contract, collateralIndex) => {
    const [pairs, pairOi, pairGroups] = await contract.getAllBorrowingPairs(collateralIndex);
    const feeCaps = await contract.getBorrowingPairFeePerBlockCaps(collateralIndex, [...Array(pairs.length).keys()]);
    return (0, trade_1.convertPairBorrowingFees)([pairs, pairOi, pairGroups, feeCaps]);
};
exports.fetchAllPairBorrowingFees = fetchAllPairBorrowingFees;
const fetchGroupBorrowingFees = async (contract, collateralIndex, groupIxs) => (0, trade_1.convertGroupBorrowingFees)(await contract.getBorrowingGroups(collateralIndex, groupIxs));
exports.fetchGroupBorrowingFees = fetchGroupBorrowingFees;
const fetchAllPairAndGroupBorrowingFees = async (contract, collateralIndex) => {
    const pairs = await (0, exports.fetchAllPairBorrowingFees)(contract, collateralIndex);
    const groupIxs = [
        ...new Set(pairs
            .map(value => value.groups.map(value => value.groupIndex))
            .reduce((acc, value) => acc.concat(value), [])),
    ].sort((a, b) => a - b);
    const groups = await (0, exports.fetchGroupBorrowingFees)(contract, collateralIndex, groupIxs);
    return { pairs, groups };
};
exports.fetchAllPairAndGroupBorrowingFees = fetchAllPairAndGroupBorrowingFees;

},{"../../trade": "trade/index.js"}],
"trade/fees/borrowing/builder.js":[function(require,module,exports){
"use strict";
/**
 * @dev Context builder for borrowing v1 fees
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBorrowingV1Context = void 0;
/**
 * @dev Builds borrowing v1 context from global trading variables
 * @dev Returns full array-based context required for v1 borrowing fee calculations
 * @param globalTradingVariables The transformed global trading variables from backend
 * @param collateralIndex Collateral index (1-based)
 * @param currentBlock Current block number
 * @returns Full borrowing context with all pairs and groups or undefined if data not available
 */
const buildBorrowingV1Context = (globalTradingVariables, collateralIndex, currentBlock) => {
    const collateral = globalTradingVariables.collaterals[collateralIndex - 1];
    if (!collateral?.pairBorrowingFees || !collateral?.groupBorrowingFees) {
        return undefined;
    }
    const pairs = collateral.pairBorrowingFees;
    const groups = collateral.groupBorrowingFees;
    if (pairs.length === 0 || groups.length === 0) {
        return undefined;
    }
    return {
        currentBlock,
        pairs,
        groups,
        collateralPriceUsd: collateral.prices?.collateralPriceUsd || 1,
        pairOis: collateral.pairOis,
    };
};
exports.buildBorrowingV1Context = buildBorrowingV1Context;

},{}],
"trade/fees/tiers/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStakingFeeMultiplier = exports.isGnsStakingCooldownActive = exports.getTraderFeeMultiplier = exports.calculateFeeAmount = exports.computeFeeMultiplier = exports.getFeeMultiplier = exports.getFeeTiersCount = exports.getCurrentDay = exports.GNS_STAKING_COOLDOWN_SECONDS = exports.MAX_FEE_TIERS = exports.FEE_MULTIPLIER_SCALE = exports.TRAILING_PERIOD_DAYS = void 0;
const types_1 = require("./types");
__exportStar(require("./types"), exports);
__exportStar(require("./converter"), exports);
exports.TRAILING_PERIOD_DAYS = 30;
exports.FEE_MULTIPLIER_SCALE = 1;
exports.MAX_FEE_TIERS = 8;
exports.GNS_STAKING_COOLDOWN_SECONDS = 86400; // 1 day in seconds
const getCurrentDay = () => Math.floor(Date.now() / 1000 / 60 / 60 / 24);
exports.getCurrentDay = getCurrentDay;
const getFeeTiersCount = (feeTiers) => {
    for (let i = exports.MAX_FEE_TIERS; i > 0; --i) {
        if (feeTiers[i - 1]?.feeMultiplier > 0) {
            return i;
        }
    }
    return 0;
};
exports.getFeeTiersCount = getFeeTiersCount;
const getFeeMultiplier = (trailingPoints, tiers) => {
    let feeMultiplier = exports.FEE_MULTIPLIER_SCALE;
    for (let i = (0, exports.getFeeTiersCount)(tiers); i > 0; --i) {
        const feeTier = tiers[i - 1];
        if (trailingPoints >= feeTier.pointsThreshold) {
            feeMultiplier = feeTier.feeMultiplier;
            break;
        }
    }
    return feeMultiplier;
};
exports.getFeeMultiplier = getFeeMultiplier;
const computeFeeMultiplier = (feeTiers, traderFeeTiers) => {
    const { currentDay, tiers } = feeTiers;
    const { traderInfo, expiredPoints, lastDayUpdatedPoints, traderEnrollment, stakingInfo, } = traderFeeTiers;
    const { lastDayUpdated, trailingPoints } = traderInfo;
    let curTrailingPoints = trailingPoints;
    if (currentDay > lastDayUpdated) {
        curTrailingPoints = 0;
        const earliestActiveDay = currentDay - exports.TRAILING_PERIOD_DAYS;
        if (lastDayUpdated >= earliestActiveDay) {
            curTrailingPoints = trailingPoints + lastDayUpdatedPoints;
            const expiredTrailingPoints = expiredPoints.reduce((acc, points) => acc + points, 0);
            curTrailingPoints -= expiredTrailingPoints;
        }
    }
    const isTraderExcluded = traderEnrollment.status === types_1.TraderEnrollmentStatus.EXCLUDED;
    // Fee multiplier from volume tiers
    const volumeFeeMultiplier = isTraderExcluded
        ? exports.FEE_MULTIPLIER_SCALE
        : (0, exports.getFeeMultiplier)(curTrailingPoints, tiers);
    // Fee multiplier from staking tiers
    const stakingFeeMultiplier = isTraderExcluded || stakingInfo.feeMultiplierCache === 0
        ? exports.FEE_MULTIPLIER_SCALE
        : stakingInfo.feeMultiplierCache;
    // Total fee multiplier is the product of both multipliers
    const totalFeeMultiplier = volumeFeeMultiplier * stakingFeeMultiplier;
    return {
        feeMultiplier: totalFeeMultiplier,
        volumeFeeMultiplier: volumeFeeMultiplier,
        trailingPoints: curTrailingPoints,
        stakingFeeMultiplier: stakingFeeMultiplier,
    };
};
exports.computeFeeMultiplier = computeFeeMultiplier;
/**
 * @dev Calculates the final fee amount after applying the trader's fee tier discount
 * @dev Mirrors the contract's calculateFeeAmount function
 * @param trader The address of the trader (not used in SDK, for consistency)
 * @param normalFeeAmountCollateral The base fee amount before any discounts
 * @param feeMultiplier The trader's fee multiplier (e.g., 0.8 = 80% of normal fee)
 * @returns The final fee amount after applying discount
 */
const calculateFeeAmount = (trader, normalFeeAmountCollateral, feeMultiplier) => {
    // If no fee multiplier provided or it's 0, return normal fee
    if (!feeMultiplier || feeMultiplier === 0) {
        return normalFeeAmountCollateral;
    }
    // Apply fee multiplier discount
    return (feeMultiplier * normalFeeAmountCollateral) / exports.FEE_MULTIPLIER_SCALE;
};
exports.calculateFeeAmount = calculateFeeAmount;
/**
 * @dev Helper function to get trader's fee multiplier from volume and staking fee tiers data
 * @param feeTiers System fee tiers configuration
 * @param traderFeeTiers Trader's fee tier data
 * @returns Fee multiplier (1e3 precision)
 */
const getTraderFeeMultiplier = (feeTiers, traderFeeTiers) => {
    const { feeMultiplier } = (0, exports.computeFeeMultiplier)(feeTiers, traderFeeTiers);
    return feeMultiplier;
};
exports.getTraderFeeMultiplier = getTraderFeeMultiplier;
const isGnsStakingCooldownActive = (traderFeeTiers) => {
    const now = Math.floor(Date.now() / 1000);
    const expiryTs = traderFeeTiers.stakingInfo.stakeTimestamp + exports.GNS_STAKING_COOLDOWN_SECONDS;
    return { isActive: now < expiryTs, expiryTs };
};
exports.isGnsStakingCooldownActive = isGnsStakingCooldownActive;
/**
 * @dev Helper function to get the fee multiplier based on GNS and gGNS amounts. Useful to estimate fee multiplier after staking/unstaking.
 * @param amountGns Amount of GNS staked
 * @param amountGGns Amount of gGNS staked
 * @param bonusAmount GNS bonus amount
 * @param stakingTiers Array of staking fee tiers
 * @param gGnsPrice Conversion ratio from gGNS to GNS (e.g., 0.8 means 1 gGNS = 0.8 GNS, 1.1 means 1 gGNS = 1.1 GNS); Defaults to 1 (e.g., 1 gGNS = 1 GNS)
 */
const getStakingFeeMultiplier = (amountGns, amountGGns, bonusAmount, stakingTiers, gGnsPrice = 1) => {
    let feeMultiplier = exports.FEE_MULTIPLIER_SCALE;
    for (let i = (0, exports.getFeeTiersCount)(stakingTiers); i > 0; --i) {
        const stakingTier = stakingTiers[i - 1];
        if (amountGns + amountGGns * gGnsPrice + bonusAmount >=
            stakingTier.pointsThreshold) {
            feeMultiplier = stakingTier.feeMultiplier;
            break;
        }
    }
    return feeMultiplier;
};
exports.getStakingFeeMultiplier = getStakingFeeMultiplier;

},{"./types": "trade/fees/tiers/types.js", "./converter": "trade/fees/tiers/converter.js"}],
"trade/fees/tiers/types.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderEnrollmentStatus = void 0;
var TraderEnrollmentStatus;
(function (TraderEnrollmentStatus) {
    TraderEnrollmentStatus[TraderEnrollmentStatus["ENROLLED"] = 0] = "ENROLLED";
    TraderEnrollmentStatus[TraderEnrollmentStatus["EXCLUDED"] = 1] = "EXCLUDED";
})(TraderEnrollmentStatus = exports.TraderEnrollmentStatus || (exports.TraderEnrollmentStatus = {}));

},{}],
"trade/fees/tiers/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for fee tier data between contract and SDK formats
 * @dev All BigNumber values are normalized to floats with appropriate precision
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTraderFeeTiersData = exports.convertFeeTiersConfig = exports.convertStakingInfo = exports.convertTraderEnrollment = exports.convertTraderInfo = exports.convertFeeTierArray = exports.convertFeeTier = void 0;
/**
 * @dev Converts contract fee tier data to SDK format
 * @param contractData Contract FeeTier struct
 * @returns Normalized fee tier data
 */
const convertFeeTier = (contractData) => {
    return {
        feeMultiplier: Number(contractData.feeMultiplier) / 1e3,
        pointsThreshold: Number(contractData.pointsThreshold), // 0 precision
    };
};
exports.convertFeeTier = convertFeeTier;
/**
 * @dev Converts array of fee tiers from contract format
 * @param contractDataArray Array of contract FeeTier structs
 * @returns Array of normalized fee tiers
 */
const convertFeeTierArray = (contractDataArray) => {
    return contractDataArray.map(exports.convertFeeTier);
};
exports.convertFeeTierArray = convertFeeTierArray;
/**
 * @dev Converts contract trader info to SDK format
 * @param contractData Contract TraderInfo struct
 * @returns Normalized trader info
 */
const convertTraderInfo = (contractData) => {
    return {
        lastDayUpdated: Number(contractData.lastDayUpdated),
        trailingPoints: Number(contractData.trailingPoints) / 1e18, // Points in 1e18 precision
    };
};
exports.convertTraderInfo = convertTraderInfo;
/**
 * @dev Converts contract trader enrollment to SDK format
 * @param contractData Contract TraderEnrollment struct
 * @returns Normalized trader enrollment
 */
const convertTraderEnrollment = (contractData) => {
    return {
        status: Number(contractData.status),
    };
};
exports.convertTraderEnrollment = convertTraderEnrollment;
/**
 * @dev Converts contract gns staking info to SDK format
 * @param contractData Contract GnsStakingInfo struct
 * @returns Normalized gns staking info
 */
const convertStakingInfo = (contractData) => {
    return {
        stakedGns: Number(contractData.stakedGns) / 1e18,
        stakedVaultGns: Number(contractData.stakedVaultGns) / 1e18,
        bonusAmount: Number(contractData.bonusAmount),
        stakeTimestamp: Number(contractData.stakeTimestamp),
        feeMultiplierCache: Number(contractData.feeMultiplierCache) / 1e3,
    };
};
exports.convertStakingInfo = convertStakingInfo;
/**
 * @dev Converts the complete fee tiers configuration from contract format
 * @param tiers Array of volume fee tiers from contract
 * @param groupVolumeMultipliers Array of group volume multipliers
 * @param currentDay Current day from contract
 * @param stakingTiers Array of staking fee tiers from contract
 * @returns Complete fee tiers configuration
 */
const convertFeeTiersConfig = (tiers, groupVolumeMultipliers, currentDay, stakingTiers) => {
    return {
        tiers: (0, exports.convertFeeTierArray)(tiers),
        groupVolumeMultipliers: groupVolumeMultipliers.map(m => Number(m) / 1e3),
        currentDay: Number(currentDay),
        stakingTiers: (0, exports.convertFeeTierArray)(stakingTiers),
    };
};
exports.convertFeeTiersConfig = convertFeeTiersConfig;
/**
 * @dev Converts trader's volume and staking fee tier data from contract format
 * @param traderInfo Trader info from contract
 * @param traderDailyInfo Array of daily points info
 * @param traderEnrollment Enrollment status from contract
 * @param stakingInfo Staking info from contract
 * @returns Complete trader volume and staking fee tier data
 */
const convertTraderFeeTiersData = (traderInfo, traderDailyInfo, traderEnrollment, stakingInfo) => {
    return {
        traderInfo: (0, exports.convertTraderInfo)(traderInfo),
        dailyPoints: traderDailyInfo.map(points => Number(points) / 1e18),
        traderEnrollment: (0, exports.convertTraderEnrollment)(traderEnrollment),
        stakingInfo: (0, exports.convertStakingInfo)(stakingInfo),
    };
};
exports.convertTraderFeeTiersData = convertTraderFeeTiersData;

},{}],
"trade/fees/trading/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Trading fee calculations for opening and closing positions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradePendingHoldingFeesCollateral = exports.getClosingFee = exports.getTotalTradeLiqFeesCollateral = exports.getTradeFeesCollateral = exports.getTotalTradeFeesCollateral = void 0;
const borrowing_1 = require("../borrowing");
const borrowingV2_1 = require("../borrowingV2");
const fundingFees_1 = require("../fundingFees");
const tiers_1 = require("../tiers");
const types_1 = require("../../../contracts/types");
/**
 * @dev Returns the total fee for a trade in collateral tokens
 * @dev Mirrors the contract's getTotalTradeFeesCollateral function
 * @param collateralIndex Collateral index (not used in calculation, for consistency)
 * @param trader Trader address (for fee tier lookup)
 * @param pairIndex Index of the trading pair
 * @param positionSizeCollateral Position size in collateral tokens
 * @param isCounterTrade Whether the trade is a counter trade
 * @param context Context containing fee parameters and settings
 * @returns Total fee in collateral tokens
 */
const getTotalTradeFeesCollateral = (collateralIndex, trader, pairIndex, positionSizeCollateral, isCounterTrade, context) => {
    const { fee, collateralPriceUsd } = context;
    const { totalPositionSizeFeeP, minPositionSizeUsd } = fee;
    // Get counter trade fee rate multiplier (default 1 = 1x)
    const counterTradeFeeRateMultiplier = isCounterTrade && context.counterTradeSettings?.[pairIndex]
        ? context.counterTradeSettings[pairIndex].feeRateMultiplier
        : 1;
    // Apply counter trade multiplier to position size
    const adjustedPositionSizeCollateral = positionSizeCollateral * counterTradeFeeRateMultiplier;
    // Calculate minimum position size in collateral
    const minPositionSizeCollateral = minPositionSizeUsd / collateralPriceUsd;
    // Use max of adjusted position size and minimum position size
    const positionSizeBasis = Math.max(adjustedPositionSizeCollateral, minPositionSizeCollateral);
    // Calculate raw fee
    const rawFee = totalPositionSizeFeeP * positionSizeBasis;
    // Apply trader fee tier if available
    return (0, tiers_1.calculateFeeAmount)(trader, rawFee, context.traderFeeMultiplier);
};
exports.getTotalTradeFeesCollateral = getTotalTradeFeesCollateral;
/**
 * @dev Returns the fee breakdown for a trade
 * @dev Mirrors the contract's getTradeFeesCollateral function
 */
const getTradeFeesCollateral = (collateralIndex, trader, pairIndex, positionSizeCollateral, isCounterTrade, context) => {
    const totalFees = (0, exports.getTotalTradeFeesCollateral)(collateralIndex, trader, pairIndex, positionSizeCollateral, isCounterTrade, context);
    const { globalTradeFeeParams } = context;
    const totalP = globalTradeFeeParams.referralFeeP +
        globalTradeFeeParams.govFeeP +
        globalTradeFeeParams.triggerOrderFeeP +
        globalTradeFeeParams.gnsOtcFeeP +
        globalTradeFeeParams.gTokenFeeP;
    // Distribute fees proportionally
    return {
        referralFeeCollateral: (totalFees * globalTradeFeeParams.referralFeeP) / totalP,
        govFeeCollateral: (totalFees * globalTradeFeeParams.govFeeP) / totalP,
        triggerFeeCollateral: (totalFees * globalTradeFeeParams.triggerOrderFeeP) / totalP,
        gnsOtcFeeCollateral: (totalFees * globalTradeFeeParams.gnsOtcFeeP) / totalP,
        gTokenFeeCollateral: (totalFees * globalTradeFeeParams.gTokenFeeP) / totalP,
    };
};
exports.getTradeFeesCollateral = getTradeFeesCollateral;
/**
 * @dev Returns total liquidation fee for a trade in collateral tokens
 * @dev Mirrors the contract's getTotalTradeLiqFeesCollateral function
 */
const getTotalTradeLiqFeesCollateral = (collateralIndex, trader, pairIndex, collateralAmount, context) => {
    const { totalLiqCollateralFeeP } = context;
    // Calculate raw liquidation fee
    const rawFee = collateralAmount * totalLiqCollateralFeeP;
    // Apply trader fee tier if available
    return (0, tiers_1.calculateFeeAmount)(trader, rawFee, context.traderFeeMultiplier);
};
exports.getTotalTradeLiqFeesCollateral = getTotalTradeLiqFeesCollateral;
/**
 * @dev Legacy function for backward compatibility
 * @deprecated Use getTotalTradeFeesCollateral instead
 */
const getClosingFee = (collateralAmount, leverage, pairIndex, pairFee, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_collateralPriceUsd = 0, // Kept for backward compatibility
isCounterTrade = false, trader, context) => {
    if (!pairFee || !context)
        return 0;
    const positionSizeCollateral = collateralAmount * leverage;
    return (0, exports.getTotalTradeFeesCollateral)(0, // collateralIndex not used
    trader || "", pairIndex, positionSizeCollateral, isCounterTrade, context);
};
exports.getClosingFee = getClosingFee;
/**
 * @dev Calculates total holding fees for a trade (funding + borrowing fees)
 * @param trade The trade to calculate fees for
 * @param tradeInfo Trade info containing contracts version
 * @param tradeFeesData Trade fees data containing initial acc fees
 * @param currentPairPrice Current pair price
 * @param context Structured context with sub-contexts for each fee type
 * @returns Object containing all holding fee components
 */
const getTradePendingHoldingFeesCollateral = (trade, tradeInfo, tradeFeesData, currentPairPrice, context) => {
    const positionSizeCollateral = trade.collateralAmount * trade.leverage;
    // Calculate funding fees (v10+ only)
    let fundingFeeCollateral = 0;
    if (context.contractsVersion >= types_1.ContractsVersion.V10 &&
        context.funding &&
        tradeFeesData.initialAccFundingFeeP !== undefined) {
        fundingFeeCollateral = (0, fundingFees_1.getTradeFundingFeesCollateral)(trade, tradeInfo, tradeFeesData, currentPairPrice, {
            ...context.funding,
            currentTimestamp: context.currentTimestamp,
        });
    }
    // Calculate borrowing fees v2 (v10+ only)
    let borrowingFeeCollateral = 0;
    if (context.contractsVersion >= types_1.ContractsVersion.V10 &&
        context.borrowingV2 &&
        tradeFeesData.initialAccBorrowingFeeP !== undefined) {
        borrowingFeeCollateral = (0, borrowingV2_1.getTradeBorrowingFeesCollateral)({
            positionSizeCollateral,
            openPrice: trade.openPrice,
            currentPairPrice,
            initialAccBorrowingFeeP: tradeFeesData.initialAccBorrowingFeeP,
            currentTimestamp: context.currentTimestamp,
        }, context.borrowingV2);
    }
    // Calculate v1 borrowing fees (some markets use v1 indefinitely)
    let borrowingFeeCollateral_old = 0;
    if (context.borrowingV1 && context.initialAccFees) {
        borrowingFeeCollateral_old = (0, borrowing_1.getBorrowingFee)(positionSizeCollateral, trade.pairIndex, trade.long, context.initialAccFees, currentPairPrice, context.borrowingV1);
    }
    return {
        fundingFeeCollateral,
        borrowingFeeCollateral,
        borrowingFeeCollateral_old,
        totalFeeCollateral: fundingFeeCollateral +
            borrowingFeeCollateral +
            borrowingFeeCollateral_old,
    };
};
exports.getTradePendingHoldingFeesCollateral = getTradePendingHoldingFeesCollateral;
// Export types
__exportStar(require("./types"), exports);
__exportStar(require("./converter"), exports);
__exportStar(require("./builder"), exports);

},{"../borrowing": "trade/fees/borrowing/index.js", "../borrowingV2": "trade/fees/borrowingV2/index.js", "../fundingFees": "trade/fees/fundingFees/index.js", "../tiers": "trade/fees/tiers/index.js", "../../../contracts/types": "contracts/types/index.js", "./types": "trade/fees/trading/types.js", "./converter": "trade/fees/trading/converter.js", "./builder": "trade/fees/trading/builder.js"}],
"trade/fees/borrowingV2/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowingFeeV2 = exports.borrowingFeeV2Utils = exports.getPairBorrowingFees = exports.getTradeBorrowingFeesCollateral = exports.getPairPendingAccBorrowingFees = exports.BORROWING_V2_PRECISION = exports.MAX_BORROWING_RATE_PER_SECOND = void 0;
/**
 * @dev Maximum borrowing rate per second (1,000% APR)
 */
exports.MAX_BORROWING_RATE_PER_SECOND = 0.0317097; // 317097 / 1e10
/**
 * @dev Precision constants for borrowing v2 calculations
 */
exports.BORROWING_V2_PRECISION = {
    RATE_PER_SECOND: 1e10,
    ACC_FEE: 1e20,
    PERCENTAGE: 100,
};
/**
 * @dev Calculates pending accumulated borrowing fees for a pair
 * @param params Borrowing fee parameters for the pair
 * @param data Current borrowing fee data for the pair
 * @param currentPairPrice Current price of the trading pair
 * @param currentTimestamp Current timestamp (defaults to now)
 * @returns Updated accumulated borrowing fee (1e20 precision)
 */
const getPairPendingAccBorrowingFees = (params, data, currentPairPrice, currentTimestamp) => {
    const timestamp = currentTimestamp ?? Math.floor(Date.now() / 1000);
    // Calculate time elapsed since last update
    const timeElapsed = Math.max(0, timestamp - data.lastBorrowingUpdateTs);
    // If no time elapsed, return current accumulated fee
    if (timeElapsed === 0) {
        return data.accBorrowingFeeP;
    }
    // Calculate accumulated borrowing fee delta
    // Formula: borrowingRatePerSecondP * timeElapsed * currentPairPrice
    const accBorrowingFeeDeltaP = params.borrowingRatePerSecondP * timeElapsed * currentPairPrice;
    return data.accBorrowingFeeP + accBorrowingFeeDeltaP;
};
exports.getPairPendingAccBorrowingFees = getPairPendingAccBorrowingFees;
/**
 * @dev Calculates borrowing fees owed by a specific trade
 * @param input Trade borrowing fee calculation input (without pairIndex)
 * @param context Pair-specific borrowing context
 * @returns Borrowing fees in collateral tokens
 */
const getTradeBorrowingFeesCollateral = (input, context) => {
    const { positionSizeCollateral, openPrice, currentPairPrice, initialAccBorrowingFeeP, currentTimestamp, } = input;
    const { params, data } = context;
    if (!params || !data) {
        return 0;
    }
    // Calculate current accumulated borrowing fees
    const currentAccBorrowingFeeP = (0, exports.getPairPendingAccBorrowingFees)(params, data, currentPairPrice, currentTimestamp ?? context.currentTimestamp);
    // Calculate borrowing fees for this trade
    // Formula: (positionSizeCollateral * (currentAccFee - initialAccFee)) / openPrice / 100
    const feeDeltaP = currentAccBorrowingFeeP - initialAccBorrowingFeeP;
    return ((positionSizeCollateral * feeDeltaP) /
        openPrice /
        exports.BORROWING_V2_PRECISION.PERCENTAGE);
};
exports.getTradeBorrowingFeesCollateral = getTradeBorrowingFeesCollateral;
/**
 * @dev Utility function to get pending accumulated borrowing fees for a pair using context
 * @param input Pair borrowing fee calculation input
 * @param context Context containing borrowing parameters and data
 * @returns Updated accumulated borrowing fee (1e20 precision)
 */
const getPairBorrowingFees = (input, context) => {
    const { pairIndex, currentPairPrice, currentTimestamp } = input;
    const params = context.borrowingParams[pairIndex];
    const data = context.borrowingData[pairIndex];
    if (!params || !data) {
        return 0;
    }
    return (0, exports.getPairPendingAccBorrowingFees)(params, data, currentPairPrice, currentTimestamp ?? context.currentTimestamp);
};
exports.getPairBorrowingFees = getPairBorrowingFees;
/**
 * @dev Utility functions for working with borrowing v2 fees
 */
exports.borrowingFeeV2Utils = {
    getPairPendingAccBorrowingFees: exports.getPairPendingAccBorrowingFees,
    getTradeBorrowingFeesCollateral: exports.getTradeBorrowingFeesCollateral,
    getPairBorrowingFees: exports.getPairBorrowingFees,
};
exports.BorrowingFeeV2 = __importStar(require("./types"));
__exportStar(require("./converter"), exports);
__exportStar(require("./fetcher"), exports);

},{"./types": "trade/fees/borrowingV2/types.js", "./converter": "trade/fees/borrowingV2/converter.js", "./fetcher": "trade/fees/borrowingV2/fetcher.js"}],
"trade/fees/borrowingV2/types.js":[function(require,module,exports){
"use strict";
/**
 * @dev Types for borrowing v2 fees system (simplified rate-based model)
 */
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/fees/borrowingV2/converter.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollateralScopedBorrowingContext = exports.aprToBorrowingRate = exports.borrowingRateToAPR = exports.isValidBorrowingRate = exports.createBorrowingV2Context = exports.convertTradeInitialAccFeesArray = exports.convertTradeInitialAccFees = exports.convertPairBorrowingFeeDataArray = exports.convertPairBorrowingFeeData = exports.convertBorrowingFeeParamsArray = exports.convertBorrowingFeeParams = void 0;
const index_1 = require("./index");
/**
 * @dev Converts contract BorrowingFeeParams to SDK type
 * @param contractParams Contract borrowing fee params from IFundingFees.BorrowingFeeParams
 * @returns SDK BorrowingFeeParams
 */
const convertBorrowingFeeParams = (contractParams) => ({
    borrowingRatePerSecondP: contractParams.borrowingRatePerSecondP /
        index_1.BORROWING_V2_PRECISION.RATE_PER_SECOND,
});
exports.convertBorrowingFeeParams = convertBorrowingFeeParams;
/**
 * @dev Converts array of contract BorrowingFeeParams to SDK types
 * @param contractParamsArray Array of contract borrowing fee params
 * @returns Array of SDK BorrowingFeeParams
 */
const convertBorrowingFeeParamsArray = (contractParamsArray) => contractParamsArray.map(params => (0, exports.convertBorrowingFeeParams)(params));
exports.convertBorrowingFeeParamsArray = convertBorrowingFeeParamsArray;
/**
 * @dev Converts contract PairBorrowingFeeData to SDK type
 * @param contractData Contract pair borrowing fee data from IFundingFees.PairBorrowingFeeData
 * @returns SDK PairBorrowingFeeData
 */
const convertPairBorrowingFeeData = (contractData) => ({
    accBorrowingFeeP: parseFloat(contractData.accBorrowingFeeP.toString()) /
        index_1.BORROWING_V2_PRECISION.ACC_FEE,
    lastBorrowingUpdateTs: contractData.lastBorrowingUpdateTs,
});
exports.convertPairBorrowingFeeData = convertPairBorrowingFeeData;
/**
 * @dev Converts array of contract PairBorrowingFeeData to SDK types
 * @param contractDataArray Array of contract pair borrowing fee data
 * @returns Array of SDK PairBorrowingFeeData
 */
const convertPairBorrowingFeeDataArray = (contractDataArray) => contractDataArray.map(data => (0, exports.convertPairBorrowingFeeData)(data));
exports.convertPairBorrowingFeeDataArray = convertPairBorrowingFeeDataArray;
/**
 * @dev Converts contract TradeFeesData to SDK TradeInitialAccFees
 * @param contractTradeData Contract trade fees data from IFundingFees.TradeFeesData
 * @returns SDK TradeInitialAccFees
 */
const convertTradeInitialAccFees = (contractTradeData) => ({
    initialAccBorrowingFeeP: parseFloat(contractTradeData.initialAccBorrowingFeeP.toString()) /
        index_1.BORROWING_V2_PRECISION.ACC_FEE,
});
exports.convertTradeInitialAccFees = convertTradeInitialAccFees;
/**
 * @dev Converts array of contract TradeFeesData to SDK TradeInitialAccFees
 * @param contractTradeDataArray Array of contract trade fees data
 * @returns Array of SDK TradeInitialAccFees
 */
const convertTradeInitialAccFeesArray = (contractTradeDataArray) => contractTradeDataArray.map(data => (0, exports.convertTradeInitialAccFees)(data));
exports.convertTradeInitialAccFeesArray = convertTradeInitialAccFeesArray;
/**
 * @dev Creates a context object from contract data arrays
 * @param pairIndices Array of pair indices
 * @param borrowingParams Array of borrowing fee params from contract
 * @param borrowingData Array of pair borrowing fee data from contract
 * @param currentTimestamp Optional current timestamp
 * @returns Complete SDK context for borrowing v2 calculations (collateral-scoped)
 */
const createBorrowingV2Context = (pairIndices, borrowingParams, borrowingData, currentTimestamp) => {
    const context = {
        currentTimestamp,
        borrowingParams: {},
        borrowingData: {},
    };
    // Build objects indexed by pairIndex
    for (let i = 0; i < pairIndices.length; i++) {
        const pairIndex = pairIndices[i];
        // Store converted data
        context.borrowingParams[pairIndex] = (0, exports.convertBorrowingFeeParams)(borrowingParams[i]);
        context.borrowingData[pairIndex] = (0, exports.convertPairBorrowingFeeData)(borrowingData[i]);
    }
    return context;
};
exports.createBorrowingV2Context = createBorrowingV2Context;
/**
 * @dev Helper function to validate borrowing rate per second
 * @param borrowingRatePerSecondP Borrowing rate per second (normalized float)
 * @returns True if rate is within valid bounds
 */
const isValidBorrowingRate = (borrowingRatePerSecondP) => {
    return (borrowingRatePerSecondP >= 0 &&
        borrowingRatePerSecondP <= 317097 / index_1.BORROWING_V2_PRECISION.RATE_PER_SECOND); // Max 1,000% APR
};
exports.isValidBorrowingRate = isValidBorrowingRate;
/**
 * @dev Helper function to convert borrowing rate to APR percentage
 * @param borrowingRatePerSecondP Borrowing rate per second (normalized float)
 * @returns APR as percentage (e.g., 10.5 for 10.5% APR)
 */
const borrowingRateToAPR = (borrowingRatePerSecondP) => {
    const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000
    return borrowingRatePerSecondP * SECONDS_PER_YEAR;
};
exports.borrowingRateToAPR = borrowingRateToAPR;
/**
 * @dev Helper function to convert APR percentage to borrowing rate per second
 * @param aprPercentage APR as percentage (e.g., 10.5 for 10.5% APR)
 * @returns Borrowing rate per second (normalized float)
 */
const aprToBorrowingRate = (aprPercentage) => {
    const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000
    return aprPercentage / SECONDS_PER_YEAR;
};
exports.aprToBorrowingRate = aprToBorrowingRate;
/**
 * @dev Creates a collateral-scoped context from frontend data structure
 * @param collateralBorrowingData Data structure from frontend (params and data arrays)
 * @param currentTimestamp Optional current timestamp
 * @returns Collateral-scoped borrowing fee v2 context
 */
const createCollateralScopedBorrowingContext = (collateralBorrowingData, currentTimestamp) => {
    const context = {
        currentTimestamp: currentTimestamp ?? Math.floor(Date.now() / 1000),
        borrowingParams: {},
        borrowingData: {},
    };
    // Map arrays to objects indexed by array position (pairIndex)
    collateralBorrowingData.params.forEach((param, index) => {
        context.borrowingParams[index] = param;
    });
    collateralBorrowingData.data.forEach((data, index) => {
        context.borrowingData[index] = data;
    });
    return context;
};
exports.createCollateralScopedBorrowingContext = createCollateralScopedBorrowingContext;

},{"./index": "trade/fees/borrowingV2/index.js"}],
"trade/fees/borrowingV2/fetcher.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBorrowingV2DataForPairs = exports.createBorrowingV2ContextFromArrays = exports.createBorrowingV2ContextFromContract = exports.fetchAllBorrowingV2Data = exports.fetchPairPendingAccBorrowingFeesV2 = exports.fetchTradeBorrowingFeesCollateralV2 = exports.fetchPairBorrowingFeeDataV2 = exports.fetchBorrowingFeeParamsV2 = void 0;
const converter_1 = require("./converter");
/**
 * @dev Fetches borrowing fee parameters v2 for specific pairs
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices
 * @returns Promise resolving to array of borrowing fee parameters
 */
const fetchBorrowingFeeParamsV2 = async (contract, collateralIndices, pairIndices) => {
    if (collateralIndices.length !== pairIndices.length) {
        throw new Error("Collateral indices and pair indices arrays must have the same length");
    }
    try {
        const contractParams = await contract.getPairBorrowingFeeParams(collateralIndices, pairIndices);
        return (0, converter_1.convertBorrowingFeeParamsArray)(contractParams);
    }
    catch (error) {
        console.error("Error fetching borrowing fee params v2:", error);
        throw error;
    }
};
exports.fetchBorrowingFeeParamsV2 = fetchBorrowingFeeParamsV2;
/**
 * @dev Fetches pair borrowing fee data v2 for specific pairs
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices
 * @returns Promise resolving to array of pair borrowing fee data
 */
const fetchPairBorrowingFeeDataV2 = async (contract, collateralIndices, pairIndices) => {
    if (collateralIndices.length !== pairIndices.length) {
        throw new Error("Collateral indices and pair indices arrays must have the same length");
    }
    try {
        const contractData = await contract.getPairBorrowingFeeData(collateralIndices, pairIndices);
        return (0, converter_1.convertPairBorrowingFeeDataArray)(contractData);
    }
    catch (error) {
        console.error("Error fetching pair borrowing fee data v2:", error);
        throw error;
    }
};
exports.fetchPairBorrowingFeeDataV2 = fetchPairBorrowingFeeDataV2;
/**
 * @dev Fetches borrowing fees in collateral tokens for a specific trade
 * @param contract GNSMultiCollatDiamond contract instance
 * @param trader Address of the trader
 * @param index Trade index
 * @param currentPairPrice Current price of the trading pair (1e6 precision)
 * @returns Promise resolving to borrowing fees in collateral tokens
 */
const fetchTradeBorrowingFeesCollateralV2 = async (contract, trader, index, currentPairPrice) => {
    try {
        const feesCollateral = await contract.getTradeBorrowingFeesCollateral(trader, index, currentPairPrice);
        // Convert BigNumber to normalized float
        // Note: Collateral precision varies by chain, but contract returns proper precision
        return parseFloat(feesCollateral.toString());
    }
    catch (error) {
        console.error("Error fetching trade borrowing fees collateral v2:", error);
        throw error;
    }
};
exports.fetchTradeBorrowingFeesCollateralV2 = fetchTradeBorrowingFeesCollateralV2;
/**
 * @dev Fetches pending accumulated borrowing fees for a specific pair
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndex Index of the collateral
 * @param pairIndex Index of the trading pair
 * @param currentPairPrice Current price of the trading pair (1e6 precision)
 * @returns Promise resolving to pending accumulated borrowing fee
 */
const fetchPairPendingAccBorrowingFeesV2 = async (contract, collateralIndex, pairIndex, currentPairPrice) => {
    try {
        const accBorrowingFeeP = await contract.getPairPendingAccBorrowingFees(collateralIndex, pairIndex, currentPairPrice);
        // Convert BigNumber to normalized float
        return parseFloat(accBorrowingFeeP.toString()) / 1e20;
    }
    catch (error) {
        console.error("Error fetching pair pending acc borrowing fees v2:", error);
        throw error;
    }
};
exports.fetchPairPendingAccBorrowingFeesV2 = fetchPairPendingAccBorrowingFeesV2;
/**
 * @dev Convenience function to fetch all borrowing v2 data for specific pairs
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndex Index of the collateral
 * @param pairIndices Array of pair indices
 * @returns Promise resolving to complete borrowing v2 data set
 */
const fetchAllBorrowingV2Data = async (contract, collateralIndex, pairIndices) => {
    const collateralIndices = new Array(pairIndices.length).fill(collateralIndex);
    try {
        // Fetch both parameters and data in parallel
        const [params, data] = await Promise.all([
            (0, exports.fetchBorrowingFeeParamsV2)(contract, collateralIndices, pairIndices),
            (0, exports.fetchPairBorrowingFeeDataV2)(contract, collateralIndices, pairIndices),
        ]);
        // Create context from fetched data
        const context = (0, exports.createBorrowingV2ContextFromArrays)(collateralIndices, pairIndices, params, data);
        return { params, data, context };
    }
    catch (error) {
        console.error("Error fetching all borrowing v2 data:", error);
        throw error;
    }
};
exports.fetchAllBorrowingV2Data = fetchAllBorrowingV2Data;
/**
 * @dev Creates a complete borrowing v2 context from contract data
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndex Index of the collateral
 * @param pairIndices Array of pair indices
 * @param currentTimestamp Optional current timestamp for calculations
 * @returns Promise resolving to complete borrowing v2 context
 */
const createBorrowingV2ContextFromContract = async (contract, collateralIndex, pairIndices, currentTimestamp) => {
    const { context } = await (0, exports.fetchAllBorrowingV2Data)(contract, collateralIndex, pairIndices);
    return {
        ...context,
        currentTimestamp: currentTimestamp ?? Math.floor(Date.now() / 1000),
    };
};
exports.createBorrowingV2ContextFromContract = createBorrowingV2ContextFromContract;
/**
 * @dev Helper function to create context from already fetched arrays
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices
 * @param params Array of borrowing fee parameters
 * @param data Array of pair borrowing fee data
 * @param currentTimestamp Optional current timestamp
 * @returns Complete borrowing v2 context
 */
const createBorrowingV2ContextFromArrays = (collateralIndices, pairIndices, params, data, currentTimestamp) => {
    const context = {
        currentTimestamp: currentTimestamp ?? Math.floor(Date.now() / 1000),
        borrowingParams: {},
        borrowingData: {},
    };
    // Build objects indexed by pairIndex (collateral-scoped)
    for (let i = 0; i < pairIndices.length; i++) {
        const pairIndex = pairIndices[i];
        // Store data indexed by pairIndex
        context.borrowingParams[pairIndex] = params[i];
        context.borrowingData[pairIndex] = data[i];
    }
    return context;
};
exports.createBorrowingV2ContextFromArrays = createBorrowingV2ContextFromArrays;
/**
 * @dev Fetches borrowing v2 data for multiple collateral/pair combinations
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices (must match collateralIndices length)
 * @returns Promise resolving to complete borrowing v2 context
 */
const fetchBorrowingV2DataForPairs = async (contract, collateralIndices, pairIndices) => {
    if (collateralIndices.length !== pairIndices.length) {
        throw new Error("Collateral indices and pair indices arrays must have the same length");
    }
    try {
        // Fetch both parameters and data in parallel
        const [params, data] = await Promise.all([
            (0, exports.fetchBorrowingFeeParamsV2)(contract, collateralIndices, pairIndices),
            (0, exports.fetchPairBorrowingFeeDataV2)(contract, collateralIndices, pairIndices),
        ]);
        // Create and return context
        return (0, exports.createBorrowingV2ContextFromArrays)(collateralIndices, pairIndices, params, data);
    }
    catch (error) {
        console.error("Error fetching borrowing v2 data for pairs:", error);
        throw error;
    }
};
exports.fetchBorrowingV2DataForPairs = fetchBorrowingV2DataForPairs;

},{"./converter": "trade/fees/borrowingV2/converter.js"}],
"trade/fees/fundingFees/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Funding fees calculations for v10+ trades
 * @dev Based on skew-based funding rate model with velocity and APR multipliers
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundingFees = exports.getTradeFundingFeesCollateralSimple = exports.getTradeFundingFees = exports.getTradeFundingFeesCollateral = exports.getPairPendingAccFundingFees = exports.getLongShortAprMultiplier = exports.getAvgFundingRatePerSecondP = exports.getSecondsToReachZeroRate = exports.getCurrentFundingVelocityPerYear = void 0;
const types_1 = require("../../../contracts/types");
// Constants from contract
const FUNDING_APR_MULTIPLIER_CAP = 100; // Smaller side can earn up to 100x more APR
const ONE_YEAR = 365 * 24 * 60 * 60; // 1 year in seconds
/**
 * @dev Calculates current funding velocity per year based on skew
 * @param netExposureToken Net exposure (long - short) in tokens
 * @param netExposureUsd Net exposure in USD
 * @param skewCoefficientPerYear Skew coefficient per year from params
 * @param absoluteVelocityPerYearCap Cap on velocity per year
 * @param thetaThresholdUsd Minimum exposure USD to start charging funding fees
 * @returns Current yearly funding velocity
 */
const getCurrentFundingVelocityPerYear = (netExposureToken, netExposureUsd, skewCoefficientPerYear, absoluteVelocityPerYearCap, thetaThresholdUsd) => {
    // If no exposure or skew coefficient 0 or velocity cap 0, velocity is 0
    if (netExposureToken === 0 ||
        skewCoefficientPerYear === 0 ||
        absoluteVelocityPerYearCap === 0) {
        return 0;
    }
    // Check theta threshold
    const absNetExposureUsd = Math.abs(netExposureUsd);
    if (absNetExposureUsd < thetaThresholdUsd) {
        return 0;
    }
    // Calculate absolute velocity
    const absoluteVelocityPerYear = Math.abs(netExposureToken) * skewCoefficientPerYear;
    // Apply cap
    const cappedAbsoluteVelocity = Math.min(absoluteVelocityPerYear, absoluteVelocityPerYearCap);
    // Return with proper sign
    return netExposureToken < 0
        ? -cappedAbsoluteVelocity
        : cappedAbsoluteVelocity;
};
exports.getCurrentFundingVelocityPerYear = getCurrentFundingVelocityPerYear;
/**
 * @dev Calculates seconds until funding rate reaches zero
 * @param lastFundingRatePerSecondP Last funding rate per second
 * @param currentVelocityPerYear Current velocity per year
 * @returns Seconds until rate reaches zero
 */
const getSecondsToReachZeroRate = (lastFundingRatePerSecondP, currentVelocityPerYear) => {
    if (currentVelocityPerYear === 0) {
        throw new Error("Velocity cannot be zero when calculating time to reach zero rate");
    }
    const secondsToReachZeroRate = (-lastFundingRatePerSecondP * ONE_YEAR) / currentVelocityPerYear;
    if (secondsToReachZeroRate < 0) {
        throw new Error("Invalid calculation: seconds to reach zero rate cannot be negative");
    }
    return secondsToReachZeroRate;
};
exports.getSecondsToReachZeroRate = getSecondsToReachZeroRate;
/**
 * @dev Calculates average and current funding rate per second
 * @param lastFundingRatePerSecondP Last funding rate per second
 * @param absoluteRatePerSecondCap Absolute cap on funding rate per second
 * @param currentVelocityPerYear Current velocity per year
 * @param secondsSinceLastUpdate Seconds elapsed since last update
 * @returns Average and current funding rate per second
 */
const getAvgFundingRatePerSecondP = (lastFundingRatePerSecondP, absoluteRatePerSecondCap, currentVelocityPerYear, secondsSinceLastUpdate) => {
    // If cap is 0, there are no funding fees
    if (absoluteRatePerSecondCap === 0) {
        return { avgFundingRatePerSecondP: 0, currentFundingRatePerSecondP: 0 };
    }
    // If velocity is 0 or no time elapsed, funding rate is still the same
    if (currentVelocityPerYear === 0 || secondsSinceLastUpdate === 0) {
        return {
            avgFundingRatePerSecondP: lastFundingRatePerSecondP,
            currentFundingRatePerSecondP: lastFundingRatePerSecondP,
        };
    }
    const ratePerSecondCap = absoluteRatePerSecondCap * (currentVelocityPerYear < 0 ? -1 : 1);
    // If rate is already at cap, just return it
    if (ratePerSecondCap === lastFundingRatePerSecondP) {
        return {
            avgFundingRatePerSecondP: ratePerSecondCap,
            currentFundingRatePerSecondP: ratePerSecondCap,
        };
    }
    const secondsToReachCap = ((ratePerSecondCap - lastFundingRatePerSecondP) * ONE_YEAR) /
        currentVelocityPerYear;
    if (secondsSinceLastUpdate > secondsToReachCap) {
        // Rate reached cap during this period
        const currentFundingRatePerSecondP = ratePerSecondCap;
        // Weighted average: time to cap at average rate + time at cap
        const avgFundingRatePerSecondP_1 = (lastFundingRatePerSecondP + ratePerSecondCap) / 2;
        const avgFundingRatePerSecondP = (avgFundingRatePerSecondP_1 * secondsToReachCap +
            ratePerSecondCap * (secondsSinceLastUpdate - secondsToReachCap)) /
            secondsSinceLastUpdate;
        return { avgFundingRatePerSecondP, currentFundingRatePerSecondP };
    }
    else {
        // Rate didn't reach cap
        const currentFundingRatePerSecondP = lastFundingRatePerSecondP +
            (secondsSinceLastUpdate * currentVelocityPerYear) / ONE_YEAR;
        const avgFundingRatePerSecondP = (lastFundingRatePerSecondP + currentFundingRatePerSecondP) / 2;
        return { avgFundingRatePerSecondP, currentFundingRatePerSecondP };
    }
};
exports.getAvgFundingRatePerSecondP = getAvgFundingRatePerSecondP;
/**
 * @dev Calculates APR multipliers for long and short sides based on OI ratio
 * @param avgFundingRatePerSecondP Average funding rate per second
 * @param pairOiLongToken Long OI in tokens
 * @param pairOiShortToken Short OI in tokens
 * @param aprMultiplierEnabled Whether APR multiplier is enabled
 * @returns Long and short APR multipliers
 */
const getLongShortAprMultiplier = (avgFundingRatePerSecondP, pairOiLongToken, pairOiShortToken, aprMultiplierEnabled) => {
    // If funding rate is 0, multipliers don't matter
    if (avgFundingRatePerSecondP === 0) {
        return { longAprMultiplier: 1, shortAprMultiplier: 1 };
    }
    const longsEarned = avgFundingRatePerSecondP < 0;
    let longAprMultiplier = 1;
    let shortAprMultiplier = 1;
    if (aprMultiplierEnabled) {
        if (longsEarned && pairOiLongToken > 0) {
            longAprMultiplier = pairOiShortToken / pairOiLongToken;
        }
        else if (!longsEarned && pairOiShortToken > 0) {
            shortAprMultiplier = pairOiLongToken / pairOiShortToken;
        }
        // Apply cap
        longAprMultiplier = Math.min(longAprMultiplier, FUNDING_APR_MULTIPLIER_CAP);
        shortAprMultiplier = Math.min(shortAprMultiplier, FUNDING_APR_MULTIPLIER_CAP);
    }
    return { longAprMultiplier, shortAprMultiplier };
};
exports.getLongShortAprMultiplier = getLongShortAprMultiplier;
/**
 * @dev Calculates pending accumulated funding fees for a pair
 * @param params Funding fee parameters
 * @param data Current funding fee data
 * @param currentPairPrice Current pair price
 * @param pairOiToken Pair OI after v10
 * @param netExposureToken Net exposure in tokens
 * @param netExposureUsd Net exposure in USD
 * @param currentTimestamp Current timestamp
 * @returns Pending accumulated funding fees and current rate
 */
const getPairPendingAccFundingFees = (params, data, currentPairPrice, pairOiToken, netExposureToken, netExposureUsd, currentTimestamp) => {
    let accFundingFeeLongP = data.accFundingFeeLongP;
    let accFundingFeeShortP = data.accFundingFeeShortP;
    // If funding fees are disabled, return current values
    if (!params.fundingFeesEnabled) {
        return {
            accFundingFeeLongP,
            accFundingFeeShortP,
            currentFundingRatePerSecondP: data.lastFundingRatePerSecondP,
        };
    }
    const secondsSinceLastUpdate = currentTimestamp - data.lastFundingUpdateTs;
    // Calculate current velocity
    const currentVelocityPerYear = (0, exports.getCurrentFundingVelocityPerYear)(netExposureToken, netExposureUsd, params.skewCoefficientPerYear, params.absoluteVelocityPerYearCap, params.thetaThresholdUsd);
    // Get average and current funding rates
    const { avgFundingRatePerSecondP, currentFundingRatePerSecondP } = (0, exports.getAvgFundingRatePerSecondP)(data.lastFundingRatePerSecondP, params.absoluteRatePerSecondCap, currentVelocityPerYear, secondsSinceLastUpdate);
    // Check if we need to handle rate sign change
    const rateChangedSign = params.aprMultiplierEnabled &&
        ((currentFundingRatePerSecondP > 0 && data.lastFundingRatePerSecondP < 0) ||
            (currentFundingRatePerSecondP < 0 && data.lastFundingRatePerSecondP > 0));
    if (rateChangedSign) {
        // Split calculation into two periods: before and after sign change
        // 1. From last update to rate = 0
        const secondsToReachZeroRate = (0, exports.getSecondsToReachZeroRate)(data.lastFundingRatePerSecondP, currentVelocityPerYear);
        const avgFundingRatePerSecondP_1 = data.lastFundingRatePerSecondP / 2;
        const fundingFeesDeltaP_1 = avgFundingRatePerSecondP_1 * secondsToReachZeroRate * currentPairPrice;
        const { longAprMultiplier: longMultiplier1, shortAprMultiplier: shortMultiplier1, } = (0, exports.getLongShortAprMultiplier)(avgFundingRatePerSecondP_1, pairOiToken.oiLongToken, pairOiToken.oiShortToken, true);
        accFundingFeeLongP += fundingFeesDeltaP_1 * longMultiplier1;
        accFundingFeeShortP -= fundingFeesDeltaP_1 * shortMultiplier1;
        // 2. From rate = 0 to current rate
        const avgFundingRatePerSecondP_2 = currentFundingRatePerSecondP / 2;
        const fundingFeesDeltaP_2 = avgFundingRatePerSecondP_2 *
            (secondsSinceLastUpdate - secondsToReachZeroRate) *
            currentPairPrice;
        const { longAprMultiplier: longMultiplier2, shortAprMultiplier: shortMultiplier2, } = (0, exports.getLongShortAprMultiplier)(avgFundingRatePerSecondP_2, pairOiToken.oiLongToken, pairOiToken.oiShortToken, true);
        accFundingFeeLongP += fundingFeesDeltaP_2 * longMultiplier2;
        accFundingFeeShortP -= fundingFeesDeltaP_2 * shortMultiplier2;
    }
    else {
        // Single period calculation
        const fundingFeesDeltaP = avgFundingRatePerSecondP * secondsSinceLastUpdate * currentPairPrice;
        const { longAprMultiplier, shortAprMultiplier } = (0, exports.getLongShortAprMultiplier)(avgFundingRatePerSecondP, pairOiToken.oiLongToken, pairOiToken.oiShortToken, params.aprMultiplierEnabled);
        accFundingFeeLongP += fundingFeesDeltaP * longAprMultiplier;
        accFundingFeeShortP -= fundingFeesDeltaP * shortAprMultiplier;
    }
    return {
        accFundingFeeLongP,
        accFundingFeeShortP,
        currentFundingRatePerSecondP,
    };
};
exports.getPairPendingAccFundingFees = getPairPendingAccFundingFees;
/**
 * @dev Calculates funding fees for a specific trade
 * @param trade Trade parameters (collateral amount, leverage, open price, long/short)
 * @param tradeInfo Trade info (contracts version)
 * @param tradeFeesData Trade fees data containing initial acc funding fee
 * @param currentPairPrice Current pair price
 * @param context Pair-specific funding fee context
 * @returns Funding fee in collateral tokens
 */
const getTradeFundingFeesCollateral = (trade, tradeInfo, tradeFeesData, currentPairPrice, context) => {
    if (tradeInfo.contractsVersion < types_1.ContractsVersion.V10) {
        return 0;
    }
    context.netExposureUsd = (context.netExposureToken || 0) * currentPairPrice;
    const positionSizeCollateral = trade.collateralAmount * trade.leverage;
    if (!context.params.fundingFeesEnabled) {
        return 0;
    }
    // Calculate pending accumulated fees
    const { accFundingFeeLongP, accFundingFeeShortP } = (0, exports.getPairPendingAccFundingFees)(context.params, context.data, currentPairPrice, context.pairOi || { oiLongToken: 0, oiShortToken: 0 }, context.netExposureToken || 0, context.netExposureUsd || 0, context.currentTimestamp);
    const currentAccFundingFeeP = trade.long
        ? accFundingFeeLongP
        : accFundingFeeShortP;
    const fundingFeeDelta = currentAccFundingFeeP - tradeFeesData.initialAccFundingFeeP;
    return (positionSizeCollateral * fundingFeeDelta) / trade.openPrice / 100;
};
exports.getTradeFundingFeesCollateral = getTradeFundingFeesCollateral;
/**
 * @dev Main function to calculate funding fees for a trade within context
 * @param input Trade funding fee input parameters
 * @param context Funding fee context with params and data
 * @returns Complete funding fee calculation result
 */
const getTradeFundingFees = (input, context) => {
    // Get params and data from context
    const params = context.fundingParams[input.collateralIndex]?.[input.pairIndex];
    const data = context.fundingData[input.collateralIndex]?.[input.pairIndex];
    if (!params || !data) {
        throw new Error(`Missing funding fee data for collateral ${input.collateralIndex} pair ${input.pairIndex}`);
    }
    // Calculate pending accumulated fees
    const { accFundingFeeLongP, accFundingFeeShortP } = (0, exports.getPairPendingAccFundingFees)(params, data, input.currentPairPrice, input.pairOiToken, input.netExposureToken, input.netExposureUsd, context.currentTimestamp);
    const currentAccFundingFeeP = input.trade.long
        ? accFundingFeeLongP
        : accFundingFeeShortP;
    // Calculate funding fee in collateral
    const fundingFeeCollateral = (0, exports.getTradeFundingFeesCollateralSimple)(input.trade, input.tradeInfo, input.initialAccFundingFeeP, currentAccFundingFeeP);
    // Calculate funding fee as percentage
    const fundingFeeP = input.trade.collateralAmount > 0
        ? (fundingFeeCollateral / input.trade.collateralAmount) * 100
        : 0;
    return {
        fundingFeeCollateral,
        fundingFeeP,
        currentAccFundingFeeP,
        initialAccFundingFeeP: input.initialAccFundingFeeP,
    };
};
exports.getTradeFundingFees = getTradeFundingFees;
/**
 * @dev Simple version of getTradeFundingFeesCollateral for backward compatibility
 * @param trade Trade parameters
 * @param tradeInfo Trade info with contracts version
 * @param initialAccFundingFeeP Initial accumulated funding fee
 * @param currentAccFundingFeeP Current accumulated funding fee
 * @returns Funding fee in collateral tokens
 */
const getTradeFundingFeesCollateralSimple = (trade, tradeInfo, initialAccFundingFeeP, currentAccFundingFeeP) => {
    // Funding fees are only charged on post-v10 trades
    if (tradeInfo.contractsVersion < types_1.ContractsVersion.V10) {
        return 0;
    }
    const positionSizeCollateral = trade.collateralAmount * trade.leverage;
    const fundingFeeDelta = currentAccFundingFeeP - initialAccFundingFeeP;
    return (positionSizeCollateral * fundingFeeDelta) / trade.openPrice / 100;
};
exports.getTradeFundingFeesCollateralSimple = getTradeFundingFeesCollateralSimple;
// Export namespace for types
exports.FundingFees = __importStar(require("./types"));
__exportStar(require("./fetcher"), exports);
__exportStar(require("./pairContext"), exports);
__exportStar(require("./builder"), exports);

},{"../../../contracts/types": "contracts/types/index.js", "./types": "trade/fees/fundingFees/types.js", "./fetcher": "trade/fees/fundingFees/fetcher.js", "./pairContext": "trade/fees/fundingFees/pairContext.js", "./builder": "trade/fees/fundingFees/builder.js"}],
"contracts/types/index.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainId = exports.ContractsVersion = exports.CollateralTypes = void 0;
var CollateralTypes;
(function (CollateralTypes) {
    CollateralTypes["DAI"] = "DAI";
    CollateralTypes["ETH"] = "ETH";
    CollateralTypes["ARB"] = "ARB";
    CollateralTypes["USDC"] = "USDC";
    CollateralTypes["APE"] = "APE";
    CollateralTypes["GNS"] = "GNS";
    CollateralTypes["BTCUSD"] = "BTCUSD";
    CollateralTypes["USDM"] = "USDM";
})(CollateralTypes = exports.CollateralTypes || (exports.CollateralTypes = {}));
var ContractsVersion;
(function (ContractsVersion) {
    ContractsVersion[ContractsVersion["BEFORE_V9_2"] = 0] = "BEFORE_V9_2";
    ContractsVersion[ContractsVersion["V9_2"] = 1] = "V9_2";
    ContractsVersion[ContractsVersion["V10"] = 2] = "V10";
})(ContractsVersion = exports.ContractsVersion || (exports.ContractsVersion = {}));
var ChainId;
(function (ChainId) {
    ChainId[ChainId["POLYGON"] = 137] = "POLYGON";
    ChainId[ChainId["ARBITRUM"] = 42161] = "ARBITRUM";
    ChainId[ChainId["ARBITRUM_SEPOLIA"] = 421614] = "ARBITRUM_SEPOLIA";
    ChainId[ChainId["BASE"] = 8453] = "BASE";
    ChainId[ChainId["APECHAIN"] = 33139] = "APECHAIN";
    ChainId[ChainId["MEGAETH"] = 4326] = "MEGAETH";
    ChainId[ChainId["MEGAETH_TESTNET"] = 6343] = "MEGAETH_TESTNET";
})(ChainId = exports.ChainId || (exports.ChainId = {}));

},{}],
"trade/fees/fundingFees/types.js":[function(require,module,exports){
"use strict";
/**
 * @dev Funding fees types for v10+ trades
 */
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/fees/fundingFees/fetcher.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collateralToContractFormat = exports.priceToContractFormat = exports.fetchPairPendingAccFundingFeesBatch = exports.fetchTradeFeesDataBatch = exports.fetchTradeFeesData = exports.fetchTradeFundingFeesCollateral = exports.fetchPairPendingAccFundingFees = void 0;
/**
 * @dev Fetches pending accumulated funding fees for a specific pair
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndex Collateral index
 * @param pairIndex Pair index
 * @param currentPairPrice Current pair price (1e10)
 * @returns Promise resolving to accumulated funding fees and current rate
 */
const fetchPairPendingAccFundingFees = async (contract, collateralIndex, pairIndex, currentPairPrice) => {
    try {
        const result = await contract.getPairPendingAccFundingFees(collateralIndex, pairIndex, currentPairPrice);
        return {
            accFundingFeeLongP: Number(result.accFundingFeeLongP) / 1e20,
            accFundingFeeShortP: Number(result.accFundingFeeShortP) / 1e20,
            currentFundingRatePerSecondP: Number(result.currentFundingRatePerSecondP) / 1e18, // FUNDING_RATE_PER_SECOND_P precision
        };
    }
    catch (error) {
        console.error("Error fetching pair pending acc funding fees:", error);
        throw error;
    }
};
exports.fetchPairPendingAccFundingFees = fetchPairPendingAccFundingFees;
/**
 * @dev Fetches funding fees for a specific trade in collateral tokens
 * @param contract GNSMultiCollatDiamond contract instance
 * @param trader Trader address
 * @param index Trade index
 * @param currentPairPrice Current pair price (1e10)
 * @returns Promise resolving to funding fee in collateral tokens
 */
const fetchTradeFundingFeesCollateral = async (contract, trader, index, currentPairPrice) => {
    try {
        const fundingFeeCollateral = await contract.getTradeFundingFeesCollateral(trader, index, currentPairPrice);
        // Convert from BigNumber to number (collateral precision already applied)
        return Number(fundingFeeCollateral);
    }
    catch (error) {
        console.error("Error fetching trade funding fees:", error);
        throw error;
    }
};
exports.fetchTradeFundingFeesCollateral = fetchTradeFundingFeesCollateral;
/**
 * @dev Fetches trade fees data for a specific trade
 * @param contract GNSMultiCollatDiamond contract instance
 * @param trader Trader address
 * @param index Trade index
 * @returns Promise resolving to trade fees data
 */
const fetchTradeFeesData = async (contract, trader, index) => {
    try {
        const feesData = await contract.getTradeFeesData(trader, index);
        return {
            accPerOiLong: Number(feesData.initialAccFundingFeeP) / 1e20,
            accPerOiShort: Number(feesData.initialAccFundingFeeP) / 1e20,
            openBlock: 0, // Not available in this struct
        };
    }
    catch (error) {
        console.error("Error fetching trade fees data:", error);
        throw error;
    }
};
exports.fetchTradeFeesData = fetchTradeFeesData;
/**
 * @dev Fetches trade fees data for multiple trades
 * @param contract GNSMultiCollatDiamond contract instance
 * @param traders Array of trader addresses
 * @param indices Array of trade indices
 * @returns Promise resolving to array of trade fees data
 */
const fetchTradeFeesDataBatch = async (contract, traders, indices) => {
    if (traders.length !== indices.length) {
        throw new Error("Traders and indices arrays must have the same length");
    }
    try {
        const feesDatas = await contract.getTradeFeesDataArray(traders, indices);
        return feesDatas.map(feesData => ({
            accPerOiLong: Number(feesData.initialAccFundingFeeP) / 1e20,
            accPerOiShort: Number(feesData.initialAccFundingFeeP) / 1e20,
            openBlock: 0,
        }));
    }
    catch (error) {
        console.error("Error fetching trade fees data batch:", error);
        throw error;
    }
};
exports.fetchTradeFeesDataBatch = fetchTradeFeesDataBatch;
/**
 * @dev Fetches pending accumulated funding fees for multiple pairs
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices
 * @param currentPairPrices Array of current pair prices (1e10)
 * @returns Promise resolving to array of accumulated funding fees
 */
const fetchPairPendingAccFundingFeesBatch = async (contract, collateralIndices, pairIndices, currentPairPrices) => {
    if (collateralIndices.length !== pairIndices.length ||
        pairIndices.length !== currentPairPrices.length) {
        throw new Error("All input arrays must have the same length");
    }
    try {
        // Fetch all in parallel
        const promises = collateralIndices.map((collateralIndex, i) => contract.getPairPendingAccFundingFees(collateralIndex, pairIndices[i], currentPairPrices[i]));
        const results = await Promise.all(promises);
        return results.map(result => ({
            accFundingFeeLongP: Number(result.accFundingFeeLongP) / 1e20,
            accFundingFeeShortP: Number(result.accFundingFeeShortP) / 1e20,
            currentFundingRatePerSecondP: Number(result.currentFundingRatePerSecondP) / 1e18,
        }));
    }
    catch (error) {
        console.error("Error fetching pair pending acc funding fees batch:", error);
        throw error;
    }
};
exports.fetchPairPendingAccFundingFeesBatch = fetchPairPendingAccFundingFeesBatch;
/**
 * @dev Helper to convert price from number to contract format
 * @param price Price as number
 * @returns Price in contract format (1e10)
 */
const priceToContractFormat = (price) => {
    return BigInt(Math.round(price * 1e10));
};
exports.priceToContractFormat = priceToContractFormat;
/**
 * @dev Helper to convert collateral amount to contract format
 * @param amount Amount as number
 * @param decimals Collateral decimals (6 for USDC, 18 for others)
 * @returns Amount in contract format
 */
const collateralToContractFormat = (amount, decimals) => {
    return BigInt(Math.round(amount * 10 ** decimals));
};
exports.collateralToContractFormat = collateralToContractFormat;

},{}],
"trade/fees/fundingFees/pairContext.js":[function(require,module,exports){
"use strict";
/**
 * @dev Pair-specific funding fee types and utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPairPendingAccFundingFees = void 0;
const index_1 = require("./index");
/**
 * @dev Calculate pending accumulated funding fees for a pair using pair-specific context
 * @param currentPairPrice Current price of the pair
 * @param context Pair-specific funding context
 * @returns Pending accumulated funding fees
 */
const getPairPendingAccFundingFees = (currentPairPrice, context) => {
    return (0, index_1.getPairPendingAccFundingFees)(context.params, context.data, currentPairPrice, context.pairOi || { oiLongToken: 0, oiShortToken: 0 }, context.netExposureToken || 0, context.netExposureUsd || 0, context.currentTimestamp);
};
exports.getPairPendingAccFundingFees = getPairPendingAccFundingFees;

},{"./index": "trade/fees/fundingFees/index.js"}],
"trade/fees/fundingFees/builder.js":[function(require,module,exports){
"use strict";
/**
 * @dev Builder functions for funding fees context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFundingContext = void 0;
const index_1 = require("../../../markets/oi/index");
/**
 * @dev Builds funding fees sub-context for a specific pair
 */
const buildFundingContext = (globalTradingVariables, collateralIndex, pairIndex, currentTimestamp) => {
    const collateral = globalTradingVariables.collaterals[collateralIndex - 1];
    if (!collateral?.pairFundingFees) {
        return undefined;
    }
    const params = collateral.pairFundingFees.params?.[pairIndex];
    const data = collateral.pairFundingFees.data?.[pairIndex];
    const pairOi = collateral.pairOis?.[pairIndex];
    const netExposureToken = (0, index_1.getPairV10OiTokenSkewCollateral)(pairIndex, {
        pairOis: collateral.pairOis,
    });
    if (!params || !data) {
        return undefined;
    }
    return {
        params,
        data,
        pairOi: pairOi
            ? {
                oiLongToken: pairOi.token?.long || 0,
                oiShortToken: pairOi.token?.short || 0,
            }
            : undefined,
        currentTimestamp,
        netExposureToken,
    };
};
exports.buildFundingContext = buildFundingContext;

},{"../../../markets/oi/index": "markets/oi/index.js"}],
"markets/oi/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Main export file for OI module
 * @dev Provides unified Open Interest management functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeOiValues = exports.convertPairOiArray = exports.convertPairOi = exports.convertTokenOi = exports.convertCollateralOi = exports.convertBeforeV10Collateral = exports.getPairV10OiDynamicSkewCollateral = exports.getPairV10OiTokenSkewCollateral = exports.getPairTotalOiDynamicCollateral = exports.getPairTotalOisDynamicCollateral = exports.getPairTotalOisCollateral = void 0;
const getPairTotalOisCollateral = (pairIndex, context) => {
    return {
        long: context.pairOis[pairIndex].beforeV10Collateral.long +
            context.pairOis[pairIndex].collateral.long,
        short: context.pairOis[pairIndex].beforeV10Collateral.short +
            context.pairOis[pairIndex].collateral.short,
    };
};
exports.getPairTotalOisCollateral = getPairTotalOisCollateral;
/**
 * @dev Returns pair total dynamic open interest (before v10 + after v10) in collateral tokens
 * @param pairIndex index of pair
 * @param context contains UnifiedPairOi array and current pair price
 * @returns dynamic OI for long and short sides in collateral precision
 */
const getPairTotalOisDynamicCollateral = (pairIndex, context) => {
    const pairOi = context.pairOis[pairIndex];
    // We have to use the initial collateral OIs for pre-v10 trades because we don't have OIs in token amount
    const oiLongCollateralDynamicAfterV10 = pairOi.beforeV10Collateral.long +
        pairOi.token.long * context.currentPairPrice;
    const oiShortCollateralDynamicAfterV10 = pairOi.beforeV10Collateral.short +
        pairOi.token.short * context.currentPairPrice;
    return {
        long: oiLongCollateralDynamicAfterV10,
        short: oiShortCollateralDynamicAfterV10,
    };
};
exports.getPairTotalOisDynamicCollateral = getPairTotalOisDynamicCollateral;
/**
 * @dev Returns pair total dynamic open interest (before v10 + after v10) in collateral tokens on one side only
 * @param pairIndex index of pair
 * @param long true if long, false if short
 * @param context contains UnifiedPairOi array and current pair price
 * @returns dynamic OI for the specified side in collateral precision
 */
const getPairTotalOiDynamicCollateral = (pairIndex, long, context) => {
    const dynamicOis = (0, exports.getPairTotalOisDynamicCollateral)(pairIndex, context);
    return long ? dynamicOis.long : dynamicOis.short;
};
exports.getPairTotalOiDynamicCollateral = getPairTotalOiDynamicCollateral;
/**
 * @dev Returns pair open interest skew (v10 only) in tokens
 * @param pairIndex index of pair
 * @param context contains UnifiedPairOi array
 * @returns skew in token amount (positive = more longs, negative = more shorts)
 */
const getPairV10OiTokenSkewCollateral = (pairIndex, context) => {
    const pairOi = context.pairOis[pairIndex];
    return pairOi.token.long - pairOi.token.short;
};
exports.getPairV10OiTokenSkewCollateral = getPairV10OiTokenSkewCollateral;
/**
 * @dev Returns pair dynamic skew (v10 only) in collateral tokens
 * @param pairIndex index of pair
 * @param context contains UnifiedPairOi array and current pair price
 * @returns dynamic skew in collateral precision
 */
const getPairV10OiDynamicSkewCollateral = (pairIndex, context) => {
    return ((0, exports.getPairV10OiTokenSkewCollateral)(pairIndex, context) *
        context.currentPairPrice);
};
exports.getPairV10OiDynamicSkewCollateral = getPairV10OiDynamicSkewCollateral;
// Converters
var converter_1 = require("./converter");
Object.defineProperty(exports, "convertBeforeV10Collateral", { enumerable: true, get: function () { return converter_1.convertBeforeV10Collateral; } });
Object.defineProperty(exports, "convertCollateralOi", { enumerable: true, get: function () { return converter_1.convertCollateralOi; } });
Object.defineProperty(exports, "convertTokenOi", { enumerable: true, get: function () { return converter_1.convertTokenOi; } });
Object.defineProperty(exports, "convertPairOi", { enumerable: true, get: function () { return converter_1.convertPairOi; } });
Object.defineProperty(exports, "convertPairOiArray", { enumerable: true, get: function () { return converter_1.convertPairOiArray; } });
Object.defineProperty(exports, "computeOiValues", { enumerable: true, get: function () { return converter_1.computeOiValues; } });

},{"./converter": "markets/oi/converter.js"}],
"markets/oi/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for OI data between contract and SDK formats
 * @dev Handles the three OI storage systems and precision conversions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeOiValues = exports.convertPairOiArray = exports.convertPairOi = exports.convertTokenOi = exports.convertCollateralOi = exports.convertBeforeV10Collateral = void 0;
/**
 * @dev Converts pre-v10 OI from contract format
 * @param contractOi Contract OpenInterest struct from BorrowingFeesStorage
 * @returns Normalized OI with long/short values
 */
const convertBeforeV10Collateral = (contractOi) => {
    return {
        long: Number(contractOi.long) / 1e10,
        short: Number(contractOi.short) / 1e10,
    };
};
exports.convertBeforeV10Collateral = convertBeforeV10Collateral;
/**
 * @dev Converts post-v10 collateral OI from contract format
 * @param contractOi Contract PairOiCollateral struct
 * @param precision Collateral precision for conversion
 * @returns Normalized OI with long/short values
 */
const convertCollateralOi = (contractOi, precision) => {
    return {
        long: Number(contractOi.oiLongCollateral) / precision,
        short: Number(contractOi.oiShortCollateral) / precision,
    };
};
exports.convertCollateralOi = convertCollateralOi;
/**
 * @dev Converts post-v10 token OI from contract format
 * @param contractOi Contract PairOiToken struct
 * @returns Normalized OI with long/short values (1e18 precision)
 */
const convertTokenOi = (contractOi) => {
    return {
        long: Number(contractOi.oiLongToken) / 1e18,
        short: Number(contractOi.oiShortToken) / 1e18,
    };
};
exports.convertTokenOi = convertTokenOi;
/**
 * @dev Converts all OI data for a pair into unified structure
 * @param beforeV10 Pre-v10 OI from BorrowingFeesStorage
 * @param afterV10Collateral Post-v10 collateral OI from PriceImpactStorage
 * @param afterV10Token Post-v10 token OI from PriceImpactStorage
 * @param maxOi Maximum OI allowed (from BorrowingFeesStorage)
 * @param collateralPrecision Precision for collateral conversions
 * @returns Unified PairOi structure
 */
const convertPairOi = (beforeV10, afterV10Collateral, afterV10Token, collateralPrecision) => {
    return {
        maxCollateral: Number(beforeV10.max) / 1e10,
        beforeV10Collateral: (0, exports.convertBeforeV10Collateral)(beforeV10),
        collateral: (0, exports.convertCollateralOi)(afterV10Collateral, collateralPrecision),
        token: (0, exports.convertTokenOi)(afterV10Token),
    };
};
exports.convertPairOi = convertPairOi;
/**
 * @dev Batch converter for multiple pairs
 * @param pairs Array of OI data for multiple pairs
 * @param collateralPrecision Precision for collateral conversions
 * @returns Array of unified PairOi structures
 */
const convertPairOiArray = (pairs, collateralPrecision) => {
    return pairs.map(p => (0, exports.convertPairOi)(p.beforeV10, p.collateral, p.token, collateralPrecision));
};
exports.convertPairOiArray = convertPairOiArray;
/**
 * @dev Computes derived OI values from unified structure
 * @param pairOi Unified pair OI data
 * @param tokenPriceCollateral Current token price in collateral units
 * @returns Computed values including total OI and skew
 */
const computeOiValues = (pairOi, tokenPriceCollateral) => {
    // Static total (used for admin operations)
    const totalStaticLong = pairOi.beforeV10Collateral.long + pairOi.collateral.long;
    const totalStaticShort = pairOi.beforeV10Collateral.short + pairOi.collateral.short;
    // Dynamic total (used for real-time calculations)
    const tokenLongCollateral = pairOi.token.long * tokenPriceCollateral;
    const tokenShortCollateral = pairOi.token.short * tokenPriceCollateral;
    const totalDynamicLong = pairOi.beforeV10Collateral.long + tokenLongCollateral;
    const totalDynamicShort = pairOi.beforeV10Collateral.short + tokenShortCollateral;
    // Skew (v10+ only, in tokens)
    const skewToken = pairOi.token.long - pairOi.token.short;
    return {
        totalStaticCollateral: {
            long: totalStaticLong,
            short: totalStaticShort,
        },
        totalDynamicCollateral: {
            long: totalDynamicLong,
            short: totalDynamicShort,
        },
        // v10-only values for funding fee markets
        v10StaticCollateral: {
            long: pairOi.collateral.long,
            short: pairOi.collateral.short,
        },
        v10DynamicCollateral: {
            long: tokenLongCollateral,
            short: tokenShortCollateral,
        },
        skewToken,
    };
};
exports.computeOiValues = computeOiValues;

},{}],
"trade/fees/trading/types.js":[function(require,module,exports){
"use strict";
/**
 * @dev Types for trading fee calculations (open/close position fees)
 */
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/fees/trading/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for trading fee data between contract and SDK formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertGlobalTradeFeeParams = exports.convertCounterTradeFeeRateMultipliers = exports.convertCounterTradeSettingsArray = exports.convertCounterTradeSettings = void 0;
/**
 * @dev Converts contract counter trade settings to SDK format
 * @param feeRateMultiplier Fee rate multiplier from contract (1e3 precision)
 * @param maxLeverage Max leverage from contract (1e3 precision)
 * @returns Normalized counter trade settings
 */
const convertCounterTradeSettings = (feeRateMultiplier, maxLeverage) => {
    return {
        feeRateMultiplier: feeRateMultiplier / 1000,
        maxLeverage: maxLeverage / 1000, // 1e3 → float
    };
};
exports.convertCounterTradeSettings = convertCounterTradeSettings;
const convertCounterTradeSettingsArray = (settings) => {
    return settings.map(setting => (0, exports.convertCounterTradeSettings)(Number(setting.feeRateMultiplier), Number(setting.maxLeverage)));
};
exports.convertCounterTradeSettingsArray = convertCounterTradeSettingsArray;
/**
 * @dev Converts array of counter trade fee rate multipliers from contract
 * @param multipliers Array of fee rate multipliers (1e3 precision)
 * @returns Array of normalized multipliers
 */
const convertCounterTradeFeeRateMultipliers = (multipliers) => {
    return multipliers.map(m => m / 1000);
};
exports.convertCounterTradeFeeRateMultipliers = convertCounterTradeFeeRateMultipliers;
/**
 * @dev Converts global trade fee params from contract to SDK format
 * @param contractParams Global trade fee params from contract
 * @returns Normalized global trade fee params
 */
const convertGlobalTradeFeeParams = (contractParams) => {
    return {
        referralFeeP: contractParams.referralFeeP / 1e10 / 100,
        govFeeP: contractParams.govFeeP / 1e10 / 100,
        triggerOrderFeeP: contractParams.triggerOrderFeeP / 1e10 / 100,
        gnsOtcFeeP: contractParams.gnsOtcFeeP / 1e10 / 100,
        gTokenFeeP: contractParams.gTokenFeeP / 1e10 / 100,
    };
};
exports.convertGlobalTradeFeeParams = convertGlobalTradeFeeParams;

},{}],
"trade/fees/trading/builder.js":[function(require,module,exports){
"use strict";
/**
 * @dev Trading fees context builder module
 * @dev Provides builder functions for creating trading fee contexts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTradingFeesContext = void 0;
/**
 * @dev Builds trading fees sub-context
 */
const buildTradingFeesContext = (globalTradingVariables, pairIndex, traderFeeMultiplier) => {
    const { fees, pairs, globalTradeFeeParams, counterTradeSettings } = globalTradingVariables;
    const feeIndex = pairs[pairIndex].feeIndex;
    return {
        fee: fees[feeIndex],
        globalTradeFeeParams: globalTradeFeeParams,
        counterTradeSettings,
        traderFeeMultiplier,
    };
};
exports.buildTradingFeesContext = buildTradingFeesContext;

},{}],
"markets/holdingFees/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Holding fees calculation utilities for v10+ markets
 * @dev Combines funding fees and borrowing v2 fees
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoldingFees = exports.formatHoldingFeeRate = exports.convertRatePerSecondToAPR = exports.getPairHoldingFeeRates = void 0;
const fundingFees_1 = require("../../trade/fees/fundingFees");
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
const PERCENTAGE_PRECISION = 100;
/**
 * @dev Calculates current holding fee rates per hour for display
 * @param input Input parameters for calculation
 * @returns Holding fee rates per hour with breakdown
 */
const getPairHoldingFeeRates = (input) => {
    const { fundingParams, fundingData, pairOiToken, netExposureToken, netExposureUsd, borrowingParams, borrowingData, currentPairPrice, currentTimestamp, } = input;
    // Calculate funding fee rates
    let fundingFeeLongHourlyRate = 0;
    let fundingFeeShortHourlyRate = 0;
    let currentFundingRatePerSecondP = 0;
    if (fundingParams.fundingFeesEnabled) {
        // Get current funding rate
        const pendingFunding = (0, fundingFees_1.getPairPendingAccFundingFees)(fundingParams, fundingData, currentPairPrice, pairOiToken, netExposureToken, netExposureUsd, currentTimestamp);
        currentFundingRatePerSecondP = pendingFunding.currentFundingRatePerSecondP;
        // Get APR multipliers
        const { longAprMultiplier, shortAprMultiplier } = (0, fundingFees_1.getLongShortAprMultiplier)(currentFundingRatePerSecondP, pairOiToken.oiLongToken, pairOiToken.oiShortToken, fundingParams.aprMultiplierEnabled);
        // Calculate hourly rates
        // Funding rate * seconds per hour * APR multiplier / 100
        const baseHourlyRate = (currentFundingRatePerSecondP * SECONDS_PER_HOUR) / PERCENTAGE_PRECISION;
        // Long side pays when rate is positive, earns when negative
        fundingFeeLongHourlyRate = baseHourlyRate * longAprMultiplier;
        // Short side is opposite
        fundingFeeShortHourlyRate = -baseHourlyRate * shortAprMultiplier;
    }
    // Calculate borrowing v2 rates
    let borrowingFeeHourlyRate = 0;
    let currentBorrowingRatePerSecondP = 0;
    if (borrowingParams && borrowingData) {
        currentBorrowingRatePerSecondP = borrowingParams.borrowingRatePerSecondP;
        // Borrowing rate * seconds per hour / 100
        borrowingFeeHourlyRate =
            (currentBorrowingRatePerSecondP * SECONDS_PER_HOUR) /
                PERCENTAGE_PRECISION;
    }
    // Total holding fees (funding can be negative/positive, borrowing always positive cost)
    const longHourlyRate = fundingFeeLongHourlyRate + borrowingFeeHourlyRate;
    const shortHourlyRate = fundingFeeShortHourlyRate + borrowingFeeHourlyRate;
    return {
        longHourlyRate,
        shortHourlyRate,
        fundingFeeLongHourlyRate,
        fundingFeeShortHourlyRate,
        borrowingFeeHourlyRate,
        currentFundingRatePerSecondP,
        currentBorrowingRatePerSecondP,
    };
};
exports.getPairHoldingFeeRates = getPairHoldingFeeRates;
/**
 * @dev Converts a per-second rate to annual percentage rate (APR)
 * @param ratePerSecond Rate per second
 * @returns Annual percentage rate
 */
const convertRatePerSecondToAPR = (ratePerSecond) => {
    return ratePerSecond * SECONDS_PER_YEAR * PERCENTAGE_PRECISION;
};
exports.convertRatePerSecondToAPR = convertRatePerSecondToAPR;
/**
 * @dev Formats a holding fee rate for display
 * @param rate Hourly rate (can be negative)
 * @param decimals Number of decimal places
 * @returns Formatted string with sign
 */
const formatHoldingFeeRate = (rate, decimals = 4) => {
    const sign = rate > 0 ? "+" : "";
    return `${sign}${rate.toFixed(decimals)}%`;
};
exports.formatHoldingFeeRate = formatHoldingFeeRate;
exports.HoldingFees = __importStar(require("./types"));

},{"../../trade/fees/fundingFees": "trade/fees/fundingFees/index.js", "./types": "markets/holdingFees/types.js"}],
"markets/holdingFees/types.js":[function(require,module,exports){
"use strict";
/**
 * @dev Type definitions for holding fees (funding + borrowing v2)
 */
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/fees/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for fee data between contract and SDK formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeUiRealizedPnlData = exports.encodeTradeFeesData = exports.convertUiRealizedPnlDataArray = exports.convertUiRealizedPnlData = exports.convertTradeFeesDataArray = exports.convertTradeFeesData = void 0;
const borrowingV2_1 = require("./borrowingV2");
const converter_1 = require("./fundingFees/converter");
/**
 * @dev Converts contract TradeFeesData to SDK format
 * @param data Trade fees data from contract
 * @param collateralConfig Config for the collateral (contains decimals)
 * @returns Normalized trade fees data
 */
const convertTradeFeesData = (data, collateralConfig) => {
    const decimals = collateralConfig.decimals || 18;
    return {
        realizedTradingFeesCollateral: parseFloat(data.realizedTradingFeesCollateral.toString()) /
            10 ** decimals,
        realizedPnlCollateral: parseFloat(data.realizedPnlCollateral.toString()) / 10 ** decimals,
        manuallyRealizedNegativePnlCollateral: parseFloat(data.manuallyRealizedNegativePnlCollateral.toString()) /
            10 ** decimals,
        alreadyTransferredNegativePnlCollateral: parseFloat(data.alreadyTransferredNegativePnlCollateral.toString()) /
            10 ** decimals,
        virtualAvailableCollateralInDiamond: parseFloat(data.virtualAvailableCollateralInDiamond.toString()) /
            10 ** decimals,
        initialAccFundingFeeP: parseFloat(data.initialAccFundingFeeP.toString()) /
            converter_1.FUNDING_FEES_PRECISION.ACC_FUNDING_FEE_P,
        initialAccBorrowingFeeP: parseFloat(data.initialAccBorrowingFeeP.toString()) /
            borrowingV2_1.BORROWING_V2_PRECISION.ACC_FEE,
    };
};
exports.convertTradeFeesData = convertTradeFeesData;
/**
 * @dev Converts array of TradeFeesData from contract
 * @param dataArray Array of trade fees data
 * @param collateralConfig Config for the collateral
 * @returns Array of normalized trade fees data
 */
const convertTradeFeesDataArray = (dataArray, collateralConfig) => {
    return dataArray.map(data => (0, exports.convertTradeFeesData)(data, collateralConfig));
};
exports.convertTradeFeesDataArray = convertTradeFeesDataArray;
/**
 * @dev Converts contract UiRealizedPnlData to SDK format
 * @param data UI realized PnL data from contract
 * @param collateralConfig Config for the collateral (contains decimals)
 * @returns Normalized UI realized PnL data
 */
const convertUiRealizedPnlData = (data, collateralConfig) => {
    const decimals = collateralConfig.decimals || 18;
    return {
        realizedTradingFeesCollateral: parseFloat(data.realizedTradingFeesCollateral.toString()) /
            10 ** decimals,
        realizedOldBorrowingFeesCollateral: parseFloat(data.realizedOldBorrowingFeesCollateral.toString()) /
            10 ** decimals,
        realizedNewBorrowingFeesCollateral: parseFloat(data.realizedNewBorrowingFeesCollateral.toString()) /
            10 ** decimals,
        realizedFundingFeesCollateral: parseFloat(data.realizedFundingFeesCollateral.toString()) /
            10 ** decimals,
        realizedPnlPartialCloseCollateral: parseFloat(data.realizedPnlPartialCloseCollateral.toString()) /
            10 ** decimals,
        pnlWithdrawnCollateral: parseFloat(data.pnlWithdrawnCollateral.toString()) / 10 ** decimals,
    };
};
exports.convertUiRealizedPnlData = convertUiRealizedPnlData;
/**
 * @dev Converts array of UiRealizedPnlData from contract
 * @param dataArray Array of UI realized PnL data
 * @param collateralConfig Config for the collateral
 * @returns Array of normalized UI realized PnL data
 */
const convertUiRealizedPnlDataArray = (dataArray, collateralConfig) => {
    return dataArray.map(data => (0, exports.convertUiRealizedPnlData)(data, collateralConfig));
};
exports.convertUiRealizedPnlDataArray = convertUiRealizedPnlDataArray;
/**
 * @dev Converts TradeFeesData to contract format (for encoding)
 * @param data SDK trade fees data
 * @param collateralConfig Config for the collateral
 * @returns Contract-formatted trade fees data
 */
const encodeTradeFeesData = (data, collateralConfig) => {
    const decimals = collateralConfig.decimals || 18;
    return {
        realizedTradingFeesCollateral: Math.round(data.realizedTradingFeesCollateral * 10 ** decimals),
        realizedPnlCollateral: Math.round(data.realizedPnlCollateral * 10 ** decimals),
        manuallyRealizedNegativePnlCollateral: Math.round(data.manuallyRealizedNegativePnlCollateral * 10 ** decimals),
        alreadyTransferredNegativePnlCollateral: Math.round(data.alreadyTransferredNegativePnlCollateral * 10 ** decimals),
        virtualAvailableCollateralInDiamond: Math.round(data.virtualAvailableCollateralInDiamond * 10 ** decimals),
        __placeholder: 0,
        initialAccFundingFeeP: Math.round(data.initialAccFundingFeeP * converter_1.FUNDING_FEES_PRECISION.ACC_FUNDING_FEE_P),
        initialAccBorrowingFeeP: Math.round(data.initialAccBorrowingFeeP * borrowingV2_1.BORROWING_V2_PRECISION.ACC_FEE),
    };
};
exports.encodeTradeFeesData = encodeTradeFeesData;
/**
 * @dev Converts UiRealizedPnlData to contract format (for encoding)
 * @param data SDK UI realized PnL data
 * @param collateralConfig Config for the collateral
 * @returns Contract-formatted UI realized PnL data
 */
const encodeUiRealizedPnlData = (data, collateralConfig) => {
    const decimals = collateralConfig.decimals || 18;
    return {
        realizedTradingFeesCollateral: Math.round(data.realizedTradingFeesCollateral * 10 ** decimals),
        realizedOldBorrowingFeesCollateral: Math.round(data.realizedOldBorrowingFeesCollateral * 10 ** decimals),
        realizedNewBorrowingFeesCollateral: Math.round(data.realizedNewBorrowingFeesCollateral * 10 ** decimals),
        realizedFundingFeesCollateral: Math.round(data.realizedFundingFeesCollateral * 10 ** decimals),
        realizedPnlPartialCloseCollateral: Math.round(data.realizedPnlPartialCloseCollateral * 10 ** decimals),
        pnlWithdrawnCollateral: Math.round(data.pnlWithdrawnCollateral * 10 ** decimals),
    };
};
exports.encodeUiRealizedPnlData = encodeUiRealizedPnlData;

},{"./borrowingV2": "trade/fees/borrowingV2/index.js", "./fundingFees/converter": "trade/fees/fundingFees/converter.js"}],
"trade/fees/fundingFees/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for funding fees data between contract and SDK formats
 * @dev All BigNumber values are normalized to floats with appropriate precision
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGetFundingFeeContext = exports.calculateVelocityFromSkew = exports.aprToFundingRate = exports.fundingRateToAPR = exports.isValidFundingRate = exports.createFundingFeeContext = exports.convertTradeInitialAccFundingFees = exports.convertPairGlobalParamsArray = exports.convertPairGlobalParams = exports.convertPairFundingFeeDataArray = exports.convertPairFundingFeeData = exports.convertFundingFeeParamsArray = exports.convertFundingFeeParams = exports.FUNDING_FEES_PRECISION = void 0;
// Precision constants from contract
exports.FUNDING_FEES_PRECISION = {
    SKEW_COEFFICIENT_PER_YEAR: 1e26,
    ABSOLUTE_VELOCITY_PER_YEAR_CAP: 1e7,
    ABSOLUTE_RATE_PER_SECOND_CAP: 1e10,
    ACC_FUNDING_FEE_P: 1e20,
    FUNDING_RATE_PER_SECOND_P: 1e18, // Funding rate per second precision
};
/**
 * @dev Converts contract funding fee params to SDK format
 * @param contractParams Contract funding fee params struct
 * @returns Normalized funding fee params
 */
const convertFundingFeeParams = (contractParams) => {
    return {
        skewCoefficientPerYear: Number(contractParams.skewCoefficientPerYear) /
            exports.FUNDING_FEES_PRECISION.SKEW_COEFFICIENT_PER_YEAR,
        absoluteVelocityPerYearCap: Number(contractParams.absoluteVelocityPerYearCap) /
            exports.FUNDING_FEES_PRECISION.ABSOLUTE_VELOCITY_PER_YEAR_CAP,
        absoluteRatePerSecondCap: Number(contractParams.absoluteRatePerSecondCap) /
            exports.FUNDING_FEES_PRECISION.ABSOLUTE_RATE_PER_SECOND_CAP,
        thetaThresholdUsd: Number(contractParams.thetaThresholdUsd),
        fundingFeesEnabled: Boolean(contractParams.fundingFeesEnabled),
        aprMultiplierEnabled: Boolean(contractParams.aprMultiplierEnabled),
    };
};
exports.convertFundingFeeParams = convertFundingFeeParams;
/**
 * @dev Converts array of contract funding fee params to SDK format
 * @param contractParamsArray Array of contract funding fee params
 * @returns Array of normalized funding fee params
 */
const convertFundingFeeParamsArray = (contractParamsArray) => {
    return contractParamsArray.map(exports.convertFundingFeeParams);
};
exports.convertFundingFeeParamsArray = convertFundingFeeParamsArray;
/**
 * @dev Converts contract pair funding fee data to SDK format
 * @param contractData Contract pair funding fee data struct
 * @returns Normalized pair funding fee data
 */
const convertPairFundingFeeData = (contractData) => {
    return {
        accFundingFeeLongP: Number(contractData.accFundingFeeLongP) /
            exports.FUNDING_FEES_PRECISION.ACC_FUNDING_FEE_P,
        accFundingFeeShortP: Number(contractData.accFundingFeeShortP) /
            exports.FUNDING_FEES_PRECISION.ACC_FUNDING_FEE_P,
        lastFundingRatePerSecondP: Number(contractData.lastFundingRatePerSecondP) /
            exports.FUNDING_FEES_PRECISION.FUNDING_RATE_PER_SECOND_P,
        lastFundingUpdateTs: Number(contractData.lastFundingUpdateTs),
    };
};
exports.convertPairFundingFeeData = convertPairFundingFeeData;
/**
 * @dev Converts array of contract pair funding fee data to SDK format
 * @param contractDataArray Array of contract pair funding fee data
 * @returns Array of normalized pair funding fee data
 */
const convertPairFundingFeeDataArray = (contractDataArray) => {
    return contractDataArray.map(exports.convertPairFundingFeeData);
};
exports.convertPairFundingFeeDataArray = convertPairFundingFeeDataArray;
/**
 * @dev Converts contract pair global params to SDK format
 * @param contractParams Contract pair global params struct
 * @returns Normalized pair global params
 */
const convertPairGlobalParams = (contractParams) => {
    return {
        maxSkewCollateral: Number(contractParams.maxSkewCollateral) / 1e10,
    };
};
exports.convertPairGlobalParams = convertPairGlobalParams;
/**
 * @dev Converts array of contract pair global params to SDK format
 * @param contractParamsArray Array of contract pair global params
 * @returns Array of normalized pair global params
 */
const convertPairGlobalParamsArray = (contractParamsArray) => {
    return contractParamsArray.map(exports.convertPairGlobalParams);
};
exports.convertPairGlobalParamsArray = convertPairGlobalParamsArray;
/**
 * @dev Converts contract trade initial acc funding fees to SDK format
 * @param contractFees Contract trade fees data (only funding fee part)
 * @returns Normalized trade initial acc funding fees
 */
const convertTradeInitialAccFundingFees = (contractFees) => {
    return {
        initialAccFundingFeeP: Number(contractFees.initialAccFundingFeeP) /
            exports.FUNDING_FEES_PRECISION.ACC_FUNDING_FEE_P,
    };
};
exports.convertTradeInitialAccFundingFees = convertTradeInitialAccFundingFees;
/**
 * @dev Creates a funding fee context from arrays of data
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices
 * @param params Array of funding fee parameters
 * @param data Array of pair funding fee data
 * @param globalParams Optional array of global parameters
 * @param currentTimestamp Optional current timestamp
 * @returns Complete funding fee context
 */
const createFundingFeeContext = (collateralIndices, pairIndices, params, data, globalParams, currentTimestamp) => {
    const context = {
        currentTimestamp: currentTimestamp ?? Math.floor(Date.now() / 1000),
        fundingParams: {},
        fundingData: {},
        globalParams: globalParams ? {} : undefined,
    };
    // Build nested objects indexed by collateralIndex and pairIndex
    for (let i = 0; i < collateralIndices.length; i++) {
        const collateralIndex = collateralIndices[i];
        const pairIndex = pairIndices[i];
        // Initialize collateral index objects if they don't exist
        if (!context.fundingParams[collateralIndex]) {
            context.fundingParams[collateralIndex] = {};
        }
        if (!context.fundingData[collateralIndex]) {
            context.fundingData[collateralIndex] = {};
        }
        if (globalParams && context.globalParams) {
            if (!context.globalParams[collateralIndex]) {
                context.globalParams[collateralIndex] = {};
            }
        }
        // Store data
        context.fundingParams[collateralIndex][pairIndex] = params[i];
        context.fundingData[collateralIndex][pairIndex] = data[i];
        if (globalParams && context.globalParams) {
            context.globalParams[collateralIndex][pairIndex] = globalParams[i];
        }
    }
    return context;
};
exports.createFundingFeeContext = createFundingFeeContext;
/**
 * @dev Validates funding rate is within allowed bounds
 * @param absoluteRatePerSecondCap Rate cap (normalized)
 * @returns Whether the rate is valid
 */
const isValidFundingRate = (absoluteRatePerSecondCap) => {
    // Convert back to contract precision for validation
    const contractValue = absoluteRatePerSecondCap *
        exports.FUNDING_FEES_PRECISION.ABSOLUTE_RATE_PER_SECOND_CAP;
    return contractValue <= 3170979; // MAX_FUNDING_RATE_PER_SECOND from contract
};
exports.isValidFundingRate = isValidFundingRate;
/**
 * @dev Converts funding rate per second to APR
 * @param ratePerSecondP Funding rate per second (normalized)
 * @returns APR as percentage
 */
const fundingRateToAPR = (ratePerSecondP) => {
    return ratePerSecondP * 365 * 24 * 60 * 60 * 100;
};
exports.fundingRateToAPR = fundingRateToAPR;
/**
 * @dev Converts APR to funding rate per second
 * @param apr APR as percentage
 * @returns Funding rate per second (normalized)
 */
const aprToFundingRate = (apr) => {
    return apr / (365 * 24 * 60 * 60 * 100);
};
exports.aprToFundingRate = aprToFundingRate;
/**
 * @dev Calculates velocity per year from skew coefficient
 * @param skewRatio Current skew ratio (net exposure / total OI)
 * @param skewCoefficientPerYear Skew coefficient per year (normalized)
 * @returns Velocity per year
 */
const calculateVelocityFromSkew = (skewRatio, skewCoefficientPerYear) => {
    return Math.abs(skewRatio) * skewCoefficientPerYear;
};
exports.calculateVelocityFromSkew = calculateVelocityFromSkew;
/**
 * @dev Creates a GetFundingFeeContext from arrays (alias for consistency)
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices
 * @param params Array of funding fee parameters
 * @param data Array of pair funding fee data
 * @returns Complete funding fee context
 */
const createGetFundingFeeContext = (collateralIndices, pairIndices, params, data) => {
    return (0, exports.createFundingFeeContext)(collateralIndices, pairIndices, params, data);
};
exports.createGetFundingFeeContext = createGetFundingFeeContext;

},{}],
"trade/fees/borrowingV2/builder.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBorrowingV2Context = void 0;
/**
 * @dev Builds borrowing v2 sub-context for a specific pair
 */
const buildBorrowingV2Context = (globalTradingVariables, collateralIndex, pairIndex, currentTimestamp) => {
    const collateral = globalTradingVariables.collaterals[collateralIndex - 1];
    if (!collateral?.pairBorrowingFeesV2) {
        return undefined;
    }
    const params = collateral.pairBorrowingFeesV2.params?.[pairIndex];
    const data = collateral.pairBorrowingFeesV2.data?.[pairIndex];
    if (!params || !data) {
        return undefined;
    }
    return {
        params,
        data,
        currentTimestamp,
    };
};
exports.buildBorrowingV2Context = buildBorrowingV2Context;

},{}],
"trade/pnl/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev PnL calculation module
 * @dev Provides functions matching v10 contract implementations
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceForTargetPnlPercentage = exports.getPnl = exports.getComprehensivePnl = exports.getTradeValue = exports.getPnlPercent = exports.getTradeRealizedPnlCollateral = void 0;
const borrowing_1 = require("../fees/borrowing");
const trading_1 = require("../fees/trading");
const liquidation_1 = require("../liquidation");
/**
 * @dev Gets trade realized PnL components from TradeFeesData
 * @dev Mirrors contract's getTradeRealizedPnlCollateral function
 * @param tradeFeesData Trade fees data containing realized components
 * @returns Tuple of [realizedPnlCollateral, realizedTradingFeesCollateral, totalRealizedPnlCollateral]
 */
const getTradeRealizedPnlCollateral = (tradeFeesData) => {
    const realizedPnlCollateral = tradeFeesData.realizedPnlCollateral;
    const realizedTradingFeesCollateral = tradeFeesData.realizedTradingFeesCollateral;
    const totalRealizedPnlCollateral = realizedPnlCollateral - realizedTradingFeesCollateral;
    return {
        realizedPnlCollateral,
        realizedTradingFeesCollateral,
        totalRealizedPnlCollateral,
    };
};
exports.getTradeRealizedPnlCollateral = getTradeRealizedPnlCollateral;
/**
 * @dev Calculates PnL percentage for a position
 * @dev Mirrors contract's getPnlPercent function
 * @param openPrice Trade open price
 * @param currentPrice Current market price
 * @param long Whether position is long
 * @param leverage Position leverage
 * @returns PnL percentage (e.g., 10 = 10% profit, -50 = 50% loss)
 */
const getPnlPercent = (openPrice, currentPrice, long, leverage) => {
    if (openPrice === 0)
        return -100;
    const priceDiff = long ? currentPrice - openPrice : openPrice - currentPrice;
    const pnlPercent = (priceDiff / openPrice) * 100 * leverage;
    // Cap at -100% loss
    return Math.max(pnlPercent, -100);
};
exports.getPnlPercent = getPnlPercent;
/**
 * @dev Calculates trade value from collateral and PnL
 * @dev Mirrors contract's getTradeValuePure function
 * @param collateral Trade collateral amount
 * @param pnlPercent PnL percentage
 * @param totalFees Total fees to deduct
 * @returns Trade value after PnL and fees
 */
const getTradeValue = (collateral, pnlPercent, totalFees) => {
    const pnlCollateral = collateral * (pnlPercent / 100);
    const value = collateral + pnlCollateral - totalFees;
    return Math.max(0, value);
};
exports.getTradeValue = getTradeValue;
/**
 * @dev Comprehensive PnL calculation including all fees
 * @param trade The trade to calculate PnL for
 * @param marketPrice Current market price (without price impact)
 * @param executionPrice Price after all impacts (spread, skew, volume)
 * @param tradeInfo Trade info with version and timestamps
 * @param context Context with all fee parameters
 * @returns Detailed PnL breakdown
 */
const getComprehensivePnl = (trade, marketPrice, executionPrice, tradeInfo, context) => {
    // Calculate both raw PnL (market price) and impact-adjusted PnL (execution price)
    let rawPnlPercent = (0, exports.getPnlPercent)(trade.openPrice, marketPrice, trade.long, trade.leverage);
    let impactPnlPercent = (0, exports.getPnlPercent)(trade.openPrice, executionPrice, trade.long, trade.leverage);
    if (!context.tradeData) {
        throw new Error("Trade data is undefined");
    }
    // Calculate position size
    const positionSizeCollateral = trade.collateralAmount * trade.leverage;
    // Calculate holding fees - always use getTradePendingHoldingFeesCollateral
    const pendingHoldingFees = (0, trading_1.getTradePendingHoldingFeesCollateral)(trade, tradeInfo, context.tradeData.tradeFeesData, marketPrice, {
        contractsVersion: context.core.contractsVersion,
        currentTimestamp: context.core.currentTimestamp,
        collateralPriceUsd: context.core.collateralPriceUsd,
        borrowingV1: context.borrowingV1,
        borrowingV2: context.borrowingV2,
        funding: context.funding,
        initialAccFees: context.tradeData.initialAccFees,
    });
    const borrowingFeeV1 = pendingHoldingFees.borrowingFeeCollateral_old;
    const borrowingFeeV2 = pendingHoldingFees.borrowingFeeCollateral;
    const fundingFee = pendingHoldingFees.fundingFeeCollateral;
    // Calculate closing fees
    const closingFee = (0, trading_1.getTotalTradeFeesCollateral)(trade.collateralIndex, trade.user, trade.pairIndex, positionSizeCollateral, trade.isCounterTrade || false, {
        fee: context.trading.fee,
        globalTradeFeeParams: context.trading.globalTradeFeeParams,
        collateralPriceUsd: context.core.collateralPriceUsd,
        counterTradeSettings: context.trading.counterTradeSettings,
        traderFeeMultiplier: context.trading.traderFeeMultiplier,
    });
    // Total fees
    const totalHoldingFees = borrowingFeeV1 + borrowingFeeV2 + fundingFee;
    const totalFees = totalHoldingFees + closingFee;
    // Check liquidation (using raw PnL for liquidation check)
    const liquidationThreshold = context.tradeData?.liquidationParams
        ? (0, liquidation_1.getLiqPnlThresholdP)(context.tradeData.liquidationParams, trade.leverage) *
            -100
        : -90; // Default 90% loss
    const isLiquidated = rawPnlPercent <= liquidationThreshold;
    // If liquidated, set both PnL percentages to -100%
    if (isLiquidated) {
        rawPnlPercent = -100;
        impactPnlPercent = -100;
    }
    // Get realized PnL components from TradeFeesData
    const { totalRealizedPnlCollateral } = (0, exports.getTradeRealizedPnlCollateral)(context.tradeData.tradeFeesData);
    // Calculate raw PnL in collateral (using market price)
    const rawPnlCollateral = trade.collateralAmount * (rawPnlPercent / 100);
    // Calculate impact-adjusted PnL in collateral (using execution price)
    const impactPnlCollateral = trade.collateralAmount * (impactPnlPercent / 100);
    // Calculate price impact
    const priceImpactCollateral = impactPnlCollateral - rawPnlCollateral;
    const priceImpactPercent = impactPnlPercent - rawPnlPercent;
    // Calculate unrealized PnL (before closing fee, after holding fees, using market price)
    // This is what the trader sees for open positions
    const uPnlCollateral = rawPnlCollateral - totalHoldingFees + totalRealizedPnlCollateral;
    const uPnlPercent = (uPnlCollateral / trade.collateralAmount) * 100;
    // Calculate realized PnL (after all fees including closing, using execution price)
    // This is what the trader would get if closing the position
    const realizedPnlCollateral = impactPnlCollateral - totalFees + totalRealizedPnlCollateral;
    const realizedPnlPercent = (realizedPnlCollateral / trade.collateralAmount) * 100;
    const tradeValue = trade.collateralAmount + realizedPnlCollateral;
    return {
        // Raw PnL values (using market price, no price impact)
        pnlPercent: rawPnlPercent,
        pnlCollateral: rawPnlCollateral,
        // Impact-adjusted PnL values (using execution price)
        impactPnlPercent,
        impactPnlCollateral,
        // Price impact
        priceImpact: {
            percent: priceImpactPercent,
            collateral: priceImpactCollateral,
        },
        // Trade value (what trader would receive if closing)
        tradeValue,
        // Unrealized PnL (after holding fees, before closing fee, using market price)
        // Use for open position display
        uPnlCollateral,
        uPnlPercent,
        // Realized PnL (after all fees, using execution price)
        // Use for closing preview
        realizedPnlCollateral,
        realizedPnlPercent,
        // Fee breakdown
        fees: {
            borrowingV1: borrowingFeeV1,
            borrowingV2: borrowingFeeV2,
            funding: fundingFee,
            closing: closingFee,
            total: totalFees,
        },
        // Status flags
        isLiquidated,
        isProfitable: rawPnlPercent > 0, // Based on raw PnL
    };
};
exports.getComprehensivePnl = getComprehensivePnl;
/**
 * @dev Legacy PnL calculation function
 * @deprecated Use getComprehensivePnl for more comprehensive calculations
 * @param price Current price
 * @param trade Trade object
 * @param tradeInfo Trade info (not used in legacy implementation)
 * @param initialAccFees Initial accumulated fees
 * @param liquidationParams Liquidation parameters
 * @param useFees Whether to include fees
 * @param context Context with fee calculation parameters
 * @returns [pnlCollateral, pnlPercentage] or undefined if no price
 */
const getPnl = (price, trade, _tradeInfo, initialAccFees, liquidationParams, useFees, context) => {
    if (!price) {
        return;
    }
    const posCollat = trade.collateralAmount;
    const { openPrice, leverage } = trade;
    let pnlCollat = trade.long
        ? ((price - openPrice) / openPrice) * leverage * posCollat
        : ((openPrice - price) / openPrice) * leverage * posCollat;
    if (useFees &&
        context.pairs &&
        context.groups &&
        context.currentBlock !== undefined &&
        context.collateralPriceUsd !== undefined) {
        pnlCollat -= (0, borrowing_1.getBorrowingFee)(posCollat * trade.leverage, trade.pairIndex, trade.long, initialAccFees, price, {
            currentBlock: context.currentBlock,
            groups: context.groups,
            pairs: context.pairs,
            collateralPriceUsd: context.collateralPriceUsd,
            pairOis: context.pairOis,
        });
    }
    let pnlPercentage = (pnlCollat / posCollat) * 100;
    // Can be liquidated
    if (pnlPercentage <=
        (0, liquidation_1.getLiqPnlThresholdP)(liquidationParams, leverage) * -100) {
        pnlPercentage = -100;
    }
    else {
        // Calculate closing fee using the same function as opening fees
        const positionSizeCollateral = posCollat * trade.leverage;
        const closingFee = (0, trading_1.getTotalTradeFeesCollateral)(0, // collateralIndex not used
        trade.user, trade.pairIndex, positionSizeCollateral, trade.isCounterTrade ?? false, {
            fee: context.fee,
            globalTradeFeeParams: context.globalTradeFeeParams,
            collateralPriceUsd: context.collateralPriceUsd || 1,
            traderFeeMultiplier: context.traderFeeMultiplier,
        });
        pnlCollat -= closingFee;
        pnlPercentage = (pnlCollat / posCollat) * 100;
    }
    pnlPercentage = pnlPercentage < -100 ? -100 : pnlPercentage;
    pnlCollat = (posCollat * pnlPercentage) / 100;
    return [pnlCollat, pnlPercentage];
};
exports.getPnl = getPnl;
/**
 * @dev Calculates the price needed to achieve a target PnL percentage
 * @param targetPnlPercent The target PnL percentage (e.g., 50 for 50% profit, -25 for 25% loss)
 * @param trade The trade to calculate for
 * @param tradeInfo Trade info with timestamps
 * @param context Context with fee calculation parameters
 * @param netPnl Whether to include closing fees in the calculation
 * @returns The price that would result in the target PnL percentage
 */
const getPriceForTargetPnlPercentage = (targetPnlPercent, trade, tradeInfo, context, netPnl = false) => {
    const { leverage, openPrice, long, collateralAmount } = trade;
    const positionSizeCollateral = collateralAmount * leverage;
    // Calculate holding fees - always use getTradePendingHoldingFeesCollateral
    // This mirrors the contract's getTradeValueCollateral which always calls this function
    const fees = (0, trading_1.getTradePendingHoldingFeesCollateral)(trade, tradeInfo, context.tradeData?.tradeFeesData || {
        realizedTradingFeesCollateral: 0,
        realizedPnlCollateral: 0,
        manuallyRealizedNegativePnlCollateral: 0,
        alreadyTransferredNegativePnlCollateral: 0,
        virtualAvailableCollateralInDiamond: 0,
        initialAccFundingFeeP: 0,
        initialAccBorrowingFeeP: 0,
    }, openPrice, // Use open price as a baseline
    {
        contractsVersion: context.core.contractsVersion,
        currentTimestamp: context.core.currentTimestamp,
        collateralPriceUsd: context.core.collateralPriceUsd,
        borrowingV1: context.borrowingV1,
        borrowingV2: context.borrowingV2,
        funding: context.funding,
        initialAccFees: context.tradeData?.initialAccFees,
    });
    const totalHoldingFees = fees.fundingFeeCollateral +
        fees.borrowingFeeCollateral +
        fees.borrowingFeeCollateral_old;
    const { totalRealizedPnlCollateral } = context.tradeData?.tradeFeesData
        ? (0, exports.getTradeRealizedPnlCollateral)(context.tradeData.tradeFeesData)
        : { totalRealizedPnlCollateral: 0 };
    const targetPnlInCollateral = (collateralAmount * targetPnlPercent) / 100;
    let targetPnlGross = targetPnlInCollateral + totalHoldingFees - totalRealizedPnlCollateral;
    if (netPnl) {
        // Include closing fees
        const closingFee = (0, trading_1.getTotalTradeFeesCollateral)(trade.collateralIndex, trade.user, trade.pairIndex, positionSizeCollateral, trade.isCounterTrade || false, {
            fee: context.trading.fee,
            globalTradeFeeParams: context.trading.globalTradeFeeParams,
            collateralPriceUsd: context.core.collateralPriceUsd,
            traderFeeMultiplier: context.trading.traderFeeMultiplier,
            counterTradeSettings: context.trading.counterTradeSettings,
        });
        targetPnlGross += closingFee;
    }
    // Calculate the price
    let price;
    if (long) {
        price = openPrice + (targetPnlGross * openPrice) / positionSizeCollateral;
    }
    else {
        price = openPrice - (targetPnlGross * openPrice) / positionSizeCollateral;
    }
    return price;
};
exports.getPriceForTargetPnlPercentage = getPriceForTargetPnlPercentage;
// Re-export types
__exportStar(require("./types"), exports);
__exportStar(require("./converter"), exports);
__exportStar(require("./builder"), exports);

},{"../fees/borrowing": "trade/fees/borrowing/index.js", "../fees/trading": "trade/fees/trading/index.js", "../liquidation": "trade/liquidation/index.js", "./types": "trade/pnl/types.js", "./converter": "trade/pnl/converter.js", "./builder": "trade/pnl/builder.js"}],
"trade/liquidation/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Main export file for liquidation module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeLiquidationParams = exports.convertLiquidationParamsArray = exports.convertLiquidationParams = exports.getLiqPnlThresholdP = exports.getLiquidationPriceAfterPositionUpdate = exports.getLiquidationPrice = void 0;
const types_1 = require("../../contracts/types");
const __1 = require("..");
/**
 * @dev Calculate liquidation price with structured context
 * @param trade The trade to calculate liquidation price for
 * @param context Structured context with all required data
 * @returns Liquidation price
 */
const getLiquidationPrice = (trade, context) => {
    // Extract parameters from structured context
    const { currentPairPrice, additionalFeeCollateral = 0, partialCloseMultiplier = 1, beforeOpened = false, isCounterTrade = false, } = context.liquidationSpecific;
    // 1. Calculate closing fees
    const closingFee = (0, __1.getTotalTradeFeesCollateral)(trade.collateralIndex, "", // No fee tiers applied for liquidation calculation
    trade.pairIndex, trade.collateralAmount * trade.leverage, isCounterTrade, {
        fee: context.trading.fee,
        collateralPriceUsd: context.core.collateralPriceUsd,
        globalTradeFeeParams: context.trading.globalTradeFeeParams,
        traderFeeMultiplier: 1,
        counterTradeSettings: context.trading.counterTradeSettings,
    });
    // 2. Calculate holding fees and realized PnL for opened trades
    let holdingFeesTotal = 0;
    let totalRealizedPnlCollateral = 0;
    if (!beforeOpened) {
        // Calculate holding fees
        const holdingFees = (0, __1.getTradePendingHoldingFeesCollateral)(trade, context.tradeData.tradeInfo, context.tradeData.tradeFeesData, currentPairPrice, {
            contractsVersion: context.core.contractsVersion,
            currentTimestamp: context.core.currentTimestamp,
            collateralPriceUsd: context.core.collateralPriceUsd,
            borrowingV1: context.borrowingV1,
            borrowingV2: context.borrowingV2,
            funding: context.funding,
            initialAccFees: context.tradeData.initialAccFees,
        });
        holdingFeesTotal = holdingFees.totalFeeCollateral;
        // Calculate total realized PnL (realized PnL minus realized trading fees)
        totalRealizedPnlCollateral =
            context.tradeData.tradeFeesData.realizedPnlCollateral -
                context.tradeData.tradeFeesData.realizedTradingFeesCollateral;
    }
    // 3. Apply unified formula for all trades
    const totalFeesCollateral = closingFee +
        (holdingFeesTotal - totalRealizedPnlCollateral) * partialCloseMultiplier +
        additionalFeeCollateral;
    // 4. Calculate liquidation threshold
    const liqThresholdP = (0, exports.getLiqPnlThresholdP)(context.tradeData.liquidationParams, trade.leverage);
    // 5. Calculate liquidation price distance
    const collateralLiqNegativePnl = trade.collateralAmount * liqThresholdP;
    let liqPriceDistance = (trade.openPrice * (collateralLiqNegativePnl - totalFeesCollateral)) /
        trade.collateralAmount /
        trade.leverage;
    // 6. Apply closing spread for v9.2+
    if (context.core.contractsVersion >= types_1.ContractsVersion.V9_2 &&
        ((context.tradeData.liquidationParams?.maxLiqSpreadP !== undefined &&
            context.tradeData.liquidationParams.maxLiqSpreadP > 0) ||
            (context.liquidationSpecific.userPriceImpact?.fixedSpreadP !==
                undefined &&
                context.liquidationSpecific.userPriceImpact.fixedSpreadP > 0))) {
        const closingSpreadP = (0, __1.getSpreadP)(context.core.spreadP, true, context.tradeData.liquidationParams, context.liquidationSpecific.userPriceImpact);
        liqPriceDistance -= trade.openPrice * closingSpreadP;
    }
    // 7. Calculate final liquidation price
    return trade.long
        ? Math.max(trade.openPrice - liqPriceDistance, 0)
        : Math.max(trade.openPrice + liqPriceDistance, 0);
};
exports.getLiquidationPrice = getLiquidationPrice;
/**
 * @dev Calculate liquidation price after a position size update
 * @dev Mirrors the contract's IncreasePositionSizeUtils.sol and DecreasePositionSizeUtils.sol logic
 * @param existingTrade The current trade before the update
 * @param newCollateralAmount New collateral amount after the update
 * @param newLeverage New leverage after the update
 * @param isLeverageUpdate Whether this is a leverage update vs regular position change
 * @param positionSizeCollateralDelta The absolute change in position size (in collateral terms)
 * @param pnlToRealizeCollateral PnL to be realized (only relevant for leverage decrease)
 * @param context Structured context with all required data (including additionalFeesCollateral for increases)
 * @returns New liquidation price after the update
 */
const getLiquidationPriceAfterPositionUpdate = (existingTrade, newCollateralAmount, newLeverage, isLeverageUpdate, positionSizeCollateralDelta, pnlToRealizeCollateral, context) => {
    const { currentPairPrice, isCounterTrade = false } = context.liquidationSpecific;
    // 1. Calculate closing fees on the new position size
    const closingFeeCollateral = (0, __1.getTotalTradeFeesCollateral)(existingTrade.collateralIndex, "", // No fee tiers applied for liquidation calculation
    existingTrade.pairIndex, newCollateralAmount * newLeverage, isCounterTrade, {
        fee: context.trading.fee,
        collateralPriceUsd: context.core.collateralPriceUsd,
        globalTradeFeeParams: context.trading.globalTradeFeeParams,
        traderFeeMultiplier: 1,
        counterTradeSettings: context.trading.counterTradeSettings,
    });
    // 2. Calculate holding fees on the EXISTING trade (full position)
    const holdingFees = (0, __1.getTradePendingHoldingFeesCollateral)(existingTrade, context.tradeData.tradeInfo, context.tradeData.tradeFeesData, currentPairPrice, {
        contractsVersion: context.core.contractsVersion,
        currentTimestamp: context.core.currentTimestamp,
        collateralPriceUsd: context.core.collateralPriceUsd,
        borrowingV1: context.borrowingV1,
        borrowingV2: context.borrowingV2,
        funding: context.funding,
        initialAccFees: context.tradeData.initialAccFees,
    });
    // 3. Calculate total realized PnL
    const totalRealizedPnlCollateral = context.tradeData.tradeFeesData.realizedPnlCollateral -
        context.tradeData.tradeFeesData.realizedTradingFeesCollateral;
    // 4. Determine if this is an increase or decrease
    const existingPositionSizeCollateral = existingTrade.collateralAmount * existingTrade.leverage;
    const newPositionSizeCollateral = newCollateralAmount * newLeverage;
    const isIncrease = newPositionSizeCollateral > existingPositionSizeCollateral;
    // 5. Calculate additional fee and partial close multiplier based on update type
    let additionalFeeCollateral;
    let partialCloseMultiplier;
    if (isIncrease) {
        // For position increases: use additional fees from context (e.g., opening fees)
        additionalFeeCollateral =
            context.liquidationSpecific.additionalFeeCollateral || 0;
        partialCloseMultiplier = 1; // Set to 1
    }
    else if (isLeverageUpdate) {
        // For leverage decreases: additional fee includes closing fee minus PnL to realize
        additionalFeeCollateral = closingFeeCollateral - pnlToRealizeCollateral;
        partialCloseMultiplier = 1; // Full multiplier for leverage updates
    }
    else {
        // For regular position decreases: no additional fee, scaled multiplier
        additionalFeeCollateral = 0;
        partialCloseMultiplier =
            (existingPositionSizeCollateral - positionSizeCollateralDelta) /
                existingPositionSizeCollateral;
    }
    // 6. Calculate total fees
    const totalFeesCollateral = closingFeeCollateral +
        (holdingFees.totalFeeCollateral - totalRealizedPnlCollateral) *
            partialCloseMultiplier +
        additionalFeeCollateral;
    // 7. Calculate liquidation threshold
    const liqThresholdP = (0, exports.getLiqPnlThresholdP)(context.tradeData.liquidationParams, newLeverage);
    // 8. Calculate liquidation price distance
    const collateralLiqNegativePnl = newCollateralAmount * liqThresholdP;
    // For increases, we need to use the new weighted average open price
    // For decreases, we use the existing open price
    const openPriceToUse = isIncrease
        ? context.liquidationSpecific.newOpenPrice || existingTrade.openPrice
        : existingTrade.openPrice;
    let liqPriceDistance = (openPriceToUse * (collateralLiqNegativePnl - totalFeesCollateral)) /
        newCollateralAmount /
        newLeverage;
    // 9. Apply closing spread for v9.2+
    if (context.core.contractsVersion >= types_1.ContractsVersion.V9_2 &&
        ((context.tradeData.liquidationParams?.maxLiqSpreadP !== undefined &&
            context.tradeData.liquidationParams.maxLiqSpreadP > 0) ||
            (context.liquidationSpecific.userPriceImpact?.fixedSpreadP !==
                undefined &&
                context.liquidationSpecific.userPriceImpact.fixedSpreadP > 0))) {
        const closingSpreadP = (0, __1.getSpreadP)(context.core.spreadP, true, context.tradeData.liquidationParams, context.liquidationSpecific.userPriceImpact);
        liqPriceDistance -= openPriceToUse * closingSpreadP;
    }
    // 10. Calculate final liquidation price
    return existingTrade.long
        ? Math.max(openPriceToUse - liqPriceDistance, 0)
        : Math.max(openPriceToUse + liqPriceDistance, 0);
};
exports.getLiquidationPriceAfterPositionUpdate = getLiquidationPriceAfterPositionUpdate;
const getLiqPnlThresholdP = (liquidationParams, leverage) => {
    if (liquidationParams === undefined ||
        leverage === undefined ||
        liquidationParams.maxLiqSpreadP === 0 ||
        liquidationParams.startLiqThresholdP === 0 ||
        liquidationParams.endLiqThresholdP === 0 ||
        liquidationParams.startLeverage === 0 ||
        liquidationParams.endLeverage === 0) {
        return 0.9;
    }
    if (leverage < liquidationParams.startLeverage) {
        return liquidationParams.startLiqThresholdP;
    }
    if (leverage > liquidationParams.endLeverage) {
        return liquidationParams.endLiqThresholdP;
    }
    if (liquidationParams.startLiqThresholdP === liquidationParams.endLiqThresholdP) {
        return liquidationParams.endLiqThresholdP;
    }
    return (liquidationParams.startLiqThresholdP -
        ((leverage - liquidationParams.startLeverage) *
            (liquidationParams.startLiqThresholdP -
                liquidationParams.endLiqThresholdP)) /
            (liquidationParams.endLeverage - liquidationParams.startLeverage));
};
exports.getLiqPnlThresholdP = getLiqPnlThresholdP;
// Converters
var converter_1 = require("./converter");
Object.defineProperty(exports, "convertLiquidationParams", { enumerable: true, get: function () { return converter_1.convertLiquidationParams; } });
Object.defineProperty(exports, "convertLiquidationParamsArray", { enumerable: true, get: function () { return converter_1.convertLiquidationParamsArray; } });
Object.defineProperty(exports, "encodeLiquidationParams", { enumerable: true, get: function () { return converter_1.encodeLiquidationParams; } });
// Types
__exportStar(require("./types"), exports);
// Builder
__exportStar(require("./builder"), exports);

},{"../../contracts/types": "contracts/types/index.js", "..": "trade/index.js", "./converter": "trade/liquidation/converter.js", "./types": "trade/liquidation/types.js", "./builder": "trade/liquidation/builder.js"}],
"trade/liquidation/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for liquidation data between contract and SDK formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeLiquidationParams = exports.convertLiquidationParamsArray = exports.convertLiquidationParams = void 0;
/**
 * @dev Converts contract liquidation params to SDK format
 * @param params Group liquidation params from contract
 * @returns Normalized liquidation params
 */
const convertLiquidationParams = (params) => {
    const ONCHAIN_LIQ_THRESHOLD = 0.9;
    return {
        maxLiqSpreadP: Number(params.maxLiqSpreadP) / 1e10 / 100,
        startLiqThresholdP: Number(params.startLiqThresholdP) / 1e10 / 100 || ONCHAIN_LIQ_THRESHOLD,
        endLiqThresholdP: Number(params.endLiqThresholdP) / 1e10 / 100 || ONCHAIN_LIQ_THRESHOLD,
        startLeverage: Number(params.startLeverage) / 1e3,
        endLeverage: Number(params.endLeverage) / 1e3, // 1e3 → float
    };
};
exports.convertLiquidationParams = convertLiquidationParams;
/**
 * @dev Converts array of liquidation params from contract
 * @param paramsArray Array of group liquidation params
 * @returns Array of normalized liquidation params
 */
const convertLiquidationParamsArray = (paramsArray) => {
    return paramsArray.map(exports.convertLiquidationParams);
};
exports.convertLiquidationParamsArray = convertLiquidationParamsArray;
/**
 * @dev Converts liquidation params to contract format (for encoding)
 * @param params SDK liquidation params
 * @returns Contract-formatted liquidation params
 */
const encodeLiquidationParams = (params) => {
    return {
        maxLiqSpreadP: Math.round(params.maxLiqSpreadP * 100 * 1e10),
        startLiqThresholdP: Math.round(params.startLiqThresholdP * 100 * 1e10),
        endLiqThresholdP: Math.round(params.endLiqThresholdP * 100 * 1e10),
        startLeverage: Math.round(params.startLeverage * 1e3),
        endLeverage: Math.round(params.endLeverage * 1e3), // float → 1e3
    };
};
exports.encodeLiquidationParams = encodeLiquidationParams;

},{}],
"trade/liquidation/types.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/liquidation/builder.js":[function(require,module,exports){
"use strict";
/**
 * @dev Liquidation price context builder module
 * @dev Provides builder functions for creating liquidation price contexts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLiquidationPriceContext = void 0;
const builder_1 = require("../fees/borrowing/builder");
const builder_2 = require("../fees/borrowingV2/builder");
const builder_3 = require("../fees/fundingFees/builder");
const builder_4 = require("../fees/trading/builder");
/**
 * @dev Builds a complete context for liquidation price calculations
 * @param globalTradingVariables The transformed global trading variables from backend
 * @param tradeContainer Full trade container with trade, tradeInfo, fees data and liquidation params
 * @param additionalParams Additional parameters not available in trading variables
 * @returns Complete context ready for getLiquidationPrice
 */
const buildLiquidationPriceContext = (globalTradingVariables, tradeContainer, additionalParams) => {
    const { trade, tradeInfo } = tradeContainer;
    const collateralIndex = trade.collateralIndex || 1;
    const collateral = globalTradingVariables.collaterals[collateralIndex - 1];
    if (!tradeContainer.liquidationParams) {
        throw new Error("Liquidation params are required for liquidation price calculation");
    }
    return {
        // Core shared context
        core: {
            currentBlock: additionalParams.currentBlock,
            currentTimestamp: additionalParams.currentTimestamp,
            collateralPriceUsd: collateral.prices?.collateralPriceUsd || 1,
            contractsVersion: tradeInfo.contractsVersion,
            spreadP: additionalParams.spreadP,
        },
        // Build sub-contexts using dedicated builders
        borrowingV1: (0, builder_1.buildBorrowingV1Context)(globalTradingVariables, collateralIndex, additionalParams.currentBlock),
        borrowingV2: (0, builder_2.buildBorrowingV2Context)(globalTradingVariables, collateralIndex, trade.pairIndex, additionalParams.currentTimestamp),
        funding: (0, builder_3.buildFundingContext)(globalTradingVariables, collateralIndex, trade.pairIndex, additionalParams.currentTimestamp),
        trading: (0, builder_4.buildTradingFeesContext)(globalTradingVariables, trade.pairIndex, additionalParams.traderFeeMultiplier),
        // Trade-specific data
        tradeData: {
            tradeInfo,
            tradeFeesData: tradeContainer.tradeFeesData,
            liquidationParams: tradeContainer.liquidationParams,
            initialAccFees: tradeContainer.initialAccFees,
        },
        // Additional parameters for liquidation calculation
        liquidationSpecific: {
            currentPairPrice: additionalParams.currentPairPrice,
            additionalFeeCollateral: additionalParams.additionalFeeCollateral || 0,
            partialCloseMultiplier: additionalParams.partialCloseMultiplier || 1,
            beforeOpened: additionalParams.beforeOpened || false,
            isCounterTrade: trade.isCounterTrade || false,
            userPriceImpact: additionalParams.userPriceImpact,
        },
    };
};
exports.buildLiquidationPriceContext = buildLiquidationPriceContext;

},{"../fees/borrowing/builder": "trade/fees/borrowing/builder.js", "../fees/borrowingV2/builder": "trade/fees/borrowingV2/builder.js", "../fees/fundingFees/builder": "trade/fees/fundingFees/builder.js", "../fees/trading/builder": "trade/fees/trading/builder.js"}],
"trade/pnl/types.js":[function(require,module,exports){
"use strict";
/**
 * @dev Types for PnL calculations
 */
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/pnl/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for PnL data between contract and SDK formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPnlResults = exports.convertLeverage = exports.convertPrice = exports.convertCollateralAmount = exports.encodePnlPercent = exports.convertPnlPercent = void 0;
/**
 * @dev Convert PnL percentage from contract precision to SDK format
 * @param pnlPercentContract PnL percentage with 1e10 precision
 * @returns PnL percentage as regular number (e.g., 10 = 10%)
 */
const convertPnlPercent = (pnlPercentContract) => {
    const value = typeof pnlPercentContract === "bigint"
        ? Number(pnlPercentContract)
        : pnlPercentContract;
    // Contract uses 1e10 precision for percentages
    return value / 1e10;
};
exports.convertPnlPercent = convertPnlPercent;
/**
 * @dev Convert PnL percentage from SDK format to contract precision
 * @param pnlPercent PnL percentage as regular number
 * @returns PnL percentage with 1e10 precision
 */
const encodePnlPercent = (pnlPercent) => {
    return BigInt(Math.round(pnlPercent * 1e10));
};
exports.encodePnlPercent = encodePnlPercent;
/**
 * @dev Convert collateral amount considering precision
 * @param amount Amount in contract format
 * @param collateralDecimals Collateral token decimals (6 or 18)
 * @returns Amount as SDK float
 */
const convertCollateralAmount = (amount, collateralDecimals) => {
    const value = typeof amount === "bigint" ? Number(amount) : amount;
    return value / 10 ** collateralDecimals;
};
exports.convertCollateralAmount = convertCollateralAmount;
/**
 * @dev Convert price from contract format to SDK format
 * @param price Price with 1e10 precision
 * @returns Price as SDK float
 */
const convertPrice = (price) => {
    const value = typeof price === "bigint" ? Number(price) : price;
    return value / 1e10;
};
exports.convertPrice = convertPrice;
/**
 * @dev Convert leverage from contract format to SDK format
 * @param leverage Leverage with 1e3 precision
 * @returns Leverage as SDK float (e.g., 10 = 10x)
 */
const convertLeverage = (leverage) => {
    const value = typeof leverage === "bigint" ? Number(leverage) : leverage;
    return value / 1e3;
};
exports.convertLeverage = convertLeverage;
/**
 * @dev Batch convert PnL results from contract format
 * @param results Array of PnL results from contract
 * @param collateralDecimals Collateral token decimals
 * @returns Array of converted PnL results
 */
const convertPnlResults = (results, collateralDecimals) => {
    return results.map(result => ({
        pnlCollateral: (0, exports.convertCollateralAmount)(result.pnlCollateral, collateralDecimals),
        pnlPercent: (0, exports.convertPnlPercent)(result.pnlPercent),
    }));
};
exports.convertPnlResults = convertPnlResults;

},{}],
"trade/pnl/builder.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComprehensivePnlContext = void 0;
const builder_1 = require("../fees/borrowingV2/builder");
const builder_2 = require("../fees/fundingFees/builder");
const builder_3 = require("../fees/borrowing/builder");
const builder_4 = require("../fees/trading/builder");
/**
 * @dev Builds a complete context for comprehensive PnL calculations
 * @dev Uses sub-context builders to create properly scoped contexts
 * @param globalTradingVariables The transformed global trading variables from backend
 * @param tradeContainer Full trade container with trade, tradeInfo, fees data and liquidation params
 * @param additionalParams Additional parameters not available in trading variables
 * @returns Complete context ready for getComprehensivePnl
 */
const buildComprehensivePnlContext = (globalTradingVariables, tradeContainer, additionalParams) => {
    const { trade, tradeInfo } = tradeContainer;
    const collateralIndex = trade.collateralIndex || 1;
    const collateral = globalTradingVariables.collaterals[collateralIndex - 1];
    return {
        // Core shared context
        core: {
            currentBlock: additionalParams.currentBlock,
            currentTimestamp: additionalParams.currentTimestamp,
            collateralPriceUsd: collateral.prices?.collateralPriceUsd || 1,
            contractsVersion: tradeInfo.contractsVersion,
        },
        // Build sub-contexts using dedicated builders
        borrowingV1: (0, builder_3.buildBorrowingV1Context)(globalTradingVariables, collateralIndex, additionalParams.currentBlock),
        borrowingV2: (0, builder_1.buildBorrowingV2Context)(globalTradingVariables, collateralIndex, trade.pairIndex, additionalParams.currentTimestamp),
        funding: (0, builder_2.buildFundingContext)(globalTradingVariables, collateralIndex, trade.pairIndex, additionalParams.currentTimestamp),
        trading: (0, builder_4.buildTradingFeesContext)(globalTradingVariables, trade.pairIndex, additionalParams.traderFeeMultiplier),
        // Trade-specific data
        tradeData: tradeContainer.tradeFeesData && tradeContainer.liquidationParams
            ? {
                tradeFeesData: tradeContainer.tradeFeesData,
                liquidationParams: tradeContainer.liquidationParams,
                initialAccFees: tradeContainer.initialAccFees,
            }
            : undefined,
    };
};
exports.buildComprehensivePnlContext = buildComprehensivePnlContext;

},{"../fees/borrowingV2/builder": "trade/fees/borrowingV2/builder.js", "../fees/fundingFees/builder": "trade/fees/fundingFees/builder.js", "../fees/borrowing/builder": "trade/fees/borrowing/builder.js", "../fees/trading/builder": "trade/fees/trading/builder.js"}],
"trade/spread.js":[function(require,module,exports){
"use strict";
/**
 * @dev Pure spread calculations without price impact
 * @dev For price impact calculations, see priceImpact module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpreadP = exports.getFixedSpreadP = exports.getLegacyFactor = exports.getCumulativeFactor = exports.isProtectionCloseFactorActive = exports.getProtectionCloseFactor = exports.getCumulVolPriceImpact = exports.getTradeCumulVolPriceImpactP = exports.getSpreadWithCumulVolPriceImpactP = exports.getSpreadWithPriceImpactP = void 0;
// Re-export from priceImpact/cumulVol for backward compatibility
var cumulVol_1 = require("./priceImpact/cumulVol");
Object.defineProperty(exports, "getSpreadWithPriceImpactP", { enumerable: true, get: function () { return cumulVol_1.getSpreadWithPriceImpactP; } });
Object.defineProperty(exports, "getSpreadWithCumulVolPriceImpactP", { enumerable: true, get: function () { return cumulVol_1.getSpreadWithCumulVolPriceImpactP; } });
Object.defineProperty(exports, "getTradeCumulVolPriceImpactP", { enumerable: true, get: function () { return cumulVol_1.getTradeCumulVolPriceImpactP; } });
Object.defineProperty(exports, "getCumulVolPriceImpact", { enumerable: true, get: function () { return cumulVol_1.getCumulVolPriceImpact; } });
Object.defineProperty(exports, "getProtectionCloseFactor", { enumerable: true, get: function () { return cumulVol_1.getProtectionCloseFactor; } });
Object.defineProperty(exports, "isProtectionCloseFactorActive", { enumerable: true, get: function () { return cumulVol_1.isProtectionCloseFactorActive; } });
Object.defineProperty(exports, "getCumulativeFactor", { enumerable: true, get: function () { return cumulVol_1.getCumulativeFactor; } });
Object.defineProperty(exports, "getLegacyFactor", { enumerable: true, get: function () { return cumulVol_1.getLegacyFactor; } });
Object.defineProperty(exports, "getFixedSpreadP", { enumerable: true, get: function () { return cumulVol_1.getFixedSpreadP; } });
Object.defineProperty(exports, "getSpreadP", { enumerable: true, get: function () { return cumulVol_1.getSpreadP; } });

},{"./priceImpact/cumulVol": "trade/priceImpact/cumulVol/index.js"}],
"trade/priceImpact/cumulVol/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Cumulative volume price impact calculations
 * @dev Mirrors contract's getTradeCumulVolPriceImpactP functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCumulVolContext = exports.convertOiWindowsSettingsArray = exports.convertOiWindows = exports.convertOiWindow = exports.convertOiWindowsSettings = exports.getSpreadWithPriceImpactP = exports.getCumulVolPriceImpact = exports.getSpreadWithCumulVolPriceImpactP = exports.getSpreadP = exports.getFixedSpreadP = exports.getTradeCumulVolPriceImpactP = exports.getLegacyFactor = exports.getCumulativeFactor = exports.isProtectionCloseFactorActive = exports.getProtectionCloseFactor = void 0;
const oiWindows_1 = require("../../oiWindows");
const constants_1 = require("../../../constants");
const types_1 = require("../../../contracts/types");
/**
 * @dev Gets the protection close factor with user multiplier
 * @param context Cumulative volume context
 * @returns Protection close factor (1 = 100%)
 */
const getProtectionCloseFactor = (context) => {
    const protectionCloseFactor = context === undefined ||
        context.contractsVersion === types_1.ContractsVersion.BEFORE_V9_2 ||
        context.isOpen === undefined ||
        context.isPnlPositive === undefined ||
        context.protectionCloseFactor === undefined ||
        (0, exports.isProtectionCloseFactorActive)(context) !== true
        ? constants_1.DEFAULT_PROTECTION_CLOSE_FACTOR
        : context.protectionCloseFactor;
    const protectionCloseFactorMultiplier = context?.userPriceImpact?.cumulVolPriceImpactMultiplier !== undefined &&
        context.userPriceImpact.cumulVolPriceImpactMultiplier > 0
        ? context.userPriceImpact.cumulVolPriceImpactMultiplier
        : 1;
    return protectionCloseFactor * protectionCloseFactorMultiplier;
};
exports.getProtectionCloseFactor = getProtectionCloseFactor;
/**
 * @dev Checks if protection close factor is active
 * @param context Cumulative volume context
 * @returns True if protection close factor should be applied
 */
const isProtectionCloseFactorActive = (context) => {
    if (context === undefined ||
        context.currentBlock === undefined ||
        context.createdBlock === undefined ||
        context.protectionCloseFactorBlocks === undefined ||
        context.protectionCloseFactor === undefined) {
        return undefined;
    }
    return (context.isPnlPositive === true &&
        context.isOpen === false &&
        context.protectionCloseFactor > 0 &&
        context.currentBlock <=
            context.createdBlock + context.protectionCloseFactorBlocks &&
        context.protectionCloseFactorWhitelist !== true);
};
exports.isProtectionCloseFactorActive = isProtectionCloseFactorActive;
/**
 * @dev Gets the cumulative factor for price impact calculation
 * @param context Cumulative volume context
 * @returns Cumulative factor (default 1)
 */
const getCumulativeFactor = (context) => {
    if (context === undefined ||
        context.cumulativeFactor === undefined ||
        context.cumulativeFactor === 0) {
        return constants_1.DEFAULT_CUMULATIVE_FACTOR;
    }
    return context.cumulativeFactor;
};
exports.getCumulativeFactor = getCumulativeFactor;
/**
 * @dev Gets the legacy factor for v9.2 compatibility
 * @param context Cumulative volume context
 * @returns 1 for pre-v9.2, 2 for v9.2+
 */
const getLegacyFactor = (context) => {
    return context?.contractsVersion === types_1.ContractsVersion.BEFORE_V9_2 ? 1 : 2;
};
exports.getLegacyFactor = getLegacyFactor;
/**
 * @dev Mirrors contract's _calculateDepthBandsPriceImpact function
 * @param tradeSizeUsd Trade size in USD (always positive here)
 * @param depthBandParams Depth band parameters
 * @returns Price impact percentage
 */
const _calculateDepthBandsPriceImpact = (tradeSizeUsd, depthBandParams) => {
    const totalDepthUsd = depthBandParams.depthBands.totalDepthUsd;
    if (totalDepthUsd === 0 || tradeSizeUsd === 0)
        return 0;
    let remainingSizeUsd = tradeSizeUsd;
    let totalWeightedPriceImpactP = 0;
    let prevBandDepthUsd = 0;
    let topOfPrevBandOffsetPpm = 0;
    for (let i = 0; i < 30 && remainingSizeUsd !== 0; i++) {
        const bandLiquidityPercentageBps = depthBandParams.depthBands.bands[i]; // Already in 0-1 format
        const topOfBandOffsetPpm = depthBandParams.depthBandsMapping.bands[i]; // Already in 0-1 format
        const bandDepthUsd = bandLiquidityPercentageBps * totalDepthUsd;
        // Skip if band has same depth as previous (would cause division by zero)
        if (bandDepthUsd <= prevBandDepthUsd) {
            prevBandDepthUsd = bandDepthUsd;
            topOfPrevBandOffsetPpm = topOfBandOffsetPpm;
            continue;
        }
        // Since bandDepthUsd represents liquidity from mid price to top of band, we need to subtract previous band depth
        const bandAvailableDepthUsd = bandDepthUsd - prevBandDepthUsd;
        let depthConsumedUsd;
        // At 100% band always consume all remaining size, even if more than band available depth
        if (bandLiquidityPercentageBps === 1 ||
            remainingSizeUsd <= bandAvailableDepthUsd) {
            depthConsumedUsd = remainingSizeUsd;
            remainingSizeUsd = 0;
        }
        else {
            // Normal case: consume entire band and continue to next
            depthConsumedUsd = bandAvailableDepthUsd;
            remainingSizeUsd -= bandAvailableDepthUsd;
        }
        // Calculate impact contribution from this band using trapezoidal rule
        // Low = previous band's price offset, High = current band's price offset
        const lowOffsetP = topOfPrevBandOffsetPpm;
        const offsetRangeP = topOfBandOffsetPpm - topOfPrevBandOffsetPpm;
        // Calculate average impact using trapezoidal rule: low + (range * fraction / 2)
        const avgImpactP = lowOffsetP +
            (offsetRangeP * depthConsumedUsd) / bandAvailableDepthUsd / 2;
        totalWeightedPriceImpactP += avgImpactP * depthConsumedUsd;
        // Update previous values for next iteration
        topOfPrevBandOffsetPpm = topOfBandOffsetPpm;
        prevBandDepthUsd = bandDepthUsd;
    }
    return totalWeightedPriceImpactP / tradeSizeUsd;
};
/**
 * @dev Mirrors contract's _getDepthBandsPriceImpactP function
 * @param cumulativeVolumeUsd Cumulative volume in USD (can be negative)
 * @param tradeSizeUsd Trade size in USD (can be negative)
 * @param depthBandParams Depth band parameters (contains both pair bands and global mapping)
 * @param priceImpactFactor Price impact factor (protection close factor)
 * @param cumulativeFactor Cumulative factor for volume impact
 * @returns Price impact percentage (can be negative)
 */
const _getDepthBandsPriceImpactP = (cumulativeVolumeUsd, tradeSizeUsd, depthBandParams, priceImpactFactor, cumulativeFactor) => {
    // Check for opposite signs
    if ((cumulativeVolumeUsd > 0 && tradeSizeUsd < 0) ||
        (cumulativeVolumeUsd < 0 && tradeSizeUsd > 0)) {
        throw new Error("Wrong params: cumulative volume and trade size have opposite signs");
    }
    const effectiveCumulativeVolumeUsd = cumulativeVolumeUsd * cumulativeFactor;
    const totalSizeLookupUsd = effectiveCumulativeVolumeUsd + tradeSizeUsd;
    const isNegative = totalSizeLookupUsd < 0;
    const effectiveCumulativeVolumeUsdUint = isNegative
        ? -effectiveCumulativeVolumeUsd
        : effectiveCumulativeVolumeUsd;
    const totalSizeLookupUsdUint = isNegative
        ? -totalSizeLookupUsd
        : totalSizeLookupUsd;
    const cumulativeVolPriceImpactP = _calculateDepthBandsPriceImpact(effectiveCumulativeVolumeUsdUint, depthBandParams);
    const totalSizePriceImpactP = _calculateDepthBandsPriceImpact(totalSizeLookupUsdUint, depthBandParams);
    const unscaledPriceImpactP = cumulativeVolPriceImpactP +
        (totalSizePriceImpactP - cumulativeVolPriceImpactP) / 2;
    const scaledPriceImpactP = unscaledPriceImpactP * priceImpactFactor;
    return isNegative ? -scaledPriceImpactP : scaledPriceImpactP;
};
/**
 * @dev Calculates cumulative volume price impact percentage
 * @dev Mirrors contract's getTradeCumulVolPriceImpactP function
 * @param trader Trader address
 * @param pairIndex Trading pair index
 * @param long True for long, false for short
 * @param tradeOpenInterestUsd Position size in USD
 * @param isPnlPositive Whether PnL is positive (only relevant when closing)
 * @param open True for opening, false for closing
 * @param lastPosIncreaseBlock Last block when position was increased (only relevant when closing)
 * @param context Additional context with depths, OI data, and factors
 * @returns Cumulative volume price impact percentage (not including spread)
 */
const getTradeCumulVolPriceImpactP = (_trader, // Unused - kept for compatibility
_pairIndex, // Unused - kept for compatibility
long, tradeOpenInterestUsd, isPnlPositive, open, lastPosIncreaseBlock, context) => {
    // Update context with passed parameters
    const updatedContext = {
        ...context,
        isOpen: open,
        isPnlPositive: isPnlPositive,
        createdBlock: context.createdBlock || lastPosIncreaseBlock,
    };
    if (
    // No price impact when closing pre-v9.2 trades
    (!open && context?.contractsVersion === types_1.ContractsVersion.BEFORE_V9_2) ||
        // No price impact for opens when `pair.exemptOnOpen` is true
        (open && context?.exemptOnOpen === true) ||
        // No price impact for closes after `protectionCloseFactor` has expired
        // when `pair.exemptAfterProtectionCloseFactor` is true
        (!open &&
            context?.exemptAfterProtectionCloseFactor === true &&
            (0, exports.isProtectionCloseFactorActive)(updatedContext) !== true)) {
        return 0;
    }
    const tradePositiveSkew = (long && open) || (!long && !open);
    const tradeSkewMultiplier = tradePositiveSkew ? 1 : -1;
    if (!context.pairDepthBands || !context.depthBandsMapping) {
        return 0;
    }
    // Select depth bands based on trade direction
    const depthBands = tradePositiveSkew
        ? context.pairDepthBands.above
        : context.pairDepthBands.below;
    // Return 0 if no depth bands configured (matching contract lines 588-590)
    if (!depthBands || depthBands.totalDepthUsd === 0) {
        return 0;
    }
    // Get active OI for cumulative volume calculation
    let activeOi = 0;
    if (context.oiWindowsSettings !== undefined) {
        activeOi =
            (0, oiWindows_1.getActiveOi)((0, oiWindows_1.getCurrentOiWindowId)(context.oiWindowsSettings), context.oiWindowsSettings.windowsCount, context.oiWindows, open ? long : !long) || 0;
    }
    const signedActiveOi = activeOi * tradeSkewMultiplier;
    const signedTradeOi = tradeOpenInterestUsd * tradeSkewMultiplier;
    // Calculate price impact using depth bands
    const priceImpactP = _getDepthBandsPriceImpactP(signedActiveOi, signedTradeOi, {
        depthBands: depthBands,
        depthBandsMapping: context.depthBandsMapping,
    }, (0, exports.getProtectionCloseFactor)(updatedContext), (0, exports.getCumulativeFactor)(updatedContext));
    return priceImpactP;
};
exports.getTradeCumulVolPriceImpactP = getTradeCumulVolPriceImpactP;
/**
 * @dev Gets the fixed spread percentage with direction
 * @dev Mirrors contract's getFixedSpreadP function
 * @param spreadP Total spread percentage (includes base + user spread)
 * @param long True for long position
 * @param open True for opening, false for closing
 * @returns Signed spread percentage (positive or negative based on direction)
 */
const getFixedSpreadP = (spreadP, long, open) => {
    // Reverse spread direction on close
    const effectiveLong = open ? long : !long;
    // Calculate half spread
    const fixedSpreadP = spreadP / 2;
    // Apply direction
    return effectiveLong ? fixedSpreadP : -fixedSpreadP;
};
exports.getFixedSpreadP = getFixedSpreadP;
/**
 * @dev Gets the base spread percentage
 * @param pairSpreadP Pair spread percentage
 * @param isLiquidation True if liquidation
 * @param liquidationParams Liquidation parameters
 * @param userPriceImpact User-specific price impact settings
 * @returns Base spread percentage
 * @todo Review if this function still makes sense or should use getFixedSpreadP pattern
 *       Currently it may double-count user fixed spread if pairSpreadP already includes it
 */
const getSpreadP = (pairSpreadP, isLiquidation, liquidationParams, userPriceImpact) => {
    const fixedSpreadP = userPriceImpact?.fixedSpreadP ?? 0;
    if (pairSpreadP === undefined || (pairSpreadP === 0 && fixedSpreadP === 0)) {
        return 0;
    }
    const spreadP = pairSpreadP / 2 + fixedSpreadP;
    return isLiquidation === true &&
        liquidationParams !== undefined &&
        liquidationParams.maxLiqSpreadP > 0 &&
        spreadP > liquidationParams.maxLiqSpreadP
        ? liquidationParams.maxLiqSpreadP
        : spreadP;
};
exports.getSpreadP = getSpreadP;
/**
 * @dev Gets spread with cumulative volume price impact
 * @dev This combines base spread + cumulative volume impact
 * @param pairSpreadP Base pair spread percentage
 * @param buy True for long, false for short
 * @param collateral Collateral amount
 * @param leverage Position leverage
 * @param oiWindowsSettings OI windows configuration
 * @param oiWindows Current OI windows data
 * @param context Additional context for the calculation
 * @returns Total spread + cumulative volume price impact percentage
 */
const getSpreadWithCumulVolPriceImpactP = (pairSpreadP, buy, collateral, leverage, context) => {
    if (pairSpreadP === undefined) {
        return 0;
    }
    const baseSpread = (0, exports.getSpreadP)(pairSpreadP, undefined, undefined, context?.userPriceImpact);
    // Calculate position size in USD
    const positionSizeUsd = collateral * leverage * (context?.collateralPriceUsd || 1);
    const cumulVolImpact = (0, exports.getTradeCumulVolPriceImpactP)("", // trader - not used in calculation
    0, // pairIndex - not used in calculation
    buy, positionSizeUsd, context?.isPnlPositive || false, context?.isOpen !== false, context?.createdBlock || 0, context);
    return baseSpread + cumulVolImpact;
};
exports.getSpreadWithCumulVolPriceImpactP = getSpreadWithCumulVolPriceImpactP;
/**
 * @dev Convenience function for calculating cumulative volume price impact
 * @dev Uses collateral and leverage instead of USD position size
 * @param buy True for long, false for short
 * @param collateral Collateral amount
 * @param leverage Position leverage
 * @param open True for opening, false for closing
 * @param context Full context including depths, OI data, and collateral price
 * @returns Cumulative volume price impact percentage
 */
const getCumulVolPriceImpact = (buy, collateral, leverage, open, context) => {
    const positionSizeUsd = collateral * leverage * context.collateralPriceUsd;
    return (0, exports.getTradeCumulVolPriceImpactP)("", // trader - not used in calculation
    0, // pairIndex - not used in calculation
    buy, positionSizeUsd, context.isPnlPositive || false, open, context.createdBlock || 0, context);
};
exports.getCumulVolPriceImpact = getCumulVolPriceImpact;
// Legacy export for backward compatibility
exports.getSpreadWithPriceImpactP = exports.getSpreadWithCumulVolPriceImpactP;
// Export converters
var converter_1 = require("./converter");
Object.defineProperty(exports, "convertOiWindowsSettings", { enumerable: true, get: function () { return converter_1.convertOiWindowsSettings; } });
Object.defineProperty(exports, "convertOiWindow", { enumerable: true, get: function () { return converter_1.convertOiWindow; } });
Object.defineProperty(exports, "convertOiWindows", { enumerable: true, get: function () { return converter_1.convertOiWindows; } });
Object.defineProperty(exports, "convertOiWindowsSettingsArray", { enumerable: true, get: function () { return converter_1.convertOiWindowsSettingsArray; } });
// Export builder
var builder_1 = require("./builder");
Object.defineProperty(exports, "buildCumulVolContext", { enumerable: true, get: function () { return builder_1.buildCumulVolContext; } });

},{"../../oiWindows": "trade/oiWindows.js", "../../../constants": "constants.js", "../../../contracts/types": "contracts/types/index.js", "./converter": "trade/priceImpact/cumulVol/converter.js", "./builder": "trade/priceImpact/cumulVol/builder.js"}],
"trade/oiWindows.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveOi = exports.getCurrentOiWindowId = void 0;
const getCurrentOiWindowId = (oiWindowSettings) => {
    return Math.floor((Math.floor(Date.now() / 1000) - oiWindowSettings.startTs) /
        oiWindowSettings.windowsDuration);
};
exports.getCurrentOiWindowId = getCurrentOiWindowId;
const getActiveOi = (currentOiWindowId, windowsCount, oiWindows, buy) => {
    if (oiWindows === undefined || windowsCount === 0)
        return 0;
    let activeOi = 0;
    for (let id = currentOiWindowId - (windowsCount - 1); id <= currentOiWindowId; id++) {
        activeOi +=
            (buy ? oiWindows?.[id]?.oiLongUsd : oiWindows?.[id]?.oiShortUsd) || 0;
    }
    return activeOi;
};
exports.getActiveOi = getActiveOi;

},{}],
"constants.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CUMULATIVE_FACTOR = exports.DEFAULT_PROTECTION_CLOSE_FACTOR = exports.delistedGroupsIxs = exports.delistedPairIxs = exports.corePairIndices = exports.stockSplits = exports.tickerChanges = exports.getAssetClassFromGroupIndex = exports.parentToSyntheticPairMap = exports.syntheticPairs = exports.pairs = void 0;
const CRYPTO = "crypto";
const FOREX = "forex";
const STOCKS = "stocks";
const INDICES = "indices";
const COMMODITIES = "commodities";
exports.pairs = {
    "BTC/USD": CRYPTO,
    "ETH/USD": CRYPTO,
    "LINK/USD": CRYPTO,
    "DOGE/USD": CRYPTO,
    "MATIC/USD": CRYPTO,
    "ADA/USD": CRYPTO,
    "SUSHI/USD": CRYPTO,
    "AAVE/USD": CRYPTO,
    "ALGO/USD": CRYPTO,
    "BAT/USD": CRYPTO,
    "COMP/USD": CRYPTO,
    "DOT/USD": CRYPTO,
    "EOS/USD": CRYPTO,
    "LTC/USD": CRYPTO,
    "MANA/USD": CRYPTO,
    "OMG/USD": CRYPTO,
    "SNX/USD": CRYPTO,
    "UNI/USD": CRYPTO,
    "XLM/USD": CRYPTO,
    "XRP/USD": CRYPTO,
    "ZEC/USD": CRYPTO,
    "EUR/USD": FOREX,
    "USD/JPY": FOREX,
    "GBP/USD": FOREX,
    "USD/CHF": FOREX,
    "AUD/USD": FOREX,
    "USD/CAD": FOREX,
    "NZD/USD": FOREX,
    "EUR/CHF": FOREX,
    "EUR/JPY": FOREX,
    "EUR/GBP": FOREX,
    "LUNA/USD": CRYPTO,
    "YFI/USD": CRYPTO,
    "SOL/USD": CRYPTO,
    "XTZ/USD": CRYPTO,
    "BCH/USD": CRYPTO,
    "BNT/USD": CRYPTO,
    "CRV/USD": CRYPTO,
    "DASH/USD": CRYPTO,
    "ETC/USD": CRYPTO,
    "ICP/USD": CRYPTO,
    "MKR/USD": CRYPTO,
    "NEO/USD": CRYPTO,
    "THETA/USD": CRYPTO,
    "TRX/USD": CRYPTO,
    "ZRX/USD": CRYPTO,
    "SAND/USD": CRYPTO,
    "BNB/USD": CRYPTO,
    "AXS/USD": CRYPTO,
    "GRT/USD": CRYPTO,
    "HBAR/USD": CRYPTO,
    "XMR/USD": CRYPTO,
    "ENJ/USD": CRYPTO,
    "FTM/USD": CRYPTO,
    "FTT/USD": CRYPTO,
    "APE/USD": CRYPTO,
    "CHZ/USD": CRYPTO,
    "SHIB/USD": CRYPTO,
    "AAPL/USD": STOCKS,
    "FB/USD": STOCKS,
    "GOOGL/USD": STOCKS,
    "AMZN/USD": STOCKS,
    "MSFT/USD": STOCKS,
    "TSLA/USD": STOCKS,
    "SNAP/USD": STOCKS,
    "NVDA/USD": STOCKS,
    "V/USD": STOCKS,
    "MA/USD": STOCKS,
    "PFE/USD": STOCKS,
    "KO/USD": STOCKS,
    "DIS/USD": STOCKS,
    "GME/USD": STOCKS,
    "NKE/USD": STOCKS,
    "AMD/USD": STOCKS,
    "PYPL/USD": STOCKS,
    "ABNB/USD": STOCKS,
    "BA/USD": STOCKS,
    "SBUX/USD": STOCKS,
    "WMT/USD": STOCKS,
    "INTC/USD": STOCKS,
    "MCD/USD": STOCKS,
    "META/USD": STOCKS,
    "GOOGL_1/USD": STOCKS,
    "GME_1/USD": STOCKS,
    "AMZN_1/USD": STOCKS,
    "TSLA_1/USD": STOCKS,
    "SPY/USD": INDICES,
    "QQQ/USD": INDICES,
    "IWM/USD": INDICES,
    "DIA/USD": INDICES,
    "XAU/USD": COMMODITIES,
    "XAG/USD": COMMODITIES,
    "USD/CNH": FOREX,
    "USD/SGD": FOREX,
    "EUR/SEK": FOREX,
    "USD/KRW": FOREX,
    "EUR/NOK": FOREX,
    "USD/INR": FOREX,
    "USD/MXN": FOREX,
    "USD/TWD": FOREX,
    "USD/ZAR": FOREX,
    "USD/BRL": FOREX,
    "AVAX/USD": CRYPTO,
    "ATOM/USD": CRYPTO,
    "NEAR/USD": CRYPTO,
    "QNT/USD": CRYPTO,
    "IOTA/USD": CRYPTO,
    "TON/USD": CRYPTO,
    "RPL/USD": CRYPTO,
    "ARB/USD": CRYPTO,
    "EUR/AUD": FOREX,
    "EUR/NZD": FOREX,
    "EUR/CAD": FOREX,
    "GBP/AUD": FOREX,
    "GBP/NZD": FOREX,
    "GBP/CAD": FOREX,
    "GBP/CHF": FOREX,
    "GBP/JPY": FOREX,
    "AUD/NZD": FOREX,
    "AUD/CAD": FOREX,
    "AUD/CHF": FOREX,
    "AUD/JPY": FOREX,
    "NZD/CAD": FOREX,
    "NZD/CHF": FOREX,
    "NZD/JPY": FOREX,
    "CAD/CHF": FOREX,
    "CAD/JPY": FOREX,
    "CHF/JPY": FOREX,
    "LDO/USD": CRYPTO,
    "INJ/USD": CRYPTO,
    "RUNE/USD": CRYPTO,
    "CAKE/USD": CRYPTO,
    "FXS/USD": CRYPTO,
    "TWT/USD": CRYPTO,
    "PEPE/USD": CRYPTO,
    "DYDX/USD": CRYPTO,
    "GMX/USD": CRYPTO,
    "FIL/USD": CRYPTO,
    "APT/USD": CRYPTO,
    "IMX/USD": CRYPTO,
    "VET/USD": CRYPTO,
    "OP/USD": CRYPTO,
    "RNDR/USD": CRYPTO,
    "EGLD/USD": CRYPTO,
    "TIA/USD": CRYPTO,
    "STX/USD": CRYPTO,
    "FLOW/USD": CRYPTO,
    "KAVA/USD": CRYPTO,
    "GALA/USD": CRYPTO,
    "MINA/USD": CRYPTO,
    "ORDI/USD": CRYPTO,
    "ILV/USD": CRYPTO,
    "KLAY/USD": CRYPTO,
    "SUI/USD": CRYPTO,
    "BLUR/USD": CRYPTO,
    "FET/USD": CRYPTO,
    "CFX/USD": CRYPTO,
    "BEAM/USD": CRYPTO,
    "AR/USD": CRYPTO,
    "SEI/USD": CRYPTO,
    "BTT/USD": CRYPTO,
    "ROSE/USD": CRYPTO,
    "WOO/USD": CRYPTO,
    "AGIX/USD": CRYPTO,
    "ZIL/USD": CRYPTO,
    "GMT/USD": CRYPTO,
    "ASTR/USD": CRYPTO,
    "1INCH/USD": CRYPTO,
    "FLOKI/USD": CRYPTO,
    "QTUM/USD": CRYPTO,
    "OCEAN/USD": CRYPTO,
    "WLD/USD": CRYPTO,
    "MASK/USD": CRYPTO,
    "CELO/USD": CRYPTO,
    "LRC/USD": CRYPTO,
    "ENS/USD": CRYPTO,
    "MEME/USD": CRYPTO,
    "ANKR/USD": CRYPTO,
    "IOTX/USD": CRYPTO,
    "ICX/USD": CRYPTO,
    "KSM/USD": CRYPTO,
    "RVN/USD": CRYPTO,
    "ANT/USD": CRYPTO,
    "WAVES/USD": CRYPTO,
    "SKL/USD": CRYPTO,
    "SUPER/USD": CRYPTO,
    "BAL/USD": CRYPTO,
    "WTI/USD": COMMODITIES,
    "XPT/USD": COMMODITIES,
    "XPD/USD": COMMODITIES,
    "HG/USD": COMMODITIES,
    "JUP/USD": CRYPTO,
    "MANTA/USD": CRYPTO,
    "BONK/USD": CRYPTO,
    "PENDLE/USD": CRYPTO,
    "OSMO/USD": CRYPTO,
    "ALT/USD": CRYPTO,
    "UMA/USD": CRYPTO,
    "MAGIC/USD": CRYPTO,
    "API3/USD": CRYPTO,
    "STRK/USD": CRYPTO,
    "DYM/USD": CRYPTO,
    "NTRN/USD": CRYPTO,
    "PYTH/USD": CRYPTO,
    "SC/USD": CRYPTO,
    "WIF/USD": CRYPTO,
    "PIXEL/USD": CRYPTO,
    "JTO/USD": CRYPTO,
    "MAVIA/USD": CRYPTO,
    "MYRO/USD": CRYPTO,
    "STG/USD": CRYPTO,
    "BOME/USD": CRYPTO,
    "ETHFI/USD": CRYPTO,
    "METIS/USD": CRYPTO,
    "AEVO/USD": CRYPTO,
    "ONDO/USD": CRYPTO,
    "MNT/USD": CRYPTO,
    "KAS/USD": CRYPTO,
    "RONIN/USD": CRYPTO,
    "ENA/USD": CRYPTO,
    "W/USD": CRYPTO,
    "ZEUS/USD": CRYPTO,
    "TNSR/USD": CRYPTO,
    "TAO/USD": CRYPTO,
    "OMNI/USD": CRYPTO,
    "PRCL/USD": CRYPTO,
    "MERL/USD": CRYPTO,
    "SAFE/USD": CRYPTO,
    "SAGA/USD": CRYPTO,
    "LL/USD": CRYPTO,
    "MSN/USD": CRYPTO,
    "REZ/USD": CRYPTO,
    "NOT/USD": CRYPTO,
    "IO/USD": CRYPTO,
    "BRETT/USD": CRYPTO,
    "ATH/USD": CRYPTO,
    "ZRO/USD": CRYPTO,
    "ZK/USD": CRYPTO,
    "LISTA/USD": CRYPTO,
    "BLAST/USD": CRYPTO,
    "RATS/USD": CRYPTO,
    "BNX/USD": CRYPTO,
    "PEOPLE/USD": CRYPTO,
    "TURBO/USD": CRYPTO,
    "SATS/USD": CRYPTO,
    "POPCAT/USD": CRYPTO,
    "MOG/USD": CRYPTO,
    "OM/USD": CRYPTO,
    "CORE/USD": CRYPTO,
    "JASMY/USD": CRYPTO,
    "DAR/USD": CRYPTO,
    "MEW/USD": CRYPTO,
    "DEGEN/USD": CRYPTO,
    "SLERF/USD": CRYPTO,
    "UXLINK/USD": CRYPTO,
    "AVAIL/USD": CRYPTO,
    "BANANA/USD": CRYPTO,
    "RARE/USD": CRYPTO,
    "SYS/USD": CRYPTO,
    "NMR/USD": CRYPTO,
    "RSR/USD": CRYPTO,
    "SYN/USD": CRYPTO,
    "AUCTION/USD": CRYPTO,
    "ALICE/USD": CRYPTO,
    "SUN/USD": CRYPTO,
    "TRB/USD": CRYPTO,
    "DOGS/USD": CRYPTO,
    "SSV/USD": CRYPTO,
    "PONKE/USD": CRYPTO,
    "POL/USD": CRYPTO,
    "RDNT/USD": CRYPTO,
    "FLUX/USD": CRYPTO,
    "NEIRO/USD": CRYPTO,
    "SUNDOG/USD": CRYPTO,
    "CAT/USD": CRYPTO,
    "BABYDOGE/USD": CRYPTO,
    "REEF/USD": CRYPTO,
    "CKB/USD": CRYPTO,
    "CATI/USD": CRYPTO,
    "LOOM/USD": CRYPTO,
    "ZETA/USD": CRYPTO,
    "HMSTR/USD": CRYPTO,
    "EIGEN/USD": CRYPTO,
    "POLYX/USD": CRYPTO,
    "MOODENG/USD": CRYPTO,
    "MOTHER/USD": CRYPTO,
    "AERO/USD": CRYPTO,
    "CVC/USD": CRYPTO,
    "NEIROCTO/USD": CRYPTO,
    "ARK/USD": CRYPTO,
    "NPC/USD": CRYPTO,
    "ORBS/USD": CRYPTO,
    "APU/USD": CRYPTO,
    "BSV/USD": CRYPTO,
    "HIPPO/USD": CRYPTO,
    "GOAT/USD": CRYPTO,
    "DOG/USD": CRYPTO,
    "HOT/USD": CRYPTO,
    "STORJ/USD": CRYPTO,
    "RAY/USD": CRYPTO,
    "BTCDEGEN/USD": CRYPTO,
    "PNUT/USD": CRYPTO,
    "ACT/USD": CRYPTO,
    "GRASS/USD": CRYPTO,
    "ZEN/USD": CRYPTO,
    "LUMIA/USD": CRYPTO,
    "ALPH/USD": CRYPTO,
    "VIRTUAL/USD": CRYPTO,
    "SPX/USD": CRYPTO,
    "ACX/USD": CRYPTO,
    "CHILLGUY/USD": CRYPTO,
    "CHEX/USD": CRYPTO,
    "BITCOIN/USD": CRYPTO,
    "ETHDEGEN/USD": CRYPTO,
    "SOLDEGEN/USD": CRYPTO,
    "MOVE/USD": CRYPTO,
    "ME/USD": CRYPTO,
    "COW/USD": CRYPTO,
    "AVA/USD": CRYPTO,
    "USUAL/USD": CRYPTO,
    "PENGU/USD": CRYPTO,
    "FARTCOIN/USD": CRYPTO,
    "ZEREBRO/USD": CRYPTO,
    "AI16Z/USD": CRYPTO,
    "AIXBT/USD": CRYPTO,
    "BIO/USD": CRYPTO,
    "XRPDEGEN/USD": CRYPTO,
    "BNBDEGEN/USD": CRYPTO,
    "TRUMP/USD": CRYPTO,
    "MELANIA/USD": CRYPTO,
    "MODE/USD": CRYPTO,
    "HYPE/USD": CRYPTO,
    "S/USD": CRYPTO,
    "ARC/USD": CRYPTO,
    "ARKM/USD": CRYPTO,
    "GRIFFAIN/USD": CRYPTO,
    "SWARMS/USD": CRYPTO,
    "ANIME/USD": CRYPTO,
    "PLUME/USD": CRYPTO,
    "VVV/USD": CRYPTO,
    "VINE/USD": CRYPTO,
    "TOSHI/USD": CRYPTO,
    "BERA/USD": CRYPTO,
    "LAYER/USD": CRYPTO,
    "CHEEMS/USD": CRYPTO,
    "SOLV/USD": CRYPTO,
    "TST/USD": CRYPTO,
    "IP/USD": CRYPTO,
    "KAITO/USD": CRYPTO,
    "ELX/USD": CRYPTO,
    "PI/USD": CRYPTO,
    "SHELL/USD": CRYPTO,
    "BMT/USD": CRYPTO,
    "BROCCOLI/USD": CRYPTO,
    "TUT/USD": CRYPTO,
    "GPS/USD": CRYPTO,
    "RED/USD": CRYPTO,
    "MUBARAK/USD": CRYPTO,
    "FORM/USD": CRYPTO,
    "WAL/USD": CRYPTO,
    "NIL/USD": CRYPTO,
    "PARTI/USD": CRYPTO,
    "SIREN/USD": CRYPTO,
    "BANANAS31/USD": CRYPTO,
    "HYPER/USD": CRYPTO,
    "PROMPT/USD": CRYPTO,
    "RFC/USD": CRYPTO,
    "WCT/USD": CRYPTO,
    "BIGTIME/USD": CRYPTO,
    "BABY/USD": CRYPTO,
    "COOKIE/USD": CRYPTO,
    "KMNO/USD": CRYPTO,
    "INIT/USD": CRYPTO,
    "SYRUP/USD": CRYPTO,
    "SIGN/USD": CRYPTO,
    "ZORA/USD": CRYPTO,
    "COIN/USD": STOCKS,
    "HOOD/USD": STOCKS,
    "MSTR/USD": STOCKS,
    "NFLX/USD": STOCKS,
    "LAUNCHCOIN/USD": CRYPTO,
    "NXPC/USD": CRYPTO,
    "SOPH/USD": CRYPTO,
    "LPT/USD": CRYPTO,
    "BVIV/USD": CRYPTO,
    "EVIV/USD": CRYPTO,
    "CRCL/USD": STOCKS,
    "RESOLV/USD": CRYPTO,
    "SQD/USD": CRYPTO,
    "TAIKO/USD": CRYPTO,
    "HOME/USD": CRYPTO,
    "B/USD": CRYPTO,
    "HUMA/USD": CRYPTO,
    "SBET/USD": STOCKS,
    "PLTR/USD": STOCKS,
    "BIDU/USD": STOCKS,
    "ROKU/USD": STOCKS,
    "LMT/USD": STOCKS,
    "RIOT/USD": STOCKS,
    "MARA/USD": STOCKS,
    "LOKA/USD": CRYPTO,
    "STO/USD": CRYPTO,
    "FUN/USD": CRYPTO,
    "KNC/USD": CRYPTO,
    "H/USD": CRYPTO,
    "ICNT/USD": CRYPTO,
    "NEWT/USD": CRYPTO,
    "PUMP/USD": CRYPTO,
    "SAROS/USD": CRYPTO,
    "SPK/USD": CRYPTO,
    "ERA/USD": CRYPTO,
    "BGSC/USD": CRYPTO,
    "TAG/USD": CRYPTO,
    "WLFI/USD": CRYPTO,
    "ASTER/USD": CRYPTO,
    "OKB/USD": CRYPTO,
    "CRO/USD": CRYPTO,
    "SKY/USD": CRYPTO,
    "XPL/USD": CRYPTO,
    "AVNT/USD": CRYPTO,
    "APEX/USD": CRYPTO,
    "ORDER/USD": CRYPTO,
    "DRIFT/USD": CRYPTO,
    "MYX/USD": CRYPTO,
    "NOM/USD": CRYPTO,
    "FLUID/USD": CRYPTO,
    "LQTY/USD": CRYPTO,
    "L3/USD": CRYPTO,
    "CAMP/USD": CRYPTO,
    "SOMI/USD": CRYPTO,
    "HEMI/USD": CRYPTO,
    "FF/USD": CRYPTO,
    "USELESS/USD": CRYPTO,
    "MON/USD": CRYPTO,
    "MET/USD": CRYPTO,
    "TURTLE/USD": CRYPTO,
    "SPX500/USD": INDICES,
    "NAS100/USD": INDICES,
    "USA30/USD": INDICES,
    "NFLX_1/USD": STOCKS,
    "STABLE/USD": CRYPTO,
    "VOOI/USD": CRYPTO,
    "LIT/USD": CRYPTO,
    "DUSK/USD": CRYPTO,
    "SCRT/USD": CRYPTO,
    "DCR/USD": CRYPTO,
    "GDX/USD": INDICES,
    "URA/USD": INDICES,
    "WPM/USD": STOCKS,
    "NATGAS/USD": COMMODITIES,
    "BRENT/USD": COMMODITIES,
    "URNM/USD": INDICES,
    "HYPEDEGEN/USD": CRYPTO,
    "MEGA/USD": CRYPTO,
};
exports.syntheticPairs = new Set([
    "BTCDEGEN/USD",
    "ETHDEGEN/USD",
    "SOLDEGEN/USD",
    "XRPDEGEN/USD",
    "BNBDEGEN/USD",
    "HYPEDEGEN/USD",
]);
exports.parentToSyntheticPairMap = new Map([
    ["BTC/USD", "BTCDEGEN/USD"],
    ["ETH/USD", "ETHDEGEN/USD"],
    ["SOL/USD", "SOLDEGEN/USD"],
    ["XRP/USD", "XRPDEGEN/USD"],
    ["BNB/USD", "BNBDEGEN/USD"],
    ["HYPE/USD", "HYPEDEGEN/USD"],
]);
const getAssetClassFromGroupIndex = (groupIndex) => {
    switch (groupIndex) {
        case 0:
        case 10:
        case 11:
            return CRYPTO;
        case 1:
        case 8:
        case 9:
            return FOREX;
        case 2:
        case 3:
        case 4:
            return STOCKS;
        case 5:
            return INDICES;
        case 6:
        case 7:
            return COMMODITIES;
    }
};
exports.getAssetClassFromGroupIndex = getAssetClassFromGroupIndex;
exports.tickerChanges = {
    FB: { newTicker: "META", date: "06/09/2022" },
};
exports.stockSplits = {
    "AMZN_1/USD": { date: "6/6/2022", split: 20 },
    "GOOGL_1/USD": { date: "7/18/2022", split: 20 },
    "GME_1/USD": { date: "7/22/2022", split: 4 },
    "TSLA_1/USD": { date: "8/25/2022", split: 3 },
    "NFLX_1/USD": { date: "11/17/2025", split: 10 },
};
exports.corePairIndices = new Set([
    0, 1, 2, 3, 5, 7, 8, 11, 12, 13, 17, 18, 19, 20, 33, 35, 39, 40, 41, 44, 47,
    49, 50, 57, 90, 91, 102, 103, 104, 105, 107, 109, 129, 134, 137, 138, 139,
    140, 141, 142, 144, 145, 153, 155, 159, 168, 171, 188, 189, 190, 191, 193,
    205, 215, 216, 217, 219, 223, 269, 299, 307, 320, 321, 328, 331, 332, 347,
    358, 407, 413, 414, 418, 442,
]);
exports.delistedPairIxs = new Set([
    4, 6, 12, 15, 24, 25, 27, 28, 30, 31, 36, 41, 52, 53, 54, 59, 60, 61, 63, 66,
    67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 95, 96, 97, 98, 99, 101, 106,
    111, 113, 114, 116, 118, 120, 122, 123, 125, 127, 130, 147, 152, 160, 163,
    170, 179, 182, 183, 186, 198, 208, 209, 221, 224, 225, 227, 229, 230, 231,
    234, 238, 239, 241, 247, 250, 253, 254, 255, 258, 261, 268, 270, 272, 273,
    275, 276, 278, 279, 280, 281, 284, 285, 290, 291, 292, 294, 296, 298, 303,
    305, 306, 311, 312, 322, 323, 330, 333, 335, 336, 337, 341, 342, 343, 344,
    346, 347, 349, 350, 351, 352, 353, 354, 355, 357, 362, 365, 366, 372, 379,
    380, 387, 395, 396, 400, 401, 408, 423, 427, 428, 430, 435, 436, 437, 438,
    441,
]);
exports.delistedGroupsIxs = new Set([]);
exports.DEFAULT_PROTECTION_CLOSE_FACTOR = 1;
exports.DEFAULT_CUMULATIVE_FACTOR = 1;

},{}],
"trade/priceImpact/cumulVol/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for cumulative volume price impact data between contract and SDK formats
 * @dev All BigNumber values are normalized to floats with appropriate precision
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPairDepthBandsFromSlots = exports.convertPairDepthBandsDecoded = exports.validateDepthBandsMapping = exports.validateDepthBands = exports.convertDepthBandsMapping = exports.convertPairDepthBands = exports.convertDepthBands = exports.convertOiWindowsSettingsArray = exports.convertOiWindows = exports.convertOiWindow = exports.convertOiWindowsSettings = void 0;
const depthBands_1 = require("../../../pricing/depthBands");
/**
 * @dev Converts contract OI windows settings to SDK format
 * @param contractData Contract OiWindowsSettings struct
 * @returns Normalized OI windows settings
 */
const convertOiWindowsSettings = (contractData) => {
    return {
        startTs: Number(contractData.startTs),
        windowsDuration: Number(contractData.windowsDuration),
        windowsCount: Number(contractData.windowsCount),
    };
};
exports.convertOiWindowsSettings = convertOiWindowsSettings;
/**
 * @dev Converts contract PairOi data to SDK OiWindow format
 * @param contractData Contract PairOi struct with USD values
 * @returns Normalized OI window data
 */
const convertOiWindow = (contractData) => {
    // USD values are stored as 1e18 in contract
    return {
        oiLongUsd: Number(contractData.oiLongUsd) / 1e18,
        oiShortUsd: Number(contractData.oiShortUsd) / 1e18,
    };
};
exports.convertOiWindow = convertOiWindow;
/**
 * @dev Converts array of OI windows from contract format
 * @param windowIds Array of window IDs (as strings for mapping)
 * @param contractWindows Array of PairOi data from contract
 * @returns Normalized OI windows mapping
 */
const convertOiWindows = (windowIds, contractWindows) => {
    if (windowIds.length !== contractWindows.length) {
        throw new Error("Window IDs and data arrays must have the same length");
    }
    const windows = {};
    windowIds.forEach((id, index) => {
        windows[id] = (0, exports.convertOiWindow)(contractWindows[index]);
    });
    return windows;
};
exports.convertOiWindows = convertOiWindows;
/**
 * @dev Batch converter for multiple OI windows settings
 * @param contractDataArray Array of contract OiWindowsSettings
 * @returns Array of normalized OI windows settings
 */
const convertOiWindowsSettingsArray = (contractDataArray) => {
    return contractDataArray.map(exports.convertOiWindowsSettings);
};
exports.convertOiWindowsSettingsArray = convertOiWindowsSettingsArray;
/**
 * @dev Converts decoded depth bands from contract to SDK format
 * @param totalDepthUsd Total depth in USD (already decoded from contract)
 * @param bandsBps Array of 30 band percentages in basis points from contract
 * @returns Normalized depth bands with bands in 0-1 range
 */
const convertDepthBands = (totalDepthUsd, bandsBps) => {
    // Convert bands from basis points to 0-1 range
    const bands = bandsBps.map(bps => bps / 10000);
    return {
        totalDepthUsd,
        bands,
    };
};
exports.convertDepthBands = convertDepthBands;
/**
 * @dev Converts decoded pair depth bands from contract to SDK format
 * @param aboveDepth Decoded above depth bands from getPairDepthBandsDecoded
 * @param belowDepth Decoded below depth bands from getPairDepthBandsDecoded
 * @returns Normalized pair depth bands with above/below
 */
const convertPairDepthBands = (aboveDepth, belowDepth) => {
    // Convert above bands if configured
    const above = aboveDepth && aboveDepth.totalDepthUsd > 0
        ? (0, exports.convertDepthBands)(aboveDepth.totalDepthUsd, aboveDepth.bands)
        : undefined;
    // Convert below bands if configured
    const below = belowDepth && belowDepth.totalDepthUsd > 0
        ? (0, exports.convertDepthBands)(belowDepth.totalDepthUsd, belowDepth.bands)
        : undefined;
    return {
        above,
        below,
    };
};
exports.convertPairDepthBands = convertPairDepthBands;
/**
 * @dev Converts decoded depth bands mapping from contract to SDK format
 * @param bandsBps Array of 30 band offset values in basis points from getDepthBandsMappingDecoded
 * @returns Normalized depth bands mapping with offset values in 0-1 range
 */
const convertDepthBandsMapping = (bandsBps) => {
    // Convert bands from basis points to 0-1 range
    const bands = bandsBps.map(bps => bps / 10000);
    return {
        bands,
    };
};
exports.convertDepthBandsMapping = convertDepthBandsMapping;
/**
 * @dev Validates depth bands have correct number of bands
 * @param depthBands Depth bands to validate
 * @returns True if valid (30 bands)
 */
const validateDepthBands = (depthBands) => {
    return depthBands.bands.length === 30;
};
exports.validateDepthBands = validateDepthBands;
/**
 * @dev Validates depth bands mapping has correct number of bands
 * @param mapping Depth bands mapping to validate
 * @returns True if valid (30 bands)
 */
const validateDepthBandsMapping = (mapping) => {
    return mapping.bands.length === 30;
};
exports.validateDepthBandsMapping = validateDepthBandsMapping;
/**
 * @dev Alternative converter for decoded pair depth bands from contract
 * @param contractData Decoded pair depth bands from getPairDepthBandsDecoded
 * @returns Normalized pair depth bands
 */
const convertPairDepthBandsDecoded = (contractData) => {
    return (0, exports.convertPairDepthBands)(contractData.above, contractData.below);
};
exports.convertPairDepthBandsDecoded = convertPairDepthBandsDecoded;
/**
 * @dev Alternative converter for raw slot-based pair depth bands (if needed for legacy)
 * @param aboveSlot1 First slot for above bands
 * @param aboveSlot2 Second slot for above bands
 * @param belowSlot1 First slot for below bands
 * @param belowSlot2 Second slot for below bands
 * @returns Normalized pair depth bands
 */
const convertPairDepthBandsFromSlots = (aboveSlot1, aboveSlot2, belowSlot1, belowSlot2) => {
    // Use the decoding functions from pricing module if raw slots are provided
    const above = aboveSlot1 !== BigInt(0) || aboveSlot2 !== BigInt(0)
        ? (0, depthBands_1.decodeDepthBands)(aboveSlot1, aboveSlot2)
        : undefined;
    const below = belowSlot1 !== BigInt(0) || belowSlot2 !== BigInt(0)
        ? (0, depthBands_1.decodeDepthBands)(belowSlot1, belowSlot2)
        : undefined;
    return (0, exports.convertPairDepthBands)(above, below);
};
exports.convertPairDepthBandsFromSlots = convertPairDepthBandsFromSlots;

},{"../../../pricing/depthBands": "pricing/depthBands.js"}],
"pricing/depthBands.js":[function(require,module,exports){
"use strict";
/**
 * @dev Depth bands encoding/decoding functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeDepthBandsMapping = exports.encodeDepthBandsMapping = exports.decodeDepthBands = exports.encodeDepthBands = void 0;
const DEPTH_BANDS_COUNT = 30;
const DEPTH_BANDS_PER_SLOT1 = 14;
/**
 * Encode depth bands data into two uint256 slots
 * @param totalDepthUsd Total depth in USD (must fit in uint32)
 * @param bandPercentagesBps Array of 30 band percentages in basis points
 * @returns Two slots as bigints
 */
function encodeDepthBands(totalDepthUsd, bandPercentagesBps) {
    // Pack slot1: totalDepthUsd (32 bits) + bands 0-13 (14 * 16 bits)
    let slot1 = BigInt(totalDepthUsd);
    for (let i = 0; i < DEPTH_BANDS_PER_SLOT1; i++) {
        const shift = 32 + i * 16;
        slot1 |= BigInt(bandPercentagesBps[i]) << BigInt(shift);
    }
    // Pack slot2: bands 14-29 (16 * 16 bits)
    let slot2 = BigInt(0);
    for (let i = DEPTH_BANDS_PER_SLOT1; i < DEPTH_BANDS_COUNT; i++) {
        const shift = (i - DEPTH_BANDS_PER_SLOT1) * 16;
        slot2 |= BigInt(bandPercentagesBps[i]) << BigInt(shift);
    }
    return { slot1, slot2 };
}
exports.encodeDepthBands = encodeDepthBands;
/**
 * Decode depth bands from two uint256 slots
 * @param slot1 First slot containing totalDepthUsd and bands 0-13
 * @param slot2 Second slot containing bands 14-29
 * @returns Total depth and array of band percentages
 */
function decodeDepthBands(slot1, slot2) {
    const totalDepthUsd = Number(slot1 & BigInt(0xffffffff));
    const bands = [];
    // Extract bands 0-13 from slot1
    for (let i = 0; i < DEPTH_BANDS_PER_SLOT1; i++) {
        const shift = 32 + i * 16;
        bands.push(Number((slot1 >> BigInt(shift)) & BigInt(0xffff)));
    }
    // Extract bands 14-29 from slot2
    for (let i = DEPTH_BANDS_PER_SLOT1; i < DEPTH_BANDS_COUNT; i++) {
        const shift = (i - DEPTH_BANDS_PER_SLOT1) * 16;
        bands.push(Number((slot2 >> BigInt(shift)) & BigInt(0xffff)));
    }
    return { totalDepthUsd, bands };
}
exports.decodeDepthBands = decodeDepthBands;
/**
 * Encode depth bands mapping (global offsets for all pairs)
 * @param bands Array of 30 band offset values in ppm
 * @returns Two slots as bigints
 */
function encodeDepthBandsMapping(bands) {
    // Pack slot1: bands 0-13 (starting at bit 32, first 32 bits unused)
    let slot1 = BigInt(0);
    for (let i = 0; i < DEPTH_BANDS_PER_SLOT1; i++) {
        const shift = 32 + i * 16; // Start at bit 32 to match contract
        slot1 |= BigInt(bands[i]) << BigInt(shift);
    }
    // Pack slot2: bands 14-29 (16 * 16 bits)
    let slot2 = BigInt(0);
    for (let i = DEPTH_BANDS_PER_SLOT1; i < DEPTH_BANDS_COUNT; i++) {
        const shift = (i - DEPTH_BANDS_PER_SLOT1) * 16;
        slot2 |= BigInt(bands[i]) << BigInt(shift);
    }
    return { slot1, slot2 };
}
exports.encodeDepthBandsMapping = encodeDepthBandsMapping;
/**
 * Decode depth bands mapping from two uint256 slots
 * @param slot1 First slot containing bands 0-13 (starting at bit 32, first 32 bits unused)
 * @param slot2 Second slot containing bands 14-29
 * @returns Array of band offset values in ppm
 */
function decodeDepthBandsMapping(slot1, slot2) {
    const bands = [];
    // Extract bands 0-13 from slot1 (skip first 32 bits which are unused for mappings)
    for (let i = 0; i < DEPTH_BANDS_PER_SLOT1; i++) {
        const shift = 32 + i * 16; // Start at bit 32, not bit 0
        bands.push(Number((slot1 >> BigInt(shift)) & BigInt(0xffff)));
    }
    // Extract bands 14-29 from slot2
    for (let i = DEPTH_BANDS_PER_SLOT1; i < DEPTH_BANDS_COUNT; i++) {
        const shift = (i - DEPTH_BANDS_PER_SLOT1) * 16;
        bands.push(Number((slot2 >> BigInt(shift)) & BigInt(0xffff)));
    }
    return bands;
}
exports.decodeDepthBandsMapping = decodeDepthBandsMapping;

},{}],
"trade/priceImpact/cumulVol/builder.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCumulVolContext = void 0;
/**
 * @dev Builds cumulative volume price impact sub-context for a specific pair
 * @param globalTradingVariables The transformed global trading variables from backend
 * @param collateralIndex The collateral index (1-based)
 * @param pairIndex The pair index
 * @param additionalParams Additional parameters not available in trading variables
 * @returns Cumulative volume context ready for getTradeCumulVolPriceImpactP
 */
const buildCumulVolContext = (globalTradingVariables, collateralIndex, pairIndex, additionalParams) => {
    const collateral = globalTradingVariables.collaterals[collateralIndex - 1];
    if (!collateral) {
        return undefined;
    }
    // Get pair-specific data from global variables
    const pairDepthBands = globalTradingVariables.pairDepthBands?.[pairIndex];
    const depthBandsMapping = globalTradingVariables.depthBandsMapping;
    const pairFactor = globalTradingVariables.pairFactors?.[pairIndex];
    const oiWindows = globalTradingVariables.oiWindows?.[pairIndex];
    // Get OI windows settings (same for all pairs)
    // OI windows settings from global trading variables are already in SDK format
    const oiWindowsSettings = globalTradingVariables.oiWindowsSettings;
    // Get user-specific parameters from additionalParams
    const userPriceImpact = additionalParams.userPriceImpact;
    const protectionCloseFactorWhitelist = additionalParams.protectionCloseFactorWhitelist;
    // Get liquidation params - check both pair and group level
    const liquidationParams = globalTradingVariables.liquidationParams?.pairs?.[pairIndex] ||
        globalTradingVariables.liquidationParams?.groups?.[0]; // fallback to first group
    return {
        // Trade state
        isOpen: additionalParams.isOpen,
        isPnlPositive: additionalParams.isPnlPositive,
        createdBlock: additionalParams.createdBlock,
        // Protection factors
        liquidationParams,
        currentBlock: additionalParams.currentBlock,
        contractsVersion: additionalParams.contractsVersion,
        protectionCloseFactorWhitelist,
        // Price impact data
        pairDepthBands,
        depthBandsMapping,
        oiWindowsSettings,
        oiWindows,
        // User/collateral specific
        userPriceImpact,
        collateralPriceUsd: collateral.prices?.collateralPriceUsd || 1,
        // Pair factors (spread across the context)
        ...pairFactor,
    };
};
exports.buildCumulVolContext = buildCumulVolContext;

},{}],
"trade/types.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairIndex = exports.TradeType = exports.CounterType = exports.PendingOrderType = exports.PositionType = void 0;
var PositionType;
(function (PositionType) {
    PositionType["LONG"] = "LONG";
    PositionType["SHORT"] = "SHORT";
})(PositionType = exports.PositionType || (exports.PositionType = {}));
var PendingOrderType;
(function (PendingOrderType) {
    PendingOrderType[PendingOrderType["MARKET_OPEN"] = 0] = "MARKET_OPEN";
    PendingOrderType[PendingOrderType["MARKET_CLOSE"] = 1] = "MARKET_CLOSE";
    PendingOrderType[PendingOrderType["LIMIT_OPEN"] = 2] = "LIMIT_OPEN";
    PendingOrderType[PendingOrderType["STOP_OPEN"] = 3] = "STOP_OPEN";
    PendingOrderType[PendingOrderType["TP_CLOSE"] = 4] = "TP_CLOSE";
    PendingOrderType[PendingOrderType["SL_CLOSE"] = 5] = "SL_CLOSE";
    PendingOrderType[PendingOrderType["LIQ_CLOSE"] = 6] = "LIQ_CLOSE";
})(PendingOrderType = exports.PendingOrderType || (exports.PendingOrderType = {}));
var CounterType;
(function (CounterType) {
    CounterType[CounterType["TRADE"] = 0] = "TRADE";
    CounterType[CounterType["PENDING_ORDER"] = 1] = "PENDING_ORDER";
})(CounterType = exports.CounterType || (exports.CounterType = {}));
var TradeType;
(function (TradeType) {
    TradeType[TradeType["TRADE"] = 0] = "TRADE";
    TradeType[TradeType["LIMIT"] = 1] = "LIMIT";
    TradeType[TradeType["STOP"] = 2] = "STOP";
})(TradeType = exports.TradeType || (exports.TradeType = {}));
var PairIndex;
(function (PairIndex) {
    PairIndex[PairIndex["BTCUSD"] = 0] = "BTCUSD";
    PairIndex[PairIndex["ETHUSD"] = 1] = "ETHUSD";
    PairIndex[PairIndex["LINKUSD"] = 2] = "LINKUSD";
    PairIndex[PairIndex["DOGEUSD"] = 3] = "DOGEUSD";
    PairIndex[PairIndex["MATICUSD"] = 4] = "MATICUSD";
    PairIndex[PairIndex["ADAUSD"] = 5] = "ADAUSD";
    PairIndex[PairIndex["SUSHIUSD"] = 6] = "SUSHIUSD";
    PairIndex[PairIndex["AAVEUSD"] = 7] = "AAVEUSD";
    PairIndex[PairIndex["ALGOUSD"] = 8] = "ALGOUSD";
    PairIndex[PairIndex["BATUSD"] = 9] = "BATUSD";
    PairIndex[PairIndex["COMPUSD"] = 10] = "COMPUSD";
    PairIndex[PairIndex["DOTUSD"] = 11] = "DOTUSD";
    PairIndex[PairIndex["EOSUSD"] = 12] = "EOSUSD";
    PairIndex[PairIndex["LTCUSD"] = 13] = "LTCUSD";
    PairIndex[PairIndex["MANAUSD"] = 14] = "MANAUSD";
    PairIndex[PairIndex["OMGUSD"] = 15] = "OMGUSD";
    PairIndex[PairIndex["SNXUSD"] = 16] = "SNXUSD";
    PairIndex[PairIndex["UNIUSD"] = 17] = "UNIUSD";
    PairIndex[PairIndex["XLMUSD"] = 18] = "XLMUSD";
    PairIndex[PairIndex["XRPUSD"] = 19] = "XRPUSD";
    PairIndex[PairIndex["ZECUSD"] = 20] = "ZECUSD";
    PairIndex[PairIndex["EURUSD"] = 21] = "EURUSD";
    PairIndex[PairIndex["USDJPY"] = 22] = "USDJPY";
    PairIndex[PairIndex["GBPUSD"] = 23] = "GBPUSD";
    PairIndex[PairIndex["USDCHF"] = 24] = "USDCHF";
    PairIndex[PairIndex["AUDUSD"] = 25] = "AUDUSD";
    PairIndex[PairIndex["USDCAD"] = 26] = "USDCAD";
    PairIndex[PairIndex["NZDUSD"] = 27] = "NZDUSD";
    PairIndex[PairIndex["EURCHF"] = 28] = "EURCHF";
    PairIndex[PairIndex["EURJPY"] = 29] = "EURJPY";
    PairIndex[PairIndex["EURGBP"] = 30] = "EURGBP";
    PairIndex[PairIndex["LUNAUSD"] = 31] = "LUNAUSD";
    PairIndex[PairIndex["YFIUSD"] = 32] = "YFIUSD";
    PairIndex[PairIndex["SOLUSD"] = 33] = "SOLUSD";
    PairIndex[PairIndex["XTZUSD"] = 34] = "XTZUSD";
    PairIndex[PairIndex["BCHUSD"] = 35] = "BCHUSD";
    PairIndex[PairIndex["BNTUSD"] = 36] = "BNTUSD";
    PairIndex[PairIndex["CRVUSD"] = 37] = "CRVUSD";
    PairIndex[PairIndex["DASHUSD"] = 38] = "DASHUSD";
    PairIndex[PairIndex["ETCUSD"] = 39] = "ETCUSD";
    PairIndex[PairIndex["ICPUSD"] = 40] = "ICPUSD";
    PairIndex[PairIndex["MKRUSD"] = 41] = "MKRUSD";
    PairIndex[PairIndex["NEOUSD"] = 42] = "NEOUSD";
    PairIndex[PairIndex["THETAUSD"] = 43] = "THETAUSD";
    PairIndex[PairIndex["TRXUSD"] = 44] = "TRXUSD";
    PairIndex[PairIndex["ZRXUSD"] = 45] = "ZRXUSD";
    PairIndex[PairIndex["SANDUSD"] = 46] = "SANDUSD";
    PairIndex[PairIndex["BNBUSD"] = 47] = "BNBUSD";
    PairIndex[PairIndex["AXSUSD"] = 48] = "AXSUSD";
    PairIndex[PairIndex["GRTUSD"] = 49] = "GRTUSD";
    PairIndex[PairIndex["HBARUSD"] = 50] = "HBARUSD";
    PairIndex[PairIndex["XMRUSD"] = 51] = "XMRUSD";
    PairIndex[PairIndex["ENJUSD"] = 52] = "ENJUSD";
    PairIndex[PairIndex["FTMUSD"] = 53] = "FTMUSD";
    PairIndex[PairIndex["FTTUSD"] = 54] = "FTTUSD";
    PairIndex[PairIndex["APEUSD"] = 55] = "APEUSD";
    PairIndex[PairIndex["CHZUSD"] = 56] = "CHZUSD";
    PairIndex[PairIndex["SHIBUSD"] = 57] = "SHIBUSD";
    PairIndex[PairIndex["AAPLUSD"] = 58] = "AAPLUSD";
    PairIndex[PairIndex["FBUSD"] = 59] = "FBUSD";
    PairIndex[PairIndex["GOOGLUSD"] = 60] = "GOOGLUSD";
    PairIndex[PairIndex["AMZNUSD"] = 61] = "AMZNUSD";
    PairIndex[PairIndex["MSFTUSD"] = 62] = "MSFTUSD";
    PairIndex[PairIndex["TSLAUSD"] = 63] = "TSLAUSD";
    PairIndex[PairIndex["SNAPUSD"] = 64] = "SNAPUSD";
    PairIndex[PairIndex["NVDAUSD"] = 65] = "NVDAUSD";
    PairIndex[PairIndex["VUSD"] = 66] = "VUSD";
    PairIndex[PairIndex["MAUSD"] = 67] = "MAUSD";
    PairIndex[PairIndex["PFEUSD"] = 68] = "PFEUSD";
    PairIndex[PairIndex["KOUSD"] = 69] = "KOUSD";
    PairIndex[PairIndex["DISUSD"] = 70] = "DISUSD";
    PairIndex[PairIndex["GMEUSD"] = 71] = "GMEUSD";
    PairIndex[PairIndex["NKEUSD"] = 72] = "NKEUSD";
    PairIndex[PairIndex["AMDUSD"] = 73] = "AMDUSD";
    PairIndex[PairIndex["PYPLUSD"] = 74] = "PYPLUSD";
    PairIndex[PairIndex["ABNBUSD"] = 75] = "ABNBUSD";
    PairIndex[PairIndex["BAUSD"] = 76] = "BAUSD";
    PairIndex[PairIndex["SBUXUSD"] = 77] = "SBUXUSD";
    PairIndex[PairIndex["WMTUSD"] = 78] = "WMTUSD";
    PairIndex[PairIndex["INTCUSD"] = 79] = "INTCUSD";
    PairIndex[PairIndex["MCDUSD"] = 80] = "MCDUSD";
    PairIndex[PairIndex["METAUSD"] = 81] = "METAUSD";
    PairIndex[PairIndex["GOOGLUSD2"] = 82] = "GOOGLUSD2";
    PairIndex[PairIndex["GMEUSD2"] = 83] = "GMEUSD2";
    PairIndex[PairIndex["AMZNUSD2"] = 84] = "AMZNUSD2";
    PairIndex[PairIndex["TSLAUSD2"] = 85] = "TSLAUSD2";
    PairIndex[PairIndex["SPYUSD"] = 86] = "SPYUSD";
    PairIndex[PairIndex["QQQUSD"] = 87] = "QQQUSD";
    PairIndex[PairIndex["IWMUSD"] = 88] = "IWMUSD";
    PairIndex[PairIndex["DIAUSD"] = 89] = "DIAUSD";
    PairIndex[PairIndex["XAUUSD"] = 90] = "XAUUSD";
    PairIndex[PairIndex["XAGUSD"] = 91] = "XAGUSD";
    PairIndex[PairIndex["USDCNH"] = 92] = "USDCNH";
    PairIndex[PairIndex["USDSGD"] = 93] = "USDSGD";
    PairIndex[PairIndex["EURSEK"] = 94] = "EURSEK";
    PairIndex[PairIndex["USDKRW"] = 95] = "USDKRW";
    PairIndex[PairIndex["EURNOK"] = 96] = "EURNOK";
    PairIndex[PairIndex["USDINR"] = 97] = "USDINR";
    PairIndex[PairIndex["USDMXN"] = 98] = "USDMXN";
    PairIndex[PairIndex["USDTWD"] = 99] = "USDTWD";
    PairIndex[PairIndex["USDZAR"] = 100] = "USDZAR";
    PairIndex[PairIndex["USDBRL"] = 101] = "USDBRL";
    PairIndex[PairIndex["AVAXUSD"] = 102] = "AVAXUSD";
    PairIndex[PairIndex["ATOMUSD"] = 103] = "ATOMUSD";
    PairIndex[PairIndex["NEARUSD"] = 104] = "NEARUSD";
    PairIndex[PairIndex["QNTUSD"] = 105] = "QNTUSD";
    PairIndex[PairIndex["IOTAUSD"] = 106] = "IOTAUSD";
    PairIndex[PairIndex["TONUSD"] = 107] = "TONUSD";
    PairIndex[PairIndex["RPLUSD"] = 108] = "RPLUSD";
    PairIndex[PairIndex["ARBUSD"] = 109] = "ARBUSD";
    PairIndex[PairIndex["EURAUD"] = 110] = "EURAUD";
    PairIndex[PairIndex["EURNZD"] = 111] = "EURNZD";
    PairIndex[PairIndex["EURCAD"] = 112] = "EURCAD";
    PairIndex[PairIndex["GBPAUD"] = 113] = "GBPAUD";
    PairIndex[PairIndex["GBPNZD"] = 114] = "GBPNZD";
    PairIndex[PairIndex["GBPCAD"] = 115] = "GBPCAD";
    PairIndex[PairIndex["GBPCHF"] = 116] = "GBPCHF";
    PairIndex[PairIndex["GBPJPY"] = 117] = "GBPJPY";
    PairIndex[PairIndex["AUDNZD"] = 118] = "AUDNZD";
    PairIndex[PairIndex["AUDCAD"] = 119] = "AUDCAD";
    PairIndex[PairIndex["AUDCHF"] = 120] = "AUDCHF";
    PairIndex[PairIndex["AUDJPY"] = 121] = "AUDJPY";
    PairIndex[PairIndex["NZDCAD"] = 122] = "NZDCAD";
    PairIndex[PairIndex["NZDCHF"] = 123] = "NZDCHF";
    PairIndex[PairIndex["NZDJPY"] = 124] = "NZDJPY";
    PairIndex[PairIndex["CADCHF"] = 125] = "CADCHF";
    PairIndex[PairIndex["CADJPY"] = 126] = "CADJPY";
    PairIndex[PairIndex["CHFJPY"] = 127] = "CHFJPY";
    PairIndex[PairIndex["LDOUSD"] = 128] = "LDOUSD";
    PairIndex[PairIndex["INJUSD"] = 129] = "INJUSD";
    PairIndex[PairIndex["RUNEUSD"] = 130] = "RUNEUSD";
    PairIndex[PairIndex["CAKEUSD"] = 131] = "CAKEUSD";
    PairIndex[PairIndex["FXSUSD"] = 132] = "FXSUSD";
    PairIndex[PairIndex["TWTUSD"] = 133] = "TWTUSD";
    PairIndex[PairIndex["PEPEUSD"] = 134] = "PEPEUSD";
    PairIndex[PairIndex["DYDXUSD"] = 135] = "DYDXUSD";
    PairIndex[PairIndex["GMXUSD"] = 136] = "GMXUSD";
    PairIndex[PairIndex["FILUSD"] = 137] = "FILUSD";
    PairIndex[PairIndex["APTUSD"] = 138] = "APTUSD";
    PairIndex[PairIndex["IMXUSD"] = 139] = "IMXUSD";
    PairIndex[PairIndex["VETUSD"] = 140] = "VETUSD";
    PairIndex[PairIndex["OPUSD"] = 141] = "OPUSD";
    PairIndex[PairIndex["RNDRUSD"] = 142] = "RNDRUSD";
    PairIndex[PairIndex["EGLDUSD"] = 143] = "EGLDUSD";
    PairIndex[PairIndex["TIAUSD"] = 144] = "TIAUSD";
    PairIndex[PairIndex["STXUSD"] = 145] = "STXUSD";
    PairIndex[PairIndex["FLOWUSD"] = 146] = "FLOWUSD";
    PairIndex[PairIndex["KAVAUSD"] = 147] = "KAVAUSD";
    PairIndex[PairIndex["GALAUSD"] = 148] = "GALAUSD";
    PairIndex[PairIndex["MINAUSD"] = 149] = "MINAUSD";
    PairIndex[PairIndex["ORDIUSD"] = 150] = "ORDIUSD";
    PairIndex[PairIndex["ILVUSD"] = 151] = "ILVUSD";
    PairIndex[PairIndex["KLAYUSD"] = 152] = "KLAYUSD";
    PairIndex[PairIndex["SUIUSD"] = 153] = "SUIUSD";
    PairIndex[PairIndex["BLURUSD"] = 154] = "BLURUSD";
    PairIndex[PairIndex["FETUSD"] = 155] = "FETUSD";
    PairIndex[PairIndex["CFXUSD"] = 156] = "CFXUSD";
    PairIndex[PairIndex["BEAMUSD"] = 157] = "BEAMUSD";
    PairIndex[PairIndex["ARUSD"] = 158] = "ARUSD";
    PairIndex[PairIndex["SEIUSD"] = 159] = "SEIUSD";
    PairIndex[PairIndex["BTTUSD"] = 160] = "BTTUSD";
    PairIndex[PairIndex["ROSEUSD"] = 161] = "ROSEUSD";
    PairIndex[PairIndex["WOOUSD"] = 162] = "WOOUSD";
    PairIndex[PairIndex["AGIXUSD"] = 163] = "AGIXUSD";
    PairIndex[PairIndex["ZILUSD"] = 164] = "ZILUSD";
    PairIndex[PairIndex["GMTUSD"] = 165] = "GMTUSD";
    PairIndex[PairIndex["ASTRUSD"] = 166] = "ASTRUSD";
    PairIndex[PairIndex["ONEINCHUSD"] = 167] = "ONEINCHUSD";
    PairIndex[PairIndex["FLOKIUSD"] = 168] = "FLOKIUSD";
    PairIndex[PairIndex["QTUMUSD"] = 169] = "QTUMUSD";
    PairIndex[PairIndex["OCEANUSD"] = 170] = "OCEANUSD";
    PairIndex[PairIndex["WLDUSD"] = 171] = "WLDUSD";
    PairIndex[PairIndex["MASKUSD"] = 172] = "MASKUSD";
    PairIndex[PairIndex["CELOUSD"] = 173] = "CELOUSD";
    PairIndex[PairIndex["LRCUSD"] = 174] = "LRCUSD";
    PairIndex[PairIndex["ENSUSD"] = 175] = "ENSUSD";
    PairIndex[PairIndex["MEMEUSD"] = 176] = "MEMEUSD";
    PairIndex[PairIndex["ANKRUSD"] = 177] = "ANKRUSD";
    PairIndex[PairIndex["IOTXUSD"] = 178] = "IOTXUSD";
    PairIndex[PairIndex["ICXUSD"] = 179] = "ICXUSD";
    PairIndex[PairIndex["KSMUSD"] = 180] = "KSMUSD";
    PairIndex[PairIndex["RVNUSD"] = 181] = "RVNUSD";
    PairIndex[PairIndex["ANTUSD"] = 182] = "ANTUSD";
    PairIndex[PairIndex["WAVESUSD"] = 183] = "WAVESUSD";
    PairIndex[PairIndex["SKLUSD"] = 184] = "SKLUSD";
    PairIndex[PairIndex["SUPERUSD"] = 185] = "SUPERUSD";
    PairIndex[PairIndex["BALUSD"] = 186] = "BALUSD";
    PairIndex[PairIndex["WTIUSD"] = 187] = "WTIUSD";
    PairIndex[PairIndex["XPTUSD"] = 188] = "XPTUSD";
    PairIndex[PairIndex["XPDUSD"] = 189] = "XPDUSD";
    PairIndex[PairIndex["HGUSD"] = 190] = "HGUSD";
    PairIndex[PairIndex["JUPUSD"] = 191] = "JUPUSD";
    PairIndex[PairIndex["MANTAUSD"] = 192] = "MANTAUSD";
    PairIndex[PairIndex["BONKUSD"] = 193] = "BONKUSD";
    PairIndex[PairIndex["PENDLEUSD"] = 194] = "PENDLEUSD";
    PairIndex[PairIndex["OSMOUSD"] = 195] = "OSMOUSD";
    PairIndex[PairIndex["ALTUSD"] = 196] = "ALTUSD";
    PairIndex[PairIndex["UMAUSD"] = 197] = "UMAUSD";
    PairIndex[PairIndex["MAGICUSD"] = 198] = "MAGICUSD";
    PairIndex[PairIndex["API3USD"] = 199] = "API3USD";
    PairIndex[PairIndex["STRKUSD"] = 200] = "STRKUSD";
    PairIndex[PairIndex["DYMUSD"] = 201] = "DYMUSD";
    PairIndex[PairIndex["NTRNUSD"] = 202] = "NTRNUSD";
    PairIndex[PairIndex["PYTHUSD"] = 203] = "PYTHUSD";
    PairIndex[PairIndex["SCUSD"] = 204] = "SCUSD";
    PairIndex[PairIndex["WIFUSD"] = 205] = "WIFUSD";
    PairIndex[PairIndex["PIXELUSD"] = 206] = "PIXELUSD";
    PairIndex[PairIndex["JTOUSD"] = 207] = "JTOUSD";
    PairIndex[PairIndex["MAVIAUSD"] = 208] = "MAVIAUSD";
    PairIndex[PairIndex["MYROUSD"] = 209] = "MYROUSD";
    PairIndex[PairIndex["STGUSD"] = 210] = "STGUSD";
    PairIndex[PairIndex["BOMEUSD"] = 211] = "BOMEUSD";
    PairIndex[PairIndex["ETHFIUSD"] = 212] = "ETHFIUSD";
    PairIndex[PairIndex["METISUSD"] = 213] = "METISUSD";
    PairIndex[PairIndex["AEVOUSD"] = 214] = "AEVOUSD";
    PairIndex[PairIndex["ONDOUSD"] = 215] = "ONDOUSD";
    PairIndex[PairIndex["MNTUSD"] = 216] = "MNTUSD";
    PairIndex[PairIndex["KASUSD"] = 217] = "KASUSD";
    PairIndex[PairIndex["RONINUSD"] = 218] = "RONINUSD";
    PairIndex[PairIndex["ENAUSD"] = 219] = "ENAUSD";
    PairIndex[PairIndex["WUSD"] = 220] = "WUSD";
    PairIndex[PairIndex["ZEUSUSD"] = 221] = "ZEUSUSD";
    PairIndex[PairIndex["TNSRUSD"] = 222] = "TNSRUSD";
    PairIndex[PairIndex["TAOUSD"] = 223] = "TAOUSD";
    PairIndex[PairIndex["OMNIUSD"] = 224] = "OMNIUSD";
    PairIndex[PairIndex["PRCLUSD"] = 225] = "PRCLUSD";
    PairIndex[PairIndex["MERLUSD"] = 226] = "MERLUSD";
    PairIndex[PairIndex["SAFEUSD"] = 227] = "SAFEUSD";
    PairIndex[PairIndex["SAGAUSD"] = 228] = "SAGAUSD";
    PairIndex[PairIndex["LLUSD"] = 229] = "LLUSD";
    PairIndex[PairIndex["MSNUSD"] = 230] = "MSNUSD";
    PairIndex[PairIndex["REZUSD"] = 231] = "REZUSD";
    PairIndex[PairIndex["NOTUSD"] = 232] = "NOTUSD";
    PairIndex[PairIndex["IOUSD"] = 233] = "IOUSD";
    PairIndex[PairIndex["BRETTUSD"] = 234] = "BRETTUSD";
    PairIndex[PairIndex["ATHUSD"] = 235] = "ATHUSD";
    PairIndex[PairIndex["ZROUSD"] = 236] = "ZROUSD";
    PairIndex[PairIndex["ZKUSD"] = 237] = "ZKUSD";
    PairIndex[PairIndex["LISTAUSD"] = 238] = "LISTAUSD";
    PairIndex[PairIndex["BLASTUSD"] = 239] = "BLASTUSD";
    PairIndex[PairIndex["RATSUSD"] = 240] = "RATSUSD";
    PairIndex[PairIndex["BNXUSD"] = 241] = "BNXUSD";
    PairIndex[PairIndex["PEOPLEUSD"] = 242] = "PEOPLEUSD";
    PairIndex[PairIndex["TURBOUSD"] = 243] = "TURBOUSD";
    PairIndex[PairIndex["SATSUSD"] = 244] = "SATSUSD";
    PairIndex[PairIndex["POPCATUSD"] = 245] = "POPCATUSD";
    PairIndex[PairIndex["MOGUSD"] = 246] = "MOGUSD";
    PairIndex[PairIndex["OMUSD"] = 247] = "OMUSD";
    PairIndex[PairIndex["COREUSD"] = 248] = "COREUSD";
    PairIndex[PairIndex["JASMYUSD"] = 249] = "JASMYUSD";
    PairIndex[PairIndex["DARUSD"] = 250] = "DARUSD";
    PairIndex[PairIndex["MEWUSD"] = 251] = "MEWUSD";
    PairIndex[PairIndex["DEGENUSD"] = 252] = "DEGENUSD";
    PairIndex[PairIndex["SLERFUSD"] = 253] = "SLERFUSD";
    PairIndex[PairIndex["UXLINKUSD"] = 254] = "UXLINKUSD";
    PairIndex[PairIndex["AVAILUSD"] = 255] = "AVAILUSD";
    PairIndex[PairIndex["BANANAUSD"] = 256] = "BANANAUSD";
    PairIndex[PairIndex["RAREUSD"] = 257] = "RAREUSD";
    PairIndex[PairIndex["SYSUSD"] = 258] = "SYSUSD";
    PairIndex[PairIndex["NMRUSD"] = 259] = "NMRUSD";
    PairIndex[PairIndex["RSRUSD"] = 260] = "RSRUSD";
    PairIndex[PairIndex["SYNUSD"] = 261] = "SYNUSD";
    PairIndex[PairIndex["AUCTIONUSD"] = 262] = "AUCTIONUSD";
    PairIndex[PairIndex["ALICEUSD"] = 263] = "ALICEUSD";
    PairIndex[PairIndex["SUNUSD"] = 264] = "SUNUSD";
    PairIndex[PairIndex["TRBUSD"] = 265] = "TRBUSD";
    PairIndex[PairIndex["DOGSUSD"] = 266] = "DOGSUSD";
    PairIndex[PairIndex["SSVUSD"] = 267] = "SSVUSD";
    PairIndex[PairIndex["PONKEUSD"] = 268] = "PONKEUSD";
    PairIndex[PairIndex["POLUSD"] = 269] = "POLUSD";
    PairIndex[PairIndex["RDNTUSD"] = 270] = "RDNTUSD";
    PairIndex[PairIndex["FLUXUSD"] = 271] = "FLUXUSD";
    PairIndex[PairIndex["NEIROUSD"] = 272] = "NEIROUSD";
    PairIndex[PairIndex["SUNDOGUSD"] = 273] = "SUNDOGUSD";
    PairIndex[PairIndex["CATUSD"] = 274] = "CATUSD";
    PairIndex[PairIndex["BABYDOGEUSD"] = 275] = "BABYDOGEUSD";
    PairIndex[PairIndex["REEFUSD"] = 276] = "REEFUSD";
    PairIndex[PairIndex["CKBUSD"] = 277] = "CKBUSD";
    PairIndex[PairIndex["CATIUSD"] = 278] = "CATIUSD";
    PairIndex[PairIndex["LOOMUSD"] = 279] = "LOOMUSD";
    PairIndex[PairIndex["ZETAUSD"] = 280] = "ZETAUSD";
    PairIndex[PairIndex["HMSTRUSD"] = 281] = "HMSTRUSD";
    PairIndex[PairIndex["EIGENUSD"] = 282] = "EIGENUSD";
    PairIndex[PairIndex["POLYXUSD"] = 283] = "POLYXUSD";
    PairIndex[PairIndex["MOODENGUSD"] = 284] = "MOODENGUSD";
    PairIndex[PairIndex["MOTHERUSD"] = 285] = "MOTHERUSD";
    PairIndex[PairIndex["AEROUSD"] = 286] = "AEROUSD";
    PairIndex[PairIndex["CVCUSD"] = 287] = "CVCUSD";
    PairIndex[PairIndex["NEIROCTOUSD"] = 288] = "NEIROCTOUSD";
    PairIndex[PairIndex["ARKUSD"] = 289] = "ARKUSD";
    PairIndex[PairIndex["NPCUSD"] = 290] = "NPCUSD";
    PairIndex[PairIndex["ORBSUSD"] = 291] = "ORBSUSD";
    PairIndex[PairIndex["APUUSD"] = 292] = "APUUSD";
    PairIndex[PairIndex["BSVUSD"] = 293] = "BSVUSD";
    PairIndex[PairIndex["HIPPOUSD"] = 294] = "HIPPOUSD";
    PairIndex[PairIndex["GOATUSD"] = 295] = "GOATUSD";
    PairIndex[PairIndex["DOGUSD"] = 296] = "DOGUSD";
    PairIndex[PairIndex["HOTUSD"] = 297] = "HOTUSD";
    PairIndex[PairIndex["STORJUSD"] = 298] = "STORJUSD";
    PairIndex[PairIndex["RAYUSD"] = 299] = "RAYUSD";
    PairIndex[PairIndex["BTCDEGEN"] = 300] = "BTCDEGEN";
    PairIndex[PairIndex["PNUTUSD"] = 301] = "PNUTUSD";
    PairIndex[PairIndex["ACTUSD"] = 302] = "ACTUSD";
    PairIndex[PairIndex["GRASSUSD"] = 303] = "GRASSUSD";
    PairIndex[PairIndex["ZENUSD"] = 304] = "ZENUSD";
    PairIndex[PairIndex["LUMIAUSD"] = 305] = "LUMIAUSD";
    PairIndex[PairIndex["ALPHUSD"] = 306] = "ALPHUSD";
    PairIndex[PairIndex["VIRTUALUSD"] = 307] = "VIRTUALUSD";
    PairIndex[PairIndex["SPXUSD"] = 308] = "SPXUSD";
    PairIndex[PairIndex["ACXUSD"] = 309] = "ACXUSD";
    PairIndex[PairIndex["CHILLGUYUSD"] = 310] = "CHILLGUYUSD";
    PairIndex[PairIndex["CHEXUSD"] = 311] = "CHEXUSD";
    PairIndex[PairIndex["BITCOINUSD"] = 312] = "BITCOINUSD";
    PairIndex[PairIndex["ETHDEGEN"] = 313] = "ETHDEGEN";
    PairIndex[PairIndex["SOLDEGEN"] = 314] = "SOLDEGEN";
    PairIndex[PairIndex["MOVEUSD"] = 315] = "MOVEUSD";
    PairIndex[PairIndex["MEUSD"] = 316] = "MEUSD";
    PairIndex[PairIndex["COWUSD"] = 317] = "COWUSD";
    PairIndex[PairIndex["AVAUSD"] = 318] = "AVAUSD";
    PairIndex[PairIndex["USUALUSD"] = 319] = "USUALUSD";
    PairIndex[PairIndex["PENGUUSD"] = 320] = "PENGUUSD";
    PairIndex[PairIndex["FARTCOINUSD"] = 321] = "FARTCOINUSD";
    PairIndex[PairIndex["ZEREBROUSD"] = 322] = "ZEREBROUSD";
    PairIndex[PairIndex["AI16ZUSD"] = 323] = "AI16ZUSD";
    PairIndex[PairIndex["AIXBTUSD"] = 324] = "AIXBTUSD";
    PairIndex[PairIndex["BIOUSD"] = 325] = "BIOUSD";
    PairIndex[PairIndex["XRPDEGEN"] = 326] = "XRPDEGEN";
    PairIndex[PairIndex["BNBDEGEN"] = 327] = "BNBDEGEN";
    PairIndex[PairIndex["TRUMPUSD"] = 328] = "TRUMPUSD";
    PairIndex[PairIndex["MELANIAUSD"] = 329] = "MELANIAUSD";
    PairIndex[PairIndex["MODEUSD"] = 330] = "MODEUSD";
    PairIndex[PairIndex["HYPEUSD"] = 331] = "HYPEUSD";
    PairIndex[PairIndex["SUSD"] = 332] = "SUSD";
    PairIndex[PairIndex["ARCUSD"] = 333] = "ARCUSD";
    PairIndex[PairIndex["ARKMUSD"] = 334] = "ARKMUSD";
    PairIndex[PairIndex["GRIFFAINUSD"] = 335] = "GRIFFAINUSD";
    PairIndex[PairIndex["SWARMSUSD"] = 336] = "SWARMSUSD";
    PairIndex[PairIndex["ANIMEUSD"] = 337] = "ANIMEUSD";
    PairIndex[PairIndex["PLUMEUSD"] = 338] = "PLUMEUSD";
    PairIndex[PairIndex["VVVUSD"] = 339] = "VVVUSD";
    PairIndex[PairIndex["VINEUSD"] = 340] = "VINEUSD";
    PairIndex[PairIndex["TOSHIUSD"] = 341] = "TOSHIUSD";
    PairIndex[PairIndex["BERAUSD"] = 342] = "BERAUSD";
    PairIndex[PairIndex["LAYERUSD"] = 343] = "LAYERUSD";
    PairIndex[PairIndex["CHEEMSUSD"] = 344] = "CHEEMSUSD";
    PairIndex[PairIndex["SOLVUSD"] = 345] = "SOLVUSD";
    PairIndex[PairIndex["TSTUSD"] = 346] = "TSTUSD";
    PairIndex[PairIndex["IPUSD"] = 347] = "IPUSD";
    PairIndex[PairIndex["KAITOUSD"] = 348] = "KAITOUSD";
    PairIndex[PairIndex["ELXUSD"] = 349] = "ELXUSD";
    PairIndex[PairIndex["PIUSD"] = 350] = "PIUSD";
    PairIndex[PairIndex["SHELLUSD"] = 351] = "SHELLUSD";
    PairIndex[PairIndex["BMTUSD"] = 352] = "BMTUSD";
    PairIndex[PairIndex["BROCCOLIUSD"] = 353] = "BROCCOLIUSD";
    PairIndex[PairIndex["TUTUSD"] = 354] = "TUTUSD";
    PairIndex[PairIndex["GPSUSD"] = 355] = "GPSUSD";
    PairIndex[PairIndex["REDUSD"] = 356] = "REDUSD";
    PairIndex[PairIndex["MUBARAKUSD"] = 357] = "MUBARAKUSD";
    PairIndex[PairIndex["FORMUSD"] = 358] = "FORMUSD";
    PairIndex[PairIndex["WALUSD"] = 359] = "WALUSD";
    PairIndex[PairIndex["NILUSD"] = 360] = "NILUSD";
    PairIndex[PairIndex["PARTIUSD"] = 361] = "PARTIUSD";
    PairIndex[PairIndex["SIRENUSD"] = 362] = "SIRENUSD";
    PairIndex[PairIndex["BANANAS31"] = 363] = "BANANAS31";
    PairIndex[PairIndex["HYPERUSD"] = 364] = "HYPERUSD";
    PairIndex[PairIndex["PROMPTUSD"] = 365] = "PROMPTUSD";
    PairIndex[PairIndex["RFCUSD"] = 366] = "RFCUSD";
    PairIndex[PairIndex["WCTUSD"] = 367] = "WCTUSD";
    PairIndex[PairIndex["BIGTIMEUSD"] = 368] = "BIGTIMEUSD";
    PairIndex[PairIndex["BABYUSD"] = 369] = "BABYUSD";
    PairIndex[PairIndex["COOKIEUSD"] = 370] = "COOKIEUSD";
    PairIndex[PairIndex["KMNOUSD"] = 371] = "KMNOUSD";
    PairIndex[PairIndex["INITUSD"] = 372] = "INITUSD";
    PairIndex[PairIndex["SYRUPUSD"] = 373] = "SYRUPUSD";
    PairIndex[PairIndex["SIGNUSD"] = 374] = "SIGNUSD";
    PairIndex[PairIndex["ZORAUSD"] = 375] = "ZORAUSD";
    PairIndex[PairIndex["COINUSD"] = 376] = "COINUSD";
    PairIndex[PairIndex["HOODUSD"] = 377] = "HOODUSD";
    PairIndex[PairIndex["MSTRUSD"] = 378] = "MSTRUSD";
    PairIndex[PairIndex["NFLXUSD"] = 379] = "NFLXUSD";
    PairIndex[PairIndex["LAUNCHCOINUSD"] = 380] = "LAUNCHCOINUSD";
    PairIndex[PairIndex["NXPCUSD"] = 381] = "NXPCUSD";
    PairIndex[PairIndex["SOPHUSD"] = 382] = "SOPHUSD";
    PairIndex[PairIndex["LPTUSD"] = 383] = "LPTUSD";
    PairIndex[PairIndex["BVIVUSD"] = 384] = "BVIVUSD";
    PairIndex[PairIndex["EVIVUSD"] = 385] = "EVIVUSD";
    PairIndex[PairIndex["CRCLUSD"] = 386] = "CRCLUSD";
    PairIndex[PairIndex["RESOLVUSD"] = 387] = "RESOLVUSD";
    PairIndex[PairIndex["SQDUSD"] = 388] = "SQDUSD";
    PairIndex[PairIndex["TAIKOUSD"] = 389] = "TAIKOUSD";
    PairIndex[PairIndex["HOMEUSD"] = 390] = "HOMEUSD";
    PairIndex[PairIndex["BUSD"] = 391] = "BUSD";
    PairIndex[PairIndex["HUMAUSD"] = 392] = "HUMAUSD";
    PairIndex[PairIndex["SBETUSD"] = 393] = "SBETUSD";
    PairIndex[PairIndex["PLTRUSD"] = 394] = "PLTRUSD";
    PairIndex[PairIndex["BIDUUSD"] = 395] = "BIDUUSD";
    PairIndex[PairIndex["ROKUUSD"] = 396] = "ROKUUSD";
    PairIndex[PairIndex["LMTUSD"] = 397] = "LMTUSD";
    PairIndex[PairIndex["RIOTUSD"] = 398] = "RIOTUSD";
    PairIndex[PairIndex["MARAUSD"] = 399] = "MARAUSD";
    PairIndex[PairIndex["LOKAUSD"] = 400] = "LOKAUSD";
    PairIndex[PairIndex["STOUSD"] = 401] = "STOUSD";
    PairIndex[PairIndex["FUNUSD"] = 402] = "FUNUSD";
    PairIndex[PairIndex["KNCUSD"] = 403] = "KNCUSD";
    PairIndex[PairIndex["HUSD"] = 404] = "HUSD";
    PairIndex[PairIndex["ICNTUSD"] = 405] = "ICNTUSD";
    PairIndex[PairIndex["NEWTUSD"] = 406] = "NEWTUSD";
    PairIndex[PairIndex["PUMPUSD"] = 407] = "PUMPUSD";
    PairIndex[PairIndex["SAROSUSD"] = 408] = "SAROSUSD";
    PairIndex[PairIndex["SPKUSD"] = 409] = "SPKUSD";
    PairIndex[PairIndex["ERAUSD"] = 410] = "ERAUSD";
    PairIndex[PairIndex["BGSCUSD"] = 411] = "BGSCUSD";
    PairIndex[PairIndex["TAGUSD"] = 412] = "TAGUSD";
    PairIndex[PairIndex["WLFIUSD"] = 413] = "WLFIUSD";
    PairIndex[PairIndex["ASTERUSD"] = 414] = "ASTERUSD";
    PairIndex[PairIndex["OKBUSD"] = 415] = "OKBUSD";
    PairIndex[PairIndex["CROUSD"] = 416] = "CROUSD";
    PairIndex[PairIndex["SKYUSD"] = 417] = "SKYUSD";
    PairIndex[PairIndex["XPLUSD"] = 418] = "XPLUSD";
    PairIndex[PairIndex["AVNTUSD"] = 419] = "AVNTUSD";
    PairIndex[PairIndex["APEXUSD"] = 420] = "APEXUSD";
    PairIndex[PairIndex["ORDERUSD"] = 421] = "ORDERUSD";
    PairIndex[PairIndex["DRIFTUSD"] = 422] = "DRIFTUSD";
    PairIndex[PairIndex["MYXUSD"] = 423] = "MYXUSD";
    PairIndex[PairIndex["NOMUSD"] = 424] = "NOMUSD";
    PairIndex[PairIndex["FLUIDUSD"] = 425] = "FLUIDUSD";
    PairIndex[PairIndex["LQTYUSD"] = 426] = "LQTYUSD";
    PairIndex[PairIndex["L3USD"] = 427] = "L3USD";
    PairIndex[PairIndex["CAMPUSD"] = 428] = "CAMPUSD";
    PairIndex[PairIndex["SOMIUSD"] = 429] = "SOMIUSD";
    PairIndex[PairIndex["HEMIUSD"] = 430] = "HEMIUSD";
    PairIndex[PairIndex["FFUSD"] = 431] = "FFUSD";
    PairIndex[PairIndex["USELESSUSD"] = 432] = "USELESSUSD";
    PairIndex[PairIndex["MONUSD"] = 433] = "MONUSD";
    PairIndex[PairIndex["METUSD"] = 434] = "METUSD";
    PairIndex[PairIndex["TURTLEUSD"] = 435] = "TURTLEUSD";
    PairIndex[PairIndex["SPX500USD"] = 436] = "SPX500USD";
    PairIndex[PairIndex["NAS100USD"] = 437] = "NAS100USD";
    PairIndex[PairIndex["USA30USD"] = 438] = "USA30USD";
    PairIndex[PairIndex["NFLXUSD2"] = 439] = "NFLXUSD2";
    PairIndex[PairIndex["STABLEUSD"] = 440] = "STABLEUSD";
    PairIndex[PairIndex["VOOIUSD"] = 441] = "VOOIUSD";
    PairIndex[PairIndex["LITUSD"] = 442] = "LITUSD";
    PairIndex[PairIndex["DUSKUSD"] = 443] = "DUSKUSD";
    PairIndex[PairIndex["SCRTUSD"] = 444] = "SCRTUSD";
    PairIndex[PairIndex["DCRUSD"] = 445] = "DCRUSD";
    PairIndex[PairIndex["GDXUSD"] = 446] = "GDXUSD";
    PairIndex[PairIndex["URAUSD"] = 447] = "URAUSD";
    PairIndex[PairIndex["WPMUSD"] = 448] = "WPMUSD";
    PairIndex[PairIndex["NATGASUSD"] = 449] = "NATGASUSD";
    PairIndex[PairIndex["BRENTUSD"] = 450] = "BRENTUSD";
    PairIndex[PairIndex["URNMUSD"] = 451] = "URNMUSD";
    PairIndex[PairIndex["HYPEDEGEN"] = 452] = "HYPEDEGEN";
    PairIndex[PairIndex["MEGA"] = 453] = "MEGA";
})(PairIndex = exports.PairIndex || (exports.PairIndex = {}));

},{}],
"trade/priceImpact/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Main price impact module
 * @dev Exports cumulative volume, skew, and combined opening/closing price impact functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSkewPriceImpactContext = exports.convertPairSkewDepths = exports.convertSkewDepth = exports.convertPairOiCollateralArray = exports.convertPairOiCollateral = exports.convertPairOiTokenArray = exports.convertPairOiToken = exports.SkewPriceImpact = exports.calculatePartialSizeToken = exports.getTradeSkewPriceImpact = exports.calculateSkewPriceImpactP = exports.getTradeSkewDirection = exports.getNetSkewCollateral = exports.getNetSkewToken = exports.buildCumulVolContext = exports.convertOiWindowsSettingsArray = exports.convertOiWindows = exports.convertOiWindow = exports.convertOiWindowsSettings = exports.getSpreadP = exports.getFixedSpreadP = exports.getLegacyFactor = exports.getCumulativeFactor = exports.isProtectionCloseFactorActive = exports.getProtectionCloseFactor = exports.getSpreadWithPriceImpactP = exports.getSpreadWithCumulVolPriceImpactP = exports.getCumulVolPriceImpact = exports.getTradeCumulVolPriceImpactP = exports.buildTradeClosingPriceImpactContext = exports.getTradeClosingPriceImpactAtOracle = exports.getTradeClosingPriceImpact = exports.buildTradeOpeningPriceImpactContext = exports.getTradeOpeningPriceImpactAtMarket = exports.getTradeOpeningPriceImpact = exports.getPriceAfterImpact = void 0;
/**
 * @dev Calculates price after impact using the same formula as the Solidity contract
 * @dev Mirrors contract's getPriceAfterImpact function
 * @param oraclePrice Base oracle price (no decimals requirement)
 * @param totalPriceImpactP Total price impact percentage (can be positive or negative)
 * @returns Price after impact has been applied
 */
const getPriceAfterImpact = (oraclePrice, totalPriceImpactP) => {
    // Match Solidity: price = oraclePrice + (oraclePrice * totalPriceImpactP / 100)
    const priceAfterImpact = oraclePrice * (1 + totalPriceImpactP / 100);
    if (priceAfterImpact <= 0) {
        // Cap at 1% of oracle price (-99% impact max) to prevent negative prices
        // while still showing an extreme worst-case to the user
        return oraclePrice * 0.01;
    }
    return priceAfterImpact;
};
exports.getPriceAfterImpact = getPriceAfterImpact;
// Export trade opening price impact functionality
var open_1 = require("./open");
// Core functions
Object.defineProperty(exports, "getTradeOpeningPriceImpact", { enumerable: true, get: function () { return open_1.getTradeOpeningPriceImpact; } });
Object.defineProperty(exports, "getTradeOpeningPriceImpactAtMarket", { enumerable: true, get: function () { return open_1.getTradeOpeningPriceImpactAtMarket; } });
// Builder
Object.defineProperty(exports, "buildTradeOpeningPriceImpactContext", { enumerable: true, get: function () { return open_1.buildTradeOpeningPriceImpactContext; } });
// Export trade closing price impact functionality
var close_1 = require("./close");
// Core functions
Object.defineProperty(exports, "getTradeClosingPriceImpact", { enumerable: true, get: function () { return close_1.getTradeClosingPriceImpact; } });
Object.defineProperty(exports, "getTradeClosingPriceImpactAtOracle", { enumerable: true, get: function () { return close_1.getTradeClosingPriceImpactAtOracle; } });
// Builder
Object.defineProperty(exports, "buildTradeClosingPriceImpactContext", { enumerable: true, get: function () { return close_1.buildTradeClosingPriceImpactContext; } });
// Export cumulative volume price impact functionality
var cumulVol_1 = require("./cumulVol");
// Core functions
Object.defineProperty(exports, "getTradeCumulVolPriceImpactP", { enumerable: true, get: function () { return cumulVol_1.getTradeCumulVolPriceImpactP; } });
Object.defineProperty(exports, "getCumulVolPriceImpact", { enumerable: true, get: function () { return cumulVol_1.getCumulVolPriceImpact; } });
Object.defineProperty(exports, "getSpreadWithCumulVolPriceImpactP", { enumerable: true, get: function () { return cumulVol_1.getSpreadWithCumulVolPriceImpactP; } });
Object.defineProperty(exports, "getSpreadWithPriceImpactP", { enumerable: true, get: function () { return cumulVol_1.getSpreadWithPriceImpactP; } });
Object.defineProperty(exports, "getProtectionCloseFactor", { enumerable: true, get: function () { return cumulVol_1.getProtectionCloseFactor; } });
Object.defineProperty(exports, "isProtectionCloseFactorActive", { enumerable: true, get: function () { return cumulVol_1.isProtectionCloseFactorActive; } });
Object.defineProperty(exports, "getCumulativeFactor", { enumerable: true, get: function () { return cumulVol_1.getCumulativeFactor; } });
Object.defineProperty(exports, "getLegacyFactor", { enumerable: true, get: function () { return cumulVol_1.getLegacyFactor; } });
Object.defineProperty(exports, "getFixedSpreadP", { enumerable: true, get: function () { return cumulVol_1.getFixedSpreadP; } });
Object.defineProperty(exports, "getSpreadP", { enumerable: true, get: function () { return cumulVol_1.getSpreadP; } });
// Converters
Object.defineProperty(exports, "convertOiWindowsSettings", { enumerable: true, get: function () { return cumulVol_1.convertOiWindowsSettings; } });
Object.defineProperty(exports, "convertOiWindow", { enumerable: true, get: function () { return cumulVol_1.convertOiWindow; } });
Object.defineProperty(exports, "convertOiWindows", { enumerable: true, get: function () { return cumulVol_1.convertOiWindows; } });
Object.defineProperty(exports, "convertOiWindowsSettingsArray", { enumerable: true, get: function () { return cumulVol_1.convertOiWindowsSettingsArray; } });
// Builder
Object.defineProperty(exports, "buildCumulVolContext", { enumerable: true, get: function () { return cumulVol_1.buildCumulVolContext; } });
// Export skew price impact functionality
var skew_1 = require("./skew");
// Core functions
Object.defineProperty(exports, "getNetSkewToken", { enumerable: true, get: function () { return skew_1.getNetSkewToken; } });
Object.defineProperty(exports, "getNetSkewCollateral", { enumerable: true, get: function () { return skew_1.getNetSkewCollateral; } });
Object.defineProperty(exports, "getTradeSkewDirection", { enumerable: true, get: function () { return skew_1.getTradeSkewDirection; } });
Object.defineProperty(exports, "calculateSkewPriceImpactP", { enumerable: true, get: function () { return skew_1.calculateSkewPriceImpactP; } });
Object.defineProperty(exports, "getTradeSkewPriceImpact", { enumerable: true, get: function () { return skew_1.getTradeSkewPriceImpact; } });
Object.defineProperty(exports, "calculatePartialSizeToken", { enumerable: true, get: function () { return skew_1.calculatePartialSizeToken; } });
// Types namespace
Object.defineProperty(exports, "SkewPriceImpact", { enumerable: true, get: function () { return skew_1.SkewPriceImpact; } });
// Export converters
var converter_1 = require("./skew/converter");
Object.defineProperty(exports, "convertPairOiToken", { enumerable: true, get: function () { return converter_1.convertPairOiToken; } });
Object.defineProperty(exports, "convertPairOiTokenArray", { enumerable: true, get: function () { return converter_1.convertPairOiTokenArray; } });
Object.defineProperty(exports, "convertPairOiCollateral", { enumerable: true, get: function () { return converter_1.convertPairOiCollateral; } });
Object.defineProperty(exports, "convertPairOiCollateralArray", { enumerable: true, get: function () { return converter_1.convertPairOiCollateralArray; } });
Object.defineProperty(exports, "convertSkewDepth", { enumerable: true, get: function () { return converter_1.convertSkewDepth; } });
Object.defineProperty(exports, "convertPairSkewDepths", { enumerable: true, get: function () { return converter_1.convertPairSkewDepths; } });
// Export builders
var builder_1 = require("./skew/builder");
Object.defineProperty(exports, "buildSkewPriceImpactContext", { enumerable: true, get: function () { return builder_1.buildSkewPriceImpactContext; } });

},{"./open": "trade/priceImpact/open/index.js", "./close": "trade/priceImpact/close/index.js", "./cumulVol": "trade/priceImpact/cumulVol/index.js", "./skew": "trade/priceImpact/skew/index.js", "./skew/converter": "trade/priceImpact/skew/converter.js", "./skew/builder": "trade/priceImpact/skew/builder.js"}],
"trade/priceImpact/open/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Trade opening price impact calculations
 * @dev Mirrors contract's TradingCommonUtils.getTradeOpeningPriceImpact
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeOpeningPriceImpactAtMarket = exports.getTradeOpeningPriceImpact = exports.buildTradeOpeningPriceImpactContext = void 0;
const cumulVol_1 = require("../cumulVol");
const skew_1 = require("../skew");
const __1 = require("../");
// Export builder
var builder_1 = require("./builder");
Object.defineProperty(exports, "buildTradeOpeningPriceImpactContext", { enumerable: true, get: function () { return builder_1.buildTradeOpeningPriceImpactContext; } });
/**
 * @dev Calculates all price impacts for trade opening
 * @dev Mirrors contract's getTradeOpeningPriceImpact function
 * @param input Trade parameters
 * @param context Combined context for calculations
 * @returns Price impact breakdown and final price
 */
const getTradeOpeningPriceImpact = (input, context) => {
    const positionSizeCollateral = input.collateralAmount * input.leverage;
    // Calculate fixed spread
    const spreadP = (0, cumulVol_1.getFixedSpreadP)(input.pairSpreadP, input.long, true // opening
    );
    // Calculate position size in USD
    const positionSizeUsd = positionSizeCollateral * context.collateralPriceUsd;
    // Calculate cumulative volume price impact
    const cumulVolPriceImpactP = (0, cumulVol_1.getTradeCumulVolPriceImpactP)("", // trader - not needed for calculation
    input.pairIndex, input.long, positionSizeUsd, false, // isPnlPositive - not relevant for opening
    true, // open
    0, // lastPosIncreaseBlock - not relevant for opening
    context.cumulVolContext);
    // Calculate price after spread and cumulative volume impact (before skew)
    const priceAfterSpreadAndCumulVolPriceImpact = (0, __1.getPriceAfterImpact)(input.openPrice, spreadP + cumulVolPriceImpactP);
    // Calculate position size in tokens using the price after fixed spread and cumul vol impact
    const positionSizeToken = positionSizeCollateral / priceAfterSpreadAndCumulVolPriceImpact;
    // Calculate skew price impact (v10+ only)
    const skewPriceImpactObject = (0, skew_1.getTradeSkewPriceImpact)({
        collateralIndex: input.collateralIndex,
        pairIndex: input.pairIndex,
        long: input.long,
        open: true,
        positionSizeToken,
    }, context.skewContext);
    const skewPriceImpactP = skewPriceImpactObject.totalPriceImpactP;
    // Total price impact (signed - can be positive or negative)
    const totalPriceImpactP = spreadP + cumulVolPriceImpactP + skewPriceImpactP;
    const totalPriceImpactPFromMarketPrice = spreadP + cumulVolPriceImpactP + skewPriceImpactObject.tradePriceImpactP;
    // Calculate final price after impact using the same formula as Solidity
    const priceAfterImpact = (0, __1.getPriceAfterImpact)(input.openPrice, totalPriceImpactP);
    // Calculate percent profit from impact
    // For longs: negative impact = profit (price goes down, good for buyer)
    // For shorts: positive impact = profit (price goes up, good for seller)
    const percentProfitP = -totalPriceImpactP;
    return {
        priceAfterImpact,
        percentProfitP,
        fixedSpreadP: spreadP,
        cumulVolPriceImpactP,
        baseSkewPriceImpactP: skewPriceImpactObject.basePriceImpactP,
        tradeSkewPriceImpactP: skewPriceImpactObject.tradePriceImpactP,
        totalSkewPriceImpactP: skewPriceImpactObject.totalPriceImpactP,
        totalPriceImpactP,
        totalPriceImpactPFromMarketPrice,
    };
};
exports.getTradeOpeningPriceImpact = getTradeOpeningPriceImpact;
/**
 * @dev Simplified version using current market price
 * @param input Trade parameters
 * @param context Combined context
 * @param currentMarketPrice Current market price to use as open price
 * @returns Price impact breakdown and final price
 */
const getTradeOpeningPriceImpactAtMarket = (input, context, currentMarketPrice) => {
    return (0, exports.getTradeOpeningPriceImpact)({
        ...input,
        openPrice: currentMarketPrice,
    }, context);
};
exports.getTradeOpeningPriceImpactAtMarket = getTradeOpeningPriceImpactAtMarket;

},{"../cumulVol": "trade/priceImpact/cumulVol/index.js", "../skew": "trade/priceImpact/skew/index.js", "../": "trade/priceImpact/index.js", "./builder": "trade/priceImpact/open/builder.js"}],
"trade/priceImpact/skew/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Skew price impact calculations for v10+ trades
 * @dev Based on formula: (existingSkew + tradeSize/2) / skewDepth
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkewPriceImpact = exports.calculatePartialSizeToken = exports.getTradeSkewPriceImpact = exports.calculateSkewPriceImpactP = exports.getTradeSkewDirection = exports.getNetSkewCollateral = exports.getNetSkewToken = void 0;
// Constants
const PRICE_IMPACT_DIVIDER = 2; // Half price impact to match cumulative volume impact scale
/**
 * @dev Calculates net skew in tokens (long - short)
 * @param pairOi Pair OI data with long and short token amounts
 * @returns Net skew in tokens (positive = long heavy, negative = short heavy)
 */
const getNetSkewToken = (pairOi) => {
    return pairOi.oiLongToken - pairOi.oiShortToken;
};
exports.getNetSkewToken = getNetSkewToken;
/**
 * @dev Calculates net skew in collateral
 * @param netSkewToken Net skew in tokens
 * @param currentPrice Current pair price
 * @returns Net skew in collateral
 */
const getNetSkewCollateral = (netSkewToken, currentPrice) => {
    return netSkewToken * currentPrice;
};
exports.getNetSkewCollateral = getNetSkewCollateral;
/**
 * @dev Determines trade direction impact on skew
 * @param long Is long position
 * @param open Is opening (true) or closing (false)
 * @returns Whether trade increases or decreases skew
 */
const getTradeSkewDirection = (long, open) => {
    // Opening long or closing short increases positive skew
    // Opening short or closing long increases negative skew
    return (long && open) || (!long && !open);
};
exports.getTradeSkewDirection = getTradeSkewDirection;
/**
 * @dev Core skew price impact calculation
 * @param existingSkewToken Current net skew in tokens (signed)
 * @param tradeSizeToken Trade size in tokens (always positive)
 * @param skewDepth Skew depth in tokens
 * @param tradePositiveSkew Whether trade increases skew in its direction
 * @returns Price impact percentage (can be positive or negative)
 */
const calculateSkewPriceImpactP = (existingSkewToken, tradeSizeToken, skewDepth, tradePositiveSkew) => {
    if (skewDepth === 0) {
        return 0; // No impact if depth is 0
    }
    // Convert signed values based on trade direction
    const tradeSkewMultiplier = tradePositiveSkew ? 1 : -1;
    const signedExistingSkew = existingSkewToken;
    const signedTradeSize = tradeSizeToken * tradeSkewMultiplier;
    // (existingSkew + tradeSize/2) / skewDepth
    const numerator = signedExistingSkew + signedTradeSize / 2;
    const priceImpactP = numerator / skewDepth;
    // Apply divider to match cumulative volume impact scale
    return priceImpactP / PRICE_IMPACT_DIVIDER;
};
exports.calculateSkewPriceImpactP = calculateSkewPriceImpactP;
/**
 * @dev Main function to calculate skew price impact for a trade
 * @param input Trade parameters
 * @param context Skew price impact context with depths and OI data
 * @returns Skew price impact result
 */
const getTradeSkewPriceImpact = (input, context) => {
    // Get skew depth and pair OI from simplified context
    const { skewDepth, pairOiToken: pairOi } = context;
    // Calculate net skew
    const netSkewToken = (0, exports.getNetSkewToken)(pairOi);
    // Determine trade direction
    const tradePositiveSkew = (0, exports.getTradeSkewDirection)(input.long, input.open);
    // Calculate price impact
    const basePriceImpactP = (0, exports.calculateSkewPriceImpactP)(netSkewToken, 0, skewDepth, tradePositiveSkew);
    // Calculate price impact
    const totalPriceImpactP = (0, exports.calculateSkewPriceImpactP)(netSkewToken, input.positionSizeToken, skewDepth, tradePositiveSkew);
    const tradePriceImpactP = totalPriceImpactP - basePriceImpactP;
    // Determine trade direction relative to skew
    let tradeDirection;
    if (totalPriceImpactP > 0) {
        tradeDirection = "increase";
    }
    else if (totalPriceImpactP < 0) {
        tradeDirection = "decrease";
    }
    else {
        tradeDirection = "neutral";
    }
    return {
        basePriceImpactP,
        tradePriceImpactP,
        totalPriceImpactP,
        netSkewToken,
        netSkewCollateral: 0,
        tradeDirection,
    };
};
exports.getTradeSkewPriceImpact = getTradeSkewPriceImpact;
/**
 * @dev Calculate position sizes for partial operations
 * @param originalSizeCollateral Original position size in collateral
 * @param deltaCollateral Position size delta in collateral
 * @param originalSizeToken Original position size in tokens
 * @returns Delta in tokens proportional to collateral delta
 */
const calculatePartialSizeToken = (originalSizeCollateral, deltaCollateral, originalSizeToken) => {
    if (originalSizeCollateral === 0) {
        return 0;
    }
    // For partial close/add, token delta is proportional to collateral delta
    return (deltaCollateral * originalSizeToken) / originalSizeCollateral;
};
exports.calculatePartialSizeToken = calculatePartialSizeToken;
// Export namespace for types
exports.SkewPriceImpact = __importStar(require("./types"));
__exportStar(require("./converter"), exports);
__exportStar(require("./builder"), exports);
__exportStar(require("./fetcher"), exports);

},{"./types": "trade/priceImpact/skew/types.js", "./converter": "trade/priceImpact/skew/converter.js", "./builder": "trade/priceImpact/skew/builder.js", "./fetcher": "trade/priceImpact/skew/fetcher.js"}],
"trade/priceImpact/skew/types.js":[function(require,module,exports){
"use strict";
/**
 * @dev Skew price impact types for v10+ trades
 */
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/priceImpact/skew/converter.js":[function(require,module,exports){
"use strict";
/**
 * @dev Converters for skew price impact data between contract and SDK formats
 * @dev All BigNumber values are normalized to floats with appropriate precision
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPairSkewDepths = exports.convertSkewDepth = exports.convertPairOiCollateralArray = exports.convertPairOiCollateral = exports.convertPairOiTokenArray = exports.convertPairOiToken = void 0;
/**
 * @dev Converts contract pair OI token data to SDK format
 * @param contractData Contract pair OI token struct
 * @returns Normalized pair OI token data
 */
const convertPairOiToken = (contractData) => {
    // Token amounts are stored as 1e18 in contract
    return {
        oiLongToken: Number(contractData.oiLongToken) / 1e18,
        oiShortToken: Number(contractData.oiShortToken) / 1e18,
    };
};
exports.convertPairOiToken = convertPairOiToken;
/**
 * @dev Converts array of contract pair OI token data to SDK format
 * @param contractDataArray Array of contract pair OI token data
 * @returns Array of normalized pair OI token data
 */
const convertPairOiTokenArray = (contractDataArray) => {
    return contractDataArray.map(exports.convertPairOiToken);
};
exports.convertPairOiTokenArray = convertPairOiTokenArray;
/**
 * @dev Converts contract pair OI collateral data to SDK format
 * @param contractData Contract pair OI collateral struct
 * @param collateralDecimals Number of decimals for the collateral (e.g., 18 for DAI, 6 for USDC)
 * @returns Normalized pair OI collateral data
 */
const convertPairOiCollateral = (contractData, collateralDecimals) => {
    const divisor = 10 ** collateralDecimals;
    return {
        oiLongCollateral: Number(contractData.oiLongCollateral) / divisor,
        oiShortCollateral: Number(contractData.oiShortCollateral) / divisor,
    };
};
exports.convertPairOiCollateral = convertPairOiCollateral;
/**
 * @dev Converts array of contract pair OI collateral data to SDK format
 * @param contractDataArray Array of contract pair OI collateral data
 * @param collateralDecimals Array of collateral decimals for each entry
 * @returns Array of normalized pair OI collateral data
 */
const convertPairOiCollateralArray = (contractDataArray, collateralDecimals) => {
    if (contractDataArray.length !== collateralDecimals.length) {
        throw new Error("Contract data array and collateral decimals array must have the same length");
    }
    return contractDataArray.map((data, index) => (0, exports.convertPairOiCollateral)(data, collateralDecimals[index]));
};
exports.convertPairOiCollateralArray = convertPairOiCollateralArray;
/**
 * @dev Converts skew depth from contract format to SDK format
 * @param depth Skew depth from contract (in token units with 1e18 precision)
 * @returns Normalized skew depth in tokens
 */
const convertSkewDepth = (depth) => {
    // Token depths are always stored with 1e18 precision in the contract
    return Number(depth) / 1e18;
};
exports.convertSkewDepth = convertSkewDepth;
/**
 * @dev Converts array of skew depths from contract format to SDK format
 * @param depths Array of skew depths from contract (in token units with 1e18 precision)
 * @returns Object mapping pair index to normalized depth
 */
const convertPairSkewDepths = (depths) => {
    const result = {};
    depths.forEach((depth, index) => {
        if (depth && depth !== "0") {
            result[index] = (0, exports.convertSkewDepth)(depth);
        }
    });
    return result;
};
exports.convertPairSkewDepths = convertPairSkewDepths;

},{}],
"trade/priceImpact/skew/builder.js":[function(require,module,exports){
"use strict";
/**
 * @dev Builders for skew price impact contexts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSkewPriceImpactContext = void 0;
/**
 * @dev Builds skew price impact context from trading variables for a specific pair
 * @param tradingVariables Trading variables containing collateral data
 * @param pairIndex Index of the pair to build context for
 * @returns Skew price impact context for the pair
 */
const buildSkewPriceImpactContext = (tradingVariables, pairIndex) => {
    const skewDepth = tradingVariables.pairSkewDepths?.[pairIndex] ?? 0;
    const pairOi = tradingVariables.pairOis?.[pairIndex];
    if (!pairOi) {
        throw new Error(`Pair OI data not found for pair index ${pairIndex}`);
    }
    return {
        skewDepth,
        pairOiToken: {
            oiLongToken: pairOi.token.long,
            oiShortToken: pairOi.token.short,
        },
    };
};
exports.buildSkewPriceImpactContext = buildSkewPriceImpactContext;

},{}],
"trade/priceImpact/skew/fetcher.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTradeSkewPriceImpact = exports.fetchCollateralDecimals = exports.fetchSkewPriceImpactContext = exports.fetchPairSkewDepths = exports.fetchPairSkewDepth = exports.fetchPairOisAfterV10Token = exports.fetchPairOiAfterV10Token = void 0;
const converter_1 = require("./converter");
/**
 * @dev Fetches pair open interest in tokens for a specific pair
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndex Collateral index
 * @param pairIndex Pair index
 * @returns Promise resolving to pair OI in tokens
 */
const fetchPairOiAfterV10Token = async (contract, collateralIndex, pairIndex) => {
    try {
        const contractData = await contract.getPairOiAfterV10Token(collateralIndex, pairIndex);
        return (0, converter_1.convertPairOiToken)(contractData);
    }
    catch (error) {
        console.error("Error fetching pair OI token:", error);
        throw error;
    }
};
exports.fetchPairOiAfterV10Token = fetchPairOiAfterV10Token;
/**
 * @dev Fetches pair open interest in tokens for multiple pairs
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices
 * @returns Promise resolving to array of pair OI in tokens
 */
const fetchPairOisAfterV10Token = async (contract, collateralIndices, pairIndices) => {
    if (collateralIndices.length !== pairIndices.length) {
        throw new Error("Collateral indices and pair indices arrays must have the same length");
    }
    try {
        const contractDataArray = await contract.getPairOisAfterV10Token(collateralIndices, pairIndices);
        return contractDataArray.map(converter_1.convertPairOiToken);
    }
    catch (error) {
        console.error("Error fetching pair OIs token:", error);
        throw error;
    }
};
exports.fetchPairOisAfterV10Token = fetchPairOisAfterV10Token;
/**
 * @dev Fetches skew depth for a specific pair
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndex Collateral index
 * @param pairIndex Pair index
 * @returns Promise resolving to normalized skew depth
 */
const fetchPairSkewDepth = async (contract, collateralIndex, pairIndex) => {
    try {
        const contractDepth = await contract.getPairSkewDepth(collateralIndex, pairIndex);
        // Token depths are always 1e18 precision
        return (0, converter_1.convertSkewDepth)(contractDepth.toString());
    }
    catch (error) {
        console.error("Error fetching skew depth:", error);
        throw error;
    }
};
exports.fetchPairSkewDepth = fetchPairSkewDepth;
/**
 * @dev Fetches skew depths for multiple pairs
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndices Array of collateral indices
 * @param pairIndices Array of pair indices
 * @returns Promise resolving to array of normalized skew depths
 */
const fetchPairSkewDepths = async (contract, collateralIndices, pairIndices) => {
    if (collateralIndices.length !== pairIndices.length) {
        throw new Error("All input arrays must have the same length");
    }
    try {
        const contractDepths = await contract.getPairSkewDepths(collateralIndices, pairIndices);
        // Token depths are always 1e18 precision
        return contractDepths.map(depth => (0, converter_1.convertSkewDepth)(depth.toString()));
    }
    catch (error) {
        console.error("Error fetching skew depths:", error);
        throw error;
    }
};
exports.fetchPairSkewDepths = fetchPairSkewDepths;
/**
 * @dev Fetches skew price impact context for a single pair
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndex Collateral index
 * @param pairIndex Pair index
 * @returns Promise resolving to skew price impact context
 */
const fetchSkewPriceImpactContext = async (contract, collateralIndex, pairIndex) => {
    try {
        // Fetch OI data and skew depth in parallel
        const [pairOiToken, skewDepth] = await Promise.all([
            (0, exports.fetchPairOiAfterV10Token)(contract, collateralIndex, pairIndex),
            (0, exports.fetchPairSkewDepth)(contract, collateralIndex, pairIndex),
        ]);
        return {
            skewDepth,
            pairOiToken,
        };
    }
    catch (error) {
        console.error("Error fetching skew price impact context:", error);
        throw error;
    }
};
exports.fetchSkewPriceImpactContext = fetchSkewPriceImpactContext;
/**
 * @dev Fetches collateral decimals for given collateral indices
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndices Array of collateral indices
 * @returns Promise resolving to array of decimals
 */
const fetchCollateralDecimals = async (contract, collateralIndices) => {
    try {
        // Get unique collateral indices to minimize calls
        const uniqueIndices = [...new Set(collateralIndices)];
        // Fetch collateral info for unique indices
        const promises = uniqueIndices.map(async (index) => {
            const collateral = await contract.getCollateral(index);
            return { index, decimals: Number(collateral.precision) };
        });
        const collateralData = await Promise.all(promises);
        // Create a map for quick lookup
        const decimalsMap = new Map(collateralData.map(data => [data.index, data.decimals]));
        // Return decimals in the same order as input
        return collateralIndices.map(index => decimalsMap.get(index) || 18 // Default to 18 if not found
        );
    }
    catch (error) {
        console.error("Error fetching collateral decimals:", error);
        throw error;
    }
};
exports.fetchCollateralDecimals = fetchCollateralDecimals;
/**
 * @dev Calculates skew price impact for a trade using contract call
 * @param contract GNSMultiCollatDiamond contract instance
 * @param collateralIndex Collateral index
 * @param pairIndex Pair index
 * @param long Whether trade is long
 * @param positionSizeToken Position size in tokens
 * @param open Whether trade is opening
 * @returns Promise resolving to price impact percentage (1e10)
 */
const calculateTradeSkewPriceImpact = async (contract, collateralIndex, pairIndex, long, positionSizeToken, open) => {
    try {
        const priceImpactP = await contract.getTradeSkewPriceImpactP(collateralIndex, pairIndex, long, BigInt(Math.round(positionSizeToken * 1e18)), // Convert to 1e18 precision
        open);
        // Convert from int256 1e10 to percentage
        return Number(priceImpactP) / 1e10;
    }
    catch (error) {
        console.error("Error calculating trade skew price impact:", error);
        throw error;
    }
};
exports.calculateTradeSkewPriceImpact = calculateTradeSkewPriceImpact;

},{"./converter": "trade/priceImpact/skew/converter.js"}],
"trade/priceImpact/open/builder.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTradeOpeningPriceImpactContext = void 0;
const builder_1 = require("../cumulVol/builder");
const builder_2 = require("../skew/builder");
/**
 * @dev Builds a complete context for trade opening price impact calculations
 * @dev Uses sub-context builders to create properly scoped contexts
 * @param globalTradingVariables The transformed global trading variables from backend
 * @param collateralIndex The collateral index (1-based)
 * @param pairIndex The pair index
 * @param additionalParams Additional parameters not available in trading variables
 * @returns Complete context ready for getTradeOpeningPriceImpact
 */
const buildTradeOpeningPriceImpactContext = (globalTradingVariables, collateralIndex, pairIndex, additionalParams) => {
    const collateral = globalTradingVariables.collaterals[collateralIndex - 1];
    if (!collateral) {
        return undefined;
    }
    // Build cumulative volume subcontext
    const cumulVolContext = (0, builder_1.buildCumulVolContext)(globalTradingVariables, collateralIndex, pairIndex, {
        currentBlock: additionalParams.currentBlock,
        contractsVersion: additionalParams.contractsVersion,
        isPnlPositive: false,
        isOpen: true,
        createdBlock: undefined,
        userPriceImpact: additionalParams.userPriceImpact,
        protectionCloseFactorWhitelist: additionalParams.protectionCloseFactorWhitelist,
    });
    // Build skew price impact subcontext
    const skewContext = (0, builder_2.buildSkewPriceImpactContext)(collateral, pairIndex);
    if (!cumulVolContext || !skewContext) {
        return undefined;
    }
    // Return structured context with proper subcontexts
    return {
        collateralPriceUsd: collateral.prices?.collateralPriceUsd || 1,
        cumulVolContext,
        skewContext,
    };
};
exports.buildTradeOpeningPriceImpactContext = buildTradeOpeningPriceImpactContext;

},{"../cumulVol/builder": "trade/priceImpact/cumulVol/builder.js", "../skew/builder": "trade/priceImpact/skew/builder.js"}],
"trade/priceImpact/close/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Trade closing price impact calculations
 * @dev Mirrors contract's TradingCommonUtils.getTradeClosingPriceImpact
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeClosingPriceImpactAtOracle = exports.getTradeClosingPriceImpact = exports.buildTradeClosingPriceImpactContext = void 0;
const cumulVol_1 = require("../cumulVol");
const skew_1 = require("../skew");
const types_1 = require("../../../contracts/types");
const pnl_1 = require("../../pnl");
const __1 = require("../");
// Export builder
var builder_1 = require("./builder");
Object.defineProperty(exports, "buildTradeClosingPriceImpactContext", { enumerable: true, get: function () { return builder_1.buildTradeClosingPriceImpactContext; } });
/**
 * @dev Calculates position size in tokens for the portion being closed
 * @param positionSizeCollateral Position size in collateral units being closed
 * @param originalPositionSizeToken Original total position size in tokens
 * @param originalCollateral Original collateral amount
 * @param originalLeverage Original leverage
 * @returns Position size in tokens for the closing portion
 */
const calculateClosingPositionSizeToken = (positionSizeCollateral, originalPositionSizeToken, originalCollateral, originalLeverage) => {
    const totalPositionSizeCollateral = originalCollateral * originalLeverage;
    if (totalPositionSizeCollateral === 0)
        return 0;
    // (positionSizeCollateral * originalPositionSizeToken) / totalPositionSizeCollateral
    return ((positionSizeCollateral * originalPositionSizeToken) /
        totalPositionSizeCollateral);
};
/**
 * @dev Calculates all price impacts for trade closing
 * @dev Mirrors contract's getTradeClosingPriceImpact function
 * @param input Trade parameters
 * @param context Combined context for calculations
 * @returns Price impact breakdown and trade value
 */
const getTradeClosingPriceImpact = (input, context) => {
    // For trades before V9.2, return oracle price without any impact
    if (input.contractsVersion === types_1.ContractsVersion.BEFORE_V9_2) {
        return {
            positionSizeToken: 0,
            fixedSpreadP: 0,
            cumulVolPriceImpactP: 0,
            baseSkewPriceImpactP: 0,
            tradeSkewPriceImpactP: 0,
            totalSkewPriceImpactP: 0,
            totalPriceImpactP: 0,
            totalPriceImpactPFromMarketPrice: 0,
            priceAfterImpact: input.oraclePrice,
            tradeValueCollateralNoFactor: 0,
        };
    }
    // Calculate position size in tokens (proportional to collateral being closed)
    const positionSizeToken = input.trade.positionSizeToken
        ? calculateClosingPositionSizeToken(input.positionSizeCollateral, input.trade.positionSizeToken, input.trade.collateralAmount, input.trade.leverage)
        : 0;
    // Calculate fixed spread (reversed for closing)
    const fixedSpreadP = (0, cumulVol_1.getFixedSpreadP)(input.pairSpreadP, input.trade.long, false // closing
    );
    let cumulVolPriceImpactP = 0;
    let tradeValueCollateralNoFactor = 0;
    if (input.useCumulativeVolPriceImpact) {
        // First pass: Calculate with negative PnL assumption
        const positionSizeUsd = input.positionSizeCollateral * context.collateralPriceUsd;
        cumulVolPriceImpactP = (0, cumulVol_1.getTradeCumulVolPriceImpactP)(input.trade.user, input.pairIndex, input.trade.long, positionSizeUsd, false, // Assume negative PnL initially
        false, // closing
        context.tradeInfo.lastPosIncreaseBlock || context.tradeInfo.createdBlock, context.cumulVolContext);
        // Calculate price with conservative impact
        const priceWithImpact = (0, __1.getPriceAfterImpact)(input.currentPairPrice, fixedSpreadP + cumulVolPriceImpactP);
        // Calculate PnL percentage using the proper function
        const pnlPercent = (0, pnl_1.getPnlPercent)(input.trade.openPrice, priceWithImpact, input.trade.long, input.trade.leverage);
        // Calculate trade value using getTradeValue function
        // Note: We don't include fees here as this is the raw trade value
        tradeValueCollateralNoFactor = (0, pnl_1.getTradeValue)(input.trade.collateralAmount, pnlPercent, 0 // No fees for raw trade value calculation
        );
        // Determine actual PnL from the calculated percentage
        const isPnlPositive = pnlPercent > 0;
        // Second pass: Recalculate with actual PnL if positive
        if (isPnlPositive) {
            cumulVolPriceImpactP = (0, cumulVol_1.getTradeCumulVolPriceImpactP)(input.trade.user, input.pairIndex, input.trade.long, positionSizeUsd, true, // Positive PnL
            false, // closing
            context.tradeInfo.lastPosIncreaseBlock ||
                context.tradeInfo.createdBlock, context.cumulVolContext);
        }
    }
    // Calculate skew price impact (v10+ only)
    const skewPriceImpactObject = input.contractsVersion >= types_1.ContractsVersion.V10
        ? (0, skew_1.getTradeSkewPriceImpact)({
            collateralIndex: input.collateralIndex,
            pairIndex: input.pairIndex,
            long: input.trade.long,
            open: false,
            positionSizeToken,
        }, context.skewContext)
        : {
            basePriceImpactP: 0,
            tradePriceImpactP: 0,
            totalPriceImpactP: 0,
        };
    // Total price impact (all components)
    const totalPriceImpactP = fixedSpreadP +
        cumulVolPriceImpactP +
        skewPriceImpactObject.totalPriceImpactP;
    const totalPriceImpactPFromMarketPrice = fixedSpreadP +
        cumulVolPriceImpactP +
        skewPriceImpactObject.tradePriceImpactP;
    // Calculate final price after all impacts
    const priceAfterImpact = (0, __1.getPriceAfterImpact)(input.currentPairPrice, totalPriceImpactP);
    return {
        positionSizeToken,
        fixedSpreadP,
        cumulVolPriceImpactP,
        baseSkewPriceImpactP: skewPriceImpactObject.basePriceImpactP,
        tradeSkewPriceImpactP: skewPriceImpactObject.tradePriceImpactP,
        totalSkewPriceImpactP: skewPriceImpactObject.totalPriceImpactP,
        totalPriceImpactP,
        totalPriceImpactPFromMarketPrice,
        priceAfterImpact,
        tradeValueCollateralNoFactor,
    };
};
exports.getTradeClosingPriceImpact = getTradeClosingPriceImpact;
/**
 * @dev Simplified version using oracle price as current price
 * @param input Trade parameters (without currentPairPrice)
 * @param context Combined context
 * @returns Price impact breakdown and trade value
 */
const getTradeClosingPriceImpactAtOracle = (input, context) => {
    return (0, exports.getTradeClosingPriceImpact)({
        ...input,
        currentPairPrice: input.oraclePrice,
    }, context);
};
exports.getTradeClosingPriceImpactAtOracle = getTradeClosingPriceImpactAtOracle;

},{"../cumulVol": "trade/priceImpact/cumulVol/index.js", "../skew": "trade/priceImpact/skew/index.js", "../../../contracts/types": "contracts/types/index.js", "../../pnl": "trade/pnl/index.js", "../": "trade/priceImpact/index.js", "./builder": "trade/priceImpact/close/builder.js"}],
"trade/priceImpact/close/builder.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTradeClosingPriceImpactContext = void 0;
const builder_1 = require("../cumulVol/builder");
const builder_2 = require("../skew/builder");
/**
 * @dev Builds a complete context for trade closing price impact calculations
 * @dev Uses sub-context builders to create properly scoped contexts
 * @param globalTradingVariables The transformed global trading variables from backend
 * @param collateralIndex The collateral index (1-based)
 * @param pairIndex The pair index
 * @param tradeInfo Trade information including createdBlock
 * @param additionalParams Additional parameters not available in trading variables
 * @returns Complete context ready for getTradeClosingPriceImpact
 */
const buildTradeClosingPriceImpactContext = (globalTradingVariables, collateralIndex, pairIndex, tradeInfo, additionalParams) => {
    const collateral = globalTradingVariables.collaterals[collateralIndex - 1];
    if (!collateral) {
        return undefined;
    }
    // Build cumulative volume subcontext for closing
    const cumulVolContext = (0, builder_1.buildCumulVolContext)(globalTradingVariables, collateralIndex, pairIndex, {
        currentBlock: additionalParams.currentBlock,
        contractsVersion: additionalParams.contractsVersion || tradeInfo.contractsVersion,
        isPnlPositive: additionalParams.isPnlPositive,
        isOpen: false,
        createdBlock: tradeInfo.createdBlock,
        userPriceImpact: additionalParams.userPriceImpact,
        protectionCloseFactorWhitelist: additionalParams.protectionCloseFactorWhitelist,
    });
    // Build skew price impact subcontext
    const skewContext = (0, builder_2.buildSkewPriceImpactContext)(collateral, pairIndex);
    if (!cumulVolContext || !skewContext) {
        return undefined;
    }
    // Return structured context with proper subcontexts
    return {
        collateralPriceUsd: collateral.prices?.collateralPriceUsd || 1,
        cumulVolContext,
        skewContext,
        tradeInfo,
    };
};
exports.buildTradeClosingPriceImpactContext = buildTradeClosingPriceImpactContext;

},{"../cumulVol/builder": "trade/priceImpact/cumulVol/builder.js", "../skew/builder": "trade/priceImpact/skew/builder.js"}],
"trade/utils.js":[function(require,module,exports){
"use strict";
/**
 * @dev Trade-specific utility functions
 * @dev Common calculations and conversions used across trading modules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePositionSizeCollateral = exports.calculatePositionSizeToken = void 0;
/**
 * @dev Converts position size from collateral to tokens
 * @param positionSizeCollateral Position size in collateral tokens
 * @param currentPrice Current pair price
 * @returns Position size in tokens
 */
const calculatePositionSizeToken = (positionSizeCollateral, currentPrice) => {
    if (currentPrice === 0) {
        throw new Error("Current price cannot be zero");
    }
    return positionSizeCollateral / currentPrice;
};
exports.calculatePositionSizeToken = calculatePositionSizeToken;
/**
 * @dev Converts position size from tokens to collateral
 * @param positionSizeToken Position size in tokens
 * @param currentPrice Current pair price
 * @returns Position size in collateral tokens
 */
const calculatePositionSizeCollateral = (positionSizeToken, currentPrice) => {
    return positionSizeToken * currentPrice;
};
exports.calculatePositionSizeCollateral = calculatePositionSizeCollateral;

},{}],
"trade/effectiveLeverage/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeEffectiveLeverage = exports.getTradeNewEffectiveLeverage = void 0;
__exportStar(require("./types"), exports);
var getTradeNewEffectiveLeverage_1 = require("./getTradeNewEffectiveLeverage");
Object.defineProperty(exports, "getTradeNewEffectiveLeverage", { enumerable: true, get: function () { return getTradeNewEffectiveLeverage_1.getTradeNewEffectiveLeverage; } });
Object.defineProperty(exports, "getTradeEffectiveLeverage", { enumerable: true, get: function () { return getTradeNewEffectiveLeverage_1.getTradeEffectiveLeverage; } });

},{"./types": "trade/effectiveLeverage/types.js", "./getTradeNewEffectiveLeverage": "trade/effectiveLeverage/getTradeNewEffectiveLeverage.js"}],
"trade/effectiveLeverage/types.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/effectiveLeverage/getTradeNewEffectiveLeverage.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeEffectiveLeverage = exports.getTradeNewEffectiveLeverage = void 0;
/**
 * @dev Calculates the effective leverage of a trade accounting for unrealized PnL
 * @dev Effective leverage increases when PnL is negative and decreases when positive
 * @dev Mirrors contract's getTradeNewEffectiveLeverage function
 * @param input Trade parameters including new position values
 * @returns Effective leverage and related values
 */
const getTradeNewEffectiveLeverage = (input) => {
    const { newOpenPrice, newCollateralAmount, newLeverage, currentPairPrice, tradeValueCollateral, } = input;
    // Calculate new position size
    const newPositionSize = newCollateralAmount * newLeverage;
    // Calculate dynamic position size (matching on-chain logic)
    // This adjusts position size based on current price vs open price
    const newPosSizeCollateralDynamic = (newPositionSize * currentPairPrice) / newOpenPrice;
    // Use the provided trade value as margin value
    // This already includes collateral + PnL with price impact - fees
    const newMarginValueCollateral = tradeValueCollateral;
    // Calculate effective leverage (matching on-chain)
    // If margin value is <= 0, leverage is effectively infinite
    const effectiveLeverage = newMarginValueCollateral > 0
        ? newPosSizeCollateralDynamic / newMarginValueCollateral
        : Number.MAX_SAFE_INTEGER;
    return {
        effectiveLeverage,
        unrealizedPnl: tradeValueCollateral - newCollateralAmount,
        effectiveCollateral: newMarginValueCollateral,
        positionSize: newPositionSize,
    };
};
exports.getTradeNewEffectiveLeverage = getTradeNewEffectiveLeverage;
/**
 * @dev Simplified version for existing positions
 * @param input Trade parameters
 * @returns Effective leverage and related values
 */
const getTradeEffectiveLeverage = (input) => {
    return (0, exports.getTradeNewEffectiveLeverage)(input);
};
exports.getTradeEffectiveLeverage = getTradeEffectiveLeverage;

},{}],
"trade/counterTrade/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./types"), exports);
__exportStar(require("./validateCounterTrade"), exports);

},{"./types": "trade/counterTrade/types.js", "./validateCounterTrade": "trade/counterTrade/validateCounterTrade.js"}],
"trade/counterTrade/types.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"trade/counterTrade/validateCounterTrade.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCounterTrade = void 0;
/**
 * Validates a counter trade based on pair OI skew, matching the contract's validateCounterTrade logic
 * @param trade Trade object
 * @param positionSizeCollateral Position size in collateral tokens
 * @param context Context containing the pair OI skew
 * @returns Validation result with exceeding collateral amount if applicable
 */
function validateCounterTrade(trade, positionSizeCollateral, context) {
    const { pairOiSkewCollateral } = context;
    // Calculate signed position size based on trade direction
    const positionSizeCollateralSigned = positionSizeCollateral * (trade.long ? 1 : -1);
    // Check if position improves skew (opposite signs)
    if (pairOiSkewCollateral === 0 ||
        (pairOiSkewCollateral > 0 && positionSizeCollateralSigned > 0) ||
        (pairOiSkewCollateral < 0 && positionSizeCollateralSigned < 0)) {
        return { isValidated: false, exceedingPositionSizeCollateral: 0 };
    }
    // Calculate maximum position size that brings skew to 0
    const maxPositionSizeCollateral = Math.abs(pairOiSkewCollateral);
    // Calculate exceeding amount
    const exceedingPositionSizeCollateral = positionSizeCollateral > maxPositionSizeCollateral
        ? positionSizeCollateral - maxPositionSizeCollateral
        : 0;
    return { isValidated: true, exceedingPositionSizeCollateral };
}
exports.validateCounterTrade = validateCounterTrade;

},{}],
"utils/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./packing"), exports);

},{"./packing": "utils/packing.js"}],
"utils/packing.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpack = exports.pack = void 0;
const pack = (values, bitLengths) => {
    if (values.length !== bitLengths.length) {
        throw new Error("Mismatch in the lengths of values and bitLengths arrays");
    }
    let packed = BigInt(0);
    let currentShift = BigInt(0);
    for (let i = 0; i < values.length; i++) {
        if (currentShift + bitLengths[i] > BigInt(256)) {
            throw new Error("Packed value exceeds 256 bits");
        }
        const maxValue = (BigInt(1) << bitLengths[i]) - BigInt(1);
        if (values[i] > maxValue) {
            throw new Error("Value too large for specified bit length");
        }
        const maskedValue = values[i] & maxValue;
        packed |= maskedValue << currentShift;
        currentShift += bitLengths[i];
    }
    return packed;
};
exports.pack = pack;
const unpack = (packed, bitLengths) => {
    const values = [];
    let currentShift = BigInt(0);
    for (let i = 0; i < bitLengths.length; i++) {
        if (currentShift + bitLengths[i] > BigInt(256)) {
            throw new Error("Unpacked value exceeds 256 bits");
        }
        const maxValue = (BigInt(1) << bitLengths[i]) - BigInt(1);
        const mask = maxValue << currentShift;
        values[i] = (packed & mask) >> currentShift;
        currentShift += bitLengths[i];
    }
    return values;
};
exports.unpack = unpack;

},{}],
"backend/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCollateralsBackend = exports.convertTradingPairsBackend = exports.convertTraderFeeTiersBackend = exports.convertOiWindowsSettingsBackend = exports.convertOiWindowsBackend = exports.convertPairOiBackend = exports.convertTradeContainerBackend = void 0;
__exportStar(require("./tradingVariables"), exports);
__exportStar(require("./globalTrades"), exports);
// Re-export backend-specific converters with "Backend" suffix to avoid conflicts
var converter_1 = require("./tradingVariables/converter");
Object.defineProperty(exports, "convertTradeContainerBackend", { enumerable: true, get: function () { return converter_1.convertTradeContainer; } });
Object.defineProperty(exports, "convertPairOiBackend", { enumerable: true, get: function () { return converter_1.convertPairOi; } });
Object.defineProperty(exports, "convertOiWindowsBackend", { enumerable: true, get: function () { return converter_1.convertOiWindows; } });
Object.defineProperty(exports, "convertOiWindowsSettingsBackend", { enumerable: true, get: function () { return converter_1.convertOiWindowsSettings; } });
Object.defineProperty(exports, "convertTraderFeeTiersBackend", { enumerable: true, get: function () { return converter_1.convertTraderFeeTiers; } });
Object.defineProperty(exports, "convertTradingPairsBackend", { enumerable: true, get: function () { return converter_1.convertTradingPairs; } });
Object.defineProperty(exports, "convertCollateralsBackend", { enumerable: true, get: function () { return converter_1.convertCollaterals; } });

},{"./tradingVariables": "backend/tradingVariables/index.js", "./globalTrades": "backend/globalTrades/index.js", "./tradingVariables/converter": "backend/tradingVariables/converter.js"}],
"backend/tradingVariables/index.js":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformGlobalTradingVariables = void 0;
const converter_1 = require("./converter");
const trade_1 = require("../../trade");
const transformGlobalTradingVariables = (rawData) => {
    const globalTradingVariables = {
        collaterals: (0, converter_1.convertCollaterals)(rawData.collaterals),
        pairs: (0, converter_1.convertTradingPairs)(rawData.pairs),
        stockPairToActiveStockSplit: (0, converter_1.generateStockPairToActiveStockSplit)(rawData.pairs),
        groups: (0, converter_1.convertTradingGroups)(rawData.groups),
        fees: (0, converter_1.convertFees)(rawData.fees),
        orderTimeout: rawData.marketOrdersTimeoutBlocks,
        blockConfirmations: rawData.blockConfirmations,
        forexClosed: !rawData.isForexOpen,
        stocksClosed: !rawData.isStocksOpen,
        indicesClosed: !rawData.isIndicesOpen,
        commoditiesClosed: !rawData.isCommoditiesOpen,
        pairDepthBands: rawData.pairInfos?.pairDepthBands !== undefined
            ? (0, converter_1.convertPairDepthBands)(rawData.pairInfos.pairDepthBands)
            : [],
        depthBandsMapping: rawData.depthBandsMapping !== undefined
            ? (0, converter_1.convertDepthBandsMapping)(rawData.depthBandsMapping)
            : { bands: [] },
        pairMaxLeverages: rawData.pairInfos?.maxLeverages !== undefined
            ? (0, converter_1.convertMaxLeverages)(rawData.pairInfos.maxLeverages)
            : [],
        maxNegativePnlOnOpenP: (rawData.maxNegativePnlOnOpenP && rawData.maxNegativePnlOnOpenP / 1e10) ||
            undefined,
        oiWindowsSettings: rawData.oiWindowsSettings !== undefined
            ? (0, converter_1.convertOiWindowsSettings)(rawData.oiWindowsSettings)
            : { startTs: 0, windowsDuration: 0, windowsCount: 0 },
        oiWindows: rawData.oiWindows !== undefined
            ? (0, converter_1.convertOiWindows)(rawData.oiWindows)
            : [],
        feeTiers: (0, converter_1.convertFeeTiers)(rawData.feeTiers),
        liquidationParams: {
            groups: rawData.liquidationParams?.groups?.map(liqParams => (0, trade_1.convertLiquidationParams)(liqParams)) || [],
            pairs: rawData.liquidationParams?.pairs?.map(liqParams => (0, trade_1.convertLiquidationParams)(liqParams)) || [],
        },
        counterTradeSettings: (0, trade_1.convertCounterTradeSettingsArray)(rawData.counterTradeSettings),
        pairFactors: rawData.pairInfos?.pairFactors?.map(factor => (0, converter_1.convertPairFactor)(factor)) || [],
        globalTradeFeeParams: rawData.globalTradeFeeParams
            ? (0, converter_1.convertGlobalTradeFeeParams)(rawData.globalTradeFeeParams)
            : undefined,
        congestionLevels: rawData.congestionLevels,
    };
    const currentBlock = (rawData.currentBlock > -1 && rawData.currentBlock) || undefined;
    const l1BlockNumber = (rawData.currentL1Block > -1 && rawData.currentL1Block) || undefined;
    const pairIndexes = {};
    for (let i = 0; i < rawData.pairs?.length; i++) {
        pairIndexes[rawData.pairs[i].from + "/" + rawData.pairs[i].to] = i;
    }
    if (globalTradingVariables.collaterals !== undefined) {
        const { collaterals } = globalTradingVariables;
        for (let i = 0; i < collaterals.length; i++) {
            collaterals[i].tradingPairs = getTradingPairs(globalTradingVariables.pairs, collaterals);
        }
    }
    return {
        globalTradingVariables,
        pairIndexes,
        blockNumber: currentBlock,
        l1BlockNumber,
    };
};
exports.transformGlobalTradingVariables = transformGlobalTradingVariables;
// Orphaned function
const getTradingPairs = (pairs, collaterals) => {
    const tradingPairs = new Map();
    if (pairs) {
        for (let j = 0; j < pairs.length; j++) {
            const pair = pairs[j];
            // pair is tradeable if any collateral is enabled (max oi > 0)
            if (collaterals.some((collat) => collat.pairOis[j].maxCollateral > 0)) {
                tradingPairs.set(j, pair);
            }
        }
    }
    return tradingPairs;
};
// Re-export everything from backend.types
__exportStar(require("./backend.types"), exports);
__exportStar(require("./types"), exports);

},{"./converter": "backend/tradingVariables/converter.js", "../../trade": "trade/index.js", "./backend.types": "backend/tradingVariables/backend.types.js", "./types": "backend/tradingVariables/types.js"}],
"backend/tradingVariables/converter.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLiquidationParams = exports.convertPairName = exports.convertFeePerBlockCap = exports.convertMaxLeverages = exports.convertGlobalTradeFeeParams = exports.convertTraderFeeTiers = exports.convertFeeTiers = exports.convertCollateralConfig = exports.convertOiWindowsSettings = exports.convertOiWindows = exports.convertPairOi = exports.convertContestLeaderboardEntry = exports.generateStockPairToActiveStockSplit = exports.convertTradeInitialAccFees = exports.convertTradeInfo = exports.convertTrade = exports.convertPairFactor = exports.convertTradeContainer = exports.convertTradesAndLimitOrders = exports.convertTradingPairs = exports.convertTradingGroups = exports.convertGroupBorrowingFees = exports.convertPairBorrowingFees = exports.convertPairSkewDepths = exports.convertDepthBandsMapping = exports.convertPairDepthBands = exports.convertOpenInterests = exports.convertCollaterals = exports.convertFees = void 0;
const __1 = require("../../");
Object.defineProperty(exports, "convertLiquidationParams", { enumerable: true, get: function () { return __1.convertLiquidationParams; } });
const converter_1 = require("../../trade/priceImpact/skew/converter");
const converter_2 = require("../../trade/priceImpact/cumulVol/converter");
const depthBands_1 = require("../../pricing/depthBands");
const convertFees = (fees) => fees?.map(fee => convertFee(fee));
exports.convertFees = convertFees;
const convertCollateral = (collateral) => ({
    pairBorrowingFees: collateral.borrowingFees?.v1 !== undefined
        ? (0, exports.convertPairBorrowingFees)(collateral.borrowingFees.v1)
        : [],
    groupBorrowingFees: collateral.borrowingFees?.v1 !== undefined
        ? (0, exports.convertGroupBorrowingFees)(collateral.borrowingFees.v1)
        : [],
    collateral: collateral.collateral,
    collateralConfig: (0, exports.convertCollateralConfig)(collateral),
    collateralIndex: collateral.collateralIndex,
    gToken: collateral.gToken,
    isActive: true,
    prices: collateral.prices,
    symbol: collateral.symbol,
    pairBorrowingFeesV2: {
        params: (0, __1.convertBorrowingFeeParamsArrayV2)(collateral.borrowingFees?.v2
            ?.pairParams),
        data: (0, __1.convertPairBorrowingFeeDataArrayV2)(collateral.borrowingFees?.v2
            ?.pairData),
    },
    pairFundingFees: {
        globalParams: (0, __1.convertPairGlobalParamsArray)(collateral.fundingFees
            ?.pairGlobalParams),
        params: (0, __1.convertFundingFeeParamsArray)(collateral.fundingFees
            ?.pairParams),
        data: (0, __1.convertPairFundingFeeDataArray)(collateral.fundingFees
            ?.pairData),
    },
    pairOis: (0, __1.convertPairOiArray)(collateral.pairOis, parseInt(collateral.collateralConfig.precision)),
    pairSkewDepths: (0, exports.convertPairSkewDepths)(collateral.pairSkewDepths),
});
const convertCollaterals = (collaterals) => collaterals?.map(collateral => convertCollateral(collateral));
exports.convertCollaterals = convertCollaterals;
const convertFee = (fee) => ({
    totalPositionSizeFeeP: parseFloat(fee.totalPositionSizeFeeP) / 1e12,
    totalLiqCollateralFeeP: parseFloat(fee.totalLiqCollateralFeeP) / 1e12,
    oraclePositionSizeFeeP: parseFloat(fee.oraclePositionSizeFeeP) / 1e12,
    minPositionSizeUsd: parseFloat(fee.minPositionSizeUsd) / 1e3,
});
const convertOpenInterests = (interests) => interests?.map(interest => convertOpenInterest(interest));
exports.convertOpenInterests = convertOpenInterests;
const convertOpenInterest = (interest) => ({
    long: parseFloat(interest.beforeV10.long) / 1e10,
    short: parseFloat(interest.beforeV10.short) / 1e10,
    max: parseFloat(interest.beforeV10.max) / 1e10,
});
const convertPairDepthBands = (pairDepthBands) => pairDepthBands?.map(bands => (0, converter_2.convertPairDepthBandsFromSlots)(BigInt(bands.aboveSlot1), BigInt(bands.aboveSlot2), BigInt(bands.belowSlot1), BigInt(bands.belowSlot2))) || [];
exports.convertPairDepthBands = convertPairDepthBands;
const convertDepthBandsMapping = (mapping) => {
    // First decode the raw slots to get bands in basis points
    const bandsBps = (0, depthBands_1.decodeDepthBandsMapping)(BigInt(mapping.slot1), BigInt(mapping.slot2));
    // Convert from basis points to 0-1 range
    return {
        bands: bandsBps.map(bps => bps / 10000),
    };
};
exports.convertDepthBandsMapping = convertDepthBandsMapping;
const convertPairSkewDepths = (pairSkewDepths) => {
    if (!pairSkewDepths)
        return {};
    return (0, converter_1.convertPairSkewDepths)(pairSkewDepths);
};
exports.convertPairSkewDepths = convertPairSkewDepths;
const convertPairBorrowingFees = (pairParams) => pairParams?.pairs.map(pairParam => convertPairBorrowingFee(pairParam));
exports.convertPairBorrowingFees = convertPairBorrowingFees;
const convertPairGroupBorrowingFee = (pairParam) => ({
    groupIndex: parseInt(pairParam.groupIndex),
    initialAccFeeLong: parseFloat(pairParam.initialAccFeeLong) / 1e10,
    initialAccFeeShort: parseFloat(pairParam.initialAccFeeShort) / 1e10,
    pairAccFeeLong: parseFloat(pairParam.pairAccFeeLong) / 1e10,
    pairAccFeeShort: parseFloat(pairParam.pairAccFeeShort) / 1e10,
    prevGroupAccFeeLong: parseFloat(pairParam.prevGroupAccFeeLong) / 1e10,
    prevGroupAccFeeShort: parseFloat(pairParam.prevGroupAccFeeShort) / 1e10,
    block: parseInt(pairParam.block),
});
const convertPairBorrowingFee = (pairParams) => ({
    groups: pairParams.groups.map(pairParam => convertPairGroupBorrowingFee(pairParam)),
    feePerBlock: parseFloat(pairParams.feePerBlock) / 1e10,
    accFeeLong: parseFloat(pairParams.accFeeLong) / 1e10,
    accFeeShort: parseFloat(pairParams.accFeeShort) / 1e10,
    accLastUpdatedBlock: parseInt(pairParams.accLastUpdatedBlock),
    oi: {
        max: parseFloat(pairParams.oi.beforeV10.max) / 1e10 || 0,
        long: parseFloat(pairParams.oi.beforeV10.long) / 1e10 || 0,
        short: parseFloat(pairParams.oi.beforeV10.short) / 1e10 || 0,
    },
    feeExponent: parseInt(pairParams.feeExponent) || 0,
    feePerBlockCap: (0, exports.convertFeePerBlockCap)(pairParams?.feePerBlockCap),
});
const convertGroupBorrowingFees = (pairParams) => pairParams?.groups.map(pairParam => convertGroupBorrowingFee(pairParam));
exports.convertGroupBorrowingFees = convertGroupBorrowingFees;
const convertGroupBorrowingFee = (pairParams) => ({
    oi: {
        long: parseFloat(pairParams.oi.long) / 1e10,
        short: parseFloat(pairParams.oi.short) / 1e10,
        max: parseFloat(pairParams.oi.max) / 1e10 || 0,
    },
    feePerBlock: parseFloat(pairParams.feePerBlock) / 1e10,
    accFeeLong: parseFloat(pairParams.accFeeLong) / 1e10,
    accFeeShort: parseFloat(pairParams.accFeeShort) / 1e10,
    accLastUpdatedBlock: parseInt(pairParams.accLastUpdatedBlock),
    feeExponent: parseInt(pairParams.feeExponent) || 0,
});
const convertTradingGroups = (groups) => groups?.map(group => convertTradingGroup(group));
exports.convertTradingGroups = convertTradingGroups;
const convertTradingGroup = (group) => ({
    maxLeverage: parseFloat(group.maxLeverage) / 1e3,
    minLeverage: parseFloat(group.minLeverage) / 1e3,
    name: group.name,
});
const convertTradingPairs = (pairs) => pairs
    ?.filter(pair => pair.from !== "")
    .map((pair, index) => convertTradingPair(pair, index));
exports.convertTradingPairs = convertTradingPairs;
const convertTradingPair = (pair, index) => ({
    name: (0, exports.convertPairName)(pair),
    description: (0, __1.getPairDescription)(index),
    from: pair.from,
    to: pair.to,
    pairIndex: index,
    feeIndex: parseInt(pair.feeIndex),
    groupIndex: parseInt(pair.groupIndex),
    spreadP: parseFloat(pair.spreadP) / 1e10,
});
const convertTradesAndLimitOrders = (allItems, collaterals) => allItems?.map(item => {
    return (0, exports.convertTradeContainer)(item, collaterals);
});
exports.convertTradesAndLimitOrders = convertTradesAndLimitOrders;
const convertTradeContainer = (tradeContainer, collaterals) => {
    const trade = (0, exports.convertTrade)(tradeContainer.trade, collaterals);
    const collateralIndex = trade.collateralIndex;
    return {
        trade,
        tradeInfo: (0, exports.convertTradeInfo)(tradeContainer.tradeInfo),
        initialAccFees: tradeContainer.initialAccFees === undefined
            ? {
                accPairFee: 0,
                accGroupFee: 0,
                block: 0,
            }
            : (0, exports.convertTradeInitialAccFees)(tradeContainer.initialAccFees),
        liquidationParams: tradeContainer.liquidationParams === undefined
            ? {
                maxLiqSpreadP: 0,
                startLiqThresholdP: 0,
                endLiqThresholdP: 0,
                startLeverage: 0,
                endLeverage: 0,
            }
            : (0, __1.convertLiquidationParams)(tradeContainer.liquidationParams),
        tradeFeesData: tradeContainer.tradeFeesData
            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
                (0, __1.convertTradeFeesData)(tradeContainer.tradeFeesData, collaterals[collateralIndex - 1].collateralConfig)
            : undefined,
        uiRealizedPnlData: tradeContainer.uiRealizedPnlData
            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
                (0, __1.convertUiRealizedPnlData)(tradeContainer.uiRealizedPnlData, collaterals[collateralIndex - 1].collateralConfig)
            : undefined,
    };
};
exports.convertTradeContainer = convertTradeContainer;
const convertPairFactor = (pairFactor) => ({
    cumulativeFactor: parseFloat(pairFactor.cumulativeFactor) / 1e10,
    protectionCloseFactor: parseFloat(pairFactor.protectionCloseFactor) / 1e10,
    protectionCloseFactorBlocks: parseInt(pairFactor.protectionCloseFactorBlocks),
    exemptOnOpen: pairFactor.exemptOnOpen,
    exemptAfterProtectionCloseFactor: pairFactor.exemptAfterProtectionCloseFactor,
});
exports.convertPairFactor = convertPairFactor;
const convertTrade = (trade, collaterals) => {
    const { long, user } = trade;
    const collateralIndex = parseInt(trade.collateralIndex);
    const collateral = collaterals[collateralIndex - 1];
    const decimals = collateral?.collateralConfig?.decimals || 18;
    return {
        user,
        index: parseInt(trade.index),
        pairIndex: parseInt(trade.pairIndex),
        leverage: parseInt(trade.leverage) / 1e3,
        long,
        isOpen: trade.isOpen,
        collateralIndex,
        tradeType: parseInt(trade.tradeType),
        collateralAmount: parseFloat(trade.collateralAmount) / 10 ** decimals,
        openPrice: parseFloat(trade.openPrice) / 1e10,
        sl: parseFloat(trade.sl) / 1e10,
        tp: parseFloat(trade.tp) / 1e10,
        isCounterTrade: trade.isCounterTrade,
        positionSizeToken: trade.positionSizeToken
            ? parseFloat(trade.positionSizeToken) / 1e18
            : undefined,
    };
};
exports.convertTrade = convertTrade;
const convertTradeInfo = (tradeInfo) => ({
    createdBlock: parseInt(tradeInfo.createdBlock),
    tpLastUpdatedBlock: parseInt(tradeInfo.tpLastUpdatedBlock),
    slLastUpdatedBlock: parseInt(tradeInfo.slLastUpdatedBlock),
    maxSlippageP: parseFloat(tradeInfo.maxSlippageP) / 1e3 || 1,
    lastOiUpdateTs: tradeInfo.lastOiUpdateTs,
    collateralPriceUsd: tradeInfo.collateralPriceUsd && tradeInfo.collateralPriceUsd !== "0"
        ? parseFloat(tradeInfo.collateralPriceUsd) / 1e8
        : 1,
    contractsVersion: parseInt(tradeInfo.contractsVersion),
    lastPosIncreaseBlock: parseInt(tradeInfo.lastPosIncreaseBlock),
});
exports.convertTradeInfo = convertTradeInfo;
const convertTradeInitialAccFees = (initialAccFees) => ({
    accPairFee: parseFloat(initialAccFees.accPairFee || "0") / 1e10,
    accGroupFee: parseFloat(initialAccFees.accGroupFee || "0") / 1e10,
    block: parseInt(initialAccFees.block || "0"),
});
exports.convertTradeInitialAccFees = convertTradeInitialAccFees;
const generateStockPairToActiveStockSplit = (pairs) => {
    const result = new Map();
    if (!pairs) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
    }
    const basePairFroms = new Set();
    const splitPairFroms = new Set();
    pairs.forEach(p => {
        const from = p.from;
        if (from.includes("_")) {
            splitPairFroms.add(from);
        }
        else {
            basePairFroms.add(from);
        }
    });
    splitPairFroms.forEach(splitFrom => {
        const [potentialSplitPairFromBase, potentialSplitPairFromSplitId] = splitFrom.split("_");
        const currentHighestSplitPairIdForBasePair = result.get(potentialSplitPairFromBase);
        if ((currentHighestSplitPairIdForBasePair &&
            +potentialSplitPairFromSplitId >
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                +currentHighestSplitPairIdForBasePair.split("_")[1]) ||
            (!currentHighestSplitPairIdForBasePair &&
                basePairFroms.has(potentialSplitPairFromBase))) {
            result.set(potentialSplitPairFromBase, splitFrom);
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
};
exports.generateStockPairToActiveStockSplit = generateStockPairToActiveStockSplit;
const convertContestLeaderboardEntry = (entry) => {
    const [trader, numWins, numLosses, avgWin, avgLoss, daiProfit, pctProfit, daiVolume,] = entry;
    return {
        trader,
        numWins,
        numLosses,
        avgWin,
        avgLoss,
        daiProfit,
        pctProfit,
        daiVolume,
    };
};
exports.convertContestLeaderboardEntry = convertContestLeaderboardEntry;
// OiWindow values are normalized to USD 1e18
const convertPairOi = (collateral) => ({
    oiLongUsd: parseFloat(collateral.oiLongUsd) / 1e18,
    oiShortUsd: parseFloat(collateral.oiShortUsd) / 1e18,
});
exports.convertPairOi = convertPairOi;
const convertOiWindows = (oiWindows) => {
    return oiWindows?.map(pairWindows => {
        const converted = {};
        for (const [key, oiWindow] of Object.entries(pairWindows)) {
            converted[key] = (0, exports.convertPairOi)(oiWindow);
        }
        return converted;
    });
};
exports.convertOiWindows = convertOiWindows;
const convertOiWindowsSettings = (oiWindowsSettings) => ({
    startTs: oiWindowsSettings.startTs,
    windowsDuration: oiWindowsSettings.windowsDuration,
    windowsCount: oiWindowsSettings.windowsCount,
});
exports.convertOiWindowsSettings = convertOiWindowsSettings;
const convertCollateralConfig = (collateral) => ({
    collateral: collateral.collateral,
    isActive: collateral.isActive,
    precision: parseInt(collateral.collateralConfig.precision),
    precisionDelta: parseInt(collateral.collateralConfig.precisionDelta),
    decimals: collateral.collateralConfig.decimals,
});
exports.convertCollateralConfig = convertCollateralConfig;
const convertFeeTiers = (feeTiersBackend) => ({
    tiers: feeTiersBackend?.tiers.map(tier => ({
        feeMultiplier: Number(tier.feeMultiplier) / 1e3,
        pointsThreshold: parseFloat(tier.pointsThreshold),
    })),
    multipliers: feeTiersBackend?.multipliers?.map(mult => parseFloat(mult) / 1e3) || [],
    currentDay: feeTiersBackend?.currentDay || 0,
    stakingTiers: feeTiersBackend?.stakingTiers.map(tier => ({
        feeMultiplier: Number(tier.feeMultiplier) / 1e3,
        pointsThreshold: parseFloat(tier.pointsThreshold),
    })) || [],
    gnsVaultAddress: feeTiersBackend?.gnsVaultAddress ||
        "0x0000000000000000000000000000000000000000",
    useGnsVaultBalance: feeTiersBackend?.useGnsVaultBalance || false,
});
exports.convertFeeTiers = convertFeeTiers;
const convertTraderFeeTiers = (traderFeeTiers) => ({
    traderEnrollment: {
        status: traderFeeTiers.traderEnrollment.status,
    },
    traderInfo: {
        lastDayUpdated: traderFeeTiers.traderInfo.lastDayUpdated,
        trailingPoints: parseFloat(traderFeeTiers.traderInfo.trailingPoints) / 1e18,
    },
    stakingInfo: {
        stakedGns: parseFloat(traderFeeTiers.stakingInfo.stakedGns) / 1e18,
        stakedVaultGns: parseFloat(traderFeeTiers.stakingInfo.stakedVaultGns) / 1e18,
        bonusAmount: Number(traderFeeTiers.stakingInfo.bonusAmount),
        stakeTimestamp: traderFeeTiers.stakingInfo.stakeTimestamp,
        feeMultiplierCache: parseFloat(traderFeeTiers.stakingInfo.feeMultiplierCache) / 1e3,
    },
    inboundPoints: parseFloat(traderFeeTiers.inboundPoints) / 1e18,
    outboundPoints: parseFloat(traderFeeTiers.outboundPoints) / 1e18,
    lastDayUpdatedPoints: parseFloat(traderFeeTiers.lastDayUpdatedPoints) / 1e18,
    expiredPoints: traderFeeTiers.expiredPoints.map(point => parseFloat(point) / 1e18),
    unclaimedPoints: parseFloat(traderFeeTiers.unclaimedPoints) / 1e18,
});
exports.convertTraderFeeTiers = convertTraderFeeTiers;
const convertGlobalTradeFeeParams = (fee) => ({
    referralFeeP: parseFloat(fee.referralFeeP) / 1e5,
    govFeeP: parseFloat(fee.govFeeP) / 1e5,
    triggerOrderFeeP: parseFloat(fee.triggerOrderFeeP) / 1e5,
    gnsOtcFeeP: parseFloat(fee.gnsOtcFeeP) / 1e5,
    gTokenFeeP: parseFloat(fee.gTokenFeeP) / 1e5,
});
exports.convertGlobalTradeFeeParams = convertGlobalTradeFeeParams;
const convertMaxLeverages = (maxLeverages) => maxLeverages?.map(maxLeverage => parseFloat(maxLeverage) / 1e3);
exports.convertMaxLeverages = convertMaxLeverages;
const convertFeePerBlockCap = (feeCap) => ({
    minP: feeCap?.minP ? parseFloat(feeCap.minP.toString()) / 1e3 / 100 : 0,
    maxP: feeCap?.maxP ? parseFloat(feeCap.maxP.toString()) / 1e3 / 100 : 1,
});
exports.convertFeePerBlockCap = convertFeePerBlockCap;
const convertPairName = (pair) => {
    if (!pair)
        return "";
    return pair.from.split("_")[0] + "/" + pair.to;
};
exports.convertPairName = convertPairName;

},{"../../": "index.js", "../../trade/priceImpact/skew/converter": "trade/priceImpact/skew/converter.js", "../../trade/priceImpact/cumulVol/converter": "trade/priceImpact/cumulVol/converter.js", "../../pricing/depthBands": "pricing/depthBands.js"}],
"backend/tradingVariables/backend.types.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],
"backend/tradingVariables/types.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRADE_TYPE = exports.ORDER_TYPE = void 0;
var ORDER_TYPE;
(function (ORDER_TYPE) {
    ORDER_TYPE["LIMIT"] = "LIMIT";
    ORDER_TYPE["STOP"] = "STOP";
    ORDER_TYPE["MARKET"] = "MARKET";
})(ORDER_TYPE = exports.ORDER_TYPE || (exports.ORDER_TYPE = {}));
var TRADE_TYPE;
(function (TRADE_TYPE) {
    TRADE_TYPE["LONG"] = "LONG";
    TRADE_TYPE["SHORT"] = "SHORT";
})(TRADE_TYPE = exports.TRADE_TYPE || (exports.TRADE_TYPE = {}));

},{}],
"backend/globalTrades/index.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformGlobalTrades = void 0;
const trade_1 = require("../../trade");
const converter_1 = require("./../tradingVariables/converter");
const transformGlobalTrades = (rawTrades, pairs, currentAddress, collaterals) => {
    if (rawTrades === undefined)
        return;
    const r = (0, converter_1.convertTradesAndLimitOrders)(rawTrades, collaterals);
    const returnObject = {
        allTrades: new Map(),
        allLimitOrders: new Map(),
        trades: new Map(),
        limitOrders: new Map(),
    };
    currentAddress = currentAddress === undefined ? "" : currentAddress;
    const _trades = new Map();
    const _limitOrders = new Map();
    const _allTrades = new Map();
    const _allLimitOrders = new Map();
    for (let s = 0; s < r.length; s++) {
        if (r[s].trade.tradeType !== trade_1.TradeType.TRADE) {
            const t = r[s];
            if (_allLimitOrders.get(t.trade.user) === undefined) {
                _allLimitOrders.set(t.trade.user, new Map());
            }
            const traderMap_all = _allLimitOrders.get(t.trade.user);
            if (traderMap_all?.get(t.trade.pairIndex) === undefined) {
                traderMap_all?.set(t.trade.pairIndex, new Map());
            }
            const traderPairMap_all = traderMap_all?.get(t.trade.pairIndex);
            traderPairMap_all?.set(t.trade.index, t);
            if (t.trade.user.toUpperCase() !== currentAddress.toUpperCase()) {
                continue;
            }
            if (_limitOrders.get(t.trade.pairIndex) === undefined) {
                _limitOrders.set(t.trade.pairIndex, new Map());
            }
            const traderPairMap = _limitOrders.get(t.trade.pairIndex);
            traderPairMap?.set(t.trade.index, t);
        }
        else {
            const t = r[s];
            if (_allTrades.get(t.trade.user) === undefined) {
                _allTrades.set(t.trade.user, new Map());
            }
            const traderMap_all = _allTrades.get(t.trade.user);
            if (traderMap_all?.get(t.trade.pairIndex) === undefined) {
                traderMap_all?.set(t.trade.pairIndex, new Map());
            }
            const traderPairMap_all = traderMap_all?.get(t.trade.pairIndex);
            traderPairMap_all?.set(t.trade.index, t);
            if (t.trade.user.toUpperCase() !== currentAddress.toUpperCase()) {
                continue;
            }
            if (_trades.get(t.trade.pairIndex) === undefined) {
                _trades.set(t.trade.pairIndex, new Map());
            }
            const traderPairMap = _trades.get(t.trade.pairIndex);
            traderPairMap?.set(t.trade.index, t);
        }
    }
    returnObject.trades = _trades;
    returnObject.limitOrders = _limitOrders;
    returnObject.allTrades = _allTrades;
    returnObject.allLimitOrders = _allLimitOrders;
    return returnObject;
};
exports.transformGlobalTrades = transformGlobalTrades;

},{"../../trade": "trade/index.js", "./../tradingVariables/converter": "backend/tradingVariables/converter.js"}],
"pricing/index.js":[function(require,module,exports){
"use strict";
/**
 * @dev Pricing module exports
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./depthBands"), exports);

},{"./depthBands": "pricing/depthBands.js"}],
"contracts/utils/pairs.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPairDescription = exports.fetchOpenInterest = exports.fetchFees = exports.fetchDepthBandsMappingDecoded = exports.fetchDepthBandsMapping = exports.fetchPairDepthBandsDecoded = exports.fetchPairDepthBands = exports.fetchPairs = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const types_1 = require("../../trade/types");
const fetchPairs = async (contracts, pairIxs) => {
    if (!contracts) {
        return [];
    }
    const { gnsMultiCollatDiamond: multiCollatContract } = contracts;
    try {
        const pairs = await Promise.all(pairIxs.map(pairIndex => multiCollatContract.pairs(pairIndex)));
        return pairs.map((pair, index) => {
            return {
                name: pair.from + "/" + pair.to,
                from: pair.from,
                to: pair.to,
                feeIndex: parseInt(pair.feeIndex.toString()),
                groupIndex: parseInt(pair.groupIndex.toString()),
                pairIndex: pairIxs[index],
                spreadP: parseFloat(pair.spreadP.toString()) / 1e12,
                description: (0, exports.getPairDescription)(pairIxs[index]),
            };
        });
    }
    catch (error) {
        console.error(`Unexpected error while fetching pairs!`);
        throw error;
    }
};
exports.fetchPairs = fetchPairs;
const fetchPairDepthBands = async (contracts, pairIxs) => {
    if (!contracts || pairIxs.length === 0) {
        return [];
    }
    const { gnsMultiCollatDiamond: multiCollatContract } = contracts;
    try {
        // Returns array of PairDepthBands structs (encoded slots)
        return await multiCollatContract.getPairDepthBandsArray(pairIxs);
    }
    catch (error) {
        console.error(`Unexpected error while fetching pair depth bands!`);
        throw error;
    }
};
exports.fetchPairDepthBands = fetchPairDepthBands;
const fetchPairDepthBandsDecoded = async (contracts, pairIxs) => {
    if (!contracts || pairIxs.length === 0) {
        return {
            totalDepthAboveUsd: [],
            totalDepthBelowUsd: [],
            bandsAbove: [],
            bandsBelow: [],
        };
    }
    const { gnsMultiCollatDiamond: multiCollatContract } = contracts;
    try {
        // Returns decoded values
        // Using quoted signature for overloaded function
        const [totalDepthAboveUsd, totalDepthBelowUsd, bandsAbove, bandsBelow] = await multiCollatContract.getPairDepthBandsDecodedArray(pairIxs);
        return {
            totalDepthAboveUsd: totalDepthAboveUsd.map((v) => parseFloat(v.toString())),
            totalDepthBelowUsd: totalDepthBelowUsd.map((v) => parseFloat(v.toString())),
            bandsAbove: bandsAbove.map((bands) => bands.map((b) => parseInt(b.toString()))),
            bandsBelow: bandsBelow.map((bands) => bands.map((b) => parseInt(b.toString()))),
        };
    }
    catch (error) {
        console.error(`Unexpected error while fetching decoded pair depth bands!`);
        throw error;
    }
};
exports.fetchPairDepthBandsDecoded = fetchPairDepthBandsDecoded;
const fetchDepthBandsMapping = async (contracts) => {
    if (!contracts) {
        return { slot1: "0", slot2: "0" };
    }
    const { gnsMultiCollatDiamond: multiCollatContract } = contracts;
    try {
        // Returns two uint256 slots
        const [slot1, slot2] = await multiCollatContract.getDepthBandsMapping();
        return {
            slot1: slot1.toString(),
            slot2: slot2.toString(),
        };
    }
    catch (error) {
        console.error(`Unexpected error while fetching depth bands mapping!`);
        throw error;
    }
};
exports.fetchDepthBandsMapping = fetchDepthBandsMapping;
const fetchDepthBandsMappingDecoded = async (contracts) => {
    if (!contracts) {
        return [];
    }
    const { gnsMultiCollatDiamond: multiCollatContract } = contracts;
    try {
        // Returns array of 30 uint16 values
        const bands = await multiCollatContract.getDepthBandsMappingDecoded();
        return bands.map((b) => parseInt(b.toString()));
    }
    catch (error) {
        console.error(`Unexpected error while fetching decoded depth bands mapping!`);
        throw error;
    }
};
exports.fetchDepthBandsMappingDecoded = fetchDepthBandsMappingDecoded;
const fetchFees = async (contracts, feeIxs) => {
    if (!contracts) {
        return [];
    }
    const { gnsMultiCollatDiamond: multiCollatContract } = contracts;
    try {
        const fees = await Promise.all(feeIxs.map(pairIndex => multiCollatContract.fees(pairIndex)));
        return fees.map(fee => {
            return {
                totalPositionSizeFeeP: parseFloat(fee.totalPositionSizeFeeP.toString()) / 1e12,
                totalLiqCollateralFeeP: parseFloat(fee.totalLiqCollateralFeeP.toString()) / 1e12,
                oraclePositionSizeFeeP: parseFloat(fee.oraclePositionSizeFeeP.toString()) / 1e12,
                minPositionSizeUsd: parseFloat(fee.minPositionSizeUsd.toString()) / 1e3,
            };
        });
    }
    catch (error) {
        console.error(`Unexpected error while fetching pairs!`);
        throw error;
    }
};
exports.fetchFees = fetchFees;
const fetchOpenInterest = async (contracts, collateralIndex, pairIxs) => {
    if (pairIxs.length === 0) {
        return [];
    }
    const openInterests = (await contracts.gnsMultiCollatDiamond.getAllBorrowingPairs(collateralIndex))[1];
    return pairIxs.map(pairIndex => {
        const openInterest = openInterests[pairIndex];
        if (!openInterest) {
            return { long: 0, short: 0, max: 0 };
        }
        return {
            long: parseFloat(openInterest[0].toString()) / 1e10,
            short: parseFloat(openInterest[1].toString()) / 1e10,
            max: parseFloat(openInterest[2].toString()) / 1e10,
        };
    });
};
exports.fetchOpenInterest = fetchOpenInterest;
const getPairDescription = (pairIndex) => {
    return PAIR_INDEX_TO_DESCRIPTION[pairIndex] || "";
};
exports.getPairDescription = getPairDescription;
const PAIR_INDEX_TO_DESCRIPTION = {
    [types_1.PairIndex.BTCUSD]: "Bitcoin to US Dollar",
    [types_1.PairIndex.ETHUSD]: "Ethereum to US Dollar",
    [types_1.PairIndex.LINKUSD]: "Chainlink to US Dollar",
    [types_1.PairIndex.DOGEUSD]: "Dogecoin to US Dollar",
    [types_1.PairIndex.MATICUSD]: "Polygon to US Dollar",
    [types_1.PairIndex.ADAUSD]: "Cardano to US Dollar",
    [types_1.PairIndex.SUSHIUSD]: "Sushiswap to US Dollar",
    [types_1.PairIndex.AAVEUSD]: "Aave to US Dollar",
    [types_1.PairIndex.ALGOUSD]: "Algorand to US Dollar",
    [types_1.PairIndex.BATUSD]: "Basic Attention Token to US Dollar",
    [types_1.PairIndex.COMPUSD]: "Compound to US Dollar",
    [types_1.PairIndex.DOTUSD]: "Polkadot to US Dollar",
    [types_1.PairIndex.EOSUSD]: "EOS to US Dollar",
    [types_1.PairIndex.LTCUSD]: "Litecoin to US Dollar",
    [types_1.PairIndex.MANAUSD]: "Decentraland to US Dollar",
    [types_1.PairIndex.OMGUSD]: "OMG Network to US Dollar",
    [types_1.PairIndex.SNXUSD]: "Synthetix to US Dollar",
    [types_1.PairIndex.UNIUSD]: "Uniswap to US Dollar",
    [types_1.PairIndex.XLMUSD]: "Stellar to US Dollar",
    [types_1.PairIndex.XRPUSD]: "Ripple to US Dollar",
    [types_1.PairIndex.ZECUSD]: "Zcash to US Dollar",
    [types_1.PairIndex.EURUSD]: "Euro to US Dollar",
    [types_1.PairIndex.USDJPY]: "US Dollar to Japanese Yen",
    [types_1.PairIndex.GBPUSD]: "British Pound to US Dollar",
    [types_1.PairIndex.USDCHF]: "US Dollar to Swiss Franc",
    [types_1.PairIndex.AUDUSD]: "Australian Dollar to US Dollar",
    [types_1.PairIndex.USDCAD]: "US Dollar to Canadian Dollar",
    [types_1.PairIndex.NZDUSD]: "New Zealand Dollar to US Dollar",
    [types_1.PairIndex.EURCHF]: "Euro to Swiss Franc",
    [types_1.PairIndex.EURJPY]: "Euro to Japanese Yen",
    [types_1.PairIndex.EURGBP]: "Euro to British Pound",
    [types_1.PairIndex.LUNAUSD]: "Terra to US Dollar",
    [types_1.PairIndex.YFIUSD]: "Yearn.finance to US Dollar",
    [types_1.PairIndex.SOLUSD]: "Solana to US Dollar",
    [types_1.PairIndex.XTZUSD]: "Tezos to US Dollar",
    [types_1.PairIndex.BCHUSD]: "Bitcoin Cash to US Dollar",
    [types_1.PairIndex.BNTUSD]: "Bancor to US Dollar",
    [types_1.PairIndex.CRVUSD]: "Curve DAO Token to US Dollar",
    [types_1.PairIndex.DASHUSD]: "Dash to US Dollar",
    [types_1.PairIndex.ETCUSD]: "Ethereum Classic to US Dollar",
    [types_1.PairIndex.ICPUSD]: "Internet Computer to US Dollar",
    [types_1.PairIndex.MKRUSD]: "Maker to US Dollar",
    [types_1.PairIndex.NEOUSD]: "NEO to US Dollar",
    [types_1.PairIndex.THETAUSD]: "Theta Network to US Dollar",
    [types_1.PairIndex.TRXUSD]: "TRON to US Dollar",
    [types_1.PairIndex.ZRXUSD]: "0x to US Dollar",
    [types_1.PairIndex.SANDUSD]: "The Sandbox to US Dollar",
    [types_1.PairIndex.BNBUSD]: "Binance Coin to US Dollar",
    [types_1.PairIndex.AXSUSD]: "Axie Infinity to US Dollar",
    [types_1.PairIndex.GRTUSD]: "The Graph to US Dollar",
    [types_1.PairIndex.HBARUSD]: "Hedera Hashgraph to US Dollar",
    [types_1.PairIndex.XMRUSD]: "Monero to US Dollar",
    [types_1.PairIndex.ENJUSD]: "Enjin Coin to US Dollar",
    [types_1.PairIndex.FTMUSD]: "Fantom to US Dollar",
    [types_1.PairIndex.FTTUSD]: "FTX Token to US Dollar",
    [types_1.PairIndex.APEUSD]: "ApeCoin to US Dollar",
    [types_1.PairIndex.CHZUSD]: "Chiliz to US Dollar",
    [types_1.PairIndex.SHIBUSD]: "Shiba Inu to US Dollar",
    [types_1.PairIndex.AAPLUSD]: "Apple to US Dollar",
    [types_1.PairIndex.FBUSD]: "Facebook to US Dollar",
    [types_1.PairIndex.GOOGLUSD]: "Google to US Dollar",
    [types_1.PairIndex.AMZNUSD]: "Amazon to US Dollar",
    [types_1.PairIndex.MSFTUSD]: "Microsoft to US Dollar",
    [types_1.PairIndex.TSLAUSD]: "Tesla to US Dollar",
    [types_1.PairIndex.SNAPUSD]: "Snapchat to US Dollar",
    [types_1.PairIndex.NVDAUSD]: "Nvidia to US Dollar",
    [types_1.PairIndex.VUSD]: "Visa to US Dollar",
    [types_1.PairIndex.MAUSD]: "Mastercard to US Dollar",
    [types_1.PairIndex.PFEUSD]: "Pfizer to US Dollar",
    [types_1.PairIndex.KOUSD]: "Coca-Cola to US Dollar",
    [types_1.PairIndex.DISUSD]: "Disney to US Dollar",
    [types_1.PairIndex.GMEUSD]: "GameStop to US Dollar",
    [types_1.PairIndex.NKEUSD]: "Nike to US Dollar",
    [types_1.PairIndex.AMDUSD]: "AMD to US Dollar",
    [types_1.PairIndex.PYPLUSD]: "PayPal to US Dollar",
    [types_1.PairIndex.ABNBUSD]: "Airbnb to US Dollar",
    [types_1.PairIndex.BAUSD]: "Boeing to US Dollar",
    [types_1.PairIndex.SBUXUSD]: "Starbucks to US Dollar",
    [types_1.PairIndex.WMTUSD]: "Walmart to US Dollar",
    [types_1.PairIndex.INTCUSD]: "Intel to US Dollar",
    [types_1.PairIndex.MCDUSD]: "McDonald's to US Dollar",
    [types_1.PairIndex.METAUSD]: "Meta Platforms to US Dollar",
    [types_1.PairIndex.GOOGLUSD2]: "Google to US Dollar",
    [types_1.PairIndex.GMEUSD2]: "GameStop to US Dollar",
    [types_1.PairIndex.AMZNUSD2]: "Amazon to US Dollar",
    [types_1.PairIndex.TSLAUSD2]: "Tesla to US Dollar",
    [types_1.PairIndex.SPYUSD]: "SPDR S&P 500 ETF Trust to US Dollar",
    [types_1.PairIndex.QQQUSD]: "Invesco QQQ Trust to US Dollar",
    [types_1.PairIndex.IWMUSD]: "iShares Russell 2000 ETF to US Dollar",
    [types_1.PairIndex.DIAUSD]: "SPDR Dow Jones Industrial Average ETF Trust to US Dollar",
    [types_1.PairIndex.XAUUSD]: "Gold to US Dollar",
    [types_1.PairIndex.XAGUSD]: "Silver to US Dollar",
    [types_1.PairIndex.USDCNH]: "US Dollar to Chinese Yuan Offshore",
    [types_1.PairIndex.USDSGD]: "US Dollar to Singapore Dollar",
    [types_1.PairIndex.EURSEK]: "Euro to Swedish Krona",
    [types_1.PairIndex.USDKRW]: "US Dollar to South Korean Won",
    [types_1.PairIndex.EURNOK]: "Euro to Norwegian Krone",
    [types_1.PairIndex.USDINR]: "US Dollar to Indian Rupee",
    [types_1.PairIndex.USDMXN]: "US Dollar to Mexican Peso",
    [types_1.PairIndex.USDTWD]: "US Dollar to Taiwan New Dollar",
    [types_1.PairIndex.USDZAR]: "US Dollar to South African Rand",
    [types_1.PairIndex.USDBRL]: "US Dollar to Brazilian Real",
    [types_1.PairIndex.AVAXUSD]: "Avalanche to US Dollar",
    [types_1.PairIndex.ATOMUSD]: "Cosmos to US Dollar",
    [types_1.PairIndex.NEARUSD]: "NEAR Protocol to US Dollar",
    [types_1.PairIndex.QNTUSD]: "Quant to US Dollar",
    [types_1.PairIndex.IOTAUSD]: "IOTA to US Dollar",
    [types_1.PairIndex.TONUSD]: "The Open Network to US Dollar",
    [types_1.PairIndex.RPLUSD]: "Rocket Pool to US Dollar",
    [types_1.PairIndex.ARBUSD]: "Arbitrum to US Dollar",
    [types_1.PairIndex.EURAUD]: "Euro to Australian Dollar",
    [types_1.PairIndex.EURNZD]: "Euro to New Zealand Dollar",
    [types_1.PairIndex.EURCAD]: "Euro to Canadian Dollar",
    [types_1.PairIndex.GBPAUD]: "British Pound to Australian Dollar",
    [types_1.PairIndex.GBPNZD]: "British Pound to New Zealand Dollar",
    [types_1.PairIndex.GBPCAD]: "British Pound to Canadian Dollar",
    [types_1.PairIndex.GBPCHF]: "British Pound to Swiss Franc",
    [types_1.PairIndex.GBPJPY]: "British Pound to Japanese Yen",
    [types_1.PairIndex.AUDNZD]: "Australian Dollar to New Zealand Dollar",
    [types_1.PairIndex.AUDCAD]: "Australian Dollar to Canadian Dollar",
    [types_1.PairIndex.AUDCHF]: "Australian Dollar to Swiss Franc",
    [types_1.PairIndex.AUDJPY]: "Australian Dollar to Japanese Yen",
    [types_1.PairIndex.NZDCAD]: "New Zealand Dollar to Canadian Dollar",
    [types_1.PairIndex.NZDCHF]: "New Zealand Dollar to Swiss Franc",
    [types_1.PairIndex.NZDJPY]: "New Zealand Dollar to Japanese Yen",
    [types_1.PairIndex.CADCHF]: "Canadian Dollar to Swiss Franc",
    [types_1.PairIndex.CADJPY]: "Canadian Dollar to Japanese Yen",
    [types_1.PairIndex.CHFJPY]: "Swiss Franc to Japanese Yen",
    [types_1.PairIndex.LDOUSD]: "Lido DAO to US Dollar",
    [types_1.PairIndex.INJUSD]: "Injective Protocol to US Dollar",
    [types_1.PairIndex.RUNEUSD]: "THORChain to US Dollar",
    [types_1.PairIndex.CAKEUSD]: "PancakeSwap to US Dollar",
    [types_1.PairIndex.FXSUSD]: "Frax Share to US Dollar",
    [types_1.PairIndex.TWTUSD]: "Trust Wallet Token to US Dollar",
    [types_1.PairIndex.PEPEUSD]: "Pepe to US Dollar",
    [types_1.PairIndex.DYDXUSD]: "dYdX to US Dollar",
    [types_1.PairIndex.GMXUSD]: "GMX to US Dollar",
    [types_1.PairIndex.FILUSD]: "Filecoin to US Dollar",
    [types_1.PairIndex.APTUSD]: "Aptos to US Dollar",
    [types_1.PairIndex.IMXUSD]: "Immutable X to US Dollar",
    [types_1.PairIndex.VETUSD]: "VeChain to US Dollar",
    [types_1.PairIndex.OPUSD]: "Optimism to US Dollar",
    [types_1.PairIndex.RNDRUSD]: "Render Token to US Dollar",
    [types_1.PairIndex.EGLDUSD]: "Elrond to US Dollar",
    [types_1.PairIndex.TIAUSD]: "Tia to US Dollar",
    [types_1.PairIndex.STXUSD]: "Stacks to US Dollar",
    [types_1.PairIndex.FLOWUSD]: "Flow to US Dollar",
    [types_1.PairIndex.KAVAUSD]: "Kava to US Dollar",
    [types_1.PairIndex.GALAUSD]: "Gala to US Dollar",
    [types_1.PairIndex.MINAUSD]: "Mina to US Dollar",
    [types_1.PairIndex.ORDIUSD]: "Ordi to US Dollar",
    [types_1.PairIndex.ILVUSD]: "Illuvium to US Dollar",
    [types_1.PairIndex.KLAYUSD]: "Klaytn to US Dollar",
    [types_1.PairIndex.SUIUSD]: "Sui to US Dollar",
    [types_1.PairIndex.BLURUSD]: "Blur to US Dollar",
    [types_1.PairIndex.FETUSD]: "Fetch.ai to US Dollar",
    [types_1.PairIndex.CFXUSD]: "Conflux to US Dollar",
    [types_1.PairIndex.BEAMUSD]: "Beam to US Dollar",
    [types_1.PairIndex.ARUSD]: "Arweave to US Dollar",
    [types_1.PairIndex.SEIUSD]: "Sei to US Dollar",
    [types_1.PairIndex.BTTUSD]: "BitTorrent to US Dollar",
    [types_1.PairIndex.ROSEUSD]: "Oasis Network to US Dollar",
    [types_1.PairIndex.WOOUSD]: "WOO Network to US Dollar",
    [types_1.PairIndex.AGIXUSD]: "SingularityNET to US Dollar",
    [types_1.PairIndex.ZILUSD]: "Zilliqa to US Dollar",
    [types_1.PairIndex.GMTUSD]: "STEPN to US Dollar",
    [types_1.PairIndex.ASTRUSD]: "Astar to US Dollar",
    [types_1.PairIndex.ONEINCHUSD]: "1inch to US Dollar",
    [types_1.PairIndex.FLOKIUSD]: "Floki Inu to US Dollar",
    [types_1.PairIndex.QTUMUSD]: "Qtum to US Dollar",
    [types_1.PairIndex.OCEANUSD]: "Ocean Protocol to US Dollar",
    [types_1.PairIndex.WLDUSD]: "Worldcoin to US Dollar",
    [types_1.PairIndex.MASKUSD]: "Mask Network to US Dollar",
    [types_1.PairIndex.CELOUSD]: "Celo to US Dollar",
    [types_1.PairIndex.LRCUSD]: "Loopring to US Dollar",
    [types_1.PairIndex.ENSUSD]: "Ethereum Name Service to US Dollar",
    [types_1.PairIndex.MEMEUSD]: "Meme to US Dollar",
    [types_1.PairIndex.ANKRUSD]: "Ankr to US Dollar",
    [types_1.PairIndex.IOTXUSD]: "IoTeX to US Dollar",
    [types_1.PairIndex.ICXUSD]: "ICON to US Dollar",
    [types_1.PairIndex.KSMUSD]: "Kusama to US Dollar",
    [types_1.PairIndex.RVNUSD]: "Ravencoin to US Dollar",
    [types_1.PairIndex.ANTUSD]: "Aragon to US Dollar",
    [types_1.PairIndex.WAVESUSD]: "Waves to US Dollar",
    [types_1.PairIndex.SKLUSD]: "SKALE to US Dollar",
    [types_1.PairIndex.SUPERUSD]: "SuperVerse to US Dollar",
    [types_1.PairIndex.BALUSD]: "Balancer to US Dollar",
    [types_1.PairIndex.WTIUSD]: "Oil to US Dollar",
    [types_1.PairIndex.XPTUSD]: "Platinum to US Dollar",
    [types_1.PairIndex.XPDUSD]: "Palladium to US Dollar",
    [types_1.PairIndex.HGUSD]: "Copper to US Dollar",
    [types_1.PairIndex.JUPUSD]: "Jupiter to US Dollar",
    [types_1.PairIndex.MANTAUSD]: "Manta to US Dollar",
    [types_1.PairIndex.BONKUSD]: "Bonk to US Dollar",
    [types_1.PairIndex.PENDLEUSD]: "Pendle to US Dollar",
    [types_1.PairIndex.OSMOUSD]: "Osmosis to US Dollar",
    [types_1.PairIndex.ALTUSD]: "AltLayer to US Dollar",
    [types_1.PairIndex.UMAUSD]: "UMA to US Dollar",
    [types_1.PairIndex.MAGICUSD]: "Magic to US Dollar",
    [types_1.PairIndex.API3USD]: "API3 to US Dollar",
    [types_1.PairIndex.STRKUSD]: "Starknet to US Dollar",
    [types_1.PairIndex.DYMUSD]: "Dymension to US Dollar",
    [types_1.PairIndex.NTRNUSD]: "Neutron to US Dollar",
    [types_1.PairIndex.PYTHUSD]: "Pyth Network to US Dollar",
    [types_1.PairIndex.SCUSD]: "Siacoin to US Dollar",
    [types_1.PairIndex.WIFUSD]: "dogwifhat to US Dollar",
    [types_1.PairIndex.PIXELUSD]: "Pixels to US Dollar",
    [types_1.PairIndex.JTOUSD]: "Jito to US Dollar",
    [types_1.PairIndex.MAVIAUSD]: "Heroes of Mavia to US Dollar",
    [types_1.PairIndex.MYROUSD]: "Myro to US Dollar",
    [types_1.PairIndex.STGUSD]: "Stargate to US Dollar",
    [types_1.PairIndex.BOMEUSD]: "Book Of Meme to US Dollar",
    [types_1.PairIndex.ETHFIUSD]: "EtherFi to US Dollar",
    [types_1.PairIndex.METISUSD]: "Metis to US Dollar",
    [types_1.PairIndex.AEVOUSD]: "Aevo to US Dollar",
    [types_1.PairIndex.ONDOUSD]: "Ondo to US Dollar",
    [types_1.PairIndex.MNTUSD]: "Mantle to US Dollar",
    [types_1.PairIndex.KASUSD]: "Kaspa to US Dollar",
    [types_1.PairIndex.RONINUSD]: "Ronin to US Dollar",
    [types_1.PairIndex.ENAUSD]: "Ethena to US Dollar",
    [types_1.PairIndex.WUSD]: "Wormhole to US Dollar",
    [types_1.PairIndex.ZEUSUSD]: "Zeus to US Dollar",
    [types_1.PairIndex.TNSRUSD]: "Tensor to US Dollar",
    [types_1.PairIndex.TAOUSD]: "Bittensor to US Dollar",
    [types_1.PairIndex.OMNIUSD]: "Omni Network to US Dollar",
    [types_1.PairIndex.PRCLUSD]: "Parcl to US Dollar",
    [types_1.PairIndex.MERLUSD]: "Merlin Chain to US Dollar",
    [types_1.PairIndex.SAFEUSD]: "Safe to US Dollar",
    [types_1.PairIndex.SAGAUSD]: "Saga to US Dollar",
    [types_1.PairIndex.LLUSD]: "Light Link to US Dollar",
    [types_1.PairIndex.MSNUSD]: "Meson Network to US Dollar",
    [types_1.PairIndex.REZUSD]: "Renzo to US Dollar",
    [types_1.PairIndex.NOTUSD]: "Notcoin to US Dollar",
    [types_1.PairIndex.IOUSD]: "Ionet to US Dollar",
    [types_1.PairIndex.BRETTUSD]: "Brett to US Dollar",
    [types_1.PairIndex.ATHUSD]: "Aethir to US Dollar",
    [types_1.PairIndex.ZROUSD]: "LayerZero to US Dollar",
    [types_1.PairIndex.ZKUSD]: "ZKsync to US Dollar",
    [types_1.PairIndex.LISTAUSD]: "Lista DAO to US Dollar",
    [types_1.PairIndex.BLASTUSD]: "Blast to US Dollar",
    [types_1.PairIndex.RATSUSD]: "Rats to US Dollar",
    [types_1.PairIndex.BNXUSD]: "BinaryX to US Dollar",
    [types_1.PairIndex.PEOPLEUSD]: "Constitution DAO to US Dollar",
    [types_1.PairIndex.TURBOUSD]: "Turbo to US Dollar",
    [types_1.PairIndex.SATSUSD]: "SATS Ordinals to US Dollar",
    [types_1.PairIndex.POPCATUSD]: "Popcat to US Dollar",
    [types_1.PairIndex.MOGUSD]: "Mog Coin to US Dollar",
    [types_1.PairIndex.OMUSD]: "Mantra Chain to US Dollar",
    [types_1.PairIndex.COREUSD]: "Core to US Dollar",
    [types_1.PairIndex.JASMYUSD]: "Jasmy Coin to US Dollar",
    [types_1.PairIndex.DARUSD]: "Mines of Dalarnia to US Dollar",
    [types_1.PairIndex.MEWUSD]: "cat in a dogs world to US Dollar",
    [types_1.PairIndex.DEGENUSD]: "Degen to US Dollar",
    [types_1.PairIndex.SLERFUSD]: "Slerf to US Dollar",
    [types_1.PairIndex.UXLINKUSD]: "UXLINK to US Dollar",
    [types_1.PairIndex.AVAILUSD]: "Avail to US Dollar",
    [types_1.PairIndex.BANANAUSD]: "Banana Gun to US Dollar",
    [types_1.PairIndex.RAREUSD]: "SuperRare to US Dollar",
    [types_1.PairIndex.SYSUSD]: "Syscoin to US Dollar",
    [types_1.PairIndex.NMRUSD]: "Numeraire to US Dollar",
    [types_1.PairIndex.RSRUSD]: "Reserve Rights to US Dollar",
    [types_1.PairIndex.SYNUSD]: "Synapse to US Dollar",
    [types_1.PairIndex.AUCTIONUSD]: "Bounce to US Dollar",
    [types_1.PairIndex.ALICEUSD]: "My Neighbor Alice to US Dollar",
    [types_1.PairIndex.SUNUSD]: "Sun to US Dollar",
    [types_1.PairIndex.TRBUSD]: "Tellor tributes to US Dollar",
    [types_1.PairIndex.DOGSUSD]: "DOGS to US Dollar",
    [types_1.PairIndex.SSVUSD]: "ssv.network to US Dollar",
    [types_1.PairIndex.PONKEUSD]: "Ponke to US Dollar",
    [types_1.PairIndex.POLUSD]: "POL (ex-MATIC) to US Dollar",
    [types_1.PairIndex.RDNTUSD]: "Radiant Capital to US Dollar",
    [types_1.PairIndex.FLUXUSD]: "Flux to US Dollar",
    [types_1.PairIndex.NEIROUSD]: "Neiro on ETH to US Dollar",
    [types_1.PairIndex.SUNDOGUSD]: "Sundog to US Dollar",
    [types_1.PairIndex.CATUSD]: "Simon's Cat to US Dollar",
    [types_1.PairIndex.BABYDOGEUSD]: "Baby Doge Coin to US Dollar",
    [types_1.PairIndex.REEFUSD]: "Reef to US Dollar",
    [types_1.PairIndex.CKBUSD]: "Nervos Network to US Dollar",
    [types_1.PairIndex.CATIUSD]: "Catizen to US Dollar",
    [types_1.PairIndex.LOOMUSD]: "Loom Network to US Dollar",
    [types_1.PairIndex.ZETAUSD]: "ZetaChain to US Dollar",
    [types_1.PairIndex.HMSTRUSD]: "Hamster Kombat to US Dollar",
    [types_1.PairIndex.EIGENUSD]: "EigenLayer to US Dollar",
    [types_1.PairIndex.POLYXUSD]: "Polymesh to US Dollar",
    [types_1.PairIndex.MOODENGUSD]: "Moo Deng to US Dollar",
    [types_1.PairIndex.MOTHERUSD]: "Mother Iggy to US Dollar",
    [types_1.PairIndex.AEROUSD]: "Aerodrome Finance to US Dollar",
    [types_1.PairIndex.CVCUSD]: "Civic to US Dollar",
    [types_1.PairIndex.NEIROCTOUSD]: "Neiro CTO to US Dollar",
    [types_1.PairIndex.ARKUSD]: "Ark to US Dollar",
    [types_1.PairIndex.NPCUSD]: "Non-Playable Coin to US Dollar",
    [types_1.PairIndex.ORBSUSD]: "ORBS to US Dollar",
    [types_1.PairIndex.APUUSD]: "Apu Apustaja to US Dollar",
    [types_1.PairIndex.BSVUSD]: "Bitcoin SV to US Dollar",
    [types_1.PairIndex.HIPPOUSD]: "sudeng to US Dollar",
    [types_1.PairIndex.GOATUSD]: "Goatseus Maximus to US Dollar",
    [types_1.PairIndex.DOGUSD]: "DOG GO TO THE MOON (Runes) to US Dollar",
    [types_1.PairIndex.HOTUSD]: "Holo to US Dollar",
    [types_1.PairIndex.STORJUSD]: "Storj to US Dollar",
    [types_1.PairIndex.RAYUSD]: "Raydium to US Dollar",
    [types_1.PairIndex.BTCDEGEN]: "Bitcoin to US Dollar",
    [types_1.PairIndex.PNUTUSD]: "Peanut the Squirrel to US Dollar",
    [types_1.PairIndex.ACTUSD]: "The AI Prophecy to US Dollar",
    [types_1.PairIndex.GRASSUSD]: "Grass to US Dollar",
    [types_1.PairIndex.ZENUSD]: "Horizen to US Dollar",
    [types_1.PairIndex.LUMIAUSD]: "Lumia to US Dollar",
    [types_1.PairIndex.ALPHUSD]: "Alephium to US Dollar",
    [types_1.PairIndex.VIRTUALUSD]: "Virtuals Protocol to US Dollar",
    [types_1.PairIndex.SPXUSD]: "SPX6900 to US Dollar",
    [types_1.PairIndex.ACXUSD]: "Across Protocol to US Dollar",
    [types_1.PairIndex.CHILLGUYUSD]: "Just a chill guy to US Dollar",
    [types_1.PairIndex.CHEXUSD]: "CHEX to US Dollar",
    [types_1.PairIndex.BITCOINUSD]: "HarryPotterObamaSonic10Inu to US Dollar",
    [types_1.PairIndex.ETHDEGEN]: "Ethereum to US Dollar",
    [types_1.PairIndex.SOLDEGEN]: "Solana to US Dollar",
    [types_1.PairIndex.MOVEUSD]: "Movement to US Dollar",
    [types_1.PairIndex.MEUSD]: "Magic Eden to US Dollar",
    [types_1.PairIndex.COWUSD]: "CoW Protocol to US Dollar",
    [types_1.PairIndex.AVAUSD]: "Travala to US Dollar",
    [types_1.PairIndex.USUALUSD]: "Usual to US Dollar",
    [types_1.PairIndex.PENGUUSD]: "Pudgy Penguins to US Dollar",
    [types_1.PairIndex.FARTCOINUSD]: "Fartcoin to US Dollar",
    [types_1.PairIndex.ZEREBROUSD]: "Zerebro to US Dollar",
    [types_1.PairIndex.AI16ZUSD]: "ai16z to US Dollar",
    [types_1.PairIndex.AIXBTUSD]: "aixbt by Virtuals to US Dollar",
    [types_1.PairIndex.BIOUSD]: "Bio Protocol to US Dollar",
    [types_1.PairIndex.XRPDEGEN]: "Ripple to US Dollar",
    [types_1.PairIndex.BNBDEGEN]: "Binance Coin to US Dollar",
    [types_1.PairIndex.TRUMPUSD]: "Official Trump to US Dollar",
    [types_1.PairIndex.MELANIAUSD]: "Melania Meme to US Dollar",
    [types_1.PairIndex.MODEUSD]: "Mode to US Dollar",
    [types_1.PairIndex.HYPEUSD]: "Hyperliquid to US Dollar",
    [types_1.PairIndex.SUSD]: "Sonic (prev. FTM) to US Dollar",
    [types_1.PairIndex.ARCUSD]: "AI Rig Complex to US Dollar",
    [types_1.PairIndex.ARKMUSD]: "Arkham to US Dollar",
    [types_1.PairIndex.GRIFFAINUSD]: "GRIFFAIN to US Dollar",
    [types_1.PairIndex.SWARMSUSD]: "Swarms to US Dollar",
    [types_1.PairIndex.ANIMEUSD]: "Animecoin to US Dollar",
    [types_1.PairIndex.PLUMEUSD]: "Plume to US Dollar",
    [types_1.PairIndex.VVVUSD]: "Venice Token to US Dollar",
    [types_1.PairIndex.VINEUSD]: "Vine coin to US Dollar",
    [types_1.PairIndex.TOSHIUSD]: "Toshi to US Dollar",
    [types_1.PairIndex.BERAUSD]: "Berachain to US Dollar",
    [types_1.PairIndex.LAYERUSD]: "Solayer to US Dollar",
    [types_1.PairIndex.CHEEMSUSD]: "Cheems Token to US Dollar",
    [types_1.PairIndex.SOLVUSD]: "Solv Protocol to US Dollar",
    [types_1.PairIndex.TSTUSD]: "Test to US Dollar",
    [types_1.PairIndex.IPUSD]: "Story to US Dollar",
    [types_1.PairIndex.KAITOUSD]: "KAITO to US Dollar",
    [types_1.PairIndex.ELXUSD]: "Elixir to US Dollar",
    [types_1.PairIndex.PIUSD]: "Pi Network to US Dollar",
    [types_1.PairIndex.SHELLUSD]: "MyShell to US Dollar",
    [types_1.PairIndex.BMTUSD]: "Bubblemaps to US Dollar",
    [types_1.PairIndex.BROCCOLIUSD]: "CZ'S Dog to US Dollar",
    [types_1.PairIndex.TUTUSD]: "Tutorial to US Dollar",
    [types_1.PairIndex.GPSUSD]: "GoPlus Security to US Dollar",
    [types_1.PairIndex.REDUSD]: "RedStone to US Dollar",
    [types_1.PairIndex.MUBARAKUSD]: "Mubarak to US Dollar",
    [types_1.PairIndex.FORMUSD]: "Four to US Dollar",
    [types_1.PairIndex.WALUSD]: "Walrus to US Dollar",
    [types_1.PairIndex.NILUSD]: "Nillion to US Dollar",
    [types_1.PairIndex.PARTIUSD]: "Particle Network to US Dollar",
    [types_1.PairIndex.SIRENUSD]: "Siren to US Dollar",
    [types_1.PairIndex.BANANAS31]: "Banana For Scale to US Dollar",
    [types_1.PairIndex.HYPERUSD]: "Hyperlane to US Dollar",
    [types_1.PairIndex.PROMPTUSD]: "Wayfinder to US Dollar",
    [types_1.PairIndex.RFCUSD]: "Retard Finder Coin to US Dollar",
    [types_1.PairIndex.WCTUSD]: "WalletConnect Token to US Dollar",
    [types_1.PairIndex.BIGTIMEUSD]: "Big Time to US Dollar",
    [types_1.PairIndex.BABYUSD]: "Babylon to US Dollar",
    [types_1.PairIndex.COOKIEUSD]: "Cookie DAO to US Dollar",
    [types_1.PairIndex.KMNOUSD]: "Kamino to US Dollar",
    [types_1.PairIndex.INITUSD]: "Initia to US Dollar",
    [types_1.PairIndex.SYRUPUSD]: "Maple Finance to US Dollar",
    [types_1.PairIndex.SIGNUSD]: "Sign to US Dollar",
    [types_1.PairIndex.ZORAUSD]: "ZORA to US Dollar",
    [types_1.PairIndex.COINUSD]: "Coinbase to US Dollar",
    [types_1.PairIndex.HOODUSD]: "Robinhood Markets to US Dollar",
    [types_1.PairIndex.MSTRUSD]: "MicroStrategy Inc  to US Dollar",
    [types_1.PairIndex.NFLXUSD]: "Netflix to US Dollar",
    [types_1.PairIndex.LAUNCHCOINUSD]: "Launch Coin on Believe to US Dollar",
    [types_1.PairIndex.NXPCUSD]: "NEXPACE to US Dollar",
    [types_1.PairIndex.SOPHUSD]: "Sophon to US Dollar",
    [types_1.PairIndex.LPTUSD]: "Livepeer to US Dollar",
    [types_1.PairIndex.BVIVUSD]: "Bitcoin Volmex Implied Volatility 30 Day Index to US Dollar",
    [types_1.PairIndex.EVIVUSD]: "Ethereum Volmex Implied Volatility 30 Day Index to US Dollar",
    [types_1.PairIndex.CRCLUSD]: "Circle Internet Group to US Dollar",
    [types_1.PairIndex.RESOLVUSD]: "Resolv to US Dollar",
    [types_1.PairIndex.SQDUSD]: "Subsquid to US Dollar",
    [types_1.PairIndex.TAIKOUSD]: "Taiko to US Dollar",
    [types_1.PairIndex.HOMEUSD]: "Defi App to US Dollar",
    [types_1.PairIndex.BUSD]: "BUILDon to US Dollar",
    [types_1.PairIndex.HUMAUSD]: "Huma Finance to US Dollar",
    [types_1.PairIndex.SBETUSD]: "Sharplink Gaming Inc to US Dollar",
    [types_1.PairIndex.PLTRUSD]: "Palantir Technologies to US Dollar",
    [types_1.PairIndex.BIDUUSD]: "Baidu to US Dollar",
    [types_1.PairIndex.ROKUUSD]: "Roku to US Dollar",
    [types_1.PairIndex.LMTUSD]: "Lockheed Martin to US Dollar",
    [types_1.PairIndex.RIOTUSD]: "Riot Platforms to US Dollar",
    [types_1.PairIndex.MARAUSD]: "MARA Holdings to US Dollar",
    [types_1.PairIndex.LOKAUSD]: "League of Kingdoms Arena to US Dollar",
    [types_1.PairIndex.STOUSD]: "StakeStone to US Dollar",
    [types_1.PairIndex.FUNUSD]: "FUNToken to US Dollar",
    [types_1.PairIndex.KNCUSD]: "Kyber Network Crystal v2 to US Dollar",
    [types_1.PairIndex.HUSD]: "Humanity Protocol to US Dollar",
    [types_1.PairIndex.ICNTUSD]: "Impossible Cloud Network to US Dollar",
    [types_1.PairIndex.NEWTUSD]: "Newton Protocol to US Dollar",
    [types_1.PairIndex.PUMPUSD]: "Pump.fun to US Dollar",
    [types_1.PairIndex.SAROSUSD]: "Saros to US Dollar",
    [types_1.PairIndex.SPKUSD]: "Spark to US Dollar",
    [types_1.PairIndex.ERAUSD]: "Caldera to US Dollar",
    [types_1.PairIndex.BGSCUSD]: "BugsCoin to US Dollar",
    [types_1.PairIndex.TAGUSD]: "TAGGER to US Dollar",
    [types_1.PairIndex.WLFIUSD]: "World Liberty Financial to US Dollar",
    [types_1.PairIndex.ASTERUSD]: "Aster to US Dollar",
    [types_1.PairIndex.OKBUSD]: "OKB to US Dollar",
    [types_1.PairIndex.CROUSD]: "Cronos to US Dollar",
    [types_1.PairIndex.SKYUSD]: "Sky to US Dollar",
    [types_1.PairIndex.XPLUSD]: "Plasma to US Dollar",
    [types_1.PairIndex.AVNTUSD]: "Avantis to US Dollar",
    [types_1.PairIndex.APEXUSD]: "ApeX Protocol to US Dollar",
    [types_1.PairIndex.ORDERUSD]: "Orderly to US Dollar",
    [types_1.PairIndex.DRIFTUSD]: "Drift to US Dollar",
    [types_1.PairIndex.MYXUSD]: "MYX Finance to US Dollar",
    [types_1.PairIndex.NOMUSD]: "Nomina to US Dollar",
    [types_1.PairIndex.FLUIDUSD]: "Fluid to US Dollar",
    [types_1.PairIndex.LQTYUSD]: "Liquity to US Dollar",
    [types_1.PairIndex.L3USD]: "Layer3 to US Dollar",
    [types_1.PairIndex.CAMPUSD]: "Camp Network to US Dollar",
    [types_1.PairIndex.SOMIUSD]: "Somnia to US Dollar",
    [types_1.PairIndex.HEMIUSD]: "Hemi to US Dollar",
    [types_1.PairIndex.FFUSD]: "Falcon Finance to US Dollar",
    [types_1.PairIndex.USELESSUSD]: "Useless Coin to US Dollar",
    [types_1.PairIndex.MONUSD]: "Monad to US Dollar",
    [types_1.PairIndex.METUSD]: "Meteora to US Dollar",
    [types_1.PairIndex.TURTLEUSD]: "Turtle to US Dollar",
    [types_1.PairIndex.SPX500USD]: "S&P500 to US Dollar",
    [types_1.PairIndex.NAS100USD]: "NASDAQ 100 to US Dollar",
    [types_1.PairIndex.USA30USD]: "Down Jones 30 to US Dollar",
    [types_1.PairIndex.NFLXUSD2]: "Netflix to US Dollar",
    [types_1.PairIndex.STABLEUSD]: "Stable to US Dollar",
    [types_1.PairIndex.VOOIUSD]: "VOOI to US Dollar",
    [types_1.PairIndex.LITUSD]: "Lighter to US Dollar",
    [types_1.PairIndex.DUSKUSD]: "DUSK to US Dollar",
    [types_1.PairIndex.SCRTUSD]: "Secret to US Dollar",
    [types_1.PairIndex.DCRUSD]: "Decred to US Dollar",
    [types_1.PairIndex.GDXUSD]: "VanEck Gold Miners ETF to US Dollar",
    [types_1.PairIndex.URAUSD]: "Global X Uranium ETF to US Dollar",
    [types_1.PairIndex.WPMUSD]: "Wheaton Precious Metals Corp to US Dollar",
    [types_1.PairIndex.NATGASUSD]: "Natural Gas to US Dollar",
    [types_1.PairIndex.BRENTUSD]: "Brent Crude Oil to US Dollar",
    [types_1.PairIndex.URNMUSD]: "Sprott Uranium Miners ETF to US Dollar",
    [types_1.PairIndex.HYPEDEGEN]: "Hyperliquid to US Dollar",
    [types_1.PairIndex.MEGA]: "MegaETH to US Dollar",
};

},{"../../trade/types": "trade/types.js"}],
};const cache={};function load(k){if(k==="@ethers")return ethers;if(cache[k])return cache[k].exports;const m={exports:{}};cache[k]=m;const d=modules[k];d[0](n=>load(d[1][n]),m,m.exports);return m.exports;}window.GainsMath=load("index.js");})();