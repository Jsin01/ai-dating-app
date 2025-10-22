import { GlimpseViewer } from "@/components/glimpse-viewer"

interface GlimpsePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GlimpsePage({ params }: GlimpsePageProps) {
  const { id } = await params
  return <GlimpseViewer glimpseId={id} />
}
