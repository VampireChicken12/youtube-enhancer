import { type Resource, createInstance } from "i18next";

import { waitForSpecificMessage } from "../utils/utilities";
export const availableLocales = [
  "ca-ES",
  "cs-CZ",
  "de-DE",
  "en-GB",
  "en-US",
  "es-ES",
  "fa-IR",
  "fr-FR",
  "he-IL",
  "hi-IN",
  "it-IT",
  "ja-JP",
  "pl-PL",
  "pt-BR",
  "ru-RU",
  "sv-SE",
  "tr-TR",
  "zh-CN",
  "zh-TW"
] as const;
export const localePercentages: Record<AvailableLocales, number> = {
	"ca-ES": 0,
	"cs-CZ": 0,
	"de-DE": 34,
	"en-GB": 2,
	"en-US": 100,
	"es-ES": 61,
	"fa-IR": 0,
	"fr-FR": 64,
	"he-IL": 0,
	"hi-IN": 0,
	"it-IT": 98,
	"ja-JP": 98,
	"pl-PL": 0,
	"pt-BR": 71,
	"ru-RU": 96,
	"sv-SE": 94,
	"tr-TR": 72,
	"zh-CN": 98,
	"zh-TW": 94
};
export const localeDirection: Record<AvailableLocales, "ltr" | "rtl"> = {
	"ca-ES": "ltr",
	"cs-CZ": "ltr",
	"de-DE": "ltr",
	"en-GB": "ltr",
	"en-US": "ltr",
	"es-ES": "ltr",
	"fa-IR": "rtl",
	"fr-FR": "ltr",
	"he-IL": "rtl",
	"hi-IN": "ltr",
	"it-IT": "ltr",
	"ja-JP": "ltr",
	"pl-PL": "ltr",
	"pt-BR": "ltr",
	"ru-RU": "ltr",
	"sv-SE": "ltr",
	"tr-TR": "ltr",
	"zh-CN": "ltr",
	"zh-TW": "ltr"
};
export type AvailableLocales = (typeof availableLocales)[number];
export type i18nInstanceType = ReturnType<typeof createInstance>;

export async function i18nService(locale: AvailableLocales) {
	let extensionURL;
	const isYouTube = window.location.hostname === "www.youtube.com";
	if (isYouTube) {
		const extensionURLResponse = await waitForSpecificMessage("extensionURL", "request_data", "content");
		if (!extensionURLResponse) throw new Error("Failed to get extension URL");
		({
			data: { extensionURL }
		} = extensionURLResponse);
	} else {
		extensionURL = chrome.runtime.getURL("");
	}
	if (!availableLocales.includes(locale)) throw new Error(`The locale '${locale}' is not available`);
	const response = await fetch(`${extensionURL}locales/${locale}.json`).catch((err) => {
		if (err instanceof Error) {
			throw err;
		} else {
			throw new Error("unknown error");
		}
	});
	const translations = (await response.json()) as typeof import("../../public/locales/en-US.json");
	const i18nextInstance = await new Promise<i18nInstanceType>((resolve, reject) => {
		const resources: {
			[k in AvailableLocales]?: {
				translation: typeof import("../../public/locales/en-US.json");
			};
		} = {
			[locale]: { translation: translations }
		};
		const instance = createInstance();
		void instance.init(
			{
				debug: true,
				fallbackLng: "en-US",
				interpolation: {
					escapeValue: false
				},
				lng: locale,
				resources: resources as unknown as { [key: string]: Resource },
				returnObjects: true
			},
			(err) => {
				if (err) reject(err);
				else resolve(instance);
			}
		);
	});
	return i18nextInstance;
}
