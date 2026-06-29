import {
  AdminPagination,
  type AdminPaginationProps,
} from "@/components/admin/AdminPagination";

type ClientsPaginationProps = Omit<
  AdminPaginationProps,
  "entityName" | "emptyMessage" | "perPageOptions" | "maxVisiblePages" | "showEllipsis" | "spacing"
>;

export function ClientsPagination(props: ClientsPaginationProps) {
  return (
    <AdminPagination
      entityName="clients"
      emptyMessage="No clients to show"
      perPageOptions={[8, 16, 24, 32]}
      {...props}
    />
  );
}
