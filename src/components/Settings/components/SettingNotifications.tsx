import { useNotifications } from "@/src/hooks";
import { cn } from "@/src/utils/utilities";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { useSettings } from "../Settings";

export default function SettingsNotifications() {
	const { notifications, removeNotification } = useNotifications();
	const [parentRef] = useAutoAnimate({ duration: 300 });
	const {
		i18nInstance: { t }
	} = useSettings();
	return (
		<div id="notifications" ref={parentRef}>
			{notifications.map((notification, index) => {
				const message: string = t(notification.message);
				return (
					<div
						className={cn("notification inverse relative bg-teal-600", {
							"bg-blue-600": notification.type === "info",
							"bg-green-600": notification.type === "success",
							"bg-red-600": notification.type === "error",
							"bg-yellow-600": notification.type === "warning"
						})}
						key={index}
					>
						{notification.action ?
							notification.action === "reset_settings" ?
								<>
									{message.split("\n").map((line, index) => (
										<p key={index}>{line}</p>
									))}
									<button className="absolute right-[5px] top-[-1px] text-base font-normal" onClick={() => removeNotification(notification)}>
										&times;
									</button>
								</>
							:	null
						:	<>
								{message}
								<button className="absolute right-[5px] top-[-1px] text-base font-normal" onClick={() => removeNotification(notification)}>
									&times;
								</button>
							</>
						}
						<div
							className="absolute bottom-0 left-0 h-1 rounded-b bg-[#0086ff]"
							id={`${notification.type}_notification_${message.split(/s /).join("_")}_progress_bar`}
							key={index}
							style={{ width: `${notification.progress ?? 100}%` }}
						></div>
					</div>
				);
			})}
		</div>
	);
}
