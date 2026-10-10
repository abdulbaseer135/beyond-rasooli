import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/data/cms";
import type { Locale } from "@/i18n/routing";
import { SocialIcon } from "@/components/ui/SocialIcon";

export async function ContactChannels({ locale }: { locale: Locale }) {
  const [settings, ui, nav] = await Promise.all([
    getSettings(locale),
    getTranslations({ locale, namespace: "ui" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const links = [
    { platform: "facebook", url: settings.socialLinks?.facebook },
    { platform: "instagram", url: settings.socialLinks?.instagram },
  ];
  return (
    <details className="contact-channels">
      <summary className="button button-primary">{nav("contact")}</summary>
      <nav className="contact-channel-links" aria-label={nav("contact")}>
        {links.map(({ platform, url }) => {
          let valid = false;
          try { valid = !!url && new URL(url).protocol === "https:"; } catch { /* Unconfigured channels remain placeholders. */ }
          return valid ? (
            <a key={platform} href={url!} target="_blank" rel="noopener noreferrer" className="contact-channel-link">
              <SocialIcon platform={platform} /><bdi>{ui(platform)}</bdi>
            </a>
          ) : (
            <button key={platform} type="button" className="contact-channel-link" disabled>
              <SocialIcon platform={platform} /><bdi>{ui(platform)}</bdi>
            </button>
          );
        })}
        <button type="button" className="contact-channel-link" disabled>
          <MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" /><bdi>{ui("whatsapp")}</bdi>
        </button>
      </nav>
    </details>
  );
}
