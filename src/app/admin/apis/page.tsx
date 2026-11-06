import { redirect } from "next/navigation";

export default function AdminApisPage() {
  redirect("/admin?module=apis");
}
