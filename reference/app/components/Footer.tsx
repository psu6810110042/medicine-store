export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4">MEDS</h3>
                        <p className="text-gray-400 text-sm">
                            ร้านขายยาออนไลน์ที่คุณไว้วางใจ จำหน่ายยาและเวชภัณฑ์คุณภาพ
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">เกี่ยวกับเรา</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>เกี่ยวกับ MEDS</li>
                            <li>ทีมเภสัชกร</li>
                            <li>นโยบายความเป็นส่วนตัว</li>
                            <li>ข้อกำหนดการใช้งาน</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">บริการลูกค้า</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>วิธีการสั่งซื้อ</li>
                            <li>การจัดส่งและคืนสินค้า</li>
                            <li>คำถามที่พบบ่อย</li>
                            <li>ติดต่อเรา</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">ติดต่อเรา</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>โทร: 02-123-4567</li>
                            <li>Email: info@meds.com</li>
                            <li>Line: @meds-online</li>
                            <li>เปิดทำการ: จันทร์-ศุกร์ 9:00-18:00</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>© 2024 MEDS. สงวนลิขสิทธิ์. | ใบอนุญาตร้านขายยา เลขที่ ภ.ย. 1234/2567</p>
                </div>
            </div>
        </footer>
    );
}
