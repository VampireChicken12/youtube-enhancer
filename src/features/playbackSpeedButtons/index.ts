import type { YouTubePlayerDiv } from "@/src/types";

import { addFeatureButton, removeFeatureButton } from "@/src/features/buttonPlacement";
import { getFeatureButton } from "@/src/features/buttonPlacement/utils";
import { setPlayerSpeed } from "@/src/features/playerSpeed";
import { getFeatureIcon } from "@/src/icons";
import eventManager from "@/src/utils/EventManager";
import OnScreenDisplayManager from "@/src/utils/OnScreenDisplayManager";
import { createTooltip, isShortsPage, isWatchPage, waitForSpecificMessage } from "@/src/utils/utilities";

import type { AddButtonFunction, RemoveButtonFunction } from "../index";
let currentPlaybackSpeed = 1;

type TooltipButtonName = "decreasePlaybackSpeedButton" | "increasePlaybackSpeedButton";
async function updateTooltip<ButtonName extends TooltipButtonName>(buttonName: ButtonName, speed: number) {
	const {
		data: {
			options: {
				button_placements: {
					decreasePlaybackSpeedButton: decreasePlaybackSpeedButtonPlacement,
					increasePlaybackSpeedButton: increasePlaybackSpeedButtonPlacement
				},
				playback_buttons_speed: playbackSpeedPerClick
			}
		}
	} = await waitForSpecificMessage("options", "request_data", "content");
	const button = getFeatureButton(buttonName);
	if (!button) return;
	const placement = buttonName == "increasePlaybackSpeedButton" ? increasePlaybackSpeedButtonPlacement : decreasePlaybackSpeedButtonPlacement;
	const { update } = createTooltip({
		direction: placement === "below_player" ? "down" : "up",
		element: button,
		featureName: "playbackSpeedButtons",
		id: `yte-feature-${buttonName}-tooltip`
	});
	button.dataset.title = window.i18nextInstance.t(
		speed == 4 && buttonName == "increasePlaybackSpeedButton" ? `pages.content.features.playbackSpeedButtons.increaseLimit`
		: speed == 0.25 && buttonName == "decreasePlaybackSpeedButton" ? `pages.content.features.playbackSpeedButtons.decreaseLimit`
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		: `pages.content.features.playbackSpeedButtons.buttons.${buttonName as TooltipButtonName}.label`,
		{
			SPEED:
				speed == 4 || speed == 0.25 ? String(speed)
				: buttonName == "decreasePlaybackSpeedButton" ? String(speed - playbackSpeedPerClick)
				: String(speed + playbackSpeedPerClick)
		}
	);
	update();
}

function playbackSpeedButtonClickListener(amount: number): () => void {
	return () => {
		void (async () => {
			const videoElement = document.querySelector<HTMLVideoElement>("video");
			if (!videoElement) return;
			try {
				const { playbackRate: playbackRate } = videoElement;
				currentPlaybackSpeed = playbackRate;
				if (currentPlaybackSpeed + amount <= 0) return;
				if (currentPlaybackSpeed + amount > 4) return;
				const playerContainer =
					isWatchPage() ? document.querySelector<YouTubePlayerDiv>("div#movie_player")
					: isShortsPage() ? document.querySelector<YouTubePlayerDiv>("div#shorts-player")
					: null;
				if (!playerContainer) return;
				const {
					data: {
						options: { osd_display_color, osd_display_hide_time, osd_display_opacity, osd_display_padding, osd_display_position }
					}
				} = await waitForSpecificMessage("options", "request_data", "content");
				new OnScreenDisplayManager(
					{
						displayColor: osd_display_color,
						displayHideTime: osd_display_hide_time,
						displayOpacity: osd_display_opacity,
						displayPadding: osd_display_padding,
						displayPosition: osd_display_position,
						displayType: "text", // TODO: support for line/round? currently buggy
						playerContainer
					},
					"yte-osd",
					{ max: 4, type: "speed", value: currentPlaybackSpeed + amount }
				);
				const speed = currentPlaybackSpeed + amount;
				await setPlayerSpeed(speed);
				await updateTooltip("increasePlaybackSpeedButton", speed);
				await updateTooltip("decreasePlaybackSpeedButton", speed);
			} catch (error) {
				console.error(error);
			}
		})();
	};
}

export const addIncreasePlaybackSpeedButton: AddButtonFunction = async () => {
	const {
		data: {
			options: {
				button_placements: { increasePlaybackSpeedButton: increasePlaybackSpeedButtonPlacement },
				enable_playback_speed_buttons,
				playback_buttons_speed: playbackSpeedPerClick
			}
		}
	} = await waitForSpecificMessage("options", "request_data", "content");
	if (!enable_playback_speed_buttons) return;
	await addFeatureButton(
		"increasePlaybackSpeedButton",
		increasePlaybackSpeedButtonPlacement,
		window.i18nextInstance.t("pages.content.features.playbackSpeedButtons.buttons.increasePlaybackSpeedButton.label", {
			SPEED: currentPlaybackSpeed + playbackSpeedPerClick
		}),
		getFeatureIcon("increasePlaybackSpeedButton", increasePlaybackSpeedButtonPlacement !== "feature_menu" ? "shared_icon_position" : "feature_menu"),
		playbackSpeedButtonClickListener(playbackSpeedPerClick),
		false
	);
};

export const addDecreasePlaybackSpeedButton: AddButtonFunction = async () => {
	const {
		data: {
			options: {
				button_placements: { decreasePlaybackSpeedButton: decreasePlaybackSpeedButtonPlacement },
				enable_playback_speed_buttons,
				playback_buttons_speed: playbackSpeedPerClick
			}
		}
	} = await waitForSpecificMessage("options", "request_data", "content");
	if (!enable_playback_speed_buttons) return;
	await addFeatureButton(
		"decreasePlaybackSpeedButton",
		decreasePlaybackSpeedButtonPlacement,
		window.i18nextInstance.t("pages.content.features.playbackSpeedButtons.buttons.decreasePlaybackSpeedButton.label", {
			SPEED: currentPlaybackSpeed - playbackSpeedPerClick
		}),
		getFeatureIcon("decreasePlaybackSpeedButton", decreasePlaybackSpeedButtonPlacement !== "feature_menu" ? "shared_icon_position" : "feature_menu"),
		playbackSpeedButtonClickListener(-playbackSpeedPerClick),
		false
	);
};

export const removeDecreasePlaybackSpeedButton: RemoveButtonFunction = async (placement) => {
	await removeFeatureButton("decreasePlaybackSpeedButton", placement);
	eventManager.removeEventListeners("playbackSpeedButtons");
};
export const removeIncreasePlaybackSpeedButton: RemoveButtonFunction = async (placement) => {
	await removeFeatureButton("increasePlaybackSpeedButton", placement);
	eventManager.removeEventListeners("playbackSpeedButtons");
};
