var num_cols = 10;
var num_rows = 10;
var outer_width = 60;
var inner_width = 60;
var timestep = 0;

let colors;
let qs;
let states;
let actions;
let next_states;
let argmax_next_actions;
let q_statuses;
let priorities;

function preload() {
  // Get the most recent earthquake in the database
  let url = '/viridis_colors.json';
  colors = loadJSON(url);
  qs = loadJSON('/animations/2020-08-24-prioritized-sweeping/prioritized_sweeping_first_two_episodes_qs.json');
  states = loadJSON('/animations/2020-08-24-prioritized-sweeping/states.json');
  actions = loadJSON('/animations/2020-08-24-prioritized-sweeping/actions.json');
  next_states = loadJSON('/animations/2020-08-24-prioritized-sweeping/next_states.json');
  argmax_next_actions = loadJSON('/animations/2020-08-24-prioritized-sweeping/argmax_next_actions.json');
  q_statuses = loadJSON('/animations/2020-08-24-prioritized-sweeping/q_statuses.json');
  priorities = loadJSON('/animations/2020-08-24-prioritized-sweeping/priorities.json')
}

function setup() {
	// https://github.com/processing/p5.js/wiki/Positioning-your-canvas#relocating-the-canvas
	var cnv = createCanvas(num_cols * outer_width * 2.03, num_rows * outer_width + 100);
	// let canvas = createCanvas(windowHeight, windowWidth);
	cnv.style('display', 'block');
	// cnv.position(150, 150);
	// canvas.position();
	cnv.parent('sketch-holder');

	// https://p5js.org/reference/#/p5/createSlider
	slider = createSlider(0, Object.keys(qs).length-1, 0, 1);  // https://stackoverflow.com/questions/5223/length-of-a-javascript-object
	slider.style('width', '500px');
}

