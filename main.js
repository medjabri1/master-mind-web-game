// ---------------------------------
// ----------- CONSTs

const INITIAL_ATTEMPTS = 8;
const CIRCLE_COLORS_NBR = 4;

const COLORS_PALETTE = {
    BLUE: 'blue',
    RED : 'red',
    YELLOW : 'yellow',
    GREEN : 'green',
    BROWN : 'brown',
    GREY : 'grey',
    WHITE : 'white',
    BLACK : 'black'
}

// ---------------------------------
// ----------- DOM Elements

//Game board
const attempts_remaining_dom = document.querySelector('.game .game-board .game-info .attempts-remaining-nbr');
const color_list_container_dom = document.querySelector('.game .game-board .colors-list');
let colors_list_dom = document.querySelectorAll('.game .game-board .colors-list .color-item');
const current_row_container_dom = document.querySelector('.game .game-board .game-play .current-row');
let current_row_circles_dom = document.querySelectorAll('.game .game-board .game-play .current-row .circle');
const confirm_current_row_button_dom = document.querySelector('.game .game-board .confirm-button');

//Game display
const game_master_mind_dom = document.querySelector('.game .game-display .master-mind');
const game_side_results_dom = document.querySelector('.game .game-display .results');
let game_main_rows_dom = document.querySelectorAll('.game .game-display .master-mind .row');
let game_side_result_rows_dom = document.querySelectorAll('.game .game-display .results .row');

//Game management
const panels = document.querySelectorAll('.game .panel');
const play_button = document.querySelector('.play-button');
const goto_help_button = document.querySelector('.help-button');
const restart_buttons = document.querySelectorAll('.restart-button');
const goto_home_buttons = document.querySelectorAll('.home-screen-button');

// ---------------------------------
// ----------- Game Elements 

let isGameOver;
let currentRowIndex = 0;
let computerChoice = [];

// ---------------------------------
// ----------- MAIN Functions

startGame();

function startGame() {
    initializeDOM();
    fillGame();
    currentRowIndex = 0;
    isGameOver = false;
    generateComputerChoice();
}

// ---------------------------------
// ----------- HELPERS Functions

function initializeDOM() {
    game_master_mind_dom.innerHTML = "";
    game_side_results_dom.innerHTML = "";
    color_list_container_dom.innerHTML = "";
    current_row_container_dom.innerHTML = "";
    attempts_remaining_dom.textContent = INITIAL_ATTEMPTS;
}

function fillGame() {

    //Fill Main Game rows
    for(let i = 0; i < INITIAL_ATTEMPTS; i++) {

        let row = document.createElement('div');
        row.classList.add('row');

        for(let j = 0; j < CIRCLE_COLORS_NBR; j++) {

            //Fill Each row with circles
            let circle = document.createElement('div');
            circle.classList.add('circle');

            row.appendChild(circle);
        }

        game_master_mind_dom.append(row);
    }

    //Copy rows from main game to side results because they had the same content
    game_side_results_dom.innerHTML = game_master_mind_dom.innerHTML;

    //Fill side colors palette
    for(color in COLORS_PALETTE) {

        let div = document.createElement('div');
        div.classList.add('color-item');
        div.classList.add(COLORS_PALETTE[color]);
        div.dataset.color = COLORS_PALETTE[color];
        div.title = color;

        color_list_container_dom.appendChild(div);

    }

    for(let i = 0; i < CIRCLE_COLORS_NBR; i++) {

        //Fill Each row with circles
        let circle = document.createElement('div');
        circle.classList.add('circle');

        current_row_container_dom.appendChild(circle);
    }
    
    //REDEFINING Colors elements for the event listener
    colors_list_dom = document.querySelectorAll('.game .game-board .colors-list .color-item');
    game_main_rows_dom = document.querySelectorAll('.game .game-display .master-mind .row');
    game_side_result_rows_dom = document.querySelectorAll('.game .game-display .results .row');
    current_row_circles_dom = document.querySelectorAll('.game .game-board .game-play .current-row .circle');

    reloadGameEventListeners();
}

function unselectCurrentCircles() {
    current_row_circles_dom.forEach(circle => circle.classList.remove('selected'));
}

function colorCurrentSelectedCircle(color) {
    
    let index = 0;
    let selected = null;
    
    current_row_circles_dom.forEach(circle => {
        if(circle.classList.contains('selected')) {
            circle.classList = 'circle';
            circle.classList.add(color);
            circle.dataset.color = color;
            selected = index;
        }
        index++;
    });

    if(selected != null && selected+1 < current_row_circles_dom.length) {
        current_row_circles_dom[selected+1].classList.add('selected');
    }
    selected = null;
}

