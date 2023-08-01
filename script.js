// Представлення сегменту змійки 
function Segment(x, y){
    this.x = x;
    this.y = y;
}
// Зюереження усіх сегментів змійки
let snake = [
    new Segment(10, 10),
    new Segment(10, 11)
]
// Контейнер з грою
const game = document.getElementById('game-container');

// Об'єкт конфігурації гри
const config = {
    // Щирина поля
    height: 500,
    width: 500,
    // Зміна розмірів поля для гри
    setResolution: function (height, width) {
        if (isNaN(height) || isNaN(width)) {
            console.error("NaN argument error")
            return;
        }
        if (height < 200 || width < 200 || height > 680) {
            console.error("Resolution is not allowed")
            return;
        }
        this.height = height;
        this.width = width;
        game.style.width = width + "px";
        game.style.height = height + "px";
    },
    // Ігрові характеристики та рахунок
    gameSpeed: 200,
    playerScore: 0,
    cellSize: 10,
    
}

function drawSnake () {
    game.innerHTML = "";
    //Цикл малювання кожного сегмента змійки
    snake.forEach(segment => {
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'snake-segment';
        // Задаю ширину та висоту для кожоного сегмента як вказану у конфігурації
        segmentDiv.style.width = config.cellSize + 'px';
        segmentDiv.style.height = config.cellSize + 'px';
        // Задаю позицію для даного сегмента
        segmentDiv.style.left = (segment.x * config.cellSize) + 'px';
        segmentDiv.style.top = (segment.y * config.cellSize) + 'px';

        game.appendChild(segmentDiv);
    });
}