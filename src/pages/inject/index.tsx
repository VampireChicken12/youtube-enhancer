import type { AvailableLocales } from "@/src/i18n";
import type { ContentSendOnlyMessageMappings, Messages, RememberedVolumes, StorageChanges, configuration, configurationKeys } from "@/src/types";

import { getVideoHistory, setVideoHistory } from "@/src/features/videoHistory/utils";
import { defaultConfiguration } from "@/src/utils/constants";
import { parseStoredValue, sendExtensionMessage, sendExtensionOnlyMessage } from "@/src/utils/utilities";

/**
 * Adds a script element to the document's root element, which loads a JavaScript file from the extension's runtime URL.
 * Also creates a hidden div element with a specific ID to receive messages from the extension.
 */
const script = document.createElement("script");
script.src = chrome.runtime.getURL("src/pages/content/index.js");
script.type = "text/javascript";
function initializeCommunicationElement() {
	const element = document.createElement("div");
	element.style.display = "none";
	element.id = "yte-message-from-extension";
	document.documentElement.appendChild(element);
}
initializeCommunicationElement();
document.documentElement.appendChild(script);
void (async () => {
	/**
	 * Retrieves the options from the local storage and sends them back to the youtube page.
	 *
	 * @type {configuration}
	 */
	const options: configuration = await new Promise((resolve) => {
		chrome.storage.local.get((settings) => {
			const storedSettings: Partial<configuration> = (
				Object.keys(settings)
					.filter((key) => typeof key === "string")
					.filter((key) => Object.keys(defaultConfiguration).includes(key as unknown as string)) as configurationKeys[]
			).reduce((acc, key) => Object.assign(acc, { [key]: parseStoredValue(settings[key] as string) }), {});
			resolve(storedSettings as configuration);
		});
	});
	void void sendExtensionMessage("options", "data_response", { options });
})();

/**
 * Listens for the "yte-message-from-youtube" event and handles incoming messages from the YouTube page.
 *
 * @returns {void}
 */
