import {NavControl} from "@/components/nav-control";
import {ProfileIntro} from "@/components/profile-intro";
import {SiteFooter} from "@/components/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <NavControl href="/" label="Home" icon="home" position="left" appearDelay={0.2} />
      <main className="flex flex-1 flex-col items-center gap-6 pt-24">
        <ProfileIntro />
        <p className="site-column px-4 text-body-md text-subdued">
          This page could not be found.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
