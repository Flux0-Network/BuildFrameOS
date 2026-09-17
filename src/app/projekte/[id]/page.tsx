import { notFound } from "next/navigation";
import { getProject } from "@/app/actions/projects";
import { getDiaryEntries } from "@/app/actions/diary";
import { ProjectDetail } from "@/components/projects/project-detail";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [project, entries] = await Promise.all([
    getProject(id),
    getDiaryEntries(id),
  ]);

  if (!project) notFound();

  return <ProjectDetail project={project} entries={entries} />;
}
