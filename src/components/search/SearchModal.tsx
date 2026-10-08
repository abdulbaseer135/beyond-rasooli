"use client";
import { useTranslations } from "next-intl";
import { X, Search } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}
export function SearchModal({ isOpen, onClose, locale }: SearchModalProps) {
  const t = useTranslations("search");
  const ui = useTranslations("ui");
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      label={t("title")}
      className="search-dialog"
    >
      <div className="dialog-heading">
        <h2 className="type-h2">{t("title")}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label={ui("close_search")}
        >
          <X strokeWidth={1.5} />
        </button>
      </div>
      <form method="GET" action={`/${locale}/search`} className="search-form">
        <label className="sr-only" htmlFor="overlay-query">
          {t("title")}
        </label>
        <input
          id="overlay-query"
          name="q"
          type="search"
          autoFocus
          placeholder={t("placeholder")}
          required
        />
        <button className="button button-primary" type="submit">
          <Search strokeWidth={1.5} aria-hidden="true" />
          {ui("search")}
        </button>
      </form>
    </Dialog>
  );
}
