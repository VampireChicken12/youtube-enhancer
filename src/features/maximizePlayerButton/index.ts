import type { ButtonPlacement } from "@/src/types";

import { getFeatureIcon } from "@/src/icons";
import eventManager from "@/src/utils/EventManager";
import { createTooltip, waitForSpecificMessage } from "@/src/utils/utilities";

import { addFeatureButton, removeFeatureButton } from "../buttonPlacement";
import { getFeatureButton, updateFeatureButtonTitle } from "../buttonPlacement/utils";
import "./index.css";
import { maximizePlayer, minimizePlayer } from "./utils";

export async function addMaximizePlayerButton(): Promise<void> {
	// Wait for the "options" message from the content script
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	if (!optionsData) return;
	const {
		data: {
			options: {
				button_placements: { maximizePlayerButton: maximizePlayerButtonPlacement },
				enable_maximize_player_button: enableMaximizePlayerButton
			}
		}
	} = optionsData;
	// If the maximize player button option is disabled, return
	if (!enableMaximizePlayerButton) return;
	await addFeatureButton(
		"maximizePlayerButton",
		maximizePlayerButtonPlacement,
		maximizePlayerButtonPlacement === "feature_menu" ?
			window.i18nextInstance.t("pages.content.features.maximizePlayerButton.label")
		:	window.i18nextInstance.t("pages.content.features.maximizePlayerButton.toggle.off"),
		getFeatureIcon("maximizePlayerButton", maximizePlayerButtonPlacement !== "feature_menu" ? "shared_icon_position" : "feature_menu"),
		(checked) => {
			if (checked === undefined) return;
			console.log(checked);
			const button = getFeatureButton("maximizePlayerButton");
			if (!button) return;
			const featureName = "maximizePlayerButton";
			const { remove } = createTooltip({
				direction: maximizePlayerButtonPlacement === "below_player" ? "down" : "up",
				element: button,
				featureName,
				id: `yte-feature-${featureName}-tooltip`
			});
			updateFeatureButtonTitle(
				"maximizePlayerButton",
				window.i18nextInstance.t(`pages.content.features.maximizePlayerButton.toggle.${checked ? "on" : "off"}`)
			);
			if (checked) {
				remove();
				maximizePlayer();
			} else {
				minimizePlayer();
			}
		},
		true
	);
}
export function removeMaximizePlayerButton(placement?: ButtonPlacement) {
	void removeFeatureButton("maximizePlayerButton", placement);
	eventManager.removeEventListeners("maximizePlayerButton");
}
