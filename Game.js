let boxes = document.querySelectorAll(".Box");
let resetbtn = document.querySelector("#reset-btn");
let newGamebtn = document.querySelector("#new-btn");
let msgcontainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let modeSelect = document.querySelector("#mode-select");
let difficultySelect = document.querySelector("#difficulty-select");

let TurnO = true;
let count = 0;
let singlePlayer = false;
let difficulty = "easy"; // Default difficulty level

const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const resetGame = () => {
    TurnO = true;
    count = 0;
    enablebox();
    msgcontainer.classList.add("hide");
};

const aiMove = () => {
    if (difficulty === "easy") {
        makeRandomMove();
    } else if (difficulty === "medium") {
        if (!blockOrWinMove()) {
            makeRandomMove();
        }
    } else if (difficulty === "hard") {
        const bestMove = minimax([...boxes], "X", -Infinity, Infinity).index;
        boxes[bestMove].click();
    }
};

const blockOrWinMove = () => {
    // Check if AI can block the player or win
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        let boxA = boxes[a].innerText;
        let boxB = boxes[b].innerText;
        let boxC = boxes[c].innerText;

        if (boxA === "X" && boxB === "X" && boxC === "") {
            boxes[c].click();
            return true;
        }
        if (boxA === "X" && boxC === "X" && boxB === "") {
            boxes[b].click();
            return true;
        }
        if (boxB === "X" && boxC === "X" && boxA === "") {
            boxes[a].click();
            return true;
        }

        if (boxA === "O" && boxB === "O" && boxC === "") {
            boxes[c].click();
            return true;
        }
        if (boxA === "O" && boxC === "O" && boxB === "") {
            boxes[b].click();
            return true;
        }
        if (boxB === "O" && boxC === "O" && boxA === "") {
            boxes[a].click();
            return true;
        }
    }
    return false;
};

const makeRandomMove = () => {
    let availableBoxes = [];
    boxes.forEach((Box, index) => {
        if (Box.innerText === "") availableBoxes.push(index);
    });
    const randomIndex = availableBoxes[Math.floor(Math.random() * availableBoxes.length)];
    boxes[randomIndex].click();
};

const minimax = (board, player, alpha, beta) => {
    let availableSpots = [];
    board.forEach((Box, index) => {
        if (Box.innerText === "") availableSpots.push(index);
    });

    if (checkWinner(board, "O")) {
        return { score: -10 };
    } else if (checkWinner(board, "X")) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availableSpots.length; i++) {
        let move = {};
        move.index = availableSpots[i];
        board[availableSpots[i]].innerText = player;

        if (player === "X") {
            let result = minimax(board, "O", alpha, beta);
            move.score = result.score;
            alpha = Math.max(alpha, move.score);
        } else {
            let result = minimax(board, "X", alpha, beta);
            move.score = result.score;
            beta = Math.min(beta, move.score);
        }

        board[availableSpots[i]].innerText = "";
        moves.push(move);

        if (beta <= alpha) {
            break; // Alpha-beta pruning
        }
    }

    let bestMove;
    if (player === "X") {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
};

const checkWinner = (board, player) => {
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        if (board[a].innerText === player && board[b].innerText === player && board[c].innerText === player) {
            return true;
        }
    }
    return false;
};

boxes.forEach((Box) => {
    Box.addEventListener("click", () => {
        if (Box.innerText !== "") return;

        if (TurnO) {
            Box.innerText = "O";
            TurnO = false;
        } else {
            Box.innerText = "X";
            TurnO = true;
        }
        Box.disabled = true;
        count++;

        if (checkWinner(boxes, Box.innerText)) {
            showWinner(Box.innerText);
        } else if (count === 9) {
            msg.innerText = "Game was a Draw.";
            msgcontainer.classList.remove("hide");
            disablebox();
        }

        if (!TurnO && singlePlayer && !checkWinner(boxes, Box.innerText)) {
            setTimeout(aiMove, 200); // Reduced delay to make AI faster
        }
    });
});

modeSelect.addEventListener("change", (e) => {
    singlePlayer = e.target.value === "single";
    difficultySelect.classList.toggle("hide", !singlePlayer);
    resetGame();
});

difficultySelect.addEventListener("change", (e) => {
    difficulty = e.target.value;
    resetGame();
});

const disablebox = () => {
    boxes.forEach((Box) => Box.disabled = true);
};

const enablebox = () => {
    boxes.forEach((Box) => {
        Box.disabled = false;
        Box.innerText = "";
    });
};

const showWinner = (WINNER) => {
    msg.innerText = `Congratulations! Winner is ${WINNER}`;
    msgcontainer.classList.remove("hide");
    disablebox();
};

newGamebtn.addEventListener("click", resetGame);
resetbtn.addEventListener("click", resetGame);
