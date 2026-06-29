import {
  AdminPagination,
  type AdminPaginationProps,
} from "@/components/admin/AdminPagination";

type LeadsPaginationProps = Omit<
  AdminPaginationProps,
  "entityName" | "emptyMessage" | "perPageOptions" | "maxVisiblePages" | "showEllipsis" | "spacing"
>;

export function LeadsPagination(props: LeadsPaginationProps) {
  return (
    <AdminPagination
      entityName="leads"
      emptyMessage="No leads to show"
      perPageOptions={[8, 16, 24, 32]}
      {...props}
    />
  );
}
