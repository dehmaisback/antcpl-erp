import { ProjectDashboard } from "@/components/projects/project-dashboard";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDashboard projectId={params.id} />;
}
