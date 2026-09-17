import { getProjects } from "../actions/projects";
import { ProjectList } from "@/components/projects/project-list";

export default async function ProjektePage() {
  const projects = await getProjects();
  return <ProjectList projects={projects} />;
}