function draw() {

	background(255);

	timestep = slider.value();

	var currentStateX = states[timestep][1];
	var currentStateY = states[timestep][0];
	var currentAction = actions[timestep];

	var nextStateX = next_states[timestep][1];
	var nextStateY = next_states[timestep][0];
	var nextAction = argmax_next_actions[timestep];

	for (var i = 0; i < num_cols; i++) {
	  for (var j = 0; j < num_rows; j++) {

	  	x = i * outer_width + num_rows * outer_width * 1.03;
	    y = j * outer_width;

	    var leftX = x;
	    var centerX = x + inner_width / 2;
	    var rightX = x + inner_width;
	    
	    var topY = y;
	    var centerY = y + inner_width / 2;
	    var bottomY = y + inner_width;

	    // console.log(argmax_ix);

	    // ========== draw all actions in the state ==========
	    
	    noStroke();

	    values = priorities[timestep][j][i];

	    for (var l = 0; l < values.length; l++) {

	      var rgba = colors[floor(map(values[l], 0, 1, 0, 255))];
	      fill(rgba[0], rgba[1], rgba[2], rgba[3]);

	      noStroke();

	      if (l == 0) {

	        triangle(
	          centerX, centerY, 
	          leftX, topY, 
	          rightX, topY, 
	        );  // up
	        
	       	stroke(255);
	       	fill(255);
	        strokeWeight(1);
	        textAlign(CENTER);
	        textSize(10);
	        text(round(values[l], 2), centerX, centerY-state_width/2-10);

	      } else if (l == 1) {
	        
	        rotate(0);
	       	triangle(
	       	  centerX, centerY,
	       	  rightX, topY,
	       	  rightX, bottomY,
	       	);  // right

	       	rotate(0);
	       	stroke(255);
	       	strokeWeight(1);
	        fill(255);
	        textAlign(CENTER);
	        textSize(10);
	        text(round(values[l], 2), centerX+state_width/2+12.5, centerY);
	      
	      } else if (l == 2) {
	      
	      	rotate(0);
	        triangle(
	          centerX, centerY,
	          leftX, bottomY,
	          rightX, bottomY,
	        );  // down

	        rotate(0);
	        stroke(255);
	        strokeWeight(1);
	        fill(255);
	        textAlign(CENTER);
	        textSize(10);
	        text(round(values[l], 2), centerX, centerY+state_width/2+15);
	      
	      } else if (l == 3) {

	      	rotate(0);

	        triangle(
	          centerX, centerY,
	          leftX, topY,
	          leftX, bottomY,
	        );  // left

	        rotate(0);
	        stroke(255);
	        strokeWeight(1);
	        fill(255);
	        textAlign(CENTER);
	        textSize(10);
	        text(round(values[l], 2), centerX-state_width/2-12, centerY);
	      
	      }

	    }

	}}

	// *****

	for (var i = 0; i < num_cols; i++) {
	  for (var j = 0; j < num_rows; j++) {

	    x = i * outer_width;
	    y = j * outer_width;

	    values = qs[timestep][j][i];

	    var max_val = -1000;
	    for (var l = 0; l < values.length; l++) {
	      if (values[l] > max_val) {
	          max_val = values[l];
	      }
	    }

	    argmax_ixs = []
	    for (var l = 0; l < values.length; l++) {
	      if (values[l] == max_val) {
	          argmax_ixs.push(l);
	      }
	    }

	    var leftX = x;
	    var centerX = x + inner_width / 2;
	    var rightX = x + inner_width;
	    
	    var topY = y;
	    var centerY = y + inner_width / 2;
	    var bottomY = y + inner_width;

	    // console.log(argmax_ix);

	    // ========== draw all actions in the state ==========
	    
	    noStroke();

	    var state_width = inner_width * 0.3;

	    for (var l = 0; l < values.length; l++) {

	      var rgba = colors[floor(map(values[l], 0, 1, 0, 255))];
	      fill(rgba[0], rgba[1], rgba[2], rgba[3]);

	      if (i == currentStateX && j == currentStateY && l == currentAction) {
	    	strokeWeight(5);
	    	stroke(255, 0, 0);
	      } else if (i == nextStateX && j == nextStateY && l == nextAction) {
	    	strokeWeight(5);
	    	stroke(0, 255, 0);
	      } else {
	      	noStroke()
	      }

	      if (l == 0) {

	        triangle(
	          centerX, centerY, 
	          leftX, topY, 
	          rightX, topY, 
	        );  // up
	       
	       	fill(255);
	       	noStroke(0);
	        textAlign(CENTER);
	        textSize(8);
	        text(round(values[l], 2), centerX, centerY-state_width/2-10);

	      } else if (l == 1) {
	        
	        rotate(0);
	       	triangle(
	       	  centerX, centerY,
	       	  rightX, topY,
	       	  rightX, bottomY,
	       	);  // right

	       	fill(255);
	       	noStroke(0);
	        textAlign(CENTER);
	        textSize(8);
	        text(round(values[l], 2), centerX+state_width/2+12.5, centerY);
	      
	      } else if (l == 2) {
	      
	      	rotate(0);
	        triangle(
	          centerX, centerY,
	          leftX, bottomY,
	          rightX, bottomY,
	        );  // down

	        fill(255);
	        noStroke(0);
	        textAlign(CENTER);
	        textSize(8);
	        text(round(values[l], 2), centerX, centerY+state_width/2+15);
	      
	      } else if (l == 3) {

	      	rotate(0);

	        triangle(
	          centerX, centerY,
	          leftX, topY,
	          leftX, bottomY,
	        );  // left

	        fill(255);
	        noStroke(0);
	        textAlign(CENTER);
	        textSize(8);
	        text(round(values[l], 2), centerX-state_width/2-12, centerY);
	      
	      }

	    }

	    // reset();

	    if (i == currentStateX && j == currentStateY) {
	    	fill(255, 0, 0);
	    } else if (i == nextStateX && j == nextStateY) {
	    	fill(0, 255, 0);
	    } else {
	    	fill(255);
	    }

	    rotate(0);

	    strokeWeight(1);

	    rectMode(CENTER);
	    rect(x+inner_width/2, y+inner_width/2, state_width, state_width);

	    // =========== draw arrows for argmax action(s) ==========

	    stroke(0);
	    fill(0);

	    var arrowLength = 0.8*state_width/2;
	    var arrowTailLength = 0.6*state_width/2
	    var arrowWidth = 3;

	    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#for...in_statement
	    for (var argmax_ix of argmax_ixs) {

	    	if (argmax_ix == 0) { // up
	    		line(centerX, centerY, centerX, centerY-0.8*state_width/2);
	    		triangle(
		        	centerX, centerY-arrowLength,
		        	centerX-arrowWidth, centerY-arrowTailLength,
		        	centerX+arrowWidth, centerY-arrowTailLength,
		        );
	    	} else if (argmax_ix == 1) { // right
	    		line(centerX, centerY, centerX+0.8*state_width/2, centerY);
	    		triangle(
		        	centerX+arrowLength, centerY,
		        	centerX+arrowTailLength, centerY-arrowWidth,
		        	centerX+arrowTailLength, centerY+arrowWidth,
		        );
	    	} else if (argmax_ix == 2) { // down
	    		line(centerX, centerY, centerX, centerY+0.8*state_width/2);
	    		triangle(
		        	centerX, centerY+arrowLength,
		        	centerX-arrowWidth, centerY+arrowTailLength,
		        	centerX+arrowWidth, centerY+arrowTailLength,
		        );
	    	} else if (argmax_ix == 3) { // left
	    		line(centerX, centerY, centerX-0.8*state_width/2, centerY);
	    		triangle(
		        	centerX-arrowLength, centerY,
		        	centerX-arrowTailLength, centerY-arrowWidth,
		        	centerX-arrowTailLength, centerY+arrowWidth,
		        );
	    	}
	    }

	    // ========== draw state name ==========

	    // rectMode(CENTER);
	    // fill(255);
	    // noStroke();
	    // rect(x+item_width/2, y+item_width/2, state_width * 0.3, state_width * 0.3);

	    // textSize(12);
	    // textAlign(CENTER, CENTER);
	    // fill(0);
	    
	    // text(' ' + str(j) + ',' + str(i), x+item_width/2, y+item_width/2, item_width-20, item_width-20);

	    fill(0);
	    noStroke();
		textSize(12);
		text('Timestep: ' + str(slider.value()), 300, num_rows * outer_width + 1.5 * outer_width + 15, 300, 100);

		if (q_statuses[timestep] == 0) {
			text('Update step type: Learning', 300, num_rows * outer_width + 1.5 * outer_width + 40, 400, 100);
		} else {
			text('Update step type: Planning', 300, num_rows * outer_width + 1.5 * outer_width + 40, 400, 100);
		}

	  }
	}

}