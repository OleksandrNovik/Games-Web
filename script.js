// The real size of the coordinate plane of the playing field
const COORDINATES_MAX_X = 289;
const COORDINATES_MAX_Y = 141;

// Reduction of vertical movement speed to equalize speeds
const verticalSpeedCoef = 2;

// Representation of a snake segment
function Segment(x, y){
    this.x = x;
    this.y = y;
}

// Snake characteristics and segments are saved here
let snake = {
    directionX: 0,
    directionY: 0,
    segments: [
        new Segment(0, 0),
        new Segment(0, 0)
    ]
}

// There can be only one fruit on the field, after the snake eats it, a new one will be created
let food = new Segment(0, 0);

// Game container and context
const game = document.querySelector('#game-container');
const context = game.getContext('2d');
// Game over and Start game texts
const startGameText = document.getElementById('start-game-text');
const gameOverText = document.getElementById('game-over-text'); 
// Fruit reward change buttons
const scoreRewardButtons = document.querySelectorAll('.js-score-btn');
// Control change buttons
const controlButtons = document.querySelectorAll('.js-controls-btns');
// Resolutin buttons 
const resolutinButtons = document.querySelectorAll('.js-resolution-btns');
//Change game speed buttons
const speedButtons = document.querySelectorAll('.js-speed-btns');

// Checking whether the direction of the snake should be changed with each key press
document.addEventListener('keydown', (event) => {
    keyboardEventHandler(event.key.toLocaleLowerCase());
});

// Clicking on any of the buttons will call up the food reward task method
// which will set the new value
scoreRewardButtons.forEach(button => {
    button.addEventListener('click', () => {
        config.changeScoreReward(Number(button.innerText));
        selectButton(scoreRewardButtons, button);
    });
});
// Similarly for the field size change and game speed buttons
resolutinButtons.forEach(button => {
    button.addEventListener('click', () => {
        config.setResolution(Number(button.id));
        selectButton(resolutinButtons, button);
    });
});
speedButtons.forEach(button => {
    button.addEventListener('click', () => {
        config.changeGameSpeed(Number(button.id));
        selectButton(speedButtons, button);
    });
});
// Adding an event listener to the color change button
document.getElementById('apply-changes-on-colors').addEventListener('click', () => {
    let mainValue = formHexToRGB(document.getElementById('main-color').value);
    let secondaryValue = formHexToRGB(document.getElementById('secondary-color').value);
    config.changeMainColor(mainValue);
    if (config.secondaryColor === secondaryValue){
        document.body.style.backgroundColor = config.mainColor;
        clearField();
        setColorValuesForInputs();  
    }
    else{
        config.changeSecondaryColor(secondaryValue);
        setColorsForAllParts();
    }
});
// Adding an event listener to the default colors button
document.getElementById('default-colors').addEventListener('click', () => {
    setDefaultColors();
});

