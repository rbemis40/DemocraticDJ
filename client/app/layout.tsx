import "./global.css";

import { Tilt_Neon } from "next/font/google";

const tiltNeon = Tilt_Neon();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={tiltNeon.className}>
        {children}
      </body>
    </html>
  );
}
