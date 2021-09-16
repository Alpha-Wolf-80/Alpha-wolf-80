game_duration_slider = document.querySelector('#game_duration')
answer_delay_slider = document.querySelector("#answer_delay")
g_timeout = 0
a_timout = 0

game_duration_slider.oninput = () => {
	value = Number(game_duration_slider.value)
	minute = Math.floor(value / 60)
	secounds = value % 60
	string = ''
	if (minute >= 1){
		string += ` ${minute} minutes`
	}
	if (secounds >= 1){
		string += ` ${secounds} secounds`
	}
	document.querySelector('#Game_duration_show').innerHTML = string
	clearTimeout(g_timeout)
	g_timeout = setTimeout(()=>{
			document.querySelector('#Game_duration_show').innerHTML = 'Game duration'
			document.querySelector('#Game_duration_show')
	},1000)
}
answer_delay_slider.oninput = () => {
	document.querySelector('#Answer_delay_show').innerHTML = answer_delay_slider.value+' secounds'
	clearTimeout(a_timout)
	a_timout = setTimeout(()=>{
			document.querySelector('#Answer_delay_show').innerHTML = 'Answer Delay'
	},1000)
}