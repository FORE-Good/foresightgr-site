import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "FOREsight | One-Page Policy Briefs - by FORE Good",
  description:
    "FOREsight gives for-purpose organisations the templates, intelligence and expert access to run their own government relations, without hiring a GR team.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
