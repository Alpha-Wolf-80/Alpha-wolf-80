let duration = 300
let answer_delay = 5
let game_going_on = cooldown = false
let current_puzzle = null
let score = {"right":0,"wrong":0,"skipped":0}
// This is where we detect what the user is bad at
let equation_probability = {first_digit:{},secound_digit:{}}
let config = {
	first_max:19,
	first_min:12,
	secound_max:9,
	secound_min:2
};
(() =>{ 
	//This is to set the probabilitys up
	// Give Each equal percent chance of happening
	first_digit_chance = 1/(config.first_max - config.first_min + 1)
	secound_digit_chance = 1/(config.secound_max - config.secound_min + 1)
	for (let i = config.first_min; i <= config.first_max;i++){
		equation_probability.first_digit[i] = first_digit_chance
	}
	for (let i = config.secound_min; i <= config.secound_max;i++){
		equation_probability.secound_digit[i] = secound_digit_chance
	}
})();

const NumFix = (number) => parseFloat(number.toFixed(14));
const fix_probability = () => {
	for (const key in equation_probability){
		digits = equation_probability[key]
		for (const digit in digits){
			// First we remove any digit which is smaller or equal to 0
			digits[digit] = NumFix(digits[digit])
			if (digits[digit] <= 0) delete digits[digit]
		}
		// Now we distribute the remaining probability to other
		// First we find the total percentage
		let percentage_sum = 0
		for (const digit in digits){
			percentage_sum = percentage_sum + digits[digit]
		}
		// We distribute the percentage according to the ratio of all the digits
		remaining_percentage = NumFix(1-percentage_sum) //We flip the sum to find the remaing percentage
		final_remain = remaining_percentage
		for (const digit in digits){
			let cost = NumFix(remaining_percentage * digits[digit])
			digits[digit] = NumFix(digits[digit]+cost)
			final_remain = NumFix(final_remain - cost)
		}
		//First we are going to separte the the remaning based on the percentage of each digit.

		// Now we put the remaining percentage into everyone
		if (final_remain > 0){
			let divide_to = final_remain/ Object.keys(digits).length
			for (const digit in digits){
				digits[digit] = NumFix(digits[digit] + divide_to)
			}
		}
	}
}

