let counts = []; 
let names = [];  

window.onload = createCounters;

function createCounters() {
    const currentNameInputs = document.querySelectorAll('.name-input');
    currentNameInputs.forEach((input, index) => { names[index] = input.value; });

    const personCount = parseInt(document.getElementById('input-num').value) || 2;
    const container = document.getElementById('counter-container');
    container.innerHTML = "";
    
    const oldCounts = counts;
    counts = new Array(personCount).fill(0);
    for(let i = 0; i < Math.min(personCount, oldCounts.length); i++) {
        counts[i] = oldCounts[i];
    }

    for (let i = 0; i < personCount; i++) {
        const displayName = names[i] || `名前${i + 1}`;
        
        container.innerHTML += `
            <div class="counter-set">
                <div class="result-box" id="result-${i}">0</div>
                <div class="score-card">
                    <input type="text" class="name-input" value="${displayName}" onchange="saveName(${i}, this.value)">
                    <input type="number" class="number-display" id="count-${i}" value="${counts[i]}" 
                           oninput="updateCountValue(${i}, this.value)" min="0">
                    <div class="btn-group">
                        <button onclick="changeValue(${i}, 1)">＋</button>
                        <button onclick="changeValue(${i}, -1)">－</button>
                    </div>
                </div>
            </div>
        `;
    }
    updateAllCalculations();
}

function updateCountValue(i, value) {
    let val = parseInt(value) || 0;
    if (val < 0) val = 0; 
    counts[i] = val;
    document.getElementById(`count-${i}`).value = val;
    updateAllCalculations();
}

// 単純な数値変更のみに変更
function changeValue(i, delta) {
    const newValue = counts[i] + delta;
    if (newValue >= 0) { 
        counts[i] = newValue;
        updateDisplay(i);
    }
}

function updateDisplay(i) {
    document.getElementById(`count-${i}`).value = counts[i];
    updateAllCalculations();
}

function saveName(index, value) { names[index] = value; }

function changePeople(val) {
    const input = document.getElementById('input-num');
    let newValue = parseInt(input.value) + val;
    if (newValue < 2) newValue = 2;
    if (newValue > 4) newValue = 4;
    input.value = newValue;
    createCounters(); 
}

function updateAllCalculations() {
    for (let i = 0; i < counts.length; i++) {
        calculateResult(i);
    }
}

function calculateResult(i) {
    const baseScore = parseInt(document.getElementById('base-input').value) || 0;
    const personCount = counts.length;
    let othersTotalScore = 0;
    for (let j = 0; j < personCount; j++) {
        if (i !== j) othersTotalScore += counts[j];
    }
    const finalResult = (counts[i] * (personCount - 1) * baseScore) - (othersTotalScore * baseScore);
    const resDiv = document.getElementById(`result-${i}`);
    resDiv.innerText = finalResult.toLocaleString();
    resDiv.style.color = finalResult >= 0 ? "black" : "red";
}
