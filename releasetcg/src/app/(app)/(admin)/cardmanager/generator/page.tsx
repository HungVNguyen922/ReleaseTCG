import Link from "next/link"

export const metadata = { title: "Card generator" }

export default function CardGeneratorPage() {
  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col gap-3 p-4">
      <Link
        href="/cardmanager"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Card Manager
      </Link>

      <iframe
        src="/card-generator/index.html"
        title="ReleaseTCG Card Generator"
        className="w-full flex-1 rounded border"
      />
    </main>
  )
}