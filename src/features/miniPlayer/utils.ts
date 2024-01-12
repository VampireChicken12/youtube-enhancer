import { modifyElementsClassList } from "@/src/utils/utilities";

import "./index.css";
const elementPairs = [
	{
		className: "yte-mini-player",
		selector: "div#movie_player"
	},
	{
		className: "yte-mini-player-video",
		selector: "video.html5-main-video"
	}
];
export function enableMiniPlayer() {
	modifyElementsClassList("add", elementPairs);
	// TODO: handle resize, drag
}
// TODO: scroll down open mini player and scroll up close mini player
export function disableMiniPlayer() {
	modifyElementsClassList("remove", elementPairs);
}
