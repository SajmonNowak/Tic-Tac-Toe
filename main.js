const DOM = (() => {

    const allOptionButtons = document.querySelector('.playerContainer').querySelectorAll('button');
    const startPage = document.getElementById('startPage');
    const gamePage = document.getElementById('mainGameDiv');
    const player1ScoreBoard = document.getElementById('score1');
    const player2ScoreBoard = document.getElementById('score2');
    const gameConsole = document.getElementById('consoleDiv');
    const fieldElements = document.querySelectorAll('.fieldDiv');

    const activateOption = (e) => {
        e.target.parentNode.querySelectorAll('Button').forEach( button =>{
            button.classList.remove('active');
        });
        e.target.classList.add('active');
        checkDifficulty(e);
    }

    const checkDifficulty = (e) => {
        if (e.target.textContent == 'Computer'){
            e.target.parentNode.querySelector('.diffDiv').style.display = 'flex';
        } else {
            e.target.parentNode.querySelector('.diffDiv').style.display = 'none';
            return;
        }
    }

    const getActiveOptions = () => {
        let activePlayerOptions = document.querySelectorAll('.playerButton.active');
        let activeDifficulty1 = document.querySelectorAll('.diff1.active')[0];
        let activeDifficulty2 = document.querySelectorAll('.diff2.active')[0];
    
        if (activeDifficulty1 != undefined){
            activeDifficulty1 = activeDifficulty1.textContent;
        } else {
            activeDifficulty1 = 'Not a computer';
        }

        if (activeDifficulty2 != undefined){
            activeDifficulty2 = activeDifficulty2.textContent;
        } else {
            activeDifficulty2 = 'Not a computer';
        }

       return {
       playerOption1: activePlayerOptions[0].textContent,
       playerOption2: activePlayerOptions[1].textContent,
       activeDifficulty1,
       activeDifficulty2
        }
    }

    const closeStartpage = () => {
        startPage.style.display = 'none';
        gamePage.style.display = 'block';
    }
    
    const setConsoleMessage = (message) => {
        gameConsole.innerHTML = message;
    } 

    const updateScore = (winner) => {
        if (winner.getSign() == 'X'){
        player1ScoreBoard.textContent = `Player 1 (X): ${winner.getScore()}`
        } else {
        player2ScoreBoard.textContent = `Player 2 (O): ${winner.getScore()}`
        }
    }

    const updateTurnMessage = () => {
        setConsoleMessage(`It is ${controller.getCurrentPlayerSign()}'s turn`)
    }

    const doAnimation = (field) => {
        fieldElements[field].querySelector('span').classList.add('animation');
    }
    
    const removeAnimations = () => {
        for (i=0; i<8; i++){
            fieldElements[i].querySelector('span').classList.remove('animation');
        }
    }

    allOptionButtons.forEach(button => {
        button.addEventListener('click', activateOption);
    })


    return {
        playButton : document.getElementById('playButton'),
        restartButton : document.getElementById('restartButton'),
        fieldElements,
        gamePage,
        getActiveOptions,
        closeStartpage,
        updateScore,
        updateTurnMessage,
        setConsoleMessage,
        doAnimation,
        removeAnimations,
    }

})();


const Player = (sign) => {
    let _sign = sign;
    let _type = "No type";
    let _difficulty = 'Not a computer';
    let _score = 0;

    const getSign = () =>  _sign;
    const setSign = (sign) => _sign = sign;
    const getType = () => _type;
    const setType = (type) => _type = type;
    const getDifficulty = () => _difficulty;
    const setDifficulty = (difficulty) => _difficulty = difficulty; 
    const getScore = () => _score;
    const increaseScore = () => _score ++;
    

    return{ getSign, setSign, getType, setType, getDifficulty, setDifficulty, getScore, increaseScore }
}


const gameBoard = (() => {

    const _board = ['','','','','','','','','']

    const setField = (index, sign) => {
        _board[index] = sign;
    }

    const getField = (index) => {
        return _board[index];
    }

    const getBoard = () => _board;

    const reset = () => {
        for (let i=0; i<9; i++){
            gameBoard.setField(i, '');
        }
        createGameBoard();
        DOM.removeAnimations();
        DOM.updateTurnMessage();
    }

    const createGameBoard = () =>{
        for (let i = 0; i < 9; i++) {
            DOM.fieldElements[i].querySelector('span').textContent = gameBoard.getField(i);
          }
    }

    const getEmptyFields = () => {
        let emptyFields = [];
        for (let i=0; i<9; i++){
            if(getField(i) == ''){
                emptyFields.push(i);
            }
        }
        return emptyFields;
    }

    return {setField, getField, reset, createGameBoard, getBoard, getEmptyFields,}
})();


