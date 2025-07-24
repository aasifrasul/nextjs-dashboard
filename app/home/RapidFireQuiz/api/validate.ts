export const validateAnswer = (answer: string, correctAnswer: string): Promise<boolean> => {
	const time = 1000; //just to make tests faster

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(answer === correctAnswer);
		}, time);
	});
};
