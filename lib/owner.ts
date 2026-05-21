export function getOwnerEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  return email || null
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  const ownerEmail = getOwnerEmail()
  if (!ownerEmail || !email) return false
  return email.trim().toLowerCase() === ownerEmail
}
