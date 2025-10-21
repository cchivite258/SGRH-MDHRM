import { createI18n, type I18nOptions } from "vue-i18n";
import localeMessages from "@/app/locales/index";
import { App } from "vue";

const legacy: boolean = false;
const globalInjection: boolean = true;
const locale: string = process.env.VUE_APP_I18N_LOCALE || "pt";
const fallbackLocale: string = process.env.VUE_APP_I18N_FALLBACK_LOCALE || "pt";

export default createI18n({
  legacy,
  globalInjection,
  locale,
  fallbackLocale,
  messages: localeMessages,
  allowComposition: true,
}) as { install: (app: App<I18nOptions>) => any };
