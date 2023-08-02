// Реальний розмір координтної площини ігрового поля
const COORDINATES_MAX_X = 289;
const COORDINATES_MAX_Y = 141;

// Зменшення швидкості руху по вертикалі для урівняння швидкостей
const verticalSpeedCoef = 2;

// Представлення сегменту змійки 
function Segment(x, y){
    this.x = x;
    this.y = y;
}

// Зюереження усіх сегментів змійки
let snake = {
    directionX: 0,
    directionY: 0,
    segments: [
        new Segment(7, 7),
        new Segment(7, 14)
    ]
}

// На полі може бути лише один фрукт, після того як його з'їсть змія створиться новий
let food = new Segment(0, 0);

// Контейнер з грою
const game = document.querySelector('#game-container');
const context = game.getContext('2d');

// Перевірка чи треба змінювати напрямок змії при кожному натисканні клавіші
document.addEventListener('keydown', (event) => {
    changeSnakeDirection(event.code);
});

// Об'єкт конфігурації гри
const config = {
    // Щирина поля
    height: 500,
    width: 500,
    // Зміна розмірів поля для гри
    setResolution: function (size) {
        if (isNaN(size)) {
            console.error("NaN argument error");
            return;
        }
        if (size < 200 || size > 690) {
            console.error("Resolution is not allowed [min = 200, max = 690]");
            return;
        }
        this.height = size;
        this.width = size;
        game.style.width = this.width + "px";
        game.style.height = this.height + "px";
    },
    // Ігрові характеристики та рахунок
    //gameSpeed: 200,
    gameRunning: false,
    gameStarted: false,
    playerScore: 0,
    scoreCost: 10,
    cellSize: 7,
    
    // Стилізація
    mainColor: 'rgb(0, 12, 33)',
    secondaryColor: 'rgb(256, 256, 256)',

    // Бінди
    movement: { UP: 'KeyW', DOWN: 'KeyS', LEFT: 'KeyA', RIGHT: 'KeyD' },
    pause: 'Space',
    // Зміна конфігурованої кнопки для паузи гри 
    changePauseButton: function (keyPressed){
        this.pause = keyPressed;
    }
}

startGame();

// Задання стартових параметрів гри
function startGame () {
    config.gameRunning = true;
    config.gameStarted = true;
    config.playerScore = 0;
    snake.directionX = config.cellSize;
    spawnFood();
    drawFood();
    executeFrame();
}
// Виконання усіх дій, необхідних для показу та роботи одного кадру гри
function executeFrame() {
    if (config.gameRunning) {
        setTimeout(() => {
            clearField();
            drawFood();
            moveSnake();
            if (checkGameOver()){
                clearField();
                config.gameRunning = false;
                config.gameStarted = false;
                return;
            } 
            drawSnake();
            executeFrame();
        }, 75);
    }
}
// Виконання руху змійки
function moveSnake () {
    // Рухаю змійку вперед на 1 клітинку додаючи новий сегмент з відповідними координатами
    const headMove = new Segment (
        snake.segments[0].x + snake.directionX,
        snake.segments[0].y + snake.directionY
    );
    snake.segments.unshift(headMove);
    // Якщо відбувся перетин з фруктом
    if (snake.segments[0].x == food.x && snake.segments[0].y == food.y){
        // Додаю нагороду за фрукт та створюю новий
        config.playerScore += config.scoreCost;
        spawnFood();
    }
    // Не відбулося перетину тому просто відкидаю сегмент з хвостом (ніби роблячи крок вперед на 1 координату)
    else{
        snake.segments.pop();
    }
}
// Управління змійкою залежно від натиснутої кнопки
function changeSnakeDirection (keyPressed) {
    if (config.gameStarted){
        switch(keyPressed) {
            // Ліворуч
            case config.movement.LEFT:
                snake.directionX = snake.directionX > 0 ? config.cellSize : -config.cellSize;
                snake.directionY = 0;
                break;
            // Праворуч
            case config.movement.RIGHT:
                snake.directionX = snake.directionX < 0 ? -config.cellSize : config.cellSize;
                snake.directionY = 0;
                break;
            // Вверх
            case config.movement.UP:
                snake.directionX = 0;
                snake.directionY = snake.directionY > 0 ? config.cellSize : -config.cellSize;
                break;
            // Вниз
            case config.movement.DOWN:
                snake.directionX = 0;
                snake.directionY = snake.directionY < 0 ? -config.cellSize : config.cellSize;
                break;
            // Пауза
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
}
// Функція створення їжі 
function spawnFood () {
    // Додаткова функція для задання позиції їжі відповідно до розміру поля
    function createRandomFood(boardSize){
        return Math.floor(Math.random() * boardSize / 10) * config.cellSize;
    }
    do {
        // Задаю нові координати для їжі
        food.x = createRandomFood(config.width - config.cellSize);
        food.y = createRandomFood(config.height - config.cellSize);
        //TODO: Виправити це 
    } while(food.x > COORDINATES_MAX_X || food.y > COORDINATES_MAX_Y);

}

// Перевірка на те чи виконується умова завершення гри
function checkGameOver () {
    // Перетин початку ігрової площі
    let startOfField = snake.segments[0].x < 0 || snake.segments[0].y < 0;
    // Перетин кінця ігрової площі 
    let endOfField = snake.segments[0].x >= COORDINATES_MAX_X || snake.segments[0].y >= COORDINATES_MAX_Y;
    // Якщо змія не перетинає себе, то переходим до перевірки виходу за межі поля
    for (let i = 1; i < snake.segments.length; i++){
        // Якщо голова перетинає хоча б 1 сегмент із хвоста
        if (snake.segments[i].x == snake.segments[0].x && snake.segments[i].y == snake.segments[0].y)
            return true;
    }
    return startOfField || endOfField;
}

// Малювання їжі
function drawFood () {
    context.strokeStyle = config.secondaryColor;
    context.strokeRect(food.x, food.y, config.cellSize, config.cellSize - verticalSpeedCoef);
}
// Малювання змійки по кожному сегменту
function drawSnake () {
    context.fillStyle = config.secondaryColor;
    context.strokeStyle = config.mainColor;
    //Цикл малювання кожного сегмента змійки
    snake.segments.forEach(segment => {
        context.fillRect(segment.x, segment.y, config.cellSize, config.cellSize);
        context.strokeRect(segment.x, segment.y, config.cellSize, config.cellSize);
    });
}
// Очищення ігрового поля
function clearField () {
    context.fillStyle = config.mainColor;
    context.fillRect(0, 0, config.width, config.height);
}