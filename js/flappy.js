// the Game object used by the phaser.io library
var stateActions = { preload: preload, create: create, update: update };

// Phaser parameters:
// - game width
// - game height
// - renderer (go for Phaser.AUTO)
// - element where the game will be drawn ('game')
// - actions on the game state (or null for nothing)
var game = new Phaser.Game(790, 400, Phaser.AUTO, 'game', stateActions);
var score = 0;
var labelScore;
var player;
var pipes = [];
var pipeInterval = 1.1;
var gapSize = 100;
var gapMargin = 50;
var blockHeight = 50;
var balloons = [];
var weights = [];
var width = 790;
var height = 400;
var gameGravity = 230;
var lives = 3;
var labelLives;


jQuery("#greeting-form").on("submit", function(event_details) {
    event_details.preventDefault();

    jQuery.ajax(
        {url : '/score', type : 'post', data : jQuery("#greeting-form").serialize()}
    );

    var greeting = "Hello ";
    var name = jQuery("#fullName").val();
    var greeting_message = greeting + name;
    jQuery("#greeting").append("<p>" + greeting_message + "!" + "</p>");
    $("#greeting").hide();
    location.reload();
});

$.get("/score", function(scores) {
    //for (var i = 0; i < scores.length; i++) {
    scores.sort(function (scoreA, scoreB) {
        var difference = scoreB.score - scoreA.score;
        return difference;
    });
        for (var i = 0; i < 5; i++) {
            $("#scoreBoard").append(
                "<li>" +
                scores[i].name + ": " + scores[i].score +
                "</li>");
        }

});

    function preload() {

        game.load.image("playerImg", "../assets/flappy_frog.png");
        game.load.audio("score", "../assets/point.ogg");
        game.load.image("pipe", "../assets/pipe_mint.png");
        game.load.image("balloons", "../assets/balloons.png");
        game.load.image("weights", "../assets/weight.png");
    }


    function create() {

        game.stage.setBackgroundColor("#FAEBD7");
        labelScore = game.add.text(20, 20, "0");
        labelLives = game.add.text(120,360, "3");
        game.add.text(20,360,"Lives:");
        player = game.add.sprite(100, 200, "playerImg");
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.enable(player);
        // set the player's gravity
        player.body.gravity.y = gameGravity;
        // associate spacebar with jump function
        game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(playerJump);
        game.time.events.loop(pipeInterval * Phaser.Timer.SECOND, generate);
        player.anchor.setTo(0.5, 0.5);
        game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add(moveDown);
    }

    function addPipeBlock(x, y) {
        var block = game.add.sprite(x, y, "pipe");
        pipes.push(block);
        game.physics.arcade.enable(block);
        block.body.velocity.x = -200;
    }

    function generatePipe() {
        
        var gapStart = game.rnd.integerInRange(1, 5);
        for (var count = 0; count < 8; count++) {
            if (count != gapStart && count != gapStart + 1 && count != gapStart + 2) {
                addPipeBlock(750, count * 50);
            }
        }
        changeScore(1);
    }

    function playerJump() {
        player.body.velocity.y = -180;
    }

    function changeScore(scoredifference) {
        score = score + scoredifference;
        labelScore.setText(score.toString());
    }
function changeGravity(g) {
    gameGravity += g;
    player.body.gravity.y = gameGravity;
}
function generateBalloons(){
    var bonus = game.add.sprite(width, height, "balloons");
    balloons.push(bonus);
    game.physics.arcade.enable(bonus);
    bonus.body.velocity.x = - 200;
    bonus.body.velocity.y = - game.rnd.integerInRange(60,100);
}

function generateWeights(){
    var bonus = game.add.sprite(width, 0, "weights");
    weights.push(bonus);
    game.physics.arcade.enable(bonus);
    bonus.body.velocity.x = - 200;
    bonus.body.velocity.y =  game.rnd.integerInRange(40,70);
}
function moveDown() {
    player.y = player.y + 30
}

function generate() {
    var diceRoll = game.rnd.integerInRange(1, 10);
    if(diceRoll==1) {
        generateBalloons();
    } else if(diceRoll==2 || diceRoll==3) {
        generateWeights();
    } else {
        generatePipe();
    }
}
    function gameOver() {
        game.destroy();
        $("#score").val(score.toString());
        $("#greeting").show();
        gameGravity = 200;
    }

function checkBonus(bonusArray, scoredifference){
    for(var i=bonusArray.length - 1; i>=0; i--){
        game.physics.arcade.overlap(player,bonusArray[i], function(){
            changeScore(scoredifference);
            bonusArray[i].destroy();
            bonusArray.splice(i,1);
        });
    }
}
function loseALife() {

    labelLives.setText(lives.toString());
}

    function update() {
        game.physics.arcade
            .overlap(player,
            pipes,
            gameOver);

        if (player.y < 0 || player.y > 400) {
            gameOver();
        }
        player.rotation = Math.atan(player.body.velocity.y / 200);
        checkBonus(balloons, 3);
        checkBonus(weights, -5);
        if(score < 0){
            gameOver();
        }
        if(lives<0) {
            gameOver();
        }
    }

