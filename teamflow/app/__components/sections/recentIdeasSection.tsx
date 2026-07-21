import { getRecentIdeas } from "@/src/infrastructure/api/ideas/server";

import { RecentIdeasClient } from "./recentIdeasClient";

export async function RecentIdeasSection() {
  const recentIdeas = await getRecentIdeas();

  return (
    <section className="bg-[#0e0d17] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <RecentIdeasClient initialIdeas={recentIdeas} />
      </div>
    </section>
  );
}
