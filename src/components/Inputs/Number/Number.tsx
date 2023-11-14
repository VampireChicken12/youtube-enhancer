import type { ClassValue } from "clsx";
import type { ChangeEvent, MutableRefObject } from "react";

import { cn } from "@/src/utils/utilities";
import React, { useRef } from "react";

import Arrow from "./Arrow";
import "./Number.css";
export type NumberInputProps = {
	className?: string;
	disabled: boolean;
	id?: string;
	label: string;
	max?: number;
	min?: number;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	step?: number;
	value: number;
};

const NumberInput: React.FC<NumberInputProps> = ({ className, disabled, id, label, max = undefined, min = 0, onChange, step = 1, value }) => {
	const inputElement: MutableRefObject<HTMLInputElement | null> = useRef(null);
	const inputDiv: MutableRefObject<HTMLDivElement | null> = useRef(null);
	const NumberPlus = () => {
		if (inputElement.current) {
			inputElement.current.stepUp();
			handleChange(inputElement.current.value);
		}
	};

	const NumberMinus = () => {
		if (inputElement.current) {
			inputElement.current.stepDown();
			handleChange(inputElement.current.value);
		}
	};

	const handleChange = (value: string) => {
		if (min && parseInt(value) < min) value = min + "";
		if (max && parseInt(value) > max) value = max + "";

		if (!isNaN(parseInt(value))) {
			onChange({ currentTarget: { value } } as ChangeEvent<HTMLInputElement>);
		}
	};

	const disabledButtonClasses = {
		"cursor-pointer": !disabled,
		"dark:hover:bg-transparent": disabled,
		"dark:text-[#4b5563]": disabled,
		"hover:bg-transparent": disabled,
		"text-[#4b5563]": disabled
	} satisfies ClassValue;
	return (
		<div className={cn("relative flex gap-4 items-baseline justify-between flex-row", className)} ref={inputDiv}>
			<label className="mb-1" htmlFor={id}>
				{label}
			</label>
			<div className="relative flex flex-row">
				<input
					aria-hidden={true}
					className={cn(
						"number border border-gray-300 bg-white text-black px-2 py-2 rounded-md flex items-center justify-between w-40 h-10 focus:outline-none dark:bg-[#23272a] dark:text-white dark:border-gray-700",
						{ "dark:text-[#4b5563]": disabled, "text-[#4b5563]": disabled }
					)}
					disabled={disabled}
					max={max}
					min={min}
					onChange={(e) => handleChange(e.currentTarget.value)}
					ref={inputElement}
					step={step}
					style={{
						MozAppearance: "textfield",
						WebkitAppearance: "none",
						borderBottomLeftRadius: "0.375rem",
						borderTopLeftRadius: "0.375rem"
					}}
					type="number"
					value={value}
				></input>
				<div className="absolute bottom-1 right-1 flex h-[35px] flex-col">
					<button
						aria-hidden={true}
						aria-label="Add one"
						className={cn(
							"flex text-black dark:text-white round-r dark:bg-[#23272a] dark:hover:bg-[rgba(24,26,27,0.5)] w-full h-1/2 p-1 justify-center cursor-default",
							disabledButtonClasses
						)}
						disabled={disabled}
						onClick={NumberPlus}
						style={{
							borderTopRightRadius: "0.375rem",
							transition: "all linear 0.1s"
						}}
						type="button"
					>
						<Arrow rotation="up" />
					</button>
					<button
						aria-hidden={true}
						aria-label="Subtract one"
						className={cn(
							"flex text-black dark:text-white round-r dark:bg-[#23272a] dark:hover:bg-[rgba(24,26,27,0.5)] w-full h-1/2 p-1 justify-center cursor-default",
							disabledButtonClasses
						)}
						disabled={disabled}
						onClick={NumberMinus}
						style={{
							borderTopRightRadius: "0.375rem",
							transition: "all linear 0.1s"
						}}
						type="button"
					>
						<Arrow rotation="down" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default NumberInput;
