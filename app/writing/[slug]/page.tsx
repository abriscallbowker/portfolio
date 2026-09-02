import {AppearFade} from "@/components/appear";
import {NavControl} from "@/components/nav-control";
import {PortableBody} from "@/components/portable-body";
import {SiteFooter} from "@/components/site-footer";
import {WritingList} from "@/components/writing-list";
import {formatArticleDate} from "@/lib/dates";
import {site} from "@/lib/site";
import {wordCount} from "@/lib/word-count";
import {client} from "@/sanity/lib/client";
import {sanityFetch} from "@/sanity/lib/live";
import {
  WRITING_BY_SLUG_QUERY,
  WRITING_MORE_QUERY,
  WRITING_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import type {WritingDetail, WritingListItem} from "@/sanity/lib/types";
import type {Metadata} from "next";
import {notFound} from "next/navigation";

type WritingPageProps = {
  params: Promise<{slug: string}>;
  searchParams: Promise<{card?: string | string[]}>;
};

export async function generateStaticParams() {
  const slugs = await client
    .withConfig({useCdn: false})
    .fetch(WRITING_SLUGS_QUERY);

  return (slugs ?? []).map((item: {slug: string}) => ({slug: item.slug}));
}

export async function generateMetadata({
  params,
}: WritingPageProps): Promise<Metadata> {
  const {slug} = await params;
  const {data} = await sanityFetch({
    query: WRITING_BY_SLUG_QUERY,
    params: {slug},
    stega: false,
  });

  const post = data as WritingDetail | null;
  if (!post) return {title: "Writing"};

  return {
    title: post.title,
    description: site.description,
  };
}

export default async function WritingPage({
  params,
  searchParams,
}: WritingPageProps) {
  const {slug} = await params;
  const card = (await searchParams).card;
  const showcaseCardId = typeof card === "string" ? card : null;
  const [{data: post}, {data: more}] = await Promise.all([
    sanityFetch({
      query: WRITING_BY_SLUG_QUERY,
      params: {slug},
      stega: false,
    }),
    sanityFetch({
      query: WRITING_MORE_QUERY,
      params: {slug},
      stega: false,
    }),
  ]);

  const article = post as WritingDetail | null;
  const morePosts = (more as WritingListItem[] | null) ?? [];
  if (!article) notFound();

  const words = wordCount(article.body);

  return (
    <div className="flex min-h-full flex-col">
      <NavControl
        href={
          showcaseCardId
            ? `/showcase?card=${encodeURIComponent(showcaseCardId)}`
            : "/writing"
        }
        label={showcaseCardId ? "Back to showcase" : "Writing"}
        icon="home"
        position="left"
      />
      <AppearFade delay={0} className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center pb-48 pt-24">
          <article className="site-column flex w-full flex-col gap-8 px-4">
            <header className="flex flex-col gap-8">
              <div className="flex items-center justify-between gap-3 text-overline text-subdued">
                <time dateTime={article.publishedAt}>
                  {formatArticleDate(article.publishedAt)}
                </time>
                <span className="inline-flex items-center gap-1.5">
                  <WordsIcon />
                  {words} words
                </span>
              </div>
              <h1 className="max-w-[80%] text-heading-1 text-ink md:max-w-none">
                {article.title}
              </h1>
            </header>
            <PortableBody value={article.body} />
          </article>
          <section className="site-column mt-16 flex w-full flex-col gap-4">
            <div className="px-4">
              <p className="text-overline text-subdued">More</p>
            </div>
            <WritingList
              posts={morePosts}
              showcaseCardId={showcaseCardId ?? undefined}
            />
          </section>
        </main>
        <SiteFooter />
      </AppearFade>
    </div>
  );
}

function WordsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M1.5 3h9M1.5 6h6.5M1.5 9h3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
