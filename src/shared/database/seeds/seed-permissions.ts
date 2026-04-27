import { Permission } from '../../../modules/internal/users/entities/Permission.entity';
import { AppDataSource } from '../data-source';
import { PERMISSIONS } from './permissions.data';

const seedPermissions = async () => {
  await AppDataSource.initialize();

  const permissionRepository = AppDataSource.getRepository(Permission);

  console.log('Seeding permissions...');

  await permissionRepository.save(PERMISSIONS);

  console.log('Permissions have been seeded successfully');
};

seedPermissions()
  .catch((error) => console.log(error))
  .finally(() => AppDataSource.destroy());
