import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AdminProvider } from "@/context/admin";
import { TrainerProvider } from "@/context/trainer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminProvider>
      <TrainerProvider>
        <Navbar />
        <Sidebar />
        {children}
      </TrainerProvider>
    </AdminProvider>
  );
}
