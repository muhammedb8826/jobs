import { JobPortalHeader } from "@/components/JobPortalHeader";
import { JobPortalFooter } from "@/components/JobPortalFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JobPortalHeader />
      <main className="flex-1">{children}</main>
      <JobPortalFooter />
    </>
  );
}

