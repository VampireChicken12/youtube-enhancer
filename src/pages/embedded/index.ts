/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { deepDarkPresets } from "@/src/deepDarkPresets";
import { type FeatureFuncRecord, featureButtonFunctions } from "@/src/features";
import { enableAutomaticTheaterMode } from "@/src/features/automaticTheaterMode";
import { featuresInControls } from "@/src/features/buttonPlacement";
import { checkIfFeatureButtonExists, getFeatureButton, updateFeatureButtonTitle } from "@/src/features/buttonPlacement/utils";
import { disableCustomCSS, enableCustomCSS } from "@/src/features/customCSS";
import { customCSSExists, updateCustomCSS } from "@/src/features/customCSS/utils";
import { disableDeepDarkCSS, enableDeepDarkCSS } from "@/src/features/deepDarkCSS";
import { deepDarkCSSExists, getDeepDarkCustomThemeStyle, updateDeepDarkCSS } from "@/src/features/deepDarkCSS/utils";
import { enableFeatureMenu, setupFeatureMenuEventListeners } from "@/src/features/featureMenu";
import { featuresInMenu, getFeatureMenuItem, updateFeatureMenuItemLabel, updateFeatureMenuTitle } from "@/src/features/featureMenu/utils";
import { disableHideLiveStreamChat, enableHideLiveStreamChat } from "@/src/features/hideLiveStreamChat";
import { enableHideScrollBar } from "@/src/features/hideScrollBar";
import { hideScrollBar, showScrollBar } from "@/src/features/hideScrollBar/utils";
import { disableHideShorts, enableHideShorts } from "@/src/features/hideShorts";
import { disableHideTranslateComment, enableHideTranslateComment } from "@/src/features/hideTranslateComment";
import { addLoopButton, removeLoopButton } from "@/src/features/loopButton";
import { addMaximizePlayerButton, removeMaximizePlayerButton } from "@/src/features/maximizePlayerButton";
import { maximizePlayer } from "@/src/features/maximizePlayerButton/utils";
import { openTranscriptButton } from "@/src/features/openTranscriptButton";
import { removeOpenTranscriptButton } from "@/src/features/openTranscriptButton/utils";
import { disableOpenYouTubeSettingsOnHover, enableOpenYouTubeSettingsOnHover } from "@/src/features/openYouTubeSettingsOnHover";
import { disablePauseBackgroundPlayers, enablePauseBackgroundPlayers } from "@/src/features/pauseBackgroundPlayers";
import {
	addDecreasePlaybackSpeedButton,
	addIncreasePlaybackSpeedButton,
	removeDecreasePlaybackSpeedButton,
	removeIncreasePlaybackSpeedButton
} from "@/src/features/playbackSpeedButtons";
import setPlayerQuality from "@/src/features/playerQuality";
import { restorePlayerSpeed, setPlayerSpeed, setupPlaybackSpeedChangeListener } from "@/src/features/playerSpeed";
import { setupRemainingTime as enableRemainingTime, removeRemainingTimeDisplay } from "@/src/features/remainingTime";
import enableRememberVolume from "@/src/features/rememberVolume";
import enableRemoveRedirect from "@/src/features/removeRedirect";
import { addScreenshotButton, removeScreenshotButton } from "@/src/features/screenshotButton";
import adjustSpeedOnScrollWheel from "@/src/features/scrollWheelSpeedControl";
import adjustVolumeOnScrollWheel from "@/src/features/scrollWheelVolumeControl";
import { disableShareShortener, enableShareShortener } from "@/src/features/shareShortener";
import { disableShortsAutoScroll, enableShortsAutoScroll } from "@/src/features/shortsAutoScroll";
import { enableSkipContinueWatching } from "@/src/features/skipContinueWatching";
import { promptUserToResumeVideo, setupVideoHistory } from "@/src/features/videoHistory";
import volumeBoost, {
	addVolumeBoostButton,
	applyVolumeBoost,
	disableVolumeBoost,
	enableVolumeBoost,
	removeVolumeBoostButton
} from "@/src/features/volumeBoost";
import { i18nService } from "@/src/i18n";
import { type ToggleFeatures, toggleFeatures } from "@/src/icons";
import {
	type ExtensionSendOnlyMessageMappings,
	type Messages,
	type MultiButtonFeatureNames,
	type MultiButtonNames,
	type SingleButtonFeatureNames,
	type SingleButtonNames,
	type YouTubePlayerDiv,
	featureToMultiButtonsMap
} from "@/src/types";
import eventManager from "@/utils/EventManager";
import {
	browserColorLog,
	findKeyByValue,
	formatError,
	isShortsPage,
	isWatchPage,
	sendContentOnlyMessage,
	waitForAllElements,
	waitForSpecificMessage
} from "@/utils/utilities";
// TODO: Add always show progressbar feature

