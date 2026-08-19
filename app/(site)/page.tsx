import {WritingList} from "@/components/writing-list";
import {sanityFetch} from "@/sanity/lib/live";
import {WRITING_LIST_QUERY} from "@/sanity/lib/queries";
import type {WritingListItem} from "@/sanity/lib/types";

export default async function Home() {
  const {data} = await sanityFetch({
    query: WRITING_LIST_QUERY,
    stega: false,
  });

  return (
    <div className="site-column w-full">
      <WritingList posts={(data as WritingListItem[] | null) ?? []} />
    </div>
  );
}
