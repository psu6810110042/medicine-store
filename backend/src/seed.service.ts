import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        await this.seedAdmin();
    }

    private async seedAdmin() {
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
        const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
        const adminFullName = this.configService.get<string>('ADMIN_FULLNAME') || 'System Admin';
        const adminPhone = this.configService.get<string>('ADMIN_PHONE') || '0000000000';

        if (!adminEmail || !adminPassword) {
            this.logger.warn(
                'ADMIN_EMAIL or ADMIN_PASSWORD not found in .env. Skipping admin seeding.',
            );
            return;
        }

        try {
            const existingAdmin = await this.usersService.findByEmail(adminEmail);
            if (existingAdmin) {
                this.logger.log(`Admin user ${adminEmail} already exists.`);
                return;
            }

            this.logger.log(`Seeding admin user: ${adminEmail}`);

            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const adminUser = {
                email: adminEmail,
                password: hashedPassword,
                fullName: adminFullName,
                phoneNumber: adminPhone,
                role: UserRole.ADMIN,
            };

            await this.usersService.create(adminUser as any);

            this.logger.log(`Admin user ${adminEmail} seeded successfully.`);
        } catch (error) {
            this.logger.error(`Failed to seed admin user: ${error.message}`, error.stack);
        }
    }
}
