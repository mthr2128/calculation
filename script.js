let counts = []; 
let names = [];  
let isSlideMode = false;
let isDragging = false;
let startY = 0;
let startValue = 0;
let activeIndex = null;

window.onload = createCounters;

// モード切り替え（ボタンを押すたびに実行）
function toggleMode() {
    isSlideMode = !isSlideMode;
    const btn = document.getElementById('mode-toggle-btn');
    btn.innerText = isSlideMode ? "モード: スライド" : "モード: ボタン";
    createCounters(); // 画面を再描画して表示を切り替える
}

function createCounters() {
    // 現在の名前を保持
    const currentNameInputs = document.querySelectorAll('.name-input');
    currentNameInputs.forEach((input, index) => { names[index] = input.value; });

    const personCount = parseInt(document.getElementById('input-num').value) || 1;
    const container = document.getElementById('counter-container');
    container.innerHTML = "";
    
    // 点数配列の維持
    const oldCounts = counts;
    counts = new Array(personCount).fill(0);
    for(let i = 0; i < Math.min(personCount, oldCounts.length); i++) {
        counts[i] = oldCounts[i];
    }

    for (let i = 0; i < personCount; i++) {
        const displayName = names[i] || `名前${i + 1}`;
        
        // モードによって表示するHTMLを分ける
        let controlHTML = '';
        if (isSlideMode) {
            // スライドモード：スライドエリアのみ表示
            // HTML生成部分の controlHTML を以下のように書き換える（タッチイベントを追加）
            controlHTML = `<div class="slide-area" 
                onmousedown="startSlide(event, ${i})" 
                ontouchstart="startSlide(event, ${i})">スライド</div>`;
        } else {
            // ボタンモード：＋－ボタンのみ表示
            controlHTML = `
                <div class="btn-group">
                    <button class="score-btn" onclick="adjustScore(${i}, -1)">－</button>
                    <button class="score-btn" onclick="adjustScore(${i}, 1)">＋</button>
                </div>`;
        }

        container.innerHTML += `
            <div class="counter-set">
                <div class="result-box" id="result-${i}">0</div>
                <div class="score-card">
                    <input type="text" class="name-input" value="${displayName}" onchange="saveName(${i}, this.value)">
                    <input type="number" class="score-input" id="count-${i}" value="${counts[i]}" 
                           oninput="manualScoreInput(${i}, this.value)">
                    ${controlHTML}
                </div>
            </div>
        `;
    }
    updateAllCalculations();
}

// ＋/－ボタン用
function adjustScore(i, val) {
    counts[i] += val;
    if (counts[i] < 0) counts[i] = 0;
    updateDisplay(i);
}

// キーボード直接入力用
function manualScoreInput(i, value) {
    let val = parseInt(value);
    if (isNaN(val)) val = 0;
    counts[i] = val;
    updateAllCalculations(); // 計算結果のみ更新（入力欄を書き換えるとカーソルが飛ぶため）
}

// 表示の同期（ボタンやスライドで動かした時に呼び出す）
function updateDisplay(i) {
    const targetInput = document.getElementById(`count-${i}`);
    if (targetInput) {
        targetInput.value = counts[i]; 
    }
    updateAllCalculations();
}

// --- スライド操作の処理 ---
function startSlide(e, index) {
    isDragging = true;
    activeIndex = index;
    startY = e.clientY;
    startValue = counts[index];
    document.body.style.userSelect = 'none';
}

window.onmousemove = function(e) {
    if (!isDragging) return;
    const diff = startY - e.clientY;
    const newValue = startValue + Math.floor(diff / 20); // 20px動かすと1点変わる
    if (newValue !== counts[activeIndex] && newValue >= 0) {
        counts[activeIndex] = newValue;
        updateDisplay(activeIndex);
    }
}

window.onmouseup = function() {
    isDragging = false;
    activeIndex = null;
    document.body.style.userSelect = 'auto';
}

// --- その他共通処理 ---
function saveName(index, value) { names[index] = value; }

function changePeople(val) {
    const input = document.getElementById('input-num');
    let newValue = parseInt(input.value) + val;
    if (newValue < 2) {newValue = 2};
    if (newValue > 4) {newValue = 4};
    input.value = newValue;
    createCounters(); 
}

function calculateResult(i) {
    const baseScore = parseInt(document.getElementById('base-input').value) || 0;
    const personCount = counts.length;
    let othersTotalScore = 0;
    for (let j = 0; j < personCount; j++) {
        if (i !== j) othersTotalScore += counts[j];
    }
    const finalResult = (counts[i] * (personCount - 1) * baseScore) - (othersTotalScore * baseScore);
    document.getElementById(`result-${i}`).innerText = finalResult;
}

function updateAllCalculations() {
    for (let i = 0; i < counts.length; i++) { calculateResult(i); }
}