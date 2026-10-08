"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Search, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SearchModal } from "@/components/search/SearchModal";
import { Dialog } from "@/components/ui/Dialog";
export function Header({ brand }: { brand: string }) {
  const t = useTranslations("nav");
  const ui = useTranslations("ui");
  const locale = useLocale();
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const scroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 96);
      last = y;
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  const navigation = ["home", "watch", "read", "topics", "about"] as const;
  const nav = (
    <nav aria-label={ui("main_navigation")}>
      {navigation.map((key) => {
        const href = key === "home" ? "/" : `/${key}`;
        return (
          <Link
            key={key}
            href={href}
            onClick={() => {
              setMenu(false);
              setSearch(false);
            }}
            aria-current={
              (key === "home" ? path === "/" : path.startsWith(href))
                ? "page"
                : undefined
            }
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("skip_to_content")}
      </a>
      <header
        className={`site-header ${hidden && !menu ? "header-hidden" : ""}`}
      >
        <div className="site-container header-inner">
          <Link href="/" className="wordmark">
            <bdi>{brand}</bdi>
          </Link>
          <div className="desktop-navigation">{nav}</div>
          <div className="header-actions">
            <button
              className="icon-button"
              type="button"
              onClick={() => setSearch(true)}
              aria-label={t("search")}
            >
              <Search strokeWidth={1.5} />
            </button>
            <div className="desktop-language">
              <LanguageSwitcher />
            </div>
            <button
              className="icon-button mobile-toggle"
              type="button"
              onClick={() => setMenu(true)}
              aria-label={t("menu")}
              aria-expanded={menu}
            >
              <Menu strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>
      <Dialog
        open={menu}
        onClose={() => setMenu(false)}
        label={t("menu")}
        className="navigation-dialog"
      >
        <div className="dialog-heading">
          <span className="wordmark">{brand}</span>
          <button
            className="icon-button"
            type="button"
            onClick={() => setMenu(false)}
            aria-label={t("close_menu")}
          >
            <X strokeWidth={1.5} />
          </button>
        </div>
        {nav}
        <LanguageSwitcher />
        <button
          className="button button-secondary"
          type="button"
          onClick={() => {
            setMenu(false);
            setSearch(true);
          }}
        >
          {t("search")}
        </button>
      </Dialog>
      <SearchModal
        isOpen={search}
        onClose={() => setSearch(false)}
        locale={locale}
      />
    </>
  );
}
