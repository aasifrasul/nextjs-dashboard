interface QuestionCardProps {
	question: string;
	options: string[];
	onSelect: (option: string) => void;
	disabled: boolean;
	selected: string | undefined;
}

const QuestionCard = ({
	question,
	options,
	onSelect,
	disabled,
	selected,
}: QuestionCardProps) => {
	return (
		<div className="p-4 border rounded shadow-md">
			<h2 className="text-lg font-semibold mb-4">{question}</h2>
			<div>
				{options.map((option) => (
					<div key={option} className="mb-2 flex items-center">
						<input
							type="radio"
							id={option}
							name="question-options"
							value={option}
							checked={selected === option}
							onChange={() => onSelect(option)}
							disabled={disabled}
							className="form-radio text-blue-600"
						/>
						<label htmlFor={option} className="ml-2">
							{option}
						</label>
					</div>
				))}
			</div>
		</div>
	);
};

export default QuestionCard;
