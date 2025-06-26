import makeEventListener from './makeEventListener.js';

const DEFAULT_ROUNDS = 5;

export default class Game extends makeEventListener({
    START: 'start',
    DEAL: 'deal',
    PLAYER_PICK: 'player-pick',
    CPU_PICK: 'cpu-pick',
    PLAYER_SCORE: 'player-score',
    CPU_SCORE: 'cpu-score',
    PLAYER_WIN: 'player-win',
    CPU_WIN: 'cpu-win',
    OVER: 'over',
}) {
    #playable = false;
    #deal = [];
    #playerPick = null;
    #cpuPick = null;
    #rounds = 5;
    #playerScore = 0;
    #cpuScore = 0;

    get rounds() {
        return this.#rounds;
    }

    get score() {
        return {
            player: this.#playerScore,
            cpu: this.#cpuScore,
        };
    }

    get isOver() {
        return !this.#playable;
    }

    constructor(config = {rounds: DEFAULT_ROUNDS}) {
        super();

        // ensure odd number
        this.#rounds = (n => n + ((n + 1) % 2))(config.rounds ?? DEFAULT_ROUNDS);

        this.addEventListener(Game.Events.START, () => {
            this.deal();
        });
        this.addEventListener(Game.Events.PLAYER_PICK, () => {
            this.#pickForCpu();
        });
        this.addEventListener(Game.Events.CPU_PICK, () => {
            this.#updateScore();
        });
        this.addEventListener(Game.Events.PLAYER_WIN, () => {
            this.dispatchEvent(Game.Events.OVER, {score: this.score});
        });
        this.addEventListener(Game.Events.CPU_WIN, () => {
            this.dispatchEvent(Game.Events.OVER, {score: this.score});
        });
    }

    start() {
        this.#deal = [];
        this.#playerPick = null;
        this.#cpuPick = null;
        this.#playerScore = 0;
        this.#cpuScore = 0;

        this.#playable = true;

        this.dispatchEvent(Game.Events.START);
    }

    deal() {
        this.#checkWinCondition();
        if (!this.#playable) return;

        const deck = ['a', 'b', 'c', 'd'];
        const deal = [...deck].map(() => {
            return deck.splice(Math.floor(Math.random() * deck.length) % deck.length, 1).pop();
        });
        this.#deal = deal;
        this.dispatchEvent(Game.Events.DEAL, {deal});
    }

    pick(index) {
        if (!this.#playable) return;
        if (index < 0 || index >= this.#deal.length) return;

        this.#playerPick = this.#deal[index];
        this.dispatchEvent(Game.Events.PLAYER_PICK, {position: index, card: this.#playerPick});
    }

    #pickForCpu() {
        const getCard = (index) => {
            const card = this.#deal[index];
            if (card === this.#playerPick) return getCard((index + 1) % this.#deal.length);
            return [index, card];
        };

        let index = Math.round(Math.random() * this.#deal.length) % this.#deal.length;
        [index, this.#cpuPick] = getCard(index);

        this.dispatchEvent(Game.Events.CPU_PICK, {position: index, card: this.#cpuPick});
    }

    #updateScore() {
        this.#playerScore += (this.#cpuPick > this.#playerPick) + 0;
        this.#cpuScore += (this.#playerPick > this.#cpuPick) + 0;

        if (this.#cpuPick < this.#playerPick) {
            this.dispatchEvent(Game.Events.CPU_SCORE);
            return;
        }

        this.dispatchEvent(Game.Events.PLAYER_SCORE);
    }

    #checkWinCondition() {
        if (!this.#playable) return;
        const wins = Math.ceil(this.rounds / 2);

        // pause game to check
        this.#playable = false;

        if (this.#cpuScore >= wins) {
            this.dispatchEvent(Game.Events.CPU_WIN);
            return;
        }
        if (this.#playerScore >= wins) {
            this.dispatchEvent(Game.Events.PLAYER_WIN);
            return;
        }

        // resume game
        this.#playable = true;
    }
}