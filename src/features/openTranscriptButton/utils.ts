import type { AddButtonFunction, RemoveButtonFunction } from "@/src/features";

import { addFeatureButton, removeFeatureButton } from "@/src/features/buttonPlacement";
import { getFeatureIcon } from "@/src/icons";
import eventManager from "@/src/utils/EventManager";
import { waitForSpecificMessage } from "@/src/utils/utilities";

export const addOpenTranscriptButton: AddButtonFunction = async () => {
	// Wait for the "options" message from the content script
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	const {
		data: {
			options: {
				button_placements: { openTranscriptButton: openTranscriptButtonPlacement }
			}
		}
	} = optionsData;
	function transcriptButtonClickerListener() {
		const transcriptButton = document.querySelector<HTMLButtonElement>("ytd-video-description-transcript-section-renderer button");
		if (!transcriptButton) return;
		transcriptButton.click();
	}
	await addFeatureButton(
		"openTranscriptButton",
		openTranscriptButtonPlacement,
		window.i18nextInstance.t("pages.content.features.openTranscriptButton.label"),
		getFeatureIcon("openTranscriptButton", openTranscriptButtonPlacement !== "feature_menu" ? "shared_icon_position" : "feature_menu"),
		transcriptButtonClickerListener,
		false
	);
};
export const removeOpenTranscriptButton: RemoveButtonFunction = async (placement) => {
	await removeFeatureButton("openTranscriptButton", placement);
	eventManager.removeEventListeners("openTranscriptButton");
};
