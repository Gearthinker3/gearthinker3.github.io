let playerHand = [];
let dealerHand = [];
let playerTotal = 0;
let dealerTotal = 0;
let hiddenCardName = '';
let hiddenCardValue = 0;
let winTotal = 0;
let lossTotal = 0;
let gameInProgress = false; // prevents new deal mid-hand
let cardsDealt = false;     // prevents hit before deal

let sessionId = crypto.randomUUID(); // Unique session ID
let handId = 0;
let gameLogs = [];

let currentLog = {
    sessionId: sessionId,
    handId: handId,
    actions: [],
    playerCards: [],
    dealerCards: [],
    initialPlayerHand: [],
    initialDealerShown: [],
    initialDealerHidden: [],
    initialPlayerTotal: 0,
    initialDealerTotal: 0,
    result: '',
    timestamp: '',
};

class Deck {
    constructor() {
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        this.cards = [];
        this.buildDeck();
    }

    buildDeck() {
        this.cards = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                this.cards.push(`${rank}_of_${suit}`);
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        if (this.cards.length === 0) {
            this.buildDeck();
            this.shuffle();
        }
        return this.cards.pop();
    }
}

function getCardValue(cardName) {
    const rank = cardName.split('_of_')[0];
    if (rank === 'jack' || rank === 'queen' || rank === 'king') return 10;
    if (rank === 'ace') return 11;
    return parseInt(rank);
}

const gameDeck = new Deck();
gameDeck.shuffle();

function addCard() {
    if (!cardsDealt || !gameInProgress) return;

    const cardName = gameDeck.draw();
    playerHand.push(cardName);
    currentLog.actions.push('hit');
    currentLog.playerCards.push(cardName);
    playerTotal = calculateHandTotal(playerHand);

    const newCard = document.createElement("div");
    newCard.classList.add("card");

    const cardImg = document.createElement("img");
    cardImg.src = `images/${cardName}.png`;
    cardImg.classList.add("cardImage");

    newCard.appendChild(cardImg);
    document.querySelector(".player").appendChild(newCard);

    document.getElementById("playerTotalDisplay").innerText = `Player Total: ${playerTotal}`;

    if (playerTotal >= 21) checkGameResult();
}

function checkGameResult() {
    revealHiddenCard();

    setTimeout(() => {
        document.getElementById("dealerTotalDisplay").innerText = `Dealer Total: ${dealerTotal}`;

        let resultMsg = "";

        if (dealerTotal === 21 && playerTotal === 21) {
            resultMsg = "Push! It's a tie.";
            finalResult ="tie";
        } else if (playerTotal === 21) {
            winCounter();
            resultMsg = "Player wins with Blackjack!";
            finalResult ="win";
        } else if (dealerTotal === 21) {
            lossCounter();
            resultMsg = "Dealer wins with Blackjack.";
            finalResult ="loss";
        } else if (playerTotal > 21) {
            lossCounter();
            resultMsg = "Player busts! Dealer wins.";
            finalResult ="loss";
        } else if (dealerTotal > 21) {
            winCounter();
            resultMsg = "Dealer busts! Player wins.";
            finalResult ="win";
        } else if (playerTotal > dealerTotal) {
            winCounter();
            resultMsg = "Player wins!";
            finalResult ="win";
        } else if (dealerTotal > playerTotal) {
            lossCounter();
            resultMsg = "Dealer wins!";
            finalResult ="loss";
        } else {
            resultMsg = "Push! It's a tie.";
            finalResult ="tie";
        }

        // ✅ Set result text and show banner
        const resultBanner = document.querySelector(".resultBanner");
        resultBanner.innerText = resultMsg;
        resultBanner.style.display = "flex";

        sendGameLog(playerTotal, dealerTotal, finalResult)
        
        reset();
        gameInProgress = false;
        cardsDealt = false;
    }, 1000);
}

function dealCards() {
    handId++;
    currentLog = {
        sessionId,
        handId,
        actions: ['deal'],
        playerCards: [],
        dealerCards: [],
        initialPlayerHand: [],
        initialDealerShown: [],
        initialDealerHidden: [],
        initialPlayerTotal: 0,
        initialDealerTotal: 0,
        result: '',
        timestamp: '',
    };

    document.querySelector('.hiddenCard').style.background = '#d91717';

    playerHand = [];
    dealerHand = [];
    playerTotal = 0;
    dealerTotal = 0;

    document.querySelector(".player").style.display = "flex";
    document.querySelector(".dealer").style.display = "flex";
    document.querySelector(".playerHandIcon").style.display = "flex";
    document.querySelector(".dealerHandIcon").style.display = "flex";
    document.querySelector(".playerIcon").style.display = "flex";
    document.querySelector(".dealerIcon").style.display = "flex";

    const playerCard1 = gameDeck.draw();
    const playerCard2 = gameDeck.draw();
    const dealerCardShown = gameDeck.draw();
    const dealerCardHidden = gameDeck.draw();

    const cardOne = document.querySelector(".cardOne");
    const cardTwo = document.querySelector(".cardTwo");
    const dealerCardDiv = document.querySelector(".dealerCard");
    const hiddenCardDiv = document.querySelector(".hiddenCard");

    cardOne.innerHTML = '';
    cardTwo.innerHTML = '';
    dealerCardDiv.innerHTML = '';
    hiddenCardDiv.innerHTML = '';

    const img1 = document.createElement("img");
    img1.src = `images/${playerCard1}.png`;
    img1.classList.add("cardImage");
    cardOne.appendChild(img1);

    const img2 = document.createElement("img");
    img2.src = `images/${playerCard2}.png`;
    img2.classList.add("cardImage");
    cardTwo.appendChild(img2);

    const dealerImg = document.createElement("img");
    dealerImg.src = `images/${dealerCardShown}.png`;
    dealerImg.classList.add("cardImage");
    dealerCardDiv.appendChild(dealerImg);

    const backImg = document.createElement("img");
    backImg.src = `images/back.png`;
    backImg.classList.add("cardImage");
    hiddenCardDiv.appendChild(backImg);

    hiddenCardName = dealerCardHidden;
    hiddenCardValue = getCardValue(dealerCardHidden);

    playerHand.push(playerCard1, playerCard2);
    dealerHand.push(dealerCardShown, dealerCardHidden);

    // Set initial hands in currentLog
    currentLog.initialPlayerHand.push(playerCard1, playerCard2);
    currentLog.initialDealerShown.push(dealerCardShown);
    currentLog.initialDealerHidden.push(dealerCardHidden);

    playerTotal = calculateHandTotal(playerHand);
    dealerTotal = calculateHandTotal(dealerHand);

    currentLog.initialPlayerTotal = playerTotal;
    currentLog.initialDealerTotal = dealerTotal;

    document.getElementById("playerTotalDisplay").innerText = `Player Total: ${playerTotal}`;
    document.getElementById("dealerTotalDisplay").innerText = `Dealer Total: ?`;

    if (dealerTotal === 21 || playerTotal === 21) {
        checkGameResult();
    }
}