// Configuration object
const config = {
    // Game field resolution
    height: 500,
    width: 500,

    // Change resolution of game and saving changes into the local storage
    setResolution: function (size) {
        if (isNaN(size)) {
            console.error("NaN argument error");
            return;
        }
        if (size < 500 || size > 700) {
            console.error("Resolution is not allowed [min = 500, max = 700]");
            return;
        }
        this.height = size;
        this.width = size;
        game.style.width = this.width + "px";
        game.style.height = this.height + "px";
        localStorage.setItem('resolution', this.height);
    },
    // Game characteristics and score
    gameRunning: false,
    gameStarted: false,
    gameSpeed: 75, 
    playerScore: 0,
    scoreCost: 10,
    cellSize: 7,
    bestScore: 0,
    // Change game speed
    changeGameSpeed: function (gameSpeedModeNumber) {
        if (isNaN(gameSpeedModeNumber)) {
            console.error("NaN argument error");
            return;
        }
        if (gameSpeedModeNumber < 1 || gameSpeedModeNumber > 5){
            console.error('The speed limit is from 1 to 5.');
        }
        // Speeds of changing a game frames { 1: 125  2: 100  3: 75  4: 50  5: 25 }
        this.gameSpeed = 25 * (6 - gameSpeedModeNumber);
        // Saving speed in local storage after it was changed
        localStorage.setItem('game-speed', this.gameSpeed);
    },

    // Change score reward for picking up a fruit 
    changeScoreReward: function (newReward) {
        if (isNaN(newReward)) {
            console.error("NaN argument error");
            return;
        }
        if (newReward < 1 || newReward > 10) {
            console.error("Score reward is not allowed [min = 1, max = 10]");
            return;
        }
        this.scoreCost = newReward;
        // Saving score reward into the local storage
        localStorage.setItem('score-reward', this.scoreCost);
    },

    // Change a cell size of game field 
    changeCellSize: function (newCellSize) {
        if (isNaN(newCellSize)) {
            console.error("NaN argument error");
            return;
        }
        if (newCellSize < 2 || newCellSize > 20) {
            console.error("Cell size is not allowed [min = 2, max = 20]");
            return;
        }
        this.cellSize = newCellSize;
    },
    
    // Styles
    mainColor: 'rgb(0, 12, 33)',
    secondaryColor: 'rgb(255, 255, 255)',
    // Change main color (bg color) and saving into local storage
    changeMainColor: function (color){
        if (colorValidation(color)){
            this.mainColor = color;
            localStorage.setItem('main-color', this.mainColor);
        }
        // Error for those users who change color from a console
        else{
            console.error('Couldn\'t change color. Try insert: rgb(), #hexHEX, hsl() formats of color.');
        }
    },
    // Change object colors and saving into local storage
    changeSecondaryColor: function (color) {
        if (colorValidation(color)){
            this.secondaryColor = color;
            localStorage.setItem('secondary-color', this.secondaryColor);
            console.log(localStorage);
        }
        // Error for those users who change color from a console
        else{
            console.error('Couldn\'t change color. Try insert: rgb(), #hexHEX, hsl() formats of color.');
        }
    },

    // Binds
    movement: { UP: 'w', DOWN: 's', LEFT: 'a', RIGHT: 'd' },
    pause: ' ',

    // Change any configuration button 
    changeButton: function (keyName, keyPressed){
        switch(keyName){
            // Binding new key on action if it is possible and save binds in local storage
            case 'Up':
                if (checkForExistingButton(keyPressed))
                    return;
                this.movement.UP = keyPressed;
                localStorage.setItem('movements', JSON.stringify(this.movement));
                break;
            case 'Down':
                if (checkForExistingButton(keyPressed))
                    return;
                this.movement.DOWN = keyPressed;
                localStorage.setItem('movements', JSON.stringify(this.movement));
                break;
            case 'Left':
                if (checkForExistingButton(keyPressed))
                    return;
                this.movement.LEFT = keyPressed;
                localStorage.setItem('movements', JSON.stringify(this.movement));
                break;
            case 'Right':
                if (checkForExistingButton(keyPressed))
                    return;
                this.movement.RIGHT = keyPressed;
                localStorage.setItem('movements', JSON.stringify(this.movement));
                break;
            case 'Pause':
                if (checkForExistingButton(keyPressed))
                    return;
                this.pause = keyPressed;
                localStorage.setItem('pause', this.pause);
                break;
            // Error in case user try to change data in console 
            default:
                console.error('Error. Couldn\'t change bind for key {' + keyName + '}.');
        }
    }
}

// Map for better displaying of the controls button
const keyMap = {
    ' ':           'space',
    'control':     'ctrl',
    'arrowup':      '⇧',
    'arrowleft':    '⇦',
    'arrowright':   '⇨',
    'arrowdown':    '⇩',
    'escape':       'esc',
}

// Setting the necessary event listeners and other characteristics for control change inputs
controlButtons.forEach(item => {
    putKeyFromConfig(item);
    item.addEventListener('keydown', (event) => {
        event.preventDefault();
        config.changeButton(item.id, event.key.toLocaleLowerCase());
        putKeyFromConfig(item);
    })
});

localStorageGet();
updateScore();

