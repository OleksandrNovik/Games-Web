// Представлення сегменту змійки 
function Segment(x, y){
    this.x = x;
    this.y = y;
}
// Зюереження усіх сегментів змійки
let snake = {
    directionX: 1,
    directionY: 0,
    segments: [
        new Segment(10, 10),
        new Segment(10, 17)
    ]
}

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
    gameSpeed: 200,
    playerScore: 0,
    cellSize: 7,
    
    // Стилізація
    mainColor: 'rgb(0, 12, 33)',
    secondaryColor: 'rgb(256, 256, 256)',

}
// Функція створення їжі 
function spawnFood () {
    // Додаткова функція для задання позиції їжі відповідно до розміру поля
    function createRandomFood(minc, maxc){
        return Math.round((Math.random() * (maxc - minc)) / config.cellSize);
    }
    return new Segment(
        createRandomFood(0, config.width - config.cellSize),
        createRandomFood(0, config.width - config.cellSize)
    );
}
// Малювання їжі
function drawFood (food){
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