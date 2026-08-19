import {PageFade, SiteEnter} from "@/components/page-fade";
import {ProfileIntro} from "@/components/profile-intro";
import {SiteFooter} from "@/components/site-footer";
import type {ReactNode} from "react";

export default function SiteLayout({children}: {children: ReactNode}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteEnter className="flex min-h-full flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center gap-6 pb-48 pt-24">
          <div className="w-full">
            <ProfileIntro showTabs />
          </div>
          <PageFade>{children}</PageFade>
        </main>
        <SiteFooter />
      </SiteEnter>
    </div>
  );
}