// Setting the starting parameters of the game
function startGame () {
    // Hiding text
    gameOverText.style.opacity = 0;
    startGameText.style.opacity = 0;
    // Setting up game characteristics
    config.gameRunning = true;
    config.gameStarted = true;
    config.playerScore = 0;
    // Direction of snake
    snake.directionX = config.cellSize;
    // Starting positions of snake segments
    snake.segments[0].x = config.cellSize;
    snake.segments[0].y = config.cellSize;

    snake.segments[1].x = config.cellSize;
    snake.segments[1].y = 2 * config.cellSize;

    // Disabling all buttons during the game
    const blockAllButtons = document.querySelectorAll('button');
    blockAllButtons.forEach(button => {
        button.disabled = true;
    }); 
    // Disabling all inputs
    const blockAllInputs = document.querySelectorAll('input');
    blockAllInputs.forEach(input => {
        input.readOnly = true;
    })
    updateScore();
    spawnFood();
    drawFood();
    executeFrame();
}
// A separate function to end the game
function endGame () {
    clearField();
    config.gameRunning = false;
    config.gameStarted = false;
    snake = {
        directionX: 0,
        directionY: 0,
        segments: [
            new Segment(0, 0),
            new Segment(0, 0)
        ]
    }
    // Restoring functionality for buttons after the game ends
    // This is done to prevent changes in controls and other characteristics during the game
    const unlockButtons = document.querySelectorAll('button');
    unlockButtons.forEach(button => {
        button.disabled = false;
    }); 
    // Restoring functionality for input fields after the game ends
    const unlockInputs = document.querySelectorAll('input');
    unlockInputs.forEach(input => {
        input.readOnly = false;
    });
    // Displaying text 
    gameOverText.style.opacity = 1;
    checkBestScore();
}
// Execution of all necessary actions to display and operate a single game frame
function executeFrame() {
    if (config.gameRunning) {
        setTimeout(() => {
            clearField();
            drawFood();
            moveSnake();
            if (checkGameOver()){
                endGame();
                return;
            } 
            drawSnake();
            executeFrame();
        }, config.gameSpeed);
    }
}
// Executing the snake movement
function moveSnake () {
    // Moving the snake forward by 1 cell, adding a new segment with the corresponding coordinates
    const headMove = new Segment (
        snake.segments[0].x + snake.directionX,
        snake.segments[0].y + snake.directionY
    );
    snake.segments.unshift(headMove);
    // If there is a collision with the food
    if (snake.segments[0].x == food.x && snake.segments[0].y == food.y){
        // Adding a reward for the food and creating a new one
        config.playerScore += config.scoreCost;
        updateScore();
        spawnFood();
    }
    // No collision occurred, so simply remove the segment from the tail (as if taking a step forward by 1 coordinate)
    else{
        snake.segments.pop();
    }
}
// Snake control depending on the pressed key
function keyboardEventHandler (keyPressed) {
    if (config.gameStarted){
        switch(keyPressed) {
            // Left
            case config.movement.LEFT:
                snake.directionX = snake.directionX > 0 ? config.cellSize : -config.cellSize;
                snake.directionY = 0;
                break;
            // Right
            case config.movement.RIGHT:
                snake.directionX = snake.directionX < 0 ? -config.cellSize : config.cellSize;
                snake.directionY = 0;
                break;
            // Up
            case config.movement.UP:
                snake.directionX = 0;
                snake.directionY = snake.directionY > 0 ? config.cellSize : -config.cellSize;
                break;
            // Down
            case config.movement.DOWN:
                snake.directionX = 0;
                snake.directionY = snake.directionY < 0 ? -config.cellSize : config.cellSize;
                break;
            // Pause
            case config.pause:
                if (config.gameRunning){
                    config.gameRunning = !config.gameRunning;
                }
                else{
                    config.gameRunning = !config.gameRunning;
                    executeFrame();
                }
                break; 
        }
    }
    else{
        if (keyPressed === ' ')
            startGame();
    }
}
// Function to create food
function spawnFood () {
    // Additional function to set the food position according to the field size
    function createRandomFood(boardSize){
        return Math.floor(Math.random() * boardSize / 10) * config.cellSize;
    }
    do {
        // Set new coordinates for the food
        food.x = createRandomFood(config.width - config.cellSize);
        food.y = createRandomFood(config.height - config.cellSize);
    } while(food.x > COORDINATES_MAX_X || food.y > COORDINATES_MAX_Y);

}
// Checking for game over condition
function checkGameOver () {
    // Crossing the start of the game field
    let startOfField = snake.segments[0].x < 0 || snake.segments[0].y < 0;
    // Crossing the end of the game field
    let endOfField = snake.segments[0].x >= COORDINATES_MAX_X || snake.segments[0].y >= COORDINATES_MAX_Y;
    // If the snake doesn't cross itself, proceed to check for going out of the field boundaries
    for (let i = 1; i < snake.segments.length; i++){
        // If the head crosses at least 1 segment from the tail
        if (snake.segments[i].x == snake.segments[0].x && snake.segments[i].y == snake.segments[0].y)
            return true;
    }
    return startOfField || endOfField;
}
// Drawing the food
function drawFood () {
    context.strokeStyle = config.secondaryColor;
    context.strokeRect(food.x, food.y, config.cellSize, config.cellSize - verticalSpeedCoef);
}
// Drawing the snake for each segment
function drawSnake () {
    context.fillStyle = config.secondaryColor;
    context.strokeStyle = config.mainColor;
    // Loop for drawing each segment of the snake
    snake.segments.forEach(segment => {
        context.fillRect(segment.x, segment.y, config.cellSize, config.cellSize);
        context.strokeRect(segment.x, segment.y, config.cellSize, config.cellSize);
    });
}
// Clearing the game field
function clearField () {
    context.fillStyle = config.mainColor;
    context.fillRect(0, 0, config.width, config.height);
}
// Checking for the correct color definition
function colorValidation (color){
    const colorRegex = /^(#(?:[0-9a-fA-F]{3}){1,2}|rgb\([\d\s,]+?\)|hsl\([\d\s%,.]+?\))$/;
    return colorRegex.test(color); 
}
// Displaying the player's score
function updateScore (){
    const score = document.querySelector('#current-score');
    score.innerHTML = 'Score:' + config.playerScore;
} 
// Clicks the user-selected button
function selectButton (rowOfButtons, target) {
    rowOfButtons.forEach(button => {
        button.classList.remove('translate-down');
    });
    target.classList.add('translate-down');
}
// Puts the key from the config on the selected button
function putKeyFromConfig (key) {
    switch(key.id){
        case 'Up':
            // If the key exists in the map, display its value from the map; otherwise, use the default value
            key.value = keyMap[config.movement.UP] === undefined ? config.movement.UP : keyMap[config.movement.UP];
            break;
        case 'Down':
            key.value = keyMap[config.movement.DOWN] === undefined ? config.movement.DOWN : keyMap[config.movement.DOWN];
            break;
        case 'Right':
            key.value = keyMap[config.movement.RIGHT] === undefined ? config.movement.RIGHT : keyMap[config.movement.RIGHT];
            break;
        case 'Left':
            key.value = keyMap[config.movement.LEFT] === undefined ? config.movement.LEFT : keyMap[config.movement.LEFT];
            break;
        case 'Pause':
            key.value = keyMap[config.pause] === undefined ? config.pause : keyMap[config.pause];
            break;
        default:
            console.error('Error occured. Couldn\'t set a key config id = ' + key.id + '.');
            break;
    }
    adjustInputWidth(key);
}
// Adjust the input element's width based on the button label length
function adjustInputWidth(inputElement) {
    inputElement.style.width = (inputElement.value.length * 15) + "px";
}
// Check if the button being changed is already used elsewhere for control
function checkForExistingButton (checkButton) {
    // Check if the button is already bound to pause
    let isPauseButton = config.pause == checkButton;
    // Check if the button is already bound to movement
    let isMovementButton = 
        config.movement.DOWN == checkButton ||
        config.movement.UP == checkButton ||
        config.movement.LEFT == checkButton ||
        config.movement.RIGHT == checkButton

    return isPauseButton || isMovementButton;
}
// Check if the user has beaten the best score
function checkBestScore () {
    if (config.playerScore > config.bestScore){
        config.bestScore = config.playerScore;
        localStorage.setItem('best-score', config.bestScore);
        setBestScore(config.bestScore);
    }
}
// Update the text displaying the best score
function setBestScore (score) {
    if (score == 0)
        return;
    const bestScoreElement = document.getElementById('best-score');
    bestScoreElement.innerText = 'Best score: ' + score;
}
// Set colors for all parts of the user interface
function setColorsForAllParts () {
    let secondaryItems = document.querySelectorAll('.secondaty-color-items');
    secondaryItems.forEach(item => {
        // Check if the element has a box shadow
        let hasBoxShadow = window.getComputedStyle(item).getPropertyValue('box-shadow');
        // Set default characteristics
        item.style.color = config.secondaryColor;
        item.style.borderColor = config.secondaryColor;
        // If there is a box shadow, set a new color for it
        if(hasBoxShadow != 'none'){
            const transparentColor = config.secondaryColor.replace(')', ', 0.4)').replace('rgb', 'rgba');
            item.style.boxShadow = '4px 7px 2px ' + transparentColor;
        }
    });
    document.body.style.backgroundColor = config.mainColor;
    setColorValuesForInputs();
    clearField();      
}
// Restore default colors for all parts
function setDefaultColors (){
    config.changeMainColor('rgb(0, 12, 33)');
    if (config.secondaryColor === 'rgb(255, 255, 255)'){
        document.body.style.backgroundColor = config.mainColor;
        setColorValuesForInputs();  
    }
    else{
        config.changeSecondaryColor('rgb(255, 255, 255)');
        setColorsForAllParts();
    } 
}
// Set the color values in the inputs to the specified ones
function setColorValuesForInputs (){
    document.getElementById('main-color').value = extractRGBFromString(config.mainColor);
    document.getElementById('secondary-color').value = extractRGBFromString(config.secondaryColor);
}
// Get data from local storage
function localStorageGet () {
    // Set all saved characteristics
    let newGameSpeed = localStorage.getItem('game-speed');
    if (newGameSpeed == null)
        return;
    speedButtons[(Number(newGameSpeed) / 25) - 1].click();
    let newScoreValue = Number(localStorage.getItem('score-reward'));
    scoreRewardButtons[newScoreValue - 1].click();
    let newResolution = Number(localStorage.getItem('resolution'));
    document.getElementById(newResolution).click();
    // Movement and pause binds
    config.movement = JSON.parse(localStorage.getItem('movements'));
    config.pause = localStorage.getItem('pause');
    controlButtons.forEach(button => putKeyFromConfig(button));    

    // Get and set colors for all parts
    config.mainColor = localStorage.getItem('main-color');
    config.secondaryColor = localStorage.getItem('secondary-color');
    setColorsForAllParts();

    config.bestScore = Number(localStorage.getItem('best-score'));
    setBestScore(config.bestScore);
}
// Function for converting from hex format to rgb()
// The input type color returns #COLOR (hex format) by default
// But for creating shadows on buttons, I need rgb() format
function formHexToRGB (color){
    color = color.replace("#", "");

    // Extracting the red, green, and blue values
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
}
// Function to extract r, g, b values from a string
function extractRGBFromString(rgbString) {
    const regex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
    const matches = rgbString.match(regex);
      
    if (matches && matches.length === 4) {
        const r = parseInt(matches[1], 10);
        const g = parseInt(matches[2], 10);
        const b = parseInt(matches[3], 10);
      
        return rgbToHex(r, g, b);
    }
      
    return null;
    // To convert from rgb to hex
    function rgbToHex(r, g, b) {
        function toHex(num) {
            const hex = num.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
  
        const hexR = toHex(r);
        const hexG = toHex(g);
        const hexB = toHex(b);
  
        return `#${hexR}${hexG}${hexB}`;
    }
}
