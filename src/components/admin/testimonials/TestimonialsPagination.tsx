import {
  AdminPagination,
  type AdminPaginationProps,
} from "@/components/admin/AdminPagination";

type TestimonialsPaginationProps = Omit<
  AdminPaginationProps,
  "entityName" | "emptyMessage" | "perPageOptions" | "maxVisiblePages" | "showEllipsis" | "spacing"
>;

export function TestimonialsPagination(props: TestimonialsPaginationProps) {
  return (
    <AdminPagination
      entityName="testimonials"
      emptyMessage="No testimonials to show"
      perPageOptions={[6, 9, 12, 18]}
      maxVisiblePages={3}
      showEllipsis={false}
      spacing="relaxed"
      {...props}
    />
  );
}
