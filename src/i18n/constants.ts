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
	"ko-KR",
	"pl-PL",
	"pt-BR",
	"ru-RU",
	"sv-SE",
	"tr-TR",
	"uk-UA",
	"vi-VN",
	"zh-CN",
	"zh-TW"
] as const;
export const localePercentages: Record<AvailableLocales, number> = {
	"ca-ES": 0,
	"cs-CZ": 0,
	"de-DE": 31,
	"en-GB": 2,
	"en-US": 100,
	"es-ES": 54,
	"fa-IR": 0,
	"fr-FR": 57,
	"he-IL": 0,
	"hi-IN": 0,
	"it-IT": 100,
	"ja-JP": 100,
	"ko-KR": 94,
	"pl-PL": 0,
	"pt-BR": 63,
	"ru-RU": 100,
	"sv-SE": 94,
	"tr-TR": 69,
	"uk-UA": 21,
	"vi-VN": 0,
	"zh-CN": 100,
	"zh-TW": 96
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
	"ko-KR": "ltr",
	"pl-PL": "ltr",
	"pt-BR": "ltr",
	"ru-RU": "ltr",
	"sv-SE": "ltr",
	"tr-TR": "ltr",
	"uk-UA": "ltr",
	"vi-VN": "ltr",
	"zh-CN": "ltr",
	"zh-TW": "ltr"
};
export type AvailableLocales = (typeof availableLocales)[number];
