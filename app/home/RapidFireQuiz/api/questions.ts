export interface QuestionData {
	question: string;
	options: string[];
	correct: string;
}

const QUESTIONS: QuestionData[] = [
	{
		question: 'Which planet is known as the Red Planet?',
		options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
		correct: 'Mars',
	},
	{
		question: "Who wrote the play 'Romeo and Juliet'?",
		options: ['Charles Dickens', 'William Shakespeare', 'Leo Tolstoy', 'Mark Twain'],
		correct: 'William Shakespeare',
	},
	{
		question: 'What is the capital of Australia?',
		options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
		correct: 'Canberra',
	},
	{
		question: 'What is H2O commonly known as?',
		options: ['Hydrogen', 'Salt', 'Water', 'Oxygen'],
		correct: 'Water',
	},
	{
		question: 'Which language is primarily spoken in Brazil?',
		options: ['Spanish', 'Portuguese', 'French', 'Italian'],
		correct: 'Portuguese',
	},
];

export const fetchQuestion = (index: number): Promise<QuestionData> => {
	return new Promise((resolve) => {
		const time = 1000; //just to make tests faster
		setTimeout(() => {
			resolve(QUESTIONS[index]);
		}, time); // simulate network delay
	});
};
