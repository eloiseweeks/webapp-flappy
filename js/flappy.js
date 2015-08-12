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
var pipeInterval = 1.4;
var gapSize = 100;
var gapMargin = 50;
var blockHeight = 50;
var balloons = [];
var weights = [];
var width = 790;
var height = 400;


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

        game.stage.setBackgroundColor("000000");
        game.add.text(40, 30, "Welcome to my game!",
            {font: "25px Times New Roman", fill: "#FFFFFF"});
        labelScore = game.add.text(700, 20, "0");
        player = game.add.sprite(100, 200, "playerImg");
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.enable(player);
        // set the player's gravity
        player.body.gravity.y = 230;
        // associate spacebar with jump function
        game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(playerJump);
        game.time.events.loop(pipeInterval * Phaser.Timer.SECOND, generate);
        player.anchor.setTo(0.5, 0.5);

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
        changeScore();
    }

    function playerJump() {
        player.body.velocity.y = -180;
    }

    function changeScore() {
        score++;
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
    var bonus = game.add.sprite(width, height, "weights");
    weights.push(bonus);
    game.physics.arcade.enable(bonus);
    bonus.body.velocity.x = - 200;
    bonus.body.velocity.y = game.rnd.integerInRange(60,100);
}
function generate() {
    var diceRoll = game.rnd.integerInRange(1, 10);
    if(diceRoll==1) {
        generateBalloons();
    } else if(diceRoll==2) {
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


    function update() {
        game.physics.arcade
            .overlap(player,
            pipes,
            gameOver);

        if (player.y < 0 || player.y > 400) {
            gameOver();
        }
        player.rotation = Math.atan(player.body.velocity.y / 200);
    }

