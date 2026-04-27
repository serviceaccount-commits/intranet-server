"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const appConfig_1 = require("../config/appConfig");
const appConfig_2 = require("../config/appConfig");
const appConfig_3 = require("../config/appConfig");
const appConfig_4 = __importDefault(require("../config/appConfig"));
let dbConfig;
switch (appConfig_4.default.environment) {
    case 'development':
        dbConfig = appConfig_1.devDatabaseConfig;
        break;
    case 'production':
        dbConfig = appConfig_2.prodDatabaseConfig;
        break;
    default:
        dbConfig = appConfig_3.qaDatabaseConfig;
        break;
}
exports.AppDataSource = new typeorm_1.DataSource(dbConfig);
//# sourceMappingURL=data-source.js.map