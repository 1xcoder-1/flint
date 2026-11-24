import type { ReactNode } from "react";
import { DocsPager } from "@/components/docs-pager";
import { DocsSidebar } from "@/components/docs-sidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wrap-wide docs-layout">
      <DocsSidebar />
      <div className="doc">
        {children}
        <DocsPager />
      </div>
    </div>
  );
}