/**
 * Creates a hidden div element with a specific ID that can be used to receive messages from YouTube.
 * The element is appended to the document's root element.
 */
const element = document.createElement("div");
element.style.display = "none";
element.id = "yte-message-from-youtube";
document.documentElement.appendChild(element);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const alwaysShowProgressBar = async function () {
	const player = document.querySelector<YouTubePlayerDiv>("#movie_player");
	if (!player) return;
	const playBar = player.querySelector<HTMLDivElement>(".ytp-play-progress");
	if (!playBar) return;
	const loadBar = player.querySelector<HTMLDivElement>(".ytp-load-progress");
	if (!loadBar) return;
	const currentTime = await player.getCurrentTime();
	const duration = await player.getDuration();
	const bytesLoaded = await player.getVideoBytesLoaded();
	const played = (currentTime * 100) / duration;
	const loaded = bytesLoaded * 100;
	let width = 0;
	let progressPlay = 0;
	let progressLoad = 0;

	width += playBar.offsetWidth;

	const widthPercent = width / 100;
	const progressWidth = playBar.offsetWidth / widthPercent;
	let playBarProgress = 0;
	let loadBarProgress = 0;
	if (played - progressPlay >= progressWidth) {
		playBarProgress = 100;
	} else if (played > progressPlay && played < progressWidth + progressPlay) {
		loadBarProgress = (100 * ((played - progressPlay) * widthPercent)) / playBar.offsetWidth;
	}
	playBar.style.transform = `scaleX(${playBarProgress / 100})`;
	if (loaded - progressLoad >= progressWidth) {
		loadBarProgress = 100;
	} else if (loaded > progressLoad && loaded < progressWidth + progressLoad) {
		loadBarProgress = (100 * ((loaded - progressLoad) * widthPercent)) / playBar.offsetWidth;
	}
	loadBar.style.transform = `scaleX(${loadBarProgress / 100})`;
	progressPlay += progressWidth;
	progressLoad += progressWidth;
};

const enableFeatures = () => {
	browserColorLog(`Enabling features...`, "FgMagenta");
	void (async () => {
		// Wait for the specified container selectors to be available on the page
		await waitForAllElements(["div#player", "div#player-wide-container", "div#video-container", "div#player-container"]);
		eventManager.removeAllEventListeners(["featureMenu"]);
		void Promise.all([
			enableHideShorts(),
			enableRemoveRedirect(),
			enableShareShortener(),
			enableSkipContinueWatching(),
			enablePauseBackgroundPlayers(),
			enableRememberVolume(),
			enableHideScrollBar(),
			enableCustomCSS(),
			enableDeepDarkCSS()
		]);

		// Use a guard clause to reduce amount of times nesting code happens
		if (!(isWatchPage() || isShortsPage())) return;

		void Promise.all([
			promptUserToResumeVideo(() => void setupVideoHistory()),
			setupPlaybackSpeedChangeListener(),
			enableShortsAutoScroll(),
			enableOpenYouTubeSettingsOnHover(),
			enableHideLiveStreamChat(),
			enableRememberVolume(),
			enableAutomaticTheaterMode(),
			enableRemainingTime(),
			volumeBoost(),
			setPlayerQuality(),
			setPlayerSpeed(),
			adjustVolumeOnScrollWheel(),
			adjustSpeedOnScrollWheel(),
			enableHideTranslateComment()
		]);
		// Enable feature menu before calling button functions
		await enableFeatureMenu();
		// Features that add buttons should be put below and be ordered in the order those buttons should appear
		await addIncreasePlaybackSpeedButton();
		await addDecreasePlaybackSpeedButton();
		await addScreenshotButton();
		await openTranscriptButton();
		await addMaximizePlayerButton();
		await addLoopButton();
	})();
};

