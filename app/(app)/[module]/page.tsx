import { notFound } from "next/navigation";
import { EnterpriseModulePage } from "@/components/enterprise/enterprise-module-page";
import { getEnterpriseModule } from "@/lib/enterprise-nav";

export default function EnterpriseModuleRoute({ params }: { params: { module: string } }) {
  const navItem = getEnterpriseModule(params.module);

  if (!navItem) {
    notFound();
  }

  return <EnterpriseModulePage module={navItem} />;
}
