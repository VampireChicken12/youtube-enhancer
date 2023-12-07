interface EnUS {
	langCode: "en-US";
	langName: "English (US)";
	pages: {
		content: {
			features: {
				videoHistory: { resumePrompt: { close: "Close" }; resumeButton: "Resume" };
				screenshotButton: { copiedToClipboard: "Screenshot copied to clipboard"; label: "Screenshot" };
				loopButton: { label: "Loop" };
				maximizePlayerButton: { label: "Maximize" };
				featureMenu: { label: "Feature menu" };
				volumeBoostButton: { label: "Volume Boost" };
			};
		};
		options: {
			notifications: {
				success: { saved: "Options saved." };
				info: {
					reset: 'All options have been reset to their default values.\nYou can now save the changes by clicking the "Confirm" button or discard them by closing this page or ignore this notification.';
				};
			};
		};
	};
	settings: {
		sections: {
			featureMenu: {
				openType: {
					title: "Feature menu settings";
					select: {
						label: "Menu Activation Type";
						title: "Select the method to activate the feature menu";
						options: { click: "Click"; hover: "Hover" };
					};
				};
			};
			importExportSettings: {
				importButton: {
					error: {
						validation: "Error importing settings. Please check the file format.\n{{ERROR_MESSAGE}}";
						unknown: "Error importing settings. Please check the file format.\nAn unknown error occurred.";
					};
					success: "Settings imported successfully";
					title: "Import settings from a JSON file";
					value: "Import Settings";
				};
				exportButton: {
					success: "Settings successfully exported";
					title: "Export settings to a JSON file";
					value: "Export Settings";
				};
			};
			miscellaneous: {
				title: "Miscellaneous settings";
				features: {
					rememberLastVolume: {
						title: "Remembers the volume of the last video you were watching and sets it when you open a new video";
						label: "Remember last volume";
					};
					maximizePlayerButton: { title: "Fills the video to the window size"; label: "Maximize player button" };
					videoHistory: {
						title: "Keeps track of where you left off on videos you were watching and asks if you want to resume when that video loads again";
						label: "Video history";
					};
					remainingTime: {
						title: "Shows the remaining time of the video you're watching";
						label: "Remaining time";
					};
					loopButton: {
						title: "Adds a button to the player to loop the video you're watching";
						label: "Loop button";
					};
					hideScrollbar: { title: "Hides the pages scrollbar"; label: "Hide scrollbar" };
					automaticTheaterMode: {
						title: "Automatically enables theater mode when you load a video";
						label: "Automatic theater mode";
					};
				};
			};
			scrollWheelVolumeControl: {
				title: "Scroll wheel volume control settings";
				enable: {
					title: "Lets you use the scroll wheel to control the volume of the video you're watching";
					label: "Scroll wheel volume control";
				};
				osdColor: { title: "Select the color for the On-Screen Display"; label: "OSD Color" };
				osdType: { title: "Select the style of On-Screen Display"; label: "OSD Type" };
				osdPosition: { title: "Select the position of the On-Screen Display"; label: "OSD Position" };
				osdOpacity: {
					title: "Adjust the transparency of the On-Screen Display";
					label: "OSD Opacity";
				};
				osdVolumeAdjustmentSteps: {
					title: "Adjust the volume change per scroll";
					label: "Volume Change Per Scroll";
				};
				osdHide: {
					title: "Specify the time, in milliseconds, before automatically hiding the OSD";
					label: "Hide Delay";
				};
				osdPadding: {
					title: "Adjust the spacing around the on-screen display (OSD) in pixels. This applies specifically to corner OSD.";
					label: "Padding";
				};
				onScreenDisplay: {
					colors: {
						red: "Red";
						green: "Green";
						blue: "Blue";
						yellow: "Yellow";
						orange: "Orange";
						purple: "Purple";
						pink: "Pink";
						white: "White";
					};
					position: {
						top_left: "Top Left";
						top_right: "Top Right";
						bottom_left: "Bottom Left";
						bottom_right: "Bottom Right";
						center: "Center";
					};
					type: { no_display: "No display"; text: "Text"; line: "Line"; round: "Round" };
				};
				holdModifierKey: {
					enable: {
						title: "Press a modifier key to enable volume adjustment with the scroll wheel.";
						label: "Enable when holding modifier key";
					};
					optionLabel: "{{KEY}} key";
					select: { label: "Modifier key"; title: "The modifier key to use" };
				};
				holdRightClick: {
					enable: {
						title: "Hold right click to enable scroll wheel volume control";
						label: "Enable when holding right click";
					};
				};
			};
			automaticQuality: {
				title: "Automatic quality settings";
				enable: {
					title: "Automatically adjusts the video quality to the selected level.";
					label: "Automatic quality adjustment";
				};
				select: { label: "Player quality"; title: "The quality to set the video to" };
			};
			playbackSpeed: {
				title: "Playback speed settings";
				enable: {
					title: "Sets the video speed to what you choose below";
					label: "Forced playback speed";
				};
				select: { label: "Player speed"; title: "The speed to set the video to" };
			};
			volumeBoost: {
				title: "Volume boost settings";
				enable: {
					title: "Boosts the volume of the video you're watching";
					label: "Volume boost";
				};
				number: { label: "Volume boost amount (dB)"; title: "The amount to boost the volume by" };
			};
			screenshotButton: {
				title: "Screenshot settings";
				enable: {
					title: "Adds a button to the player to take a screenshot of the video";
					label: "Screenshot button";
				};
				selectSaveAs: { label: "Screenshot save type"; title: "The screenshot save type" };
				selectFormat: { label: "Screenshot format"; title: "The format to save the screenshot in" };
				saveAs: { file: "File"; clipboard: "Clipboard" };
			};
			bottomButtons: {
				confirm: { title: "Confirm setting reset"; value: "Confirm" };
				clear: {
					title: "Clears all data this extension has stored on your machine";
					value: "Clear Data";
				};
				reset: {
					title: "Resets all settings to their defaults, Click the confirm button to save the changes";
					value: "Reset";
				};
			};
			language: {
				title: "Language";
				select: { label: "Language"; title: "The language to use for the extension" };
			};
		};
		clearData: {
			confirmAlert: "This will delete all extension data related to options. Continue?";
			allDataDeleted: "All data has been deleted.";
		};
	};
	messages: {
		settingVolume: "Setting volume boost to {{VOLUME_BOOST_AMOUNT}}";
		resumingVideo: "Resuming video at {{VIDEO_TIME}}";
	};
}

declare const EnUS: EnUS;

export = EnUS;
