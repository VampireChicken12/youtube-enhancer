import type { VideoHistoryEntry, YouTubePlayerDiv } from "@/src/types";

import eventManager from "@/utils/EventManager";
import {
	browserColorLog,
	createStyledElement,
	createTooltip,
	isShortsPage,
	isWatchPage,
	sendContentMessage,
	waitForSpecificMessage
} from "@/utils/utilities";

import { formatTime } from "../remainingTime/utils";
export async function setupVideoHistory() {
	// Wait for the "options" message from the content script
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	if (!optionsData) return;
	const {
		data: { options }
	} = optionsData;
	const { enable_video_history: enableVideoHistory } = options;
	if (!enableVideoHistory) return;
	// Get the player container element
	const playerContainer = isWatchPage() ? (document.querySelector("div#movie_player") as YouTubePlayerDiv | null) : isShortsPage() ? null : null;
	// If player container is not available, return
	if (!playerContainer) return;
	const playerVideoData = await playerContainer.getVideoData();
	// If the video is live return
	if (playerVideoData.isLive) return;
	const { video_id: videoId } = await playerContainer.getVideoData();
	if (!videoId) return;
	const videoElement = playerContainer.querySelector("video.video-stream.html5-main-video") as HTMLVideoElement | null;
	if (!videoElement) return;

	const videoPlayerTimeUpdateListener = async () => {
		const currentTime = await playerContainer.getCurrentTime();
		const duration = await playerContainer.getDuration();
		sendContentMessage("videoHistoryOne", "send_data", {
			video_history_entry: {
				id: videoId,
				status: Math.ceil(duration) === Math.ceil(currentTime) ? "watched" : "watching",
				timestamp: currentTime
			}
		});
	};
	eventManager.addEventListener(videoElement, "timeupdate", videoPlayerTimeUpdateListener, "videoHistory");
}
export async function promptUserToResumeVideo() {
	// Wait for the "options" message from the content script
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	if (!optionsData) return;
	const {
		data: { options }
	} = optionsData;
	const { enable_video_history: enableVideoHistory } = options;
	if (!enableVideoHistory) return;

	// Get the player container element
	const playerContainer = isWatchPage() ? (document.querySelector("div#movie_player") as YouTubePlayerDiv | null) : isShortsPage() ? null : null;

	// If player container is not available, return
	if (!playerContainer) return;

	const { video_id: videoId } = await playerContainer.getVideoData();
	if (!videoId) return;
	const videoHistoryOneData = await waitForSpecificMessage("videoHistoryOne", "request_data", "content", { id: videoId });
	if (!videoHistoryOneData) return;
	const {
		data: { video_history_entry }
	} = videoHistoryOneData;
	if (video_history_entry && video_history_entry.status === "watching" && video_history_entry.timestamp > 0) {
		createResumePrompt(video_history_entry, playerContainer);
	}
}
// Utility function to check if an element exists
const elementExists = (elementId: string) => !!document.getElementById(elementId);
function createResumePrompt(videoHistoryEntry: VideoHistoryEntry, playerContainer: YouTubePlayerDiv) {
	const progressBarId = "resume-prompt-progress-bar";
	const overlayId = "resume-prompt-overlay";
	const closeButtonId = "resume-prompt-close-button";
	const resumeButtonId = "resume-prompt-button";
	const promptId = "resume-prompt";
	const progressBarDuration = 15;
	let countdownInterval: NodeJS.Timeout | undefined;

	const prompt = createStyledElement(promptId, "div", {
		backgroundColor: "#181a1b",
		borderRadius: "5px",
		bottom: "10px",
		boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
		left: "10px",
		padding: "12px",
		paddingBottom: "17px",
		position: "fixed",
		transition: "all 0.5s ease-in-out",
		zIndex: "25000"
	});
	const progressBar = createStyledElement(progressBarId, "div", {
		backgroundColor: "#007acc",
		borderBottomLeftRadius: "5px",
		borderBottomRightRadius: "5px",
		bottom: "0",
		height: "5px",
		left: "0",
		position: "absolute",
		transition: "all 0.5s ease-in-out",
		width: "100%",
		zIndex: "1000"
	});

	const overlay = createStyledElement(overlayId, "div", {
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		cursor: "pointer",
		height: "100%",
		left: "0",
		position: "fixed",
		top: "0",
		width: "100%",
		zIndex: "2500"
	});

	const closeButton = createStyledElement(closeButtonId, "button", {
		backgroundColor: "transparent",
		border: "0",
		color: "#fff",
		cursor: "pointer",
		fontSize: "16px",
		lineHeight: "1px",
		padding: "5px",
		position: "absolute",
		right: "-2px",
		top: "2px"
	});
	closeButton.textContent = "ₓ";

	const resumeButton = createStyledElement(resumeButtonId, "button", {
		backgroundColor: "hsl(213, 80%, 50%)",
		border: "transparent",
		borderRadius: "5px",
		boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
		color: "white",
		cursor: "pointer",
		padding: "5px",
		textAlign: "center",
		transition: "all 0.5s ease-in-out",
		verticalAlign: "middle"
	});
	resumeButton.textContent = window.i18nextInstance.t("pages.content.features.videoHistory.resumeButton");

	function startCountdown() {
		if (prompt) prompt.style.display = "block";
		if (overlay) overlay.style.display = "block";
		let countdown = progressBarDuration;
		countdownInterval = setInterval(() => {
			countdown--;
			progressBar.style.width = `${(countdown / progressBarDuration) * 100}%`;

			if (countdown <= 0) {
				hidePrompt();
			}
		}, 1000);
	}

	function hidePrompt() {
		clearInterval(countdownInterval);
		prompt.style.display = "none";
		overlay.style.display = "none";
	}

	function resumeButtonClickListener() {
		hidePrompt();
		browserColorLog(window.i18nextInstance.t("messages.resumingVideo", { VIDEO_TIME: formatTime(videoHistoryEntry.timestamp) }), "FgGreen");
		playerContainer.seekTo(videoHistoryEntry.timestamp, true);
	}

	if (!elementExists(progressBarId)) {
		prompt.appendChild(progressBar);
	}

	if (!elementExists(overlayId)) {
		document.body.appendChild(overlay);
	}

	if (!elementExists(closeButtonId)) {
		const { listener: resumePromptCloseButtonMouseOverListener } = createTooltip({
			element: closeButton,
			featureName: "videoHistory",
			id: "yte-resume-prompt-close-button-tooltip",
			text: window.i18nextInstance.t("pages.content.features.videoHistory.resumePrompt.close")
		});
		eventManager.addEventListener(closeButton, "mouseover", resumePromptCloseButtonMouseOverListener, "videoHistory");
		prompt.appendChild(closeButton);
	}

	startCountdown();

	if (elementExists(resumeButtonId)) {
		eventManager.removeEventListener(resumeButton, "click", "videoHistory");
	}

	const closeListener = () => {
		hidePrompt();
	};

	eventManager.addEventListener(resumeButton, "click", resumeButtonClickListener, "videoHistory");
	eventManager.addEventListener(overlay, "click", closeListener, "videoHistory");
	eventManager.addEventListener(closeButton, "click", closeListener, "videoHistory");

	// Display the prompt
	if (!elementExists(promptId)) {
		document.body.appendChild(prompt);
		prompt.appendChild(resumeButton);
	}
}
