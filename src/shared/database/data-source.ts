import { DataSource, DataSourceOptions } from 'typeorm';
import { devDatabaseConfig } from '../config/appConfig';
import { prodDatabaseConfig } from '../config/appConfig';
import { qaDatabaseConfig } from '../config/appConfig';

import appConfig from '../config/appConfig';

let dbConfig: DataSourceOptions;

switch (appConfig.environment) {
  case 'development':
    dbConfig = devDatabaseConfig;
    break;
  case 'production':
    dbConfig = prodDatabaseConfig;
    break;

  default:
    dbConfig = qaDatabaseConfig;
    break;
}

export const AppDataSource = new DataSource(dbConfig);
