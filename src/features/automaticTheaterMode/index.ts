import type { YouTubePlayerDiv } from "@/src/types";

import { isWatchPage, waitForSpecificMessage } from "@/src/utils/utilities";

export async function automaticTheaterMode() {
	// Wait for the "options" message from the content script
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	if (!optionsData) return;
	const {
		data: { options }
	} = optionsData;
	// Extract the necessary properties from the options object
	const { enable_automatic_theater_mode } = options;
	// If automatic theater mode isn't enabled return
	if (!enable_automatic_theater_mode) return;
	if (!isWatchPage()) return;
	// Get the player element
	const playerContainer = isWatchPage() ? (document.querySelector("div#movie_player") as YouTubePlayerDiv | null) : null;
	// If player element is not available, return
	if (!playerContainer) return;
	const { width } = await playerContainer.getSize();
	const {
		body: { clientWidth }
	} = document;
	const isTheaterMode = width === clientWidth;
	// Get the size button
	const sizeButton = document.querySelector("button.ytp-size-button") as HTMLButtonElement | null;
	// If the size button is not available return
	if (!sizeButton) return;
	if (!isTheaterMode) {
		sizeButton.click();
	}
}
