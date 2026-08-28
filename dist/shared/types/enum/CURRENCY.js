"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Currency a client is billed in. Chosen per client, independently of the
// billing entity or region: a Colombian client may well be billed in USD and
// vice versa, so this is what drives the portal's invoice amounts and their
// number formatting — not the country.
var CURRENCY;
(function (CURRENCY) {
    CURRENCY["COP"] = "COP";
    CURRENCY["USD"] = "USD";
})(CURRENCY || (CURRENCY = {}));
exports.default = CURRENCY;
//# sourceMappingURL=CURRENCY.js.map