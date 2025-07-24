interface ScoresProps {
	correct: number;
	incorrect: number;
	skipped: number;
}

const Scores = ({ correct, incorrect, skipped }: ScoresProps) => {
	return (
		<div className="flex justify-between text-sm font-medium text-gray-700">
			<div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg shadow">
				✅ Correct: {correct}
			</div>
			<div className="bg-red-50 text-red-700 px-3 py-1 rounded-lg shadow">
				❌ Incorrect: {incorrect}
			</div>
			<div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg shadow">
				⏭️ Skipped: {skipped}
			</div>
		</div>
	);
};

export default Scores;
