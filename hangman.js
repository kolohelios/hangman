'use strict';

(function(){
  var arrayOfLettersPressed = [];
  var word = '';
  // hangmanStatus starts at 0, game will be over when it gets to be equal to the number of tries; -1 means the game is over
  var hangmanStatus = -1;
  var numberOfTries = 9;
  var lettersLeftToMatch = 0;
  var wins = 0;
  var losses = 0;
  // declare variables that will be used for functions
  var newGame, drawGfx, wordsAndRandomizer, updateWinsAndLossesDisplay, gameOver, displayButtonsForWord;
  var displayButtonsForCharacters, handleLetterFromKeyboard, showMessage, checkLetterForMatchesWithWordAndUpdateHangman;
  var changeCharButtonToRedOrGreen, updateHangmanStatusAndCheckForLostGame;

  $(document).ready(function(){
    newGame();
  });

  newGame = function(){
    hangmanStatus = 0;
    $('#wordIs').addClass('hidden');
    $('#canvas').fadeTo(0, 1);
    drawGfx('platform');
    arrayOfLettersPressed = [];
    wordsAndRandomizer();
    displayButtonsForWord(word.length);
    displayButtonsForCharacters();
    $('#triesLeft').text(numberOfTries - hangmanStatus);
    $('#tryAgain').addClass('hidden');
    // slideUp #alert to clear any sticky message
    $('#alert').slideUp();
    lettersLeftToMatch = word.length;
  };

  // listen for keypress event handler
  $(document).on('keypress', function(keyCharCode){
    var letter = String.fromCharCode(keyCharCode.which).toLowerCase();
    // look for only letters
    if(hangmanStatus > -1){
      if(letter.search(/[a-z]/) > -1){
        handleLetterFromKeyboard(letter);
      }else{
        showMessage('alert-danger', 'Please type a letter from the English alphabet.');
      }
    }else{
      // char code 13 is 'Enter' key
      if(keyCharCode.which === 13){
        newGame();
      }
    }
  });

  var flashTheWindowXTimes = function(times){
    for(; times > 0; times--){
      $('#contents').fadeOut(150).delay(50).fadeIn(150);
    }
  };

  handleLetterFromKeyboard = function(letter){
    if(arrayOfLettersPressed.indexOf(letter) > -1){
      showMessage('alert-warning', 'You\'ve already tried the letter ' + letter + '.');
    }else{
      arrayOfLettersPressed.push(letter);
      checkLetterForMatchesWithWordAndUpdateHangman(letter);
    }
  };

  showMessage = function(type, message, stickyMsg){
    stickyMsg = stickyMsg || 0;
    if(stickyMsg < 1){
      flashTheWindowXTimes(2);
    }
    // clean up from last message - otherwise higher precendent alert level will prevail
    $('#alert').removeClass('alert-danger', 'alert-warning', 'alert-success');
    $('#alert').find('span').text(message);
    $('#alert').slideDown().addClass(type);
    // don't slide up if the message should be sticky
    if(stickyMsg === 0){
      $('#alert').delay(2500);
      $('#alert').slideUp();
    }
  };

  drawGfx = function(drawElement){
    var canvas = document.getElementById('canvas');
    var gfx = canvas.getContext('2d');

    var drawLine = function(from, to, thickness){
      gfx.beginPath();
      gfx.lineWidth = thickness;
      gfx.moveTo(from[0], from[1]);
      gfx.lineTo(to[0], to[1]);
      gfx.stroke();
    };

    var drawCircle = function(xCenter, yCenter, size, color){
      gfx.beginPath();
      gfx.lineWidth = 1;
      gfx.strokeStyle = color;
      gfx.arc(xCenter, yCenter, size, 0, 2 * Math.PI);
      gfx.stroke();
    };

    var drawSunrays = function(color, offset){
      gfx.strokeStyle = color;
      var i = -60 + offset, j;
      for(; i < 150; i += 10){
        if(Math.abs(i) > 0){
          j = i * Math.PI + (i / 4);
        }else{
          j = i;
        }
        drawLine([65 - i, 5 + i], [135 - j, 55 + j]);
      }
    };

    var drawBodyPart = function(bodyPart, xOffset, yOffset){
      // offsets are from the top of the head
      switch(bodyPart){
        case ('head'):
          drawCircle(xOffset, yOffset + 15, 15, 'black');
          break;
        case ('torso'):
          drawLine([xOffset, yOffset + 30], [xOffset, yOffset + 100], 1);
          break;
        case 'leftArm':
          drawLine([xOffset, yOffset + 50], [xOffset - 20, yOffset + 80], 1);
          break;
        case 'rightArm':
          drawLine([xOffset, yOffset + 50], [xOffset + 20, yOffset + 80], 1);
          break;
        case 'rightLeg':
          drawLine([xOffset, yOffset + 100], [xOffset + 20, yOffset + 130], 1);
          break;
        case 'leftLeg':
          drawLine([xOffset, yOffset + 100], [xOffset - 20, yOffset + 130], 1);
          break;
        case 'leftEye':
          drawCircle(xOffset - 6, yOffset + 12, 2, 'black');
          break;
        case 'rightEye':
          drawCircle(xOffset + 6, yOffset + 12, 2, 'black');
          break;
        case 'frown':
          gfx.beginPath();
          gfx.lineWidth = 1;
          gfx.arc(xOffset, yOffset + 25, 4, 0, 1 * Math.PI, true);
          gfx.stroke();
          break;
        case 'smile':
          gfx.beginPath();
          gfx.lineWidth = 1;
          gfx.arc(xOffset, yOffset + 20, 4, 0, 1 * Math.PI);
          gfx.stroke();
      }
    };

    if(drawElement === 'platform'){
      gfx.clearRect(0, 0, canvas.width, canvas.height);
      gfx.strokeStyle = 'black';
      // platform
      drawLine([50, 250], [250, 250], 10);
      // post
      drawLine([100, 250], [100, 50], 5);
      // yardarm
      drawLine([100, 50], [180, 50], 5);
      // rope
      drawLine([180, 50], [180, 80], 3);
      // crossbar
      drawLine([140, 50], [100, 90], 4);
    }else if(drawElement === 'winScreen'){
      gfx.clearRect(0, 0, canvas.width, canvas.height);
      var sky = gfx.createLinearGradient(0, 0, 0, 300);
      sky.addColorStop(0, 'cornflowerblue');
      sky.addColorStop(1, 'cyan');
      gfx.fillStyle = sky;
      gfx.fillRect(0, 0, 300, 300);
      drawSunrays('yellow', 0);
      drawCircle(0, 0, 100, 'orange');
      gfx.fillStyle = 'orange';
      gfx.fill();
      drawSunrays('orange', 5);
      var grass = gfx.createLinearGradient(0, 0, 300, 50);
      grass.addColorStop(0, 'green');
      grass.addColorStop(1, 'lawngreen');
      gfx.fillStyle = grass;
      gfx.fillRect(0, 230, 300, 60);
      gfx.stroke;
      gfx.strokeStyle = 'black';
      ['head', 'torso', 'leftArm', 'rightArm', 'rightLeg', 'leftLeg', 'leftEye', 'rightEye', 'smile'].forEach(function(part){
        drawBodyPart(part, 180, 100);
      });
    }else if(drawElement === 'hangman'){
      var arrayOfBodyParts = ['head', 'torso', 'leftArm', 'rightArm', 'rightLeg', 'leftLeg', 'leftEye', 'rightEye', 'frown'];
      drawBodyPart(arrayOfBodyParts[hangmanStatus - 1], 180, 80);
    }else if(drawElement === 'clear'){
      gfx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  displayButtonsForWord = function(numberOfLetters){
    $('#wordButtons').empty();
    $('#wordButtons').append('<div class="btn-group" role="group">');
    for(var i = 0; i < numberOfLetters; i++){
      $('#wordButtons').append('<button class="btn btn-default">&nbsp;</button>');
    }
    $('#wordButtons').append('</div>');
  };

  checkLetterForMatchesWithWordAndUpdateHangman = function(letter){
    var match = false;
    word.split('').forEach(function(element, index){
      if(element === letter){
        match = true;
        changeCharButtonToRedOrGreen(letter, 'green');
        $('#wordButtons').find('button').eq(index).text(letter);
        lettersLeftToMatch--;
      }
    });
    if(match === false){
      changeCharButtonToRedOrGreen(letter, 'red');
      updateHangmanStatusAndCheckForLostGame();
    }else{
      if(lettersLeftToMatch === 0){
        showMessage('alert-success', 'YOU WON!!!', 1);
        wins++;
        updateWinsAndLossesDisplay();
        $('#canvas').fadeTo(2000, 0, function(){
          drawGfx('winScreen');
        });
        $('#canvas').fadeTo(2000, 1, function(){
          gameOver();
        });
      }
    }
  };

  updateHangmanStatusAndCheckForLostGame = function(){
    hangmanStatus++;
    $('#triesLeft').text(numberOfTries - hangmanStatus);
    drawGfx('hangman');
    if(hangmanStatus === numberOfTries){
      showMessage('alert-danger', 'You lost :(', 1);
      $('#wordIs').find('span').text(word);
      $('#wordIs').removeClass('hidden');
      losses++;
      updateWinsAndLossesDisplay();
      $('#canvas').fadeTo(2000, 0, function(){
        drawGfx('clear');
        gameOver();
      });
    }
  };

  wordsAndRandomizer = function(){
    // don't put any uppercase letters in these strings!
    var words = ['zoology', 'elephant', 'blue', 'jazz', 'buzz', 'javascript', 'grapple', 'test', 'hello', 'miff', 'muffin', 'zippy', 'dragon', 'jaguar', 'glass', 'fondu', 'house', 'beer', 'garden', 'salmon', 'leather', 'tulip', 'saison', 'computer', 'copper', 'cookie', 'fence', 'beer', 'guacamole', 'tortilla', 'carpet', 'steam', 'jeans', 'socks', 'calico', 'tabby', 'sneak', 'storage', 'buyer', 'astronomy', 'universal', 'couch', 'airplace', 'array', 'series', 'chickadee', 'thrush', 'captain', 'grandmother', 'shell', 'candle', 'microwave', 'refrigerator', 'cotton', 'glove', 'tomato', 'chicken', 'road', 'alder', 'mint', 'trash', 'keybaord', 'potato', 'convertible', 'pinecone', 'harbor', 'border', 'pond', 'pillow', 'neighbor', 'connection', 'electricity', 'neon', 'laptop', 'willow', 'auctioneer', 'pooch', 'foam', 'eagle', 'television', 'sideboard', 'table', 'lampshade', 'dredge', 'tomatillo', 'scab', 'follicle', 'goldfish', 'monster', 'mirror', 'aluminum', 'extrusion', 'zag', 'trouble', 'artillery', 'scabbarb', 'sword', 'satellite', 'disco', 'constrictor', 'pugnacious'];
    var randomIndex = Math.floor(Math.random() * (words.length - 0));
    word = words[randomIndex].toLowerCase();
  };

  displayButtonsForCharacters = function(){
    $('#charButtons').empty();
    $('#charButtons').append('<div class="btn-group" role="group">');
    for(var i = 97; i <= 122; i++){
      $('#charButtons').append('<button class="btn btn-default">' + String.fromCharCode(i) + '</button>');
    }
    $('#charButtons').append('</div>');
  };

  changeCharButtonToRedOrGreen = function(letter, color){
    var buttonStyle = (color === 'green') ? 'btn-success' : 'btn-danger';
    var buttonToSet = $('#charButtons').find('button:contains(' + letter + ')');
    buttonToSet.addClass(buttonStyle);
  };

  gameOver = function(){
    hangmanStatus = -1;
    $('#tryAgain').removeClass('hidden');
    $('#tryAgain').fadeOut(1000).delay(50).fadeIn(200);
  };

  updateWinsAndLossesDisplay = function(){
    $('#wins').text(wins);
    $('#losses').text(losses);
  };
})($);
