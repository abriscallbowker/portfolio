import {PageFade, SiteEnter} from "@/components/page-fade";
import {ProfileIntro} from "@/components/profile-intro";
import {SiteFooter} from "@/components/site-footer";
import {WritingFilterProvider} from "@/components/writing-filter";
import type {ReactNode} from "react";

export default function SiteLayout({children}: {children: ReactNode}) {
  return (
    <WritingFilterProvider>
      <SiteEnter>
        <main className="flex flex-1 flex-col items-center gap-6 pb-48 pt-16 sm:pt-24">
          {/* Positioned above the page content so the category menu isn't
              trapped under it while ancestor fades create stacking
              contexts. */}
          <div className="relative z-20 w-full">
            <ProfileIntro showTabs />
          </div>
          <PageFade>{children}</PageFade>
        </main>
        <SiteFooter />
      </SiteEnter>
    </WritingFilterProvider>
  );
}
