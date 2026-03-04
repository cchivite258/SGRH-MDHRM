import { createI18n } from "vue-i18n";
import localeMessages from "@/app/locales/index";

const legacy: boolean = false;
const globalInjection: boolean = true;
const locale: string = process.env.VUE_APP_I18N_LOCALE || "pt";
const fallbackLocale: string = process.env.VUE_APP_I18N_FALLBACK_LOCALE || "pt";

const i18n = createI18n({
  legacy,
  globalInjection,
  locale,
  fallbackLocale,
  messages: localeMessages,
  allowComposition: true,
});

export default i18n;
