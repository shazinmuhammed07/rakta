import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Rakta | Connecting Blood Donors with Patients",
    description: "A modern platform connecting blood donors with patients who urgently need blood.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-red-200 selection:text-red-900`}>
                <Navbar />
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
