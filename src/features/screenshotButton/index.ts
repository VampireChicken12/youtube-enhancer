import type { ButtonPlacement } from "@/src/types";

import { addFeatureButton, removeFeatureButton } from "@/src/features/buttonPlacement";
import { getFeatureButton } from "@/src/features/buttonPlacement/utils";
import { getFeatureIcon } from "@/src/icons";
import eventManager from "@/src/utils/EventManager";
import { createTooltip, waitForSpecificMessage } from "@/src/utils/utilities";

async function takeScreenshot(videoElement: HTMLVideoElement) {
	try {
		// Create a canvas element and get its context
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");

		// Set the dimensions of the canvas to the video's dimensions
		const { videoHeight, videoWidth } = videoElement;
		canvas.width = videoWidth;
		canvas.height = videoHeight;

		// Draw the video element onto the canvas
		if (!context) return;
		context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

		// Wait for the options message and get the format from it
		const optionsData = await waitForSpecificMessage("options", "request_data", "content");
		if (!optionsData) return;
		const {
			data: { options }
		} = optionsData;
		if (!options) return;
		const { screenshot_format, screenshot_save_as } = options;
		const format = `image/${screenshot_format}`;

		// Get the data URL of the canvas and create a blob from it
		const dataUrl = canvas.toDataURL(format);
		const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
		if (!blob) return;

		switch (screenshot_save_as) {
			case "clipboard": {
				const screenshotButton = getFeatureButton("screenshotButton");
				if (!screenshotButton) return;
				const { listener, remove } = createTooltip({
					direction: "up",
					element: screenshotButton,
					featureName: "screenshotButton",
					id: "yte-feature-screenshotButton-tooltip",
					text: window.i18nextInstance.t("pages.content.features.screenshotButton.copiedToClipboard")
				});
				listener();
				const clipboardImage = new ClipboardItem({ "image/png": blob });
				void navigator.clipboard.write([clipboardImage]);
				void navigator.clipboard.writeText(dataUrl);
				setTimeout(() => {
					remove();
				}, 1200);
				break;
			}
			case "file": {
				const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = `Screenshot-${location.href.match(/[\?|\&]v=([^&]+)/)?.[1]}-${timestamp}.${screenshot_format}`;
				a.click();
				break;
			}
		}
	} catch (error) {}
}

export async function addScreenshotButton(): Promise<void> {
	// Wait for the "options" message from the content script
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	if (!optionsData) return;
	const {
		data: {
			options: {
				button_placements: { screenshotButton: screenshotButtonPlacement },
				enable_screenshot_button: enableScreenshotButton
			}
		}
	} = optionsData;

	// If the screenshot button option is disabled, return
	if (!enableScreenshotButton) return;
	// Add a click event listener to the screenshot button
	function screenshotButtonClickListener() {
		void (async () => {
			// Get the video element
			const videoElement = document.querySelector<HTMLVideoElement>("video");
			// If video element is not available, return
			if (!videoElement) return;
			try {
				// Take a screenshot
				await takeScreenshot(videoElement);
			} catch (error) {
				console.error(error);
			}
		})();
	}
	await addFeatureButton(
		"screenshotButton",
		screenshotButtonPlacement,
		window.i18nextInstance.t("pages.content.features.screenshotButton.label"),
		getFeatureIcon("screenshotButton", screenshotButtonPlacement !== "feature_menu" ? "shared_icon_position" : "feature_menu"),
		screenshotButtonClickListener,
		false
	);
}
export function removeScreenshotButton(placement?: ButtonPlacement) {
	void removeFeatureButton("screenshotButton", placement);
	eventManager.removeEventListeners("screenshotButton");
}
