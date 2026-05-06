import { notFound } from "next/navigation";
import { EnterpriseModulePage } from "@/components/enterprise/enterprise-module-page";
import { getEnterpriseModule } from "@/lib/enterprise-nav";

export default async function EnterpriseModuleRoute({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const navItem = getEnterpriseModule(module);

  if (!navItem) {
    notFound();
  }

  return <EnterpriseModulePage module={navItem} />;
}
