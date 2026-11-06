import { redirect } from "next/navigation";

export default function AdminFooterPage() {
  redirect("/admin?module=footer");
}