document.addEventListener("yte-message-from-youtube", () => {
	void (async () => {
		const provider = document.querySelector("#yte-message-from-youtube");
		if (!provider) return;
		const { textContent: stringifiedMessage } = provider;
		if (!stringifiedMessage) return;
		let message;
		try {
			message = JSON.parse(stringifiedMessage) as ContentSendOnlyMessageMappings[keyof ContentSendOnlyMessageMappings] | Messages["request"];
		} catch (error) {
			console.error(error);
			return;
		}
		if (!message) return;
		switch (message.type) {
			case "options": {
				/**
				 * Retrieves the options from the local storage and sends them back to the youtube page.
				 *
				 * @type {configuration}
				 */
				const options: configuration = await new Promise((resolve) => {
					chrome.storage.local.get((settings) => {
						const storedSettings: Partial<configuration> = (
							Object.keys(settings)
								.filter((key) => typeof key === "string")
								.filter((key) => Object.keys(defaultConfiguration).includes(key as unknown as string)) as configurationKeys[]
						).reduce((acc, key) => Object.assign(acc, { [key]: parseStoredValue(settings[key] as string) }), {});
						resolve(storedSettings as configuration);
					});
				});
				void sendExtensionMessage("options", "data_response", { options });
				break;
			}
			case "videoHistoryOne": {
				const { action, data } = message;
				if (!data) return;
				switch (action) {
					case "request_data": {
						const { id } = data;
						const videoHistory = getVideoHistory();
						void sendExtensionMessage("videoHistoryOne", "data_response", {
							video_history_entry: videoHistory[id]
						});
						break;
					}
					case "send_data": {
						const { video_history_entry } = data;
						if (!video_history_entry) return;
						const { id, status, timestamp } = video_history_entry;
						setVideoHistory(id, timestamp, status);
						break;
					}
				}
				break;
			}
			case "videoHistoryAll": {
				const videoHistory = getVideoHistory();
				void sendExtensionMessage("videoHistoryAll", "data_response", {
					video_history_entries: videoHistory
				});
				break;
			}
			case "setRememberedVolume": {
				const { remembered_volumes: existingRememberedVolumeStringified } = await chrome.storage.local.get("remembered_volumes");
				const existingRememberedVolumes = parseStoredValue(existingRememberedVolumeStringified as string) as RememberedVolumes;
				void chrome.storage.local.set({ remembered_volumes: JSON.stringify({ ...existingRememberedVolumes, ...message.data }) });
				break;
			}
			case "extensionURL": {
				void sendExtensionMessage("extensionURL", "data_response", {
					extensionURL: chrome.runtime.getURL("")
				});
				break;
			}
			case "language": {
				const language = await new Promise<AvailableLocales>((resolve) => {
					chrome.storage.local.get("language", (o) => {
						resolve(o.language as AvailableLocales);
					});
				});
				void sendExtensionMessage("language", "data_response", {
					language
				});
				break;
			}
			case "pageLoaded": {
				chrome.storage.onChanged.addListener(storageListeners);
				window.onunload = () => {
					chrome.storage.onChanged.removeListener(storageListeners);
				};
			}
		}
	})();
});
const storageListeners = (changes: StorageChanges, areaName: string) => {
	if (areaName !== "local") return;
	const changeKeys = Object.keys(
		changes as {
			[K in keyof configuration]?: {
				newValue: configuration[K] | undefined;
				oldValue: configuration[K] | undefined;
			};
		}
	);
	if (!changeKeys.length) return;
	void storageChangeHandler(changes, areaName);
};
const castStorageChanges = (changes: StorageChanges) => {
	return Object.fromEntries(Object.entries(changes).map(([key, change]) => [key, change as { newValue?: unknown; oldValue?: unknown }])) as {
		[K in keyof configuration]: { newValue?: string; oldValue?: string };
	};
};
const getStoredSettings = async (): Promise<configuration> => {
	const options: configuration = await new Promise((resolve) => {
		chrome.storage.local.get((settings) => {
			const storedSettings: Partial<configuration> = (
				Object.keys(settings)
					.filter((key) => typeof key === "string")
					.filter((key) => Object.keys(defaultConfiguration).includes(key as unknown as string)) as configurationKeys[]
			).reduce((acc, key) => Object.assign(acc, { [key]: parseStoredValue(settings[key] as string) }), {});
			resolve(storedSettings as configuration);
		});
	});

	return options;
};
const isValidChange = (change?: { newValue?: unknown; oldValue?: unknown }) => {
	return (
		change?.newValue !== undefined &&
		change?.oldValue !== undefined &&
		parseStoredValue(change.oldValue as string) !== parseStoredValue(change.newValue as string)
	);
};
const storageChangeHandler = async (changes: StorageChanges, areaName: string) => {
	if (areaName !== "local") return;

	// Convert changes to a typed object
	const castedChanges = castStorageChanges(changes);

	// Get the current configuration options from local storage
	const options = await getStoredSettings();
	const keyActions: {
		[K in keyof configuration]?: (newValue: configuration[K]) => void;
	} = {
		custom_css_code: (newValue) => {
			sendExtensionOnlyMessage("customCSSChange", {
				customCSSCode: newValue,
				customCSSEnabled: options.enable_custom_css
			});
		},
		enable_automatic_theater_mode: (newValue) => {
			sendExtensionOnlyMessage("automaticTheaterModeChange", {
				automaticTheaterModeEnabled: newValue
			});
		},
		enable_custom_css: (newValue) => {
			sendExtensionOnlyMessage("customCSSChange", { customCSSCode: options.custom_css_code, customCSSEnabled: newValue });
		},
		enable_forced_playback_speed: (newValue) => {
			sendExtensionOnlyMessage("playerSpeedChange", {
				enableForcedPlaybackSpeed: newValue,
				playerSpeed: options.player_speed
			});
		},
		enable_hide_scrollbar: (newValue) => {
			sendExtensionOnlyMessage("hideScrollBarChange", {
				hideScrollBarEnabled: newValue
			});
		},
		enable_loop_button: (newValue) => {
			sendExtensionOnlyMessage("loopButtonChange", {
				loopButtonEnabled: newValue
			});
		},
		enable_maximize_player_button: (newValue) => {
			sendExtensionOnlyMessage("maximizeButtonChange", {
				maximizePlayerButtonEnabled: newValue
			});
		},
		enable_open_transcript_button: (newValue) => {
			sendExtensionOnlyMessage("openTranscriptButtonChange", {
				openTranscriptButtonEnabled: newValue
			});
		},
		enable_open_youtube_settings_on_hover: (newValue) => {
			sendExtensionOnlyMessage("openYTSettingsOnHoverChange", {
				openYouTubeSettingsOnHoverEnabled: newValue
			});
		},
		enable_remaining_time: (newValue) => {
			sendExtensionOnlyMessage("remainingTimeChange", {
				remainingTimeEnabled: newValue
			});
		},
		enable_remember_last_volume: (newValue) => {
			sendExtensionOnlyMessage("rememberVolumeChange", {
				rememberVolumeEnabled: newValue
			});
		},
		enable_screenshot_button: (newValue) => {
			sendExtensionOnlyMessage("screenshotButtonChange", {
				screenshotButtonEnabled: newValue
			});
		},
		enable_scroll_wheel_speed_control: (newValue) => {
			sendExtensionOnlyMessage("scrollWheelSpeedControlChange", {
				scrollWheelSpeedControlEnabled: newValue
			});
		},
		enable_scroll_wheel_volume_control: (newValue) => {
			sendExtensionOnlyMessage("scrollWheelVolumeControlChange", {
				scrollWheelVolumeControlEnabled: newValue
			});
		},
		enable_video_history: (newValue) => {
			sendExtensionOnlyMessage("videoHistoryChange", {
				videoHistoryEnabled: newValue
			});
		},
		enable_volume_boost: (newValue) => {
			sendExtensionOnlyMessage("volumeBoostChange", {
				volumeBoostAmount: options.volume_boost_amount,
				volumeBoostEnabled: newValue,
				volumeBoostMode: options.volume_boost_mode
			});
		},
		feature_menu_open_type: (newValue) => {
			sendExtensionOnlyMessage("featureMenuOpenTypeChange", {
				featureMenuOpenType: newValue
			});
		},
		language: (newValue) => {
			sendExtensionOnlyMessage("languageChange", {
				language: newValue
			});
		},
		player_speed: (newValue) => {
			sendExtensionOnlyMessage("playerSpeedChange", {
				enableForcedPlaybackSpeed: options.enable_forced_playback_speed,
				playerSpeed: newValue
			});
		},
		volume_boost_amount: (newValue) => {
			sendExtensionOnlyMessage("volumeBoostChange", {
				volumeBoostAmount: newValue,
				volumeBoostEnabled: options.enable_volume_boost,
				volumeBoostMode: options.volume_boost_mode
			});
		},
		volume_boost_mode: (newValue) => {
			sendExtensionOnlyMessage("volumeBoostChange", {
				volumeBoostAmount: options.volume_boost_amount,
				volumeBoostEnabled: options.enable_volume_boost,
				volumeBoostMode: newValue
			});
		}
	};
	Object.entries(castedChanges).forEach(([key, change]) => {
		if (isValidChange(change)) {
			if (!change.newValue) return;
			const newValue = parseStoredValue(change.newValue) as configuration[typeof key];
			const { [key]: handler } = keyActions;
			if (!handler) return;
			(handler as (newValue: configuration[typeof key]) => void)(newValue);
		}
	});
};
