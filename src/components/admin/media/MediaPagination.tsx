import {
  AdminPagination,
  type AdminPaginationProps,
} from "@/components/admin/AdminPagination";

type MediaPaginationProps = Omit<
  AdminPaginationProps,
  "entityName" | "emptyMessage" | "perPageOptions" | "maxVisiblePages" | "showEllipsis" | "spacing"
>;

export function MediaPagination(props: MediaPaginationProps) {
  return (
    <AdminPagination
      entityName="files"
      emptyMessage="No files to show"
      perPageOptions={[12, 16, 24, 32]}
      {...props}
    />
  );
}
