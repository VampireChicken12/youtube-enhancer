import type { configuration } from "@/src/types";

import type { CSSEditorProps } from "../../Inputs/CSSEditor/CSSEditor";
import type { CheckboxProps } from "../../Inputs/CheckBox/CheckBox";
import type { NumberInputProps } from "../../Inputs/Number/Number";
import type { SelectProps } from "../../Inputs/Select/Select";
import type { SliderProps } from "../../Inputs/Slider/Slider";

import { CSSEditor, Checkbox, NumberInput, Select, Slider } from "../../Inputs";

type SettingInputProps = {
	id: keyof configuration;
	title?: string;
} & (
	| ({ type: "checkbox" } & CheckboxProps)
	| ({ type: "css-editor" } & CSSEditorProps)
	| ({ type: "number" } & NumberInputProps)
	| ({ type: "select" } & SelectProps)
	| ({ type: "slider" } & SliderProps)
);
function SettingInput(settingProps: SettingInputProps) {
	const { type } = settingProps;
	switch (type) {
		case "checkbox": {
			const { checked, className, id, label, onChange, title } = settingProps;
			return <Checkbox checked={checked} className={className} id={id} label={label} onChange={onChange} title={title} />;
		}
		case "number": {
			const { className, disabled, id, label, max, min, onChange, step, value } = settingProps;
			return (
				<NumberInput
					className={className}
					disabled={disabled}
					id={id}
					label={label}
					max={max}
					min={min}
					onChange={onChange}
					step={step}
					value={value}
				/>
			);
		}
		case "select": {
			const { className, disabled, id, label, onChange, options, selectedOption, title } = settingProps;
			return (
				<Select
					className={className}
					disabled={disabled}
					id={id}
					label={label}
					onChange={onChange}
					options={options}
					selectedOption={selectedOption}
					title={title}
				/>
			);
		}
		case "slider": {
			const { initialValue, max, min, onChange, step } = settingProps;
			return <Slider initialValue={initialValue} max={max} min={min} onChange={onChange} step={step} />;
		}
		case "css-editor": {
			const { className, id, onChange, value } = settingProps;
			return <CSSEditor className={className} id={id} onChange={onChange} value={value} />;
		}
	}
}
export default function Setting(settingProps: SettingInputProps) {
	return (
		<div className="mx-2 mb-1" title={settingProps.title}>
			<SettingInput {...settingProps} />
		</div>
	);
}
