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
        new Segment(10, 10),
        new Segment(10, 17)
    ]
}

// На полі може бути лише один фрукт, після того як його з'їсть змія створиться новий
let food = new Segment(0, 0);

// Контейнер з грою
const game = document.querySelector('#game-container');
const context = game.getContext('2d');

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
    playerScore: 0,
    scoreCost: 10,
    cellSize: 7,
    
    // Стилізація
    mainColor: 'rgb(0, 12, 33)',
    secondaryColor: 'rgb(256, 256, 256)',

    // Бінди
    movement: { UP: 87, DOWN: 83, LEFT: 65, RIGHT: 68 }
}

startGame();

// Задання стартових параметрів гри
function startGame () {
    config.gameRunning = true;
    config.playerScore = 0;
    snake.directionX = config.cellSize;
    spawnFood();
    drawFood();
    executeFrame();
}
//
function executeFrame() {
    if (config.gameRunning){
        moveSnake();
        // перевірка на перетин з полем 
        drawSnake();
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
    switch(keyPressed) {
        // Ліворуч
        case config.movement.LEFT:
            snake.directionX = -config.cellSize;
            snake.directionY = 0;
            break;
        // Праворуч
        case config.movement.RIGHT:
            snake.directionX = config.cellSize;
            break;
        // Вверх
        case config.movement.UP:
            snake.directionX = 0;
            snake.directionY = -config.cellSize;
            break;
        // Вниз
        case config.movement.DOWN:
            snake.directionX = 0;
            snake.directionY = config.cellSize;
            break; 

    }
}
// Функція створення їжі 
function spawnFood () {
    // Додаткова функція для задання позиції їжі відповідно до розміру поля
    function createRandomFood(minc, maxc){
        return Math.round((Math.random() * (maxc - minc)) / config.cellSize);
    }
    // Задаю нові координати для їжі
    food.x = createRandomFood(0, config.width - config.cellSize);
    food.y = createRandomFood(0, config.width - config.cellSize);
}
// Малювання їжі
function drawFood () {
    context.fillStyle = config.secondaryColor;
    context.fillRect(food.x, food.y, config.cellSize, config.cellSize);
}
// Малювання змійки по кожному сегменту
function drawSnake () {
    context.strokeStyle = config.secondaryColor;
    //Цикл малювання кожного сегмента змійки
    snake.segments.forEach(segment => {
        context.strokeRect(segment.x, segment.y, config.cellSize, config.cellSize);
    });
}
// Очищення ігрового поля
function clearField () {
    context.fillStyle = config.mainColor;
    context.fillRect(0, 0, config.width, config.height);
}