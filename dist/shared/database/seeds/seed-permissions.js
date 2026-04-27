"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Permission_entity_1 = require("../../../modules/internal/users/entities/Permission.entity");
const data_source_1 = require("../data-source");
const permissions_data_1 = require("./permissions.data");
const seedPermissions = async () => {
    await data_source_1.AppDataSource.initialize();
    const permissionRepository = data_source_1.AppDataSource.getRepository(Permission_entity_1.Permission);
    console.log('Seeding permissions...');
    await permissionRepository.save(permissions_data_1.PERMISSIONS);
    console.log('Permissions have been seeded successfully');
};
seedPermissions()
    .catch((error) => console.log(error))
    .finally(() => data_source_1.AppDataSource.destroy());
//# sourceMappingURL=seed-permissions.js.map