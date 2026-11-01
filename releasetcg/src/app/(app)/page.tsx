import { createClient } from '@/utils/supabase/server'
import { Box } from './components/box'

export default async function Page() {
  const supabase = await createClient()

  return (
    <div className="flex min-h-dvh flex-col">
    <h1 className="text-4xl font-bold text-center">ReleaseTCG</h1>
    <section className="flex flex-1 items-center justify-center">
        <p>Match Preview Image</p>
    </section>

    <section className="pb-12">
      <Box>
        <div className="grid grid-cols-1 gap-4">
          <h1 className="text-4xl font-bold">Welcome to ReleaseTCG!</h1>
          <p className="text-lg text-black-300">
            Learn to juggle 9 colors each with their unique abilities and traits.
          </p>
        </div>
      </Box>
    </section>
  </div>
  );
}