function generateComputerChoice() {

    for(let i = 0; i < CIRCLE_COLORS_NBR; i++) {

        let random_index = Math.floor(Math.random() * (CIRCLE_COLORS_NBR));
        if(random_index >= CIRCLE_COLORS_NBR) random_index = CIRCLE_COLORS_NBR - 1;

        computerChoice[i] = Object.keys(COLORS_PALETTE)[random_index];
    }
}

function displaySideResults(BO_nbr, WO_nbr) {

    let row = game_side_result_rows_dom[currentRowIndex - 1].querySelectorAll('.circle');

    let colors = [];

    for(let i=0; i < BO_nbr; i++) {
        colors.push(COLORS_PALETTE.BLACK);
    } 

    for(let i=0; i < WO_nbr; i++) {
        colors.push(COLORS_PALETTE.WHITE);
    }
    
    for(let i = 0; i < colors.length; i++) {
        row[i].classList.add(colors[i]);
    }

}

// ---------------------------------
// ----------- MAIN Game EVENTS Listeners 

function reloadGameEventListeners() {
    current_row_circles_dom.forEach(circle => {

        circle.addEventListener('click', () => {
            unselectCurrentCircles();
            circle.classList.add('selected');
        });
    
    });
    
    colors_list_dom.forEach(color => {    
    
        color.addEventListener('click', () => {
            colorCurrentSelectedCircle(color.dataset.color);
        });
    
    });
}

confirm_current_row_button_dom.addEventListener('click', () => {
    
    if(isGameOver) return;
    unselectCurrentCircles();

    let row = game_main_rows_dom[currentRowIndex].querySelectorAll('.circle');
    let row_submitted = current_row_circles_dom;

    let index = 0;
    
    let animInterval = setInterval(() => {

        if(index >= row.length - 1) clearInterval(animInterval);
        row[index].classList.add(row_submitted[index].dataset.color);
        index++;

    }, 250);

    currentRowIndex++;

    //Check for results

    let BO_found = []; //Black occurences
    let BO_colors = []; //Black Colors found

    let WO_found = []; //White occurecnes
    let WO_colors = []; //White Colors found


    for(let i = 0; i < row_submitted.length; i++) {

        for(let j = 0; j < computerChoice.length; j++) {

            if(row_submitted[i].dataset.color.toLowerCase() === computerChoice[j].toLowerCase()) {

                if(i == j) {
                    BO_found.push(i);
                    if(!BO_colors.includes(computerChoice[j].toLowerCase())) {
                        BO_colors.push(computerChoice[j].toLowerCase());
                    }
                    if(WO_colors.filter(color => color==computerChoice[j]).length === 1) {
                        WO_colors = WO_colors.filter(index => index !== i);
                    }
                } else {
                    if(!BO_found.includes(i) && !WO_found.includes(i)) {
                        WO_found.push(i);
                        if(!WO_colors.includes(computerChoice[j].toLowerCase())) {
                            WO_colors.push(computerChoice[j].toLowerCase());
                        }
                    }
                }

            }

        }
        
    }

    if(BO_found.length === CIRCLE_COLORS_NBR) {
        //All circle are in the right place | Player WON
        displaySideResults(BO_found.length, 0);

        setTimeout(() => {
            activePanel('won-screen');
        }, 200);

    } else {
        //One or more circle are not in the right place
        displaySideResults(BO_colors.length, WO_colors.length);
    }
    
    attempts_remaining_dom.textContent = INITIAL_ATTEMPTS - currentRowIndex;

    if(currentRowIndex >=  INITIAL_ATTEMPTS) {
        setTimeout(() => {
            activePanel('lose-screen');
        }, 200);
    }

});

// ---------------------------------
// ----------- Game Management Liseteners

function activePanel(class_name) {
    panels.forEach(panel => {
        if(panel.classList.contains(class_name)) {
            !panel.classList.contains('active') ? panel.classList.add('active') : null;
        } else {
            panel.classList.remove('active');
        }
    })
}

play_button.addEventListener('click', () => {
    activePanel('main-game');
    startGame(); 
});

restart_buttons.forEach(button => {
    button.addEventListener('click', () => {
        activePanel('main-game');
        startGame();
    });
});

goto_home_buttons.forEach(button => {
    button.addEventListener('click', () => {
        activePanel('home-screen');
    });
});

goto_help_button.addEventListener('click', () => {
    activePanel('help-screen');
});