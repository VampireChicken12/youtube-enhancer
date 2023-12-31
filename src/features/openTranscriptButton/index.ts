import eventManager from "@/src/utils/EventManager";
import { createSVGElement, waitForAllElements, waitForSpecificMessage } from "@/src/utils/utilities";

import { addFeatureItemToMenu, getFeatureMenuItem, removeFeatureItemFromMenu } from "../featureMenu/utils";

export async function openTranscriptButton() {
	// Wait for the "options" message from the content script
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	if (!optionsData) return;
	const {
		data: { options }
	} = optionsData;
	// Extract the necessary properties from the options object
	const { enable_open_transcript_button: enableOpenTranscriptButton } = options;
	// If the open transcript button option is disabled, return
	if (!enableOpenTranscriptButton) return;
	await waitForAllElements(["ytd-video-description-transcript-section-renderer button"]);
	const transcriptButton = document.querySelector("ytd-video-description-transcript-section-renderer button");
	const transcriptButtonMenuItem = getFeatureMenuItem("openTranscriptButton");
	// If the transcript button is not found and the "openTranscriptButton" menu item exists, remove the transcript button menu item
	if (!transcriptButton && transcriptButtonMenuItem) removeFeatureItemFromMenu("openTranscriptButton");
	// If the transcript button isn't found return
	if (!transcriptButton) return;
	// If the transcript button is found and the "openTranscriptButton" menu item does not exist, add the transcript button menu item
	void addTranscriptButton();
}
async function addTranscriptButton() {
	const transcriptSvgIcon = makeTranscriptSvgIcon();
	function transcriptButtonClickerListener() {
		const transcriptButton = document.querySelector<HTMLButtonElement>("ytd-video-description-transcript-section-renderer button");
		if (!transcriptButton) return;
		transcriptButton.click();
	}
	await addFeatureItemToMenu({
		featureName: "openTranscriptButton",
		icon: transcriptSvgIcon,
		label: window.i18nextInstance.t("pages.content.features.openTranscriptButton.label"),
		listener: transcriptButtonClickerListener
	});
}
export function removeTranscriptButton() {
	removeFeatureItemFromMenu("openTranscriptButton");
	eventManager.removeEventListeners("openTranscriptButton");
}
function makeTranscriptSvgIcon() {
	const transcriptSVG = createSVGElement(
		"svg",
		{
			height: "24px",
			stroke: "currentColor",
			"stroke-width": "0",
			viewBox: "0 0 24 24",
			width: "24px"
		},
		createSVGElement("path", {
			d: "M5 16C5 15.4477 5.44772 15 6 15H14C14.5523 15 15 15.4477 15 16C15 16.5523 14.5523 17 14 17H6C5.44772 17 5 16.5523 5 16Z",
			fill: "currentColor"
		}),
		createSVGElement("path", {
			d: "M18 11C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H10C9.44772 13 9 12.5523 9 12C9 11.4477 9.44772 11 10 11H18Z",
			fill: "currentColor"
		}),
		createSVGElement("path", {
			d: "M16 16C16 15.4477 16.4477 15 17 15H18C18.5523 15 19 15.4477 19 16C19 16.5523 18.5523 17 18 17H17C16.4477 17 16 16.5523 16 16Z",
			fill: "currentColor"
		}),
		createSVGElement("path", {
			d: "M7 11C7.55228 11 8 11.4477 8 12C8 12.5523 7.55228 13 7 13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H7Z",
			fill: "currentColor"
		}),
		createSVGElement("path", {
			"clip-rule": "evenodd",
			d: "M4 3C2.34315 3 1 4.34315 1 6V18C1 19.6569 2.34315 21 4 21H20C21.6569 21 23 19.6569 23 18V6C23 4.34315 21.6569 3 20 3H4ZM20 5H4C3.44772 5 3 5.44772 3 6V18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V6C21 5.44771 20.5523 5 20 5Z",
			fill: "currentColor",
			"fill-rule": "evenodd"
		})
	);
	return transcriptSVG;
}
