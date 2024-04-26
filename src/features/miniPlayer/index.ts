import { addFeatureButton, removeFeatureButton } from "@/src/features/buttonPlacement";
import { getFeatureIcon } from "@/src/icons";
import eventManager from "@/src/utils/EventManager";
import { waitForSpecificMessage } from "@/src/utils/utilities";

import type { AddButtonFunction, RemoveButtonFunction } from "../index";

import { disableMiniPlayer, enableMiniPlayer } from "./utils";
export const addMiniPlayerButton: AddButtonFunction = async () => {
	// Wait for the "options" message from the content script
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	if (!optionsData) return;
	const {
		data: {
			options: {
				button_placements: { miniPlayer: miniPlayerButtonPlacement },
				enable_mini_player_button
			}
		}
	} = optionsData;
	// If the loop button option is disabled, return
	if (!enable_mini_player_button) return;

	await addFeatureButton(
		"miniPlayer",
		miniPlayerButtonPlacement,
		miniPlayerButtonPlacement === "feature_menu" ?
			window.i18nextInstance.t("pages.content.features.miniPlayer.button.label")
		:	window.i18nextInstance.t("pages.content.features.miniPlayer.button.toggle.off"),
		getFeatureIcon("miniPlayer", miniPlayerButtonPlacement !== "feature_menu" ? "shared_icon_position" : "feature_menu"),
		(checked) => {
			if (checked === undefined) return;
			if (checked) enableMiniPlayer();
			else disableMiniPlayer();
		},
		true
	);
};
export const removeMiniPlayerButton: RemoveButtonFunction = async () => {
	await removeFeatureButton("miniPlayer");
	eventManager.removeEventListeners("miniPlayer");
};
