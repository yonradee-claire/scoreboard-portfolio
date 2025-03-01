const colors = ["#F07857", "#5C62D6", "#4FB06D", "#F5C26B", "#EBB8DD", "#BE398D", "#253342", "#43A5BE", "#CBD6E2"];
let pressTimer;
let longPressTriggered = false; // Prevent duplicate execution

document.addEventListener("DOMContentLoaded", loadPlayers);

document.getElementById('addPlayer').addEventListener('click', function() {
    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    let player = { name: "Name", color: randomColor, score: 0 };
    addPlayerToDOM(player);
    savePlayers();
});

function addPlayerToDOM(player) {
    let playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.style.background = player.color;

    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 -960 960 960" width="24" fill="currentColor">
      <path d="M280-160q-33 0-56.5-23.5T200-240v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-160H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-760v520-520Z"/>
    </svg>
  `;
    deleteButton.addEventListener("click", function () {
        playerDiv.remove();
        savePlayers();
    });

    deleteButton.style.background = "none";
    deleteButton.style.border = "none";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.padding = "5px";

    let isNameInputFocused = false; // Flag to track if the Name input is focused
    // Create the Name input element
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = player.name;
    nameInput.addEventListener("input", savePlayers);
    // Automatically select text when the user clicks the input
    nameInput.addEventListener("focus", function () {
        nameInput.select();
        isNameInputFocused = true; // Set the flag to true when input is focused
    });
    // When Enter key is pressed, remove focus from the input box (finalise user's input)
    nameInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        nameInput.blur();  // Remove focus from the input box
        savePlayers();     // Save the updated name
      }
    });
    // Reset the flag when input loses focus
    nameInput.addEventListener("blur", function () {
        isNameInputFocused = false; // Reset flag when input loses focus
    });

    let scoreInput = document.createElement("input");
    /*scoreInput.type = "number"; this part is the spinners (arrow up and down clickable to add score)*/ 
    scoreInput.classList.add("score");
    scoreInput.value = player.score;
    scoreInput.addEventListener("change", savePlayers);

    let plusButton = document.createElement("button");
    plusButton.textContent = "+";

    // Handle both single click and long press correctly
    plusButton.addEventListener("pointerdown", function (event) {
        event.stopPropagation(); // Prevent triggering color change
        longPressTriggered = false; //Reset flag
        pressTimer = setTimeout(() => {
            longPressTriggered = true; // Set flag when long press is triggered
            showCustomIncrementInput(plusButton, scoreInput);
        }, 900); //900 ms long
    });

    plusButton.addEventListener("pointerup", function () {
        clearTimeout(pressTimer); // Stop long press timer
        if (!longPressTriggered) {
            // If long press was NOT triggered, just increment by 1
            scoreInput.value = parseInt(scoreInput.value, 10) + 1;
            savePlayers();
        }
    });

    plusButton.addEventListener("pointerleave", clearPress);
    
    // Handle color change for long press on playerDiv (except for Name input, score input, and "+")
    playerDiv.addEventListener("pointerdown", function (event) {
        if (!isNameInputFocused && !event.target.closest('input') && event.target !== plusButton) {
            clearTimeout(pressTimer);
            pressTimer = setTimeout(() => {
                let newColor = colors[Math.floor(Math.random() * colors.length)];
                playerDiv.style.background = newColor;
                savePlayers();
            }, 1100); // Color change after long press (1100ms)
        }
    });

    playerDiv.addEventListener("pointerup", clearPress);
    playerDiv.addEventListener("pointerleave", clearPress);
    
    // **Append elements in the desired order**
    playerDiv.appendChild(deleteButton); // "-" button first
    playerDiv.appendChild(nameInput);    // Player's name
    playerDiv.appendChild(scoreInput);   // Score
    playerDiv.appendChild(plusButton);   // "+" button

    document.getElementById('players').appendChild(playerDiv);
}

function clearPress() {
    clearTimeout(pressTimer);
}

function savePlayers() {
    let players = [];
    document.querySelectorAll('.player').forEach(playerDiv => {
        let name = playerDiv.children[0].value;
        let score = parseInt(playerDiv.children[1].value);
        let color = playerDiv.style.background;
        players.push({ name, score, color });
    });
    localStorage.setItem('players', JSON.stringify(players));
}

function loadPlayers() {
    let players = JSON.parse(localStorage.getItem('players')) || [];
    players.forEach(addPlayerToDOM);
}

function showCustomIncrementInput(button, scoreInput) {
    // Check if input already exists
    if (button.nextSibling && button.nextSibling.classList.contains("increment-input")) {
        return;
    }

    let input = document.createElement("input");
    /*input.type = "number"; don't want spinner (arrow up-down)*/
    input.classList.add("increment-input");
    input.placeholder = "+ score";
    input.style.position = "absolute";
    input.style.width = "60px";
    input.style.backgroundColor = "#e0e0e0";
    input.style.border = "1px solid gray"; // Ensures gray border
    input.style.left = button.offsetLeft + button.offsetWidth + "px";
    input.style.top = button.offsetTop + "px";
    input.style.zIndex = "100";
    
    button.parentElement.appendChild(input);
    input.focus();

    input.addEventListener("blur", function () {
        applyCustomIncrement(input, scoreInput);
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevents accidental form submission
            input.blur(); // This will trigger `handleApply`
        }
    });
}

function applyCustomIncrement(input, scoreInput) {
    let increment = parseInt(input.value, 10); // Ensure base 10 parsing
    if (!isNaN(increment)) { // Ensure it's a valid number
        scoreInput.value = parseInt(scoreInput.value, 10) + increment; 
        savePlayers();
    }
    input.remove(); // Remove input after use
}