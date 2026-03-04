import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "MEDS - ร้านขายยาออนไลน์",
  description: "ร้านขายยาและเวชภัณฑ์ออนไลน์คุณภาพ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
