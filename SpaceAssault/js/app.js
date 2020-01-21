var requestAnimFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();


// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// The main game loop
var lastTime;
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
};

function init() {
    terrainPattern = ctx.createPattern(resources.get('img/terrain.png'), 'repeat');

    document.getElementById('play-again').addEventListener('click', function() {
        reset();
    });

    reset();
    lastTime = Date.now();
    main();
}

resources.load([
    'img/sprites.png',
    'img/terrain.png',
    'img/sprites_02.png'
]);
resources.onReady(init);

// Game state
var player = {
    pos: [0, 0],
    sprite: new Sprite('img/sprites.png', [0, 0], [39, 36], 16, [0, 1])
};
 

var bullets = [];
var enemies = [];
var explosions = [];
var megaliths = [];
var manna = [];



function getNewPosition(){
    var pos = [];
    pos[0] = Math.random()*(canvas.width-90);
    pos[1] = Math.random()*(canvas.height-90);
    return pos;
}


function randomInteger() {
    var min = 4;
    var max = 8;
    
    let rand = min  + Math.random() * (max - min);
    return Math.round(rand);
}

function SpawnManna(number){
         
        sprite = new Sprite('img/sprites_02.png',[0,160], [55,45], 0.5, [0, 1]);
        pos = getNewPosition();
        var flag = false;
        
        while(number>0){ 
            while(!flag){
                for(var i=0;i<manna.length;i++){
                    if(boxCollides(manna[i].pos, sprite.size, pos, sprite.size)){
                        flag = true;
                         
                    } 
                }
                for(var j=0;j<megaliths.length;j++){
                    if(boxCollides(megaliths[j].pos, megaliths[j].sprite.size, pos, sprite.size)){
                        flag=true;
                        
                    }
                }
                if(!boxCollides(player.pos, player.sprite.size, pos, sprite.size) && flag === false){
                        manna.push({
                        pos:pos,
                        sprite: sprite
                        });
                        flag=true;
                }else{
                    pos = getNewPosition();
                    flag = false;
                }
            }
            flag = false;
            
            pos = getNewPosition();
            number--;

               
    }
}

function getMegalithsSprite(){
    
    var i = Math.random();
    var sprite;
    if (i>0.5){
        sprite = new Sprite('img/sprites_02.png', [0, 200], [57, 65]);
    }else{
        sprite = new Sprite('img/sprites_02.png', [0, 268], [53, 60]);
    }

    return sprite;
}


function SpawnMegaliths(number){
     
    pos = getNewPosition();
    sprite = getMegalithsSprite();

    var flag = false;
    number++;
    while(number>0){
      
        while(!flag){
 
            for(var i=0;i<megaliths.length;i++){
                if(boxCollides(megaliths[i].pos, sprite.size, pos, sprite.size)){
                    flag=true;
                    
                }
             }
        if(!boxCollides(player.pos, player.sprite.size, pos, sprite.size) && flag == false){   

            megaliths.push({
                pos:pos,
                sprite: sprite
            });
            flag = true; 
       } else{
        pos = getNewPosition();}
      }
     
    flag = false;
    pos = getNewPosition();
    sprite = getMegalithsSprite();
    number--;
    }
    
}

  



 

var lastFire = Date.now();
var gameTime = 0;
var isGameOver;
var terrainPattern;
  
var score = 0;
var count = 0;
var countEl = document.getElementById('count');
var scoreEl = document.getElementById('score');


// Speed in pixels per second
var playerSpeed = 200;
var bulletSpeed = 500;
var enemySpeed = 100;

  // Update game objects
function update(dt) {
    gameTime += dt; 
   
    checkEnemeisBounds();
    handleInput(dt);
    updateEntities(dt);
          
    // It gets harder over time by adding enemies using this
    // equation: 1-.993^gameTime
  if(Math.random() < 1 - Math.pow(.993, gameTime)) {
        enemies.push({
            pos: [canvas.width,
                  Math.random() * (canvas.height - 39)],
            sprite: new Sprite('img/sprites.png', [0, 78], [80, 38],
                               6, [0, 1, 2, 3, 2, 1])
        });
   }
 

    
    
    checkCollisions(dt);
 
    scoreEl.innerHTML = score;
    countEl.innerHTML = count;
};

