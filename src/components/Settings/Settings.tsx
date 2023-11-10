import "@/assets/styles/tailwind.css";
import "@/components/Settings/Settings.css";

import { useNotifications } from "@/hooks";
import type { configuration, configurationKeys } from "@/src/types";
import { youtubePlayerSpeedRate } from "@/src/types";
import React, { useEffect, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { cn, settingsAreDefault } from "@/src/utils/utilities";
import { configurationImportSchema } from "@/src/utils/constants";
import { generateErrorMessage } from "zod-error";
import { formatDateForFileName } from "../../utils/utilities";
import SettingsNotifications from "./components/SettingNotifications";
import SettingSection from "./components/SettingSection";
import SettingTitle from "./components/SettingTitle";
import Setting from "./components/Setting";
import type { SelectOption } from "../Inputs";

export default function Settings({
	settings,
	setSettings,
	selectedColor,
	setSelectedColor,
	selectedDisplayType,
	setSelectedDisplayType,
	selectedDisplayPosition,
	setSelectedDisplayPosition,
	selectedScreenshotFormat,
	setSelectedScreenshotFormat,
	selectedScreenshotSaveAs,
	setSelectedScreenshotSaveAs,
	selectedPlayerQuality,
	setSelectedPlayerQuality,
	selectedPlayerSpeed,
	setSelectedPlayerSpeed,
	defaultSettings
}: {
	settings: configuration | undefined;
	setSettings: Dispatch<SetStateAction<configuration | undefined>>;
	selectedColor: string | undefined;
	setSelectedColor: Dispatch<SetStateAction<string | undefined>>;
	selectedDisplayType: string | undefined;
	setSelectedDisplayType: Dispatch<SetStateAction<string | undefined>>;
	selectedDisplayPosition: string | undefined;
	setSelectedDisplayPosition: Dispatch<SetStateAction<string | undefined>>;
	selectedPlayerQuality: string | undefined;
	setSelectedPlayerQuality: Dispatch<SetStateAction<string | undefined>>;
	selectedPlayerSpeed: string | undefined;
	setSelectedPlayerSpeed: Dispatch<SetStateAction<string | undefined>>;
	selectedScreenshotSaveAs: string | undefined;
	setSelectedScreenshotSaveAs: Dispatch<SetStateAction<string | undefined>>;
	selectedScreenshotFormat: string | undefined;
	setSelectedScreenshotFormat: Dispatch<SetStateAction<string | undefined>>;
	defaultSettings: configuration;
}) {
	const [firstLoad, setFirstLoad] = useState(true);
	const { notifications, addNotification, removeNotification } = useNotifications();
	const setCheckboxOption =
		(key: configurationKeys) =>
		({ currentTarget: { checked } }: ChangeEvent<HTMLInputElement>) => {
			setFirstLoad(false);
			setSettings((options) => (options ? { ...options, [key]: checked } : undefined));
		};

	const setValueOption =
		(key: configurationKeys) =>
		({ currentTarget: { value } }: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setFirstLoad(false);
			setSettings((state) => (state ? { ...state, [key]: value } : undefined));
		};

	useEffect(() => {
		if (!firstLoad && settings && !settingsAreDefault(defaultSettings, settings)) {
			saveOptions();
		}
	}, [settings]);
	function saveOptions() {
		if (settings) {
			if (settings.enable_automatically_set_quality && !settings.player_quality) {
				addNotification("error", "You must select a player quality if you want to enable the automatic quality feature.");
				return;
			}
			Object.assign(localStorage, settings);
			chrome.storage.local.set(settings);

			addNotification("success", "Options saved");
		}
	}

	function resetOptions() {
		addNotification(
			"info",
			'All options have been reset to their default values.\nYou can now save the changes by clicking the "Confirm" button or discard them by closing this page or ignore this notification.',
			"reset_settings"
		);
	}

	function clearData() {
		const userHasConfirmed = window.confirm("This will delete all extension data related to options. Continue?");
		if (userHasConfirmed) {
			Object.assign(localStorage, defaultSettings);
			chrome.storage.local.set(defaultSettings);
			addNotification("success", "All data has been deleted");
		}
	}
	const colorOptions: SelectOption[] = [
		{
			value: "red",
			label: "Red",
			element: <div className={cn("m-2 h-2 w-2 rounded-[50%]", "bg-[red]")}></div>
		},
		{
			value: "green",
			label: "Green",
			element: <div className={cn("m-2 h-2 w-2 rounded-[50%]", "bg-[green]")}></div>
		},
		{
			value: "blue",
			label: "Blue",
			element: <div className={cn("m-2 h-2 w-2 rounded-[50%]", "bg-[blue]")}></div>
		},
		{
			value: "yellow",
			label: "Yellow",
			element: <div className={cn("m-2 h-2 w-2 rounded-[50%]", "bg-[yellow]")}></div>
		},
		{
			value: "orange",
			label: "Orange",
			element: <div className={cn("m-2 h-2 w-2 rounded-[50%]", "bg-[orange]")}></div>
		},
		{
			value: "purple",
			label: "Purple",
			element: <div className={cn("m-2 h-2 w-2 rounded-[50%]", "bg-[purple]")}></div>
		},
		{
			value: "pink",
			label: "Pink",
			element: <div className={cn("m-2 h-2 w-2 rounded-[50%]", "bg-[pink]")}></div>
		},
		{
			value: "white",
			label: "White",
			element: <div className={cn("m-2 h-2 w-2 rounded-[50%]", "bg-[white]")}></div>
		}
	];
	const OSD_DisplayTypeOptions: SelectOption[] = [
		{
			value: "no_display",
			label: "No display"
		},
		{
			value: "text",
			label: "Text"
		},
		{
			value: "line",
			label: "Line"
		},
		{
			value: "round",
			label: "Round"
		}
	];
	const OSD_PositionOptions: SelectOption[] = [
		{
			value: "top_left",
			label: "Top left"
		},
		{
			value: "top_right",
			label: "Top right"
		},
		{
			value: "bottom_left",
			label: "Bottom left"
		},
		{
			value: "bottom_right",
			label: "Bottom right"
		},
		{
			value: "center",
			label: "Center"
		}
	];
	const YouTubePlayerQualityOptions: SelectOption[] = [
		{ label: "144p", value: "tiny" },
		{ label: "240p", value: "small" },
		{ label: "360p", value: "medium" },
		{ label: "480p", value: "large" },
		{ label: "720p", value: "hd720" },
		{ label: "1080p", value: "hd1080" },
		{ label: "1440p", value: "hd1440" },
		{ label: "2160p", value: "hd2160" },
		{ label: "2880p", value: "hd2880" },
		{ label: "4320p", value: "highres" },
		{ label: "auto", value: "auto" }
	].reverse();
	const YouTubePlayerSpeedOptions: SelectOption[] = youtubePlayerSpeedRate.map((rate) => ({ label: rate.toString(), value: rate.toString() }));
	const ScreenshotFormatOptions: SelectOption[] = [
		{ label: "PNG", value: "png" },
		{ label: "JPEG", value: "jpeg" },
		{ label: "WEBP", value: "webp" }
	];
	const ScreenshotSaveAsOptions: SelectOption[] = [
		{ label: "File", value: "file" },
		{ label: "Clipboard", value: "clipboard" }
	];
	// Import settings from a JSON file.
	const importSettings = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";

		input.addEventListener("change", async (event) => {
			const { target } = event;
			if (!target) return;
			const { files } = target as HTMLInputElement;
			const file = files?.[0];
			if (file) {
				try {
					const fileContents = await file.text();
					const importedSettings = JSON.parse(fileContents);
					// Validate the imported settings.
					const result = configurationImportSchema.safeParse(importedSettings);
					if (!result.success) {
						const { error } = result;
						const errorMessage = generateErrorMessage(error.errors);
						window.alert(`Error importing settings. Please check the file format.\n${errorMessage}`);
					} else {
						const castSettings = importedSettings as configuration;
						// Set the imported settings in your state.
						setSettings({ ...castSettings });
						Object.assign(localStorage, castSettings);
						chrome.storage.local.set(castSettings);
						// Show a success notification.
						addNotification("success", "Settings imported successfully");
					}
				} catch (error) {
					// Handle any import errors.
					window.alert("Error importing settings. Please check the file format.");
				}
			}
		});

		// Trigger the file input dialog.
		input.click();
	};

	// Export settings to a JSON file.
	const exportSettings = () => {
		if (settings) {
			const timestamp = formatDateForFileName(new Date());
			const filename = `youtube_enhancer_settings_${timestamp}.json`;
			const settingsJSON = JSON.stringify(settings);

			const blob = new Blob([settingsJSON], { type: "application/json" });
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			a.click();

			// Show a success notification.
			addNotification("success", "Settings exported successfully");
		}
	};
	// TODO: add "default player mode" setting (theater, fullscreen, etc.) feature
	return (
		settings && (
			<div className="w-fit h-fit bg-[#f5f5f5] text-black dark:bg-[#181a1b] dark:text-white">
				<h1 className="flex gap-3 items-center content-center font-bold text-xl sm:text-2xl md:text-3xl">
					<img src="/icons/icon_128.png" className="h-16 w-16 sm:h-16 sm:w-16" />
					YouTube Enhancer
					<small className="light text-xs sm:text-sm md:text-base">v{chrome.runtime.getManifest().version}</small>
				</h1>
				<SettingSection>
					<SettingTitle title={"Import/Export Settings"} />
					<div className="flex gap-1 p-2">
						<input
							type="button"
							id="import_settings_button"
							className="p-2 accent dark:hover:bg-[rgba(24,26,27,0.5)] text-sm sm:text-base md:text-lg"
							value="Import Settings"
							title="Import settings from a JSON file"
							onClick={importSettings}
						/>
						<input
							type="button"
							id="export_settings_button"
							className="p-2 accent dark:hover:bg-[rgba(24,26,27,0.5)] text-sm sm:text-base md:text-lg"
							value="Export Settings"
							title="Export current settings to a JSON file"
							onClick={exportSettings}
							style={{ marginLeft: "auto" }}
						/>
					</div>
				</SettingSection>
				<SettingSection>
					<SettingTitle title={"Miscellaneous settings"} />
					<Setting
						type="checkbox"
						id="enable_remember_last_volume"
						title="Remembers the volume you were watching at and sets it as the volume when you open a new video"
						label="Remember last volume"
						checked={settings.enable_remember_last_volume?.toString() === "true"}
						onChange={setCheckboxOption("enable_remember_last_volume")}
					/>
					<Setting
						type="checkbox"
						title="Fills the video to the window size"
						id="enable_maximize_player_button"
						label="Enable maximize player button"
						checked={settings.enable_maximize_player_button?.toString() === "true"}
						onChange={setCheckboxOption("enable_maximize_player_button")}
					/>
					<Setting
						type="checkbox"
						id="enable_video_history"
						title="Keeps track of where you left off on videos you were watching and asks if you want to resume when that video loads again"
						label="Enable video history"
						checked={settings.enable_video_history?.toString() === "true"}
						onChange={setCheckboxOption("enable_video_history")}
					/>
					<Setting
						type="checkbox"
						id="enable_remaining_time"
						title="Shows the remaining time of the video you're watching"
						label="Enable remaining time"
						checked={settings.enable_remaining_time?.toString() === "true"}
						onChange={setCheckboxOption("enable_remaining_time")}
					/>
					<Setting
						type="checkbox"
						id="enable_loop_button"
						title="Adds a button to the player to loop the video you're watching"
						label="Enable loop button"
						checked={settings.enable_loop_button?.toString() === "true"}
						onChange={setCheckboxOption("enable_loop_button")}
					/>
					<Setting
						type="checkbox"
						id="enable_hide_scrollbar"
						title="Hides the pages scrollbar"
						label="Enable hide scrollbar"
						checked={settings.enable_hide_scrollbar?.toString() === "true"}
						onChange={setCheckboxOption("enable_hide_scrollbar")}
					/>
				</SettingSection>
				<SettingSection>
					<SettingTitle title={"Scroll wheel volume control settings"} />
					<Setting
						type="checkbox"
						id="enable_scroll_wheel_volume_control"
						title="Lets you use the scroll wheel to control the volume of the video you're watching"
						label="Enable scroll wheel volume control"
						checked={settings.enable_scroll_wheel_volume_control?.toString() === "true"}
						onChange={setCheckboxOption("enable_scroll_wheel_volume_control")}
					/>
					<Setting
						type="select"
						title="The color of the On Screen Display"
						label="OSD color"
						id="osd_color_select"
						onChange={setValueOption("osd_display_color")}
						options={colorOptions}
						selectedOption={selectedColor}
						setSelectedOption={setSelectedColor}
						disabled={settings.enable_scroll_wheel_volume_control.toString() !== "true"}
					/>
					<Setting
						type="select"
						title="The type of On Screen Display"
						label="OSD type"
						id="osd_display_type"
						onChange={setValueOption("osd_display_type")}
						options={OSD_DisplayTypeOptions}
						selectedOption={selectedDisplayType}
						setSelectedOption={setSelectedDisplayType}
						disabled={settings.enable_scroll_wheel_volume_control.toString() !== "true"}
					/>
					<Setting
						type="select"
						title="The position of the On Screen Display"
						label="OSD position"
						id="osd_display_position"
						onChange={setValueOption("osd_display_position")}
						options={OSD_PositionOptions}
						selectedOption={selectedDisplayPosition}
						setSelectedOption={setSelectedDisplayPosition}
						disabled={settings.enable_scroll_wheel_volume_control.toString() !== "true"}
					/>
					<Setting
						type="number"
						label="OSD opacity"
						title="The opacity of the On Screen Display"
						id="osd_display_opacity"
						min={1}
						max={100}
						value={settings.osd_display_opacity}
						onChange={setValueOption("osd_display_opacity")}
						disabled={settings.enable_scroll_wheel_volume_control.toString() !== "true"}
					/>
					<Setting
						type="number"
						title="The amount to adjust volume per scroll"
						label="Amount to adjust"
						id="volume_adjustment_steps"
						min={1}
						value={settings.volume_adjustment_steps}
						onChange={setValueOption("volume_adjustment_steps")}
						disabled={settings.enable_scroll_wheel_volume_control.toString() !== "true"}
					/>
					<Setting
						type="number"
						title="The amount of milliseconds to wait before hiding the OSD"
						label="Time to hide"
						id="osd_display_hide_time"
						min={1}
						value={settings.osd_display_hide_time}
						onChange={setValueOption("osd_display_hide_time")}
						disabled={settings.enable_scroll_wheel_volume_control.toString() !== "true"}
					/>
					<Setting
						type="number"
						label="Padding"
						title="The amount of padding to add to the OSD (in pixels, only applies to corner OSD)"
						id="osd_display_padding"
						min={0}
						value={settings.osd_display_padding}
						onChange={setValueOption("osd_display_padding")}
						disabled={settings.enable_scroll_wheel_volume_control.toString() !== "true"}
					/>
				</SettingSection>
				<SettingSection>
					<SettingTitle title={"Automatic quality settings"} />
					<Setting
						type="checkbox"
						id="enable_automatically_set_quality"
						title="Automatically sets the quality of the video to the quality you choose below"
						label="Enable auto set quality"
						checked={settings.enable_automatically_set_quality?.toString() === "true"}
						onChange={setCheckboxOption("enable_automatically_set_quality")}
					/>
					<Setting
						type="select"
						label="Player quality"
						title="The quality to set the video to"
						id="player_quality"
						onChange={setValueOption("player_quality")}
						options={YouTubePlayerQualityOptions}
						selectedOption={selectedPlayerQuality}
						setSelectedOption={setSelectedPlayerQuality}
						disabled={settings.enable_automatically_set_quality.toString() !== "true"}
					/>
				</SettingSection>
				<SettingSection>
					<SettingTitle title={"Playback speed settings"} />
					<Setting
						type="checkbox"
						id="enable_forced_playback_speed"
						title="Forces the video to play at the speed you choose below"
						label="Enable forced playback speed"
						checked={settings.enable_forced_playback_speed?.toString() === "true"}
						onChange={setCheckboxOption("enable_forced_playback_speed")}
					/>
					<Setting
						type="select"
						id="player_speed"
						onChange={setValueOption("player_speed")}
						options={YouTubePlayerSpeedOptions}
						selectedOption={selectedPlayerSpeed?.toString()}
						setSelectedOption={setSelectedPlayerSpeed}
						title="The speed to set the video to"
						label="Player speed"
						disabled={settings.enable_forced_playback_speed.toString() !== "true"}
					/>
				</SettingSection>
				<SettingSection>
					<SettingTitle title={"Volume boost settings"} />
					<Setting
						type="checkbox"
						id="enable_volume_boost"
						title="Boosts the volume of the video you're watching"
						label="Enable volume boost"
						checked={settings.enable_volume_boost?.toString() === "true"}
						onChange={setCheckboxOption("enable_volume_boost")}
					/>
					<Setting
						type="number"
						title="The amount to boost the volume by"
						label="Volume boost amount (dB)"
						id="volume_boost_amount"
						min={1}
						max={100}
						value={settings.volume_boost_amount}
						onChange={setValueOption("volume_boost_amount")}
						disabled={settings.enable_volume_boost.toString() !== "true"}
					/>
				</SettingSection>
				<SettingSection>
					<SettingTitle title={"Screenshot settings"} />
					<Setting
						type="checkbox"
						id="enable_screenshot_button"
						title="Adds a button to the player to take a screenshot of the video"
						label="Enable screenshot button"
						checked={settings.enable_screenshot_button?.toString() === "true"}
						onChange={setCheckboxOption("enable_screenshot_button")}
					/>
					<Setting
						type="select"
						id="screenshot_save_as"
						onChange={setValueOption("screenshot_save_as")}
						options={ScreenshotSaveAsOptions}
						selectedOption={selectedScreenshotSaveAs}
						setSelectedOption={setSelectedScreenshotSaveAs}
						label="Screenshot save type"
						title="The screenshot save type"
						disabled={settings.enable_screenshot_button.toString() !== "true"}
					/>
					<Setting
						type="select"
						id="screenshot_format"
						onChange={setValueOption("screenshot_format")}
						options={ScreenshotFormatOptions}
						selectedOption={selectedScreenshotFormat}
						setSelectedOption={setSelectedScreenshotFormat}
						label="Screenshot format"
						title="The format to save the screenshot in"
						disabled={settings.enable_screenshot_button.toString() !== "true"}
					/>
				</SettingSection>
				<div className="flex gap-1 sticky left-0 bottom-0 p-2 bg-[#f5f5f5] dark:bg-[#181a1b]">
					<input
						type="button"
						id="clear_data_button"
						className="p-2 danger dark:hover:bg-[rgba(24,26,27,0.5)] text-sm sm:text-base md:text-lg"
						value="Clear Data"
						title="Clears all data this extension has stored on your machine"
						onClick={clearData}
					/>
					{notifications.filter((n) => n.action === "reset_settings").length > 0 ? (
						<input
							type="button"
							id="confirm_button"
							className="p-2 danger dark:hover:bg-[rgba(24,26,27,0.5)] text-sm sm:text-base md:text-lg"
							style={{ marginLeft: "auto" }}
							value="Confirm"
							title="Confirm setting reset"
							onClick={() => {
								const notificationToRemove = notifications.find((n) => n.action === "reset_settings");
								if (notificationToRemove) {
									removeNotification(notificationToRemove);
								}
								Object.assign(localStorage, Object.assign(defaultSettings, { remembered_volumes: settings.remembered_volumes }));
								chrome.storage.local.set(Object.assign(defaultSettings, { remembered_volumes: settings.remembered_volumes }));

								addNotification("success", "Options saved");
							}}
						/>
					) : (
						<input
							type="button"
							id="reset_button"
							className="p-2 warning dark:hover:bg-[rgba(24,26,27,0.5)] text-sm sm:text-base md:text-lg"
							style={{ marginLeft: "auto" }}
							value="Reset"
							title="Resets all settings to their defaults, Click the confirm button to save the changes"
							onClick={resetOptions}
						/>
					)}
				</div>
				<SettingsNotifications />
			</div>
		)
	);
}