const biased_random = (probabilities) => {
	// Returns the number based on biasedness
	var rnd = Math.random();
    var total = 0;
    for (const key in probabilities){
    	// Check if the probability of hitting that number is in the range
    	if (rnd > total && rnd < total + probabilities[key]){
    		return key
    	}
    	total += probabilities[key]
    }
	// Return a random value from the list if no value is found
	return Object.keys(probabilities)[Math.round(Math.random() * Object.keys(probabilities).length)]
}
const random_puzzle = () => {
	// Generates Random Puzzles based on where the user is weak
	first_number = biased_random(equation_probability.first_digit);
	secound_number = biased_random(equation_probability.secound_digit);
	// first_number = Math.randomNum(first_max,first_min);
	// secound_number = Math.randomNum(secound_max,secound_min);
	return {
		"first_number":first_number,
		"secound_number":secound_number,
		"puzzle":`${first_number} &times; ${secound_number}`,
		"answer":first_number * secound_number,
	};
}
const new_puzzle = () => {
	if (game_going_on == false) return count_score();
	cooldown = true
	// We set a cooldown to prevent users from double submitting
	setTimeout(() => {cooldown = false},500);
	// Next we set the new puzzle in position
	let puzzle = document.querySelector('#puzzle');
	current_puzzle = random_puzzle()
	puzzle.innerHTML = current_puzzle["puzzle"]// + `<span style="font-size:10px;">${current_puzzle["answer"]}</small>`
	// If the puzzle isn't answered in a certain time we reset the puzzle
	score_cache = {...score}
	interval = setTimeout((score_cache)=>{
		if (JSON.stringify(score_cache) === JSON.stringify(score)){
			// If the score remains the same. It means that the user has not answered yet
			// So we are going to reset the puzzle
			score["skipped"] += 1
			for (let i = 1;i <= 100;i++){
				createParticle('#ff8000')
			}
			showAnswer(`Answer: ${current_puzzle["answer"]}`,"#ff8000")
			let {first_number,secound_number} = current_puzzle
			equation_probability.first_digit[first_number] += 0.01
			equation_probability.secound_digit[secound_number] += 0.01
			new_puzzle()
		}
	},answer_delay * 1000,score_cache)
}
const check_answer = () => {
	if(cooldown) return showAnswer("You can only sumbit answer 0.5s after you are given a sum!")
	answer = document.querySelector('#answer')
	answer_is_correct = Number(answer.value) == current_puzzle["answer"]
	if (answer.value){
		score[answer_is_correct ? "right" : "wrong"] += 1
		// Show some particles based on the answer
		submit_puzzle = document.querySelector('#Submit_Puzzle')
		for (let i = 1;i <= 100;i++){
			createParticle(answer_is_correct ? '#00ff80' : '#ff0081')
		}
		if (answer_is_correct){
			equation_probability.first_digit[current_puzzle["first_number"]] -= 0.02
			equation_probability.secound_digit[current_puzzle["secound_number"]] -= 0.02
		}else{
			showAnswer(`Answer: ${current_puzzle["answer"]}`)
			equation_probability.first_digit[current_puzzle["first_number"]] += 0.01
			equation_probability.secound_digit[current_puzzle["secound_number"]] += 0.01
		}
	} else{
		score['skipped'] += 1;
		showAnswer(`Answer: ${current_puzzle["answer"]}`)
	}
	answer.value = ""
	answer.select()
	new_puzzle()
}
function showAnswer(text,color){
	const text_elm = document.createElement('span');
	text_elm.innerHTML = text;
	text_elm.setAttribute('class','fade_answer')
	if (color){
		text_elm.style.color = color
	}
	let box = document.querySelector('#Puzzle_box');
	// The middle of the puzzle box
	const x = box.offsetLeft + (box.offsetWidth/2);
	const y = box.offsetTop
	const destinationY = box.offsetTop - (box.offsetHeight/2);
	document.body.appendChild(text_elm);
	const animation = text_elm.animate([{
			// Set the origin position of the particle
			// We offset the particle with half its size to center it around the mouse
			transform: `translate(${x}px, ${y}px)`,
			opacity: 1
		},{
			// We define the final coordinates as the second keyframe
			transform: `translate(${x}px, ${destinationY}px)`,
			opacity: 0
		}],{
			// Set a random duration from 500 to 1500ms
			duration: Math.randomNum(3000,2500),
			easing: 'cubic-bezier(0, .9, .57, 1)',
		})
	animation.onfinish = () => text_elm.remove()
}
function createParticle(color) {
	//Get Random x and y outside the Button
	let puzzle = document.querySelector('#Submit_Puzzle')
	let parent_offset = {top:puzzle.parentNode.offsetTop,left:puzzle.parentNode.offsetLeft}
	let offset_top = parent_offset.top + puzzle.offsetTop + 250
	let offset_left = parent_offset.top + puzzle.offsetLeft
	y = offset_left + 5
	rand_x = Math.randomNum(offset_top+120,offset_top-150)
	// Create a custom particle element
	const particle = document.createElement('particle');
	// Append the element into the body
	document.body.appendChild(particle);
	// Calculate a random size from 5px to 25px
	const size = Math.floor(Math.random() * 20 + 5);
	// Apply the size on each particle
	particle.style.width = `${size}px`;
	particle.style.height = `${size}px`;
	// Generate a random color in a blue/purple palette
	particle.style.background = color
	// Generate a random x & y destination within a distance of 75px from the mouse
	const destinationX = rand_x + (Math.random() - 0.5) * 2 * 75;
	const destinationY = y + (Math.random() - 0.5) * 2 * 75;

	// Store the animation in a variable because we will need it later
	const animation = particle.animate([{
			// Set the origin position of the particle
			// We offset the particle with half its size to center it around the mouse
			transform: `translate(${rand_x - (size / 2)}px, ${y - (size / 2)}px)`,
			opacity: 1
		},{
			// We define the final coordinates as the second keyframe
			transform: `translate(${destinationX}px, ${destinationY}px)`,
			opacity: 0
		}], {
			// Set a random duration from 500 to 1500ms
			duration: 500 + Math.random() * 1000,
			easing: 'cubic-bezier(0, .9, .57, 1)',
			// Delay every particle with a random value from 0ms to 200ms
			delay: Math.random() * 200
		});
	// When the animation is finished, remove the element from the DOM
	animation.onfinish = () => particle.remove()
}
const start_game = () => {
	document.querySelector("#Menu").classList.add('hidden')
	document.querySelector("#Puzzle_box").classList.remove('hidden')
	duration = Number(document.querySelector("#game_duration").value);
	answer_delay = Number(document.querySelector("#answer_delay").value);
	// Here we reset the game score and set the game to get going
	score = {"right":0,"wrong":0,"skipped":0}
	game_going_on = true;
	// This piece of code will end the game after the set amount of duration
	setTimeout(() => {game_going_on = false;},duration * 1000);
	// This is to ensure that the code doesn't break
	current_puzzle = random_puzzle();
	// This assings a new puzzle for the user
	document.querySelector('#answer').select()
	new_puzzle();
}
const count_score = () => {
	// Display the div which has this going on
	document.querySelector("#Puzzle_box").style.display = "None";
	document.querySelector("#End_Puzzle").style.display = "";
	// Update the Spans with the answers
	document.querySelector("#correct_answer").innerHTML = `Correct Answers: ${score["right"]}`
	document.querySelector("#incorrect_answer").innerHTML = `Incorrect Answers: ${score['wrong']}`
	document.querySelector("#skipped_answer").innerHTML = `Skipped Questions: ${score["skipped"]}`
}
// These are the functions which haddle how an element is handled
document.querySelector('#answer').addEventListener("keyup", (event) => {
	if (event.keyCode == 13) {
		 	event.preventDefault();
		 	document.querySelector('#Submit_Puzzle').click()
	}
});
answer_input = document.querySelector('#answer')
answer_input.oninput = () => {
	answer_input.value = answer_input.value.replace(/\D/g,'')
}

document.querySelector('.start').addEventListener("click", () => start_game())