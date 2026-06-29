"use client";

import { AdminPagination } from "@/components/admin/AdminPagination";

export function InvoicesPagination(props: {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  return (
    <AdminPagination
      {...props}
      entityName="invoices"
      perPageOptions={[8, 16, 24, 48]}
      spacing="relaxed"
    />
  );
}