window.addEventListener("DOMContentLoaded", function () {
	void (async () => {
		const {
			data: { language }
		} = await waitForSpecificMessage("language", "request_data", "content");
		if (!language) return;
		const i18nextInstance = await i18nService(language);
		window.i18nextInstance = i18nextInstance;
		// Listen to YouTube's soft navigate event
		document.addEventListener("yt-navigate-finish", enableFeatures);
		document.addEventListener("yt-player-updated", enableFeatures);
		/**
		 * Listens for the "yte-message-from-youtube" event and handles incoming messages from the YouTube page.
		 *
		 * @returns {void}
		 */
		document.addEventListener("yte-message-from-extension", () => {
			void (async () => {
				const provider = document.querySelector("div#yte-message-from-extension");
				if (!provider) return;
				const { textContent: stringifiedMessage } = provider;
				if (!stringifiedMessage) return;
				let message;
				try {
					message = JSON.parse(stringifiedMessage) as ExtensionSendOnlyMessageMappings[keyof ExtensionSendOnlyMessageMappings] | Messages["response"];
				} catch (error) {
					console.error(error);
					return;
				}
				if (!message) return;
				switch (message.type) {
					case "volumeBoostChange": {
						const {
							data: { volumeBoostEnabled, volumeBoostMode }
						} = message;
						if (volumeBoostEnabled) {
							if (volumeBoostMode === "global") {
								await removeVolumeBoostButton();
								await enableVolumeBoost();
								break;
							}
							disableVolumeBoost();
							await addVolumeBoostButton();
							break;
						}
						disableVolumeBoost();
						if (volumeBoostMode === "per_video") await removeVolumeBoostButton();
						break;
					}
					case "volumeBoostAmountChange": {
						const {
							data: { volumeBoostAmount, volumeBoostEnabled, volumeBoostMode }
						} = message;

						switch (volumeBoostMode) {
							case "global": {
								if (volumeBoostEnabled) applyVolumeBoost(volumeBoostAmount);
								break;
							}
							case "per_video": {
								const volumeBoostButton = getFeatureMenuItem("volumeBoostButton") ?? getFeatureButton("volumeBoostButton");
								console.log(volumeBoostButton);
								if (!volumeBoostButton) return;
								const volumeBoostForVideoEnabled = volumeBoostButton.ariaChecked === "true";
								console.log(volumeBoostForVideoEnabled, volumeBoostButton.ariaChecked);
								if (volumeBoostForVideoEnabled) applyVolumeBoost(volumeBoostAmount);
							}
						}
						break;
					}
					case "playerSpeedChange": {
						const {
							data: { enableForcedPlaybackSpeed, playerSpeed }
						} = message;
						if (enableForcedPlaybackSpeed && playerSpeed) await setPlayerSpeed(Number(playerSpeed));
						else if (!enableForcedPlaybackSpeed) restorePlayerSpeed();
						break;
					}
					case "screenshotButtonChange": {
						const {
							data: { screenshotButtonEnabled }
						} = message;
						if (screenshotButtonEnabled) await addScreenshotButton();
						else await removeScreenshotButton();
						break;
					}
					case "maximizeButtonChange": {
						const {
							data: { maximizePlayerButtonEnabled }
						} = message;
						if (maximizePlayerButtonEnabled) return await addMaximizePlayerButton();

						await removeMaximizePlayerButton();
						const maximizePlayerButton = document.querySelector<HTMLButtonElement>("video.html5-main-video");
						if (!maximizePlayerButton) return;
						// Get the video element
						const videoElement = document.querySelector<HTMLVideoElement>("video.html5-main-video");
						// If video element is not available, return
						if (!videoElement) return;
						const videoContainer = document.querySelector<YouTubePlayerDiv>("video.html5-main-video");
						if (!videoContainer) return;
						if (videoContainer.classList.contains("maximized_video_container") && videoElement.classList.contains("maximized_video")) {
							maximizePlayer();
						}
						break;
					}
					case "videoHistoryChange": {
						const {
							data: { videoHistoryEnabled }
						} = message;
						if (videoHistoryEnabled) await setupVideoHistory();
						else eventManager.removeEventListeners("videoHistory");
						break;
					}
					case "remainingTimeChange": {
						const {
							data: { remainingTimeEnabled }
						} = message;
						if (remainingTimeEnabled) await enableRemainingTime();
						else removeRemainingTimeDisplay();
						break;
					}
					case "loopButtonChange": {
						const {
							data: { loopButtonEnabled }
						} = message;
						if (loopButtonEnabled) await addLoopButton();
						else await removeLoopButton();
						break;
					}
					case "playbackSpeedButtonsChange": {
						const {
							data: { playbackSpeedButtonsEnabled }
						} = message;
						if (playbackSpeedButtonsEnabled) {
							await addDecreasePlaybackSpeedButton();
							await addIncreasePlaybackSpeedButton();
						} else {
							await removeDecreasePlaybackSpeedButton();
							await removeIncreasePlaybackSpeedButton();
						}
						break;
					}
					case "scrollWheelVolumeControlChange": {
						const {
							data: { scrollWheelVolumeControlEnabled }
						} = message;
						if (scrollWheelVolumeControlEnabled) await adjustVolumeOnScrollWheel();
						else eventManager.removeEventListeners("scrollWheelVolumeControl");
						break;
					}
					case "scrollWheelSpeedControlChange": {
						const {
							data: { scrollWheelSpeedControlEnabled }
						} = message;
						if (scrollWheelSpeedControlEnabled) await adjustSpeedOnScrollWheel();
						else eventManager.removeEventListeners("scrollWheelSpeedControl");
						break;
					}
					case "rememberVolumeChange": {
						const {
							data: { rememberVolumeEnabled }
						} = message;
						if (rememberVolumeEnabled) await enableRememberVolume();
						else eventManager.removeEventListeners("rememberVolume");
						break;
					}
					case "hideTranslateCommentChange": {
						const {
							data: { hideTranslateCommentEnabled }
						} = message;
						if (hideTranslateCommentEnabled) await enableHideTranslateComment();
						else await disableHideTranslateComment();
						break;
					}
					case "hideScrollBarChange": {
						const scrollBarHidden = document.getElementById("yte-hide-scroll-bar") !== null;
						const {
							data: { hideScrollBarEnabled }
						} = message;
						if (hideScrollBarEnabled && !scrollBarHidden) hideScrollBar();
						if (!hideScrollBarEnabled && scrollBarHidden) showScrollBar();
						break;
					}
					case "hideShortsChange": {
						const {
							data: { hideShortsEnabled }
						} = message;
						if (hideShortsEnabled) await enableHideShorts();
						else disableHideShorts();
						break;
					}
					case "hideLiveStreamChatChange": {
						const {
							data: { hideLiveStreamChatEnabled }
						} = message;
						if (hideLiveStreamChatEnabled) await enableHideLiveStreamChat();
						else await disableHideLiveStreamChat();
						break;
					}
					case "languageChange": {
						const {
							data: { language }
						} = message;
						window.i18nextInstance = await i18nService(language);
						if (featuresInMenu.size > 0) {
							updateFeatureMenuTitle(window.i18nextInstance.t("pages.content.features.featureMenu.button.label"));
							for (const feature of featuresInMenu) {
								const featureName = findKeyByValue(feature as MultiButtonNames) ?? (feature as SingleButtonFeatureNames);
								updateFeatureMenuItemLabel(
									feature,
									window.i18nextInstance.t(
										featureToMultiButtonsMap.has(featureName) ?
											`pages.content.features.${featureName as MultiButtonFeatureNames}.buttons.${feature as MultiButtonNames}.label`
										:	`pages.content.features.${featureName as SingleButtonNames}.button.label`
									)
								);
							}
						}
						if (featuresInControls.size > 0) {
							for (const feature of featuresInControls) {
								const featureName = findKeyByValue(feature as MultiButtonNames) ?? (feature as SingleButtonFeatureNames);
								if (toggleFeatures.includes(feature)) {
									const toggleFeature = feature as ToggleFeatures;
									const featureButton = getFeatureButton(toggleFeature);
									if (!featureButton) return;
									const buttonChecked = JSON.parse(featureButton.ariaChecked ?? "false") as boolean;
									updateFeatureButtonTitle(
										toggleFeature,
										window.i18nextInstance.t(`pages.content.features.${toggleFeature}.button.toggle.${buttonChecked ? "on" : "off"}`)
									);
									return;
								}

								updateFeatureMenuItemLabel(
									feature,
									window.i18nextInstance.t(
										featureToMultiButtonsMap.has(featureName) ?
											`pages.content.features.${featureName as MultiButtonFeatureNames}.buttons.${feature as MultiButtonNames}.label`
										:	`pages.content.features.${featureName as SingleButtonNames}.button.label`
									)
								);
							}
						}
						break;
					}
					case "automaticTheaterModeChange": {
						// Get the player element
						const playerContainer =
							isWatchPage() ? document.querySelector("div#player-container.ytd-watch-flexy")
							: isShortsPage() ? document.querySelector("div#shorts-player")
							: null;
						// If player element is not available, return
						if (!playerContainer) return;
						// Get the size button
						const sizeButton = document.querySelector<HTMLButtonElement>("button.ytp-size-button");
						// If the size button is not available return
						if (!sizeButton) return;
						sizeButton.click();

						break;
					}
					case "featureMenuOpenTypeChange": {
						const {
							data: { featureMenuOpenType }
						} = message;
						setupFeatureMenuEventListeners(featureMenuOpenType);
						break;
					}
					case "openTranscriptButtonChange": {
						const {
							data: { openTranscriptButtonEnabled }
						} = message;
						if (openTranscriptButtonEnabled) await openTranscriptButton();
						else await removeOpenTranscriptButton();
						break;
					}
					case "openYTSettingsOnHoverChange": {
						const {
							data: { openYouTubeSettingsOnHoverEnabled }
						} = message;
						if (openYouTubeSettingsOnHoverEnabled) await enableOpenYouTubeSettingsOnHover();
						else disableOpenYouTubeSettingsOnHover();
						break;
					}
					case "removeRedirectChange": {
						const {
							data: { removeRedirectEnabled }
						} = message;
						if (removeRedirectEnabled) await enableRemoveRedirect();
						break;
					}
					case "pauseBackgroundPlayersChange": {
						const {
							data: { pauseBackgroundPlayersEnabled }
						} = message;
						if (pauseBackgroundPlayersEnabled) await enablePauseBackgroundPlayers();
						else disablePauseBackgroundPlayers();
						break;
					}
					case "shareShortenerChange": {
						const {
							data: { shareShortenerEnabled }
						} = message;
						if (shareShortenerEnabled) await enableShareShortener();
						else disableShareShortener();
						break;
					}
					case "skipContinueWatchingChange": {
						const {
							data: { skipContinueWatchingEnabled }
						} = message;
						if (skipContinueWatchingEnabled) await enableSkipContinueWatching();
						break;
					}
					case "deepDarkThemeChange": {
						const {
							data: { deepDarkCustomThemeColors, deepDarkPreset, deepDarkThemeEnabled }
						} = message;
						if (!deepDarkThemeEnabled) return disableDeepDarkCSS();
						if (!deepDarkCSSExists()) return await enableDeepDarkCSS();
						updateDeepDarkCSS(deepDarkPreset === "Custom" ? getDeepDarkCustomThemeStyle(deepDarkCustomThemeColors) : deepDarkPresets[deepDarkPreset]);
						break;
					}
					case "customCSSChange": {
						const {
							data: { customCSSCode, customCSSEnabled }
						} = message;
						if (!customCSSEnabled) return disableCustomCSS();
						if (!customCSSExists()) return enableCustomCSS();
						updateCustomCSS({ custom_css_code: customCSSCode });
						break;
					}
					case "buttonPlacementChange": {
						const {
							data: { buttonPlacement: buttonPlacements }
						} = message;
						for (const [featureName, { new: newPlacement, old: oldPlacement }] of Object.entries(buttonPlacements)) {
							const buttonExists = checkIfFeatureButtonExists(featureName, newPlacement);
							if (buttonExists) continue;
							const { [featureName]: featureFunctions } = featureButtonFunctions;
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							const castFeatureFunctions = featureFunctions as unknown as FeatureFuncRecord;
							// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
							await castFeatureFunctions.remove(oldPlacement);
							// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
							await castFeatureFunctions.add();
						}
						break;
					}
					case "shortsAutoScrollChange": {
						const {
							data: { shortsAutoScrollEnabled }
						} = message;
						if (shortsAutoScrollEnabled) await enableShortsAutoScroll();
						else disableShortsAutoScroll();
						break;
					}
					default: {
						return;
					}
				}
			})();
		});
		sendContentOnlyMessage("pageLoaded", undefined);
	})();
});
window.onbeforeunload = function () {
	eventManager.removeAllEventListeners();
	element.remove();
};

// Error handling
window.addEventListener("error", (event) => {
	event.preventDefault();
	const {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		error: { stack: errorLine }
	} = event;
	browserColorLog(formatError(event.error) + "\nAt: " + errorLine, "FgRed");
});

window.addEventListener("unhandledrejection", (event) => {
	event.preventDefault();
	const errorLine = event.reason instanceof Error ? event?.reason?.stack : "Stack trace not available";
	browserColorLog(`Unhandled rejection: ${event.reason}\nAt: ${errorLine}`, "FgRed");
});
