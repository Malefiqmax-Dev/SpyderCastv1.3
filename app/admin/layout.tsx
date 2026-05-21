import { redirect } from "next/navigation"
import { requireOwnerAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwnerAdmin()
  if (!owner || "rateLimited" in owner) {
    redirect("/")
  }

  return children
}
