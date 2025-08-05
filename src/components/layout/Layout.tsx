import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { DebugPanel } from "@/components/DebugPanel";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
      <DebugPanel />
    </div>
  );
};