function handleInput(dt) {
    if(input.isDown('DOWN') || input.isDown('s')) {
        player.pos[1] += playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) {
        player.pos[1] -= playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        player.pos[0] -= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.pos[0] += playerSpeed * dt;
    }

    if(input.isDown('SPACE') &&
       !isGameOver &&
       Date.now() - lastFire > 100) {
        var x = player.pos[0] + player.sprite.size[0] / 2;
        var y = player.pos[1] + player.sprite.size[1] / 2;

        bullets.push({ pos: [x, y],
                       dir: 'forward',
                       sprite: new Sprite('img/sprites.png', [0, 39], [18, 8]) });
        bullets.push({ pos: [x, y],
                       dir: 'up',
                       sprite: new Sprite('img/sprites.png', [0, 50], [9, 5]) });
        bullets.push({ pos: [x, y],
                       dir: 'down',
                       sprite: new Sprite('img/sprites.png', [0, 60], [9, 5]) });

        lastFire = Date.now();
    }
}

function updateEntities(dt) {
    // Update the player sprite animation
    player.sprite.update(dt);
    for(var i = 0; i<manna.length;i++){
        manna[i].sprite.update(dt);
    }
    // Update all the bullets
    for(var i=0; i<bullets.length; i++) {
        var bullet = bullets[i];

        switch(bullet.dir) {
        case 'up': bullet.pos[1] -= bulletSpeed * dt; break;
        case 'down': bullet.pos[1] += bulletSpeed * dt; break;
        default:
            bullet.pos[0] += bulletSpeed * dt;
        }

        // Remove the bullet if it goes offscreen
        if(bullet.pos[1] < 0 || bullet.pos[1] > canvas.height ||
           bullet.pos[0] > canvas.width) {
            bullets.splice(i, 1);
            i--;
        }
    }
         

    // Update all the enemies
    for(var i=0; i<enemies.length; i++) {
        enemies[i].pos[0] -= enemySpeed * dt;
        enemies[i].sprite.update(dt);

        // Remove if offscreen
        if(enemies[i].pos[0] + enemies[i].sprite.size[0] < 0) {
            enemies.splice(i, 1);
            i--;
        }
    }

    // Update all the explosions
    for(var i=0; i<explosions.length; i++) {
        explosions[i].sprite.update(dt);

        // Remove if animation is done
        if(explosions[i].sprite.done) {
            explosions.splice(i, 1);
            i--;
        }
    }
}

// Collisions

function checkMannaCount(){
    if(manna.length<4)
    {
    updateManna(randomInteger());
    }
}
function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions(dt) {
     
    checkPlayerBounds();
    checkEnemeisBounds();
    

    for(var i=0;i<manna.length;i++){
        var pos = manna[i].pos;
        var size = manna[i].sprite.size;

        if(boxCollides(pos,size, player.pos, player.sprite.size))
        {
            manna.splice(i,1);
            i--;
            count +=1;
            explosions.push({
                pos:pos,
                sprite: new Sprite('img/sprites_02.png',[0,160], [55,45], 10, [0,1,2,3], null, true)
            });
            SpawnManna(1);
            break;
        }
    }


   
    
    for(var i=0; i<enemies.length; i++) {
        var pos = enemies[i].pos;
        var size = enemies[i].sprite.size;

        for(var j=0; j<bullets.length; j++) {
            var pos2 = bullets[j].pos;
            var size2 = bullets[j].sprite.size;

            if(boxCollides(pos, size, pos2, size2)) {
                 
                enemies.splice(i, 1);
                i--;
                score += 100;
                explosions.push({
                    pos: pos,
                    sprite: new Sprite('img/sprites.png',
                                       [0, 117],
                                       [39, 39],
                                       16,
                                       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                       null,
                                       true)
                });
                break;
            }
        }
        if(boxCollides(pos, size, player.pos, player.sprite.size)) {
            gameOver();
        }
    }
    
    for(var i=0; i<megaliths.length; i++) {
        var megalithPosition = megaliths[i].pos;
        var megalithSize = megaliths[i].sprite.size;

        for(var j=0; j<enemies.length; j++) {
            var enemyPosition = enemies[j].pos;
            var enemySize = enemies[j].sprite.size;
 
            if(boxCollides(megalithPosition, megalithSize, enemyPosition, enemySize)) {

                 var diffPos = Math.floor(Math.abs(enemyPosition[1]-megalithPosition[1]));
                 
         
                 if(diffPos>(megalithSize[1])/2){
                    
                    
                    enemies[j].pos[1] += (enemySpeed*dt) ;
                    enemies[j].pos[0] += (enemySpeed*dt)/2 ;
                   

                 }else{
                    enemies[j].pos[1] -= (enemySpeed*dt); 
                    enemies[j].pos[0] += (enemySpeed*dt)/2 ;
                    
                   

                    }

                 } 
     
            }

        } 


   


    for(var i=0; i<bullets.length; i++) {
        var pos = bullets[i].pos;
        var size = bullets[i].sprite.size;

        for(var j=0; j<megaliths.length; j++) {
            var megalithPosition = megaliths[j].pos;
            var megalithSize = megaliths[j].sprite.size;

            if(boxCollides(pos, size, megalithPosition, megalithSize)) {
                 
                bullets.splice(i, 1);
                i--;
                break;
            }
        }

    }
    for(var j=0; j<megaliths.length; j++) {
        var megalithPosition = megaliths[j].pos;
        var megalithSize = megaliths[j].sprite.size;
       
        

        if(boxCollides(player.pos, player.sprite.size, megalithPosition, megalithSize)) {
            
            
             var diffPos = Math.abs(player.pos[1]-megalithPosition[1]);
             var halfSpriteHeight = (megalithPosition[1])/2;
     
             if(diffPos>halfSpriteHeight){
              
                player.pos[1] += (playerSpeed )*(dt); 
                if((canvas.height-player.pos[1]) < (Math.abs(canvas.height - mega-megalithSize[1]))){
                    if(megaliths[j].pos[0]-player.pos[0]>0){
                        player.pos[0] -= playerSpeed*dt;
                    }else{ player.pos[0] += playerSpeed*dt;
    
                    }  player.pos[1] += (playerSpeed )*(dt);
                       player.pos[0] -= (playerSpeed*dt) ;
                }
             }else{
                if(player.pos[1] < (Math.abs(megalithPosition[1]-size2[1]))){
                  
                if(megaliths[j].pos[0]-player.pos[0]>0){
                    player.pos[0] -= playerSpeed*dt;
                }else{ player.pos[0] += playerSpeed*dt;

                }
                }
               player.pos[1] -= (playerSpeed )*(dt); 
               player.pos[0] -= (playerSpeed*dt) ;
                }
            
            
    }
             
               
        }

}

function checkEnemeisBounds(){
    for(var i = 0; i<enemies.length; i++){
        if(enemies[i].pos[1]<0){
          enemies.splice(i,1);
        
        }else if(enemies[i].pos[1] > canvas.height-5) {
            enemies.splice(i,1);
        }
    }
};
 
function checkPlayerBounds() {
    // Check bounds
    if(player.pos[0] < 0) {
        player.pos[0] = 0;
    }
    else if(player.pos[0] > canvas.width - player.sprite.size[0]) {
        player.pos[0] = canvas.width - player.sprite.size[0];
    }

    if(player.pos[1] < 0) {
        player.pos[1] = 0;
    }
    else if(player.pos[1] > canvas.height - player.sprite.size[1]) {
        player.pos[1] = canvas.height - player.sprite.size[1];
    }

  
}




// Draw everything
function render() {
    ctx.fillStyle = terrainPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render the player if the game isn't over
    if(!isGameOver) {
        renderEntity(player);
      
    }
    
    renderEntities(bullets);
    renderEntities(enemies);
    renderEntities(explosions);
    renderEntities(megaliths);
    renderEntities(manna);
    
};

function renderEntities(list) {
    for(var i=0; i<list.length; i++) {
        renderEntity(list[i]);
    }    
}

function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}

// Game over
function gameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
    isGameOver = true;
}

// Reset game to original state
function reset() {
  //  debugger;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    isGameOver = false;
    gameTime = 0;
    score = 0;
    count =0;
    megaliths = [];
    manna = [];
    enemies = [];
    bullets = [];
    
    player.pos = [30, canvas.height / 2];
    SpawnMegaliths(randomInteger());
    SpawnManna(randomInteger());
};
