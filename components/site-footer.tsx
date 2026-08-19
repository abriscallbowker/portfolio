import {site} from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="flex w-full justify-center px-4 pb-20 pt-24 max-md:pb-[140px]">
      <p className="text-body-xs text-subdued opacity-50">
        {site.fullName} © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
