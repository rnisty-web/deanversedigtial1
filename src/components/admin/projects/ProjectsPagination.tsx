import {
  AdminPagination,
  type AdminPaginationProps,
} from "@/components/admin/AdminPagination";

type ProjectsPaginationProps = Omit<
  AdminPaginationProps,
  "entityName" | "emptyMessage" | "perPageOptions" | "maxVisiblePages" | "showEllipsis" | "spacing"
>;

export function ProjectsPagination(props: ProjectsPaginationProps) {
  return (
    <AdminPagination
      entityName="projects"
      emptyMessage="No projects to show"
      perPageOptions={[8, 16, 24, 32]}
      {...props}
    />
  );
}
