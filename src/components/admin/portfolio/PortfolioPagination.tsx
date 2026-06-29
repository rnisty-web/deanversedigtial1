import {
  AdminPagination,
  type AdminPaginationProps,
} from "@/components/admin/AdminPagination";

type PortfolioPaginationProps = Omit<
  AdminPaginationProps,
  "entityName" | "emptyMessage" | "perPageOptions" | "maxVisiblePages" | "showEllipsis" | "spacing"
>;

export function PortfolioPagination(props: PortfolioPaginationProps) {
  return (
    <AdminPagination
      entityName="projects"
      emptyMessage="No projects to show"
      perPageOptions={[8, 12, 16, 24]}
      maxVisiblePages={3}
      showEllipsis={false}
      spacing="relaxed"
      {...props}
    />
  );
}
