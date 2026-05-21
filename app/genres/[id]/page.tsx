import GenreDetailsClientPage from "./client";

export default async function GenreDetailsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ name: string }>
}) {
  const { id } = await params
  const { name } = await searchParams
  
  return <GenreDetailsClientPage id={id} name={name || "Genre"} />
}