const controller = (() => {

    const player1 = Player('X');
    const player2 = Player('O');
    let round = 1;
    let _gameEnded = false;

    const getGameEnded = () => _gameEnded;
    

    const initialiseGame = () => {
        setPlayerTypes();
        DOM.closeStartpage();
        checkComputerTurn();
    }

    const setPlayerTypes= () => {
        choice = DOM.getActiveOptions();
        player1.setType(choice.playerOption1);
        player2.setType(choice.playerOption2);
        player1.setDifficulty(choice.activeDifficulty1);
        player2.setDifficulty(choice.activeDifficulty2);
    }

    const getCurrentPlayerTurn = () => {
        if (round%2 == 1){
            return player1;
        } else {
            return player2;
        }
    }

    const getCurrentPlayerSign = () => {
       return getCurrentPlayerTurn().getSign();
    }

    const getNotCurrentPlayerSign = () => {
        if (getCurrentPlayerSign() == 'X'){
            return 'O';
        } else {
            return 'X';
        }
    }

    const playRound = (fieldIndex) => {
        gameBoard.setField(fieldIndex, getCurrentPlayerSign());
        round ++;
        gameBoard.createGameBoard();
        DOM.doAnimation(fieldIndex);
        DOM.updateTurnMessage();
        endGame(checkForWinner(gameBoard));
        checkComputerTurn();
    }

    const checkComputerTurn = () => {
        if (getGameEnded() == false && getCurrentPlayerTurn().getType() == 'Computer'){
            if (getCurrentPlayerTurn().getDifficulty() == 'Easy'){
                AI.randomChoice();
            } else {
                AI.minimax();
            }
        }
    }


    const checkForWinner = (board) => {
        const winnerPatterns = [
            [0,1,2], [3,4,5], [6,7,8], [0,4,8],
            [0,3,6], [1,4,7], [2,5,8], [2,4,6]
        ]

        let x = [];
        let o = [];
        
        for (i=0; i<9; i++){
            if (board.getField(i) == 'X'){
                x.push(i);
            } 
            if (board.getField(i) == 'O'){
                o.push(i);
            };
        }

        for (i=0; i<8; i++){
            if (winnerPatterns[i].every(number => x.includes(number))){
                return player1;
            }
        
            if (winnerPatterns[i].every(number => o.includes(number))){
                return player2;
            }
        }
 
        if (!(board.getBoard().some(element => element == ''))){
            return 'tie';
        }
    }

    const endGame = (winner) => {
        if (winner == undefined){
            return;
        }

        if (winner == 'tie'){
        DOM.setConsoleMessage("Tie! <br /> Click on the gamefield for new round");
        } else {
        DOM.setConsoleMessage(`${winner.getSign()} wins! <br /> Click on the gamefield for new round`);
        updateScore(winner);
        }
        _gameEnded = true;
    }
    
    const updateScore = (winner) => {
        winner.increaseScore();
        DOM.updateScore(winner);
    }

    DOM.restartButton.addEventListener('click', () => location.reload());
    DOM.playButton.addEventListener('click', initialiseGame);
    DOM.fieldElements.forEach( field => field.addEventListener('click', (e) => {
        if (getGameEnded() == true){
            round = 1;
            gameBoard.reset();
            _gameEnded = false;
            checkComputerTurn();
        } else {
            if (gameBoard.getField(e.target.dataset.index) != ''){
                return;
            }
            playRound(Number(e.target.dataset.index));
        }
    }))

    return {
        getGameEnded,
        getCurrentPlayerSign,
        getNotCurrentPlayerSign,
        checkForWinner,
        playRound,
    }

})();


const AI = (() => {

    const randomChoice = () => {
        let randomNumber = Math.floor(Math.random()*gameBoard.getEmptyFields().length);
        let randomIndex = gameBoard.getEmptyFields()[randomNumber];
        setTimeout(controller.playRound, 500, randomIndex);
    }

    const minimax = () => {
        let bestScore = -Infinity;
        let bestIndex;

        function giveScore(result) {
            if('tie' == result){
                return 0;
            } else {
                if (controller.getCurrentPlayerSign() == result.getSign()){
                    return 1;
                } else {
                    return -1;
                }
            }
        }

        BestMove();

        function BestMove () {
            for (let i=0; i<9; i++){
                if (gameBoard.getField(i) == ""){
                    gameBoard.setField(i, controller.getCurrentPlayerSign());
                    let score = minimaxAlgo(gameBoard, false);
                    gameBoard.setField(i, '');
                    if(score > bestScore){
                        bestScore = score;
                        bestIndex = i;
                    }
                }
            }
            setTimeout(controller.playRound,500, bestIndex);
        }


        function minimaxAlgo (newBoard, isMaximizing) {
            let result = controller.checkForWinner(newBoard);

            if (result != undefined){
                return giveScore(result);
            }

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i=0; i<9; i++){
                    if (newBoard.getField(i) == ''){
                        newBoard.setField(i, controller.getCurrentPlayerSign());
                        let score = minimaxAlgo(newBoard, false);
                        newBoard.setField(i, '');
                        bestScore = Math.max(bestScore, score);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i=0; i<9; i++){
                    if (newBoard.getField(i) == ''){
                        newBoard.setField(i, controller.getNotCurrentPlayerSign());
                        let score = minimaxAlgo(newBoard, true);
                        newBoard.setField(i, '');
                        bestScore = Math.min(bestScore, score);
                    }
                }
                return bestScore;
            }
        }
    };

    return { randomChoice, minimax,}
})();