const dealButton = document.querySelector(".deal");

function showCardsAndDeal() {
    if (gameInProgress) return;

    gameInProgress = true;
    cardsDealt = true;

    dealButton.disabled = true; // disable deal during round

    document.querySelector(".hiddenCard").style.display = "flex";
    document.querySelector(".dealerCard").style.display = "flex";
    document.querySelector(".cardOne").style.display = "flex";
    document.querySelector(".cardTwo").style.display = "flex";

    dealCards();
}

dealButton.addEventListener("click", showCardsAndDeal);

function revealHiddenCard() {
    setTimeout(() => {
        document.getElementById("dealerTotalDisplay").innerText = `Dealer Total: ${dealerTotal}`;
        const hiddenCardDiv = document.querySelector(".hiddenCard");
        hiddenCardDiv.innerHTML = '';

        const revealImg = document.createElement("img");
        revealImg.src = `images/${hiddenCardName}.png`;
        revealImg.classList.add("cardImage");
        hiddenCardDiv.appendChild(revealImg);

        document.querySelector('.hiddenCard').style.background = 'white';
    }, 1000);
}

function standDraw() {
    if (!cardsDealt || !gameInProgress) return;
    currentLog.actions.push('stand');
    dealerTotal = calculateHandTotal(dealerHand);

    function drawNextCard() {
        
        if (dealerTotal < 17) {
            const cardName = gameDeck.draw();
            dealerHand.push(cardName);

            dealerTotal = calculateHandTotal(dealerHand);

            const newCard = document.createElement("div");
            newCard.classList.add("deltDealerCard");

            const cardImg = document.createElement("img");
            cardImg.src = `images/${cardName}.png`;
            cardImg.classList.add("cardImage");

            newCard.appendChild(cardImg);
            document.querySelector(".dealer").appendChild(newCard);

            document.getElementById("dealerTotalDisplay").innerText = `Dealer Total: ${dealerTotal}`;

            setTimeout(drawNextCard, 1000);
        } else {
            checkGameResult();
        }
    }

    setTimeout(drawNextCard, 2000);
}

function calculateHandTotal(hand) {
    let total = 0;
    let aceCount = 0;

    for (const card of hand) {
        const val = getCardValue(card);
        total += val;
        if (card.startsWith('ace')) aceCount++;
    }

    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
    }

    return total;
}

function winCounter() {
    winTotal += 1;
    document.getElementById("winTotalDisplay").innerText = `Win Total: ${winTotal}`;
}

function lossCounter() {
    lossTotal += 1;
    document.getElementById("lossTotalDisplay").innerText = `Loss Total: ${lossTotal}`;
}

function reset() {
    setTimeout(() => {
        gameDeck.buildDeck();
        gameDeck.shuffle();

        playerHand = [];
        dealerHand = [];
        playerTotal = 0;
        dealerTotal = 0;
        hiddenCardName = '';
        hiddenCardValue = 0;

        document.querySelectorAll('.card, .deltDealerCard').forEach(el => el.remove());

        document.querySelector(".cardOne").innerHTML = '';
        document.querySelector(".cardTwo").innerHTML = '';
        document.querySelector(".dealerCard").innerHTML = '';
        document.querySelector(".hiddenCard").innerHTML = '';

        document.querySelector(".player").style.display = "none";
        document.querySelector(".dealer").style.display = "none";
        document.querySelector(".resultBanner").style.display = "none";
        document.querySelector(".playerHandIcon").style.display = "none";
        document.querySelector(".dealerHandIcon").style.display = "none";

        document.getElementById("playerTotalDisplay").innerText = `Player Total: 0`;
        document.getElementById("dealerTotalDisplay").innerText = `Dealer Total: 0`;
        document.getElementById("result").innerText = ``;

        // ✅ Allow new deal again
        gameInProgress = false;
        cardsDealt = false;
        dealButton.disabled = false;

    }, 3000);
}

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (key === "d") {
        showCardsAndDeal();
    } else if (key === "h") {
        addCard();
    } else if (key === "s") {
        standDraw();
    }
});

function sendGameLog(playerTotal, dealerTotal, result) {
  fetch('https://blackjack-logger.onrender.com/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,  // generate once per browser session, e.g., crypto.randomUUID()
      player_total: playerTotal,
      dealer_total: dealerTotal,
      result: result // e.g., "win", "lose", "push"
    }),
  })
  .then(res => res.json())
  .then(data => console.log(data.message))
  .catch(err => console.error('Error logging game:', err));
}

