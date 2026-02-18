import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { CategoryService } from './category/category.service';
import { ProductsService } from './products/products.service';
import { UserRole } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const categories = [
    {
        id: "painkiller",
        name: "ยาแก้ปวด",
        icon: "pill",
        count: 45,
    },
    {
        id: "antibiotic",
        name: "ยาปฏิชีวนะ",
        icon: "syringe",
        count: 32,
    },
    {
        id: "vitamins",
        name: "วิตามินและอาหารเสริม",
        icon: "heart-pulse",
        count: 78,
    },
    {
        id: "skincare",
        name: "ผลิตภัณฑ์ดูแลผิว",
        icon: "sparkles",
        count: 56,
    },
    {
        id: "chronic",
        name: "ยาโรคเรื้อรัง",
        icon: "activity",
        count: 41,
    },
    {
        id: "medical-device",
        name: "เครื่องมือแพทย์",
        icon: "stethoscope",
        count: 23,
    },
    {
        id: "baby",
        name: "สินค้าเด็กและแม่",
        icon: "baby",
        count: 34,
    },
    {
        id: "supplements",
        name: "อาหารเสริม",
        icon: "leaf",
        count: 67,
    },
];

const products = [
    {
        id: "prod-001",
        name: "พาราเซตามอล 500mg",
        category: "painkiller",
        price: 10000000,
        description: "ยาแก้ปวด ลดไข้ สูตรอ่อนโยน",
        properties:
            "ใช้สำหรับบรรเทาอาการปวดและลดไข้ ไม่ระคายเคืองกระเพาะอาหาร เหมาะสำหรับผู้ป่วยทุกวัย",
        warnings:
            "ห้ามใช้ในผู้ที่แพ้พาราเซตามอล ไม่ควรใช้เกิน 8 เม็ดต่อวัน อาจทำให้ตับเสียหายหากใช้มากเกินไป",
        image:
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        inStock: true,
        isControlled: false,
        requiresPrescription: false,
        stockQuantity: 150,
        batchNumber: "BTH2024-001",
        expiryDate: "2026-12-31",
    },
    {
        id: "prod-002",
        name: "อะม็อกซีซิลลิน 500mg",
        category: "antibiotic",
        price: 120,
        description: "ยาปฏิชีวนะกลุ่มเพนิซิลลิน",
        properties:
            "ใช้รักษาการติดเชื้อแบคทีเรีย เช่น การติดเชื้อทางเดินหายใจ ทางเดินปัสสาวะ และผิวหนัง",
        warnings:
            "ต้องทานให้ครบตามแพทย์สั่ง ห้ามใช้ในผู้แพ้เพนิซิลลิน อาจมีผลข้างเคียงคือผื่นแพ้ ท้องเสีย",
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
        inStock: false,
        isControlled: false,
        requiresPrescription: true,
        stockQuantity: 0,
        batchNumber: "BTH2024-002",
        expiryDate: "2025-08-15",
    },
    {
        id: "prod-003",
        name: "เมทฟอร์มิน 500mg",
        category: "chronic",
        price: 180,
        description: "ยาควบคุมระดับน้ำตาลในเลือด",
        properties:
            "ใช้รักษาโรคเบาหวานชนิดที่ 2 ช่วยควบคุมระดับน้ำตาลในเลือด ลดการดูดซึมน้ำตาลจากลำไส้",
        warnings:
            "ต้องใช้ภายใต้การดูแลของแพทย์ อาจทำให้ท้องเสีย คลื่นไส้ ต้องตรวจเลือดเป็นระยะ",
        image:
            "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
        inStock: true,
        isControlled: true,
        requiresPrescription: true,
        stockQuantity: 50,
        batchNumber: "BTH2024-003",
        expiryDate: "2026-03-20",
    },
    {
        id: "prod-004",
        name: "วิตามินซี 1000mg",
        category: "vitamins",
        price: 350,
        description: "วิตามินซีชนิดเม็ดฟู่ รสส้ม",
        properties:
            "เสริมสร้างภูมิคุ้มกัน ต้านอนุมูลอิสระ ช่วยให้ผิวพรรณสดใส ดูดซึมง่าย",
        warnings:
            "ไม่ควรทานเกิน 2 เม็ดต่อวัน อาจทำให้ท้องเสียหากทานมากเกินไป",
        image:
            "https://images.unsplash.com/photo-1765382506526-9de810e1aeb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYyUyMHRhYmxldCUyMGVmZmVydmVzY2VudCUyMG9yYW5nZXxlbnwxfHx8fDE3NzA2Mjg2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        inStock: true,
        isControlled: false,
        requiresPrescription: false,
        stockQuantity: 200,
        batchNumber: "BTH2024-004",
        expiryDate: "2027-01-10",
    },
    {
        id: "prod-005",
        name: "เซรั่มวิตามินซี",
        category: "skincare",
        price: 890,
        description: "เซรั่มบำรุงผิวหน้า ลดจุดด่างดำ",
        properties:
            "เซรั่มเข้มข้นที่ช่วยให้ผิวกระจ่างใส ลดริ้วรอย จุดด่างดำ กระ ฟื้นฟูผิวให้สดใส",
        warnings:
            "ใช้ภายนอกเท่านั้น ทาทดสอบก่อนใช้ หลีกเลี่ยงบริเวณรอบดวงตา",
        image:
            "https://amarit.com/public/uploads/product/Product Banner For Website-03.jpg/",
        inStock: true,
        isControlled: false,
        requiresPrescription: false,
        stockQuantity: 75,
        batchNumber: "BTH2024-005",
        expiryDate: "2025-11-30",
    },
    {
        id: "prod-006",
        name: "เครื่องวัดความดัน ดิจิทัล",
        category: "medical-device",
        price: 1250,
        description: "เครื่องวัดความดันโลหิต แบบอัตโนมัติ",
        properties:
            "วัดความดันโลหิตและชีพจรอัตโนมัติ จอแสดงผลขนาดใหญ่ ง่ายต่อการอ่าน มีหน่วยความจำ 60 ครั้ง",
        warnings:
            "อ่านคู่มือกรใช้งานก่อนใช้ ไม่ควรใช้ผลการตรวจเพื่อวินิจฉัยด้วยตัวเอง ควรปรึกษาแพทย์",
        image:
            "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=400",
        inStock: true,
        isControlled: false,
        requiresPrescription: false,
        stockQuantity: 30,
        batchNumber: "BTH2024-006",
        expiryDate: "2028-06-30",
    },
    {
        id: "prod-007",
        name: "นมผงสูตร 1 (0-6 เดือน)",
        category: "baby",
        price: 680,
        description: "นมผงสำหรับทารก แรกเกิด - 6 เดือน",
        properties:
            "สูตรนมผงใกล้เคียงน้ำนมแม่ มี DHA, ARA ช่วยพัฒนาสมองและสายตา โปรตีนย่อยง่าย",
        warnings:
            "ควรปรึกษาแพทย์หรือเภสัชกรก่อนใช้ น้ำนมแม่ดีที่สุดสำหรับลูกน้อย",
        image:
            "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=400",
        inStock: true,
        isControlled: false,
        requiresPrescription: false,
        stockQuantity: 45,
        batchNumber: "BTH2024-007",
        expiryDate: "2025-09-15",
    },
    {
        id: "prod-008",
        name: "โอเมก้า 3 น้ำมันปลา",
        category: "supplements",
        price: 450,
        description: "อาหารเสริมน้ำมันปลาบริสุทธิ์",
        properties:
            "มี EPA และ DHA สูง ช่วยบำรุงสมอง หัวใจ และหลอดเลือด ลดคอเลสเตอรอล",
        warnings:
            "ไม่ควรทานก่อนผ่าตัด หากกินยาต้านการแข็งตัวของเลือดควรปรึกษาแพทย์",
        image:
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",
        inStock: true,
        isControlled: false,
        requiresPrescription: false,
        stockQuantity: 120,
        batchNumber: "BTH2024-008",
        expiryDate: "2026-07-22",
    },
    {
        id: "prod-009",
        name: "ไอบูโพรเฟน 400mg",
        category: "painkiller",
        price: 45,
        description: "ยาแก้ปวด แก้อักเสบ ลดไข้",
        properties:
            "ยาต้านการอักเสบที่ไม่ใช่สเตียรอยด์ ใช้บรรเทาอาการปวด อักเสบ และลดไข้",
        warnings:
            "อาจระคายเคืองกระเพาะ ควรทานหลังอาหาร ห้ามใช้ในผู้ที่มีแผลในกระเพาะ",
        image:
            "https://images.unsplash.com/photo-1612448071097-a6b55cf216c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpYnVwcm9mZW4lMjBwaWxscyUyMG1lZGljYXRpb258ZW58MXx8fHwxNzcwNjI4NjA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        inStock: true,
        isControlled: false,
        requiresPrescription: false,
        stockQuantity: 95,
        batchNumber: "BTH2024-009",
        expiryDate: "2026-04-18",
    },
    {
        id: "prod-010",
        name: "ซิพโรฟล็อกซาซิน 500mg",
        category: "antibiotic",
        price: 250,
        description: "ยาปฏิชีวนะกลุ่มควิโนโลน",
        properties:
            "ใช้รักษาการติดเชื้อแบคทีเรียในระบบต่างๆ ของร่างกาย มีฤทธิ์แรง",
        warnings:
            "ต้องมีใบสั่งแพทย์ ห้ามใช้ในเด็กและหญิงตั้งครรภ์ อาจทำให้เส้นเอ็นขาด",
        image:
            "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400",
        inStock: true,
        isControlled: true,
        requiresPrescription: true,
        stockQuantity: 40,
        batchNumber: "BTH2024-010",
        expiryDate: "2025-10-05",
    },
];

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly categoryService: CategoryService,
        private readonly productsService: ProductsService,
    ) { }

    async onModuleInit() {
        await this.seedAdmin();
        await this.seedCategories();
        await this.seedProducts();
    }

    private async seedCategories() {
        for (const category of categories) {
            const existingCategory = await this.categoryService.findById(category.id);
            if (!existingCategory) {
                this.logger.log(`Seeding category: ${category.name}`);
                await this.categoryService.create({
                    id: category.id,
                    name: category.name,
                    icon: category.icon,
                });
            }
        }
    }

    private async seedProducts() {
        for (const product of products) {
            const existingProduct = await this.productsService.findById(product.id);
            if (!existingProduct) {
                this.logger.log(`Seeding product: ${product.name}`);
                // Ensure category exists
                const category = await this.categoryService.findById(product.category);
                if (category) {
                    await this.productsService.create({
                        ...product,
                        category: category,
                    });
                } else {
                    this.logger.warn(`Category ${product.category} not found for product ${product.name}. Skipping.`);
                }
            }
        }
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
