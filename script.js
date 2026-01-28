let counts = []; 
let names = [];  

window.onload = () => {
    loadData();
    createCounters();
};

// createCounters 内の HTML生成部分も、順位表示用の場所を作るために少し書き換え
function createCounters() {
    const personCount = parseInt(document.getElementById('input-num').value) || 2;
    const container = document.getElementById('counter-container');
    container.innerHTML = "";
    
    const oldCounts = counts;
    counts = new Array(personCount).fill(0);
    for(let i = 0; i < Math.min(personCount, oldCounts.length); i++) {
        counts[i] = oldCounts[i];
    }

    for (let i = 0; i < personCount; i++) {
        const currentName = names[i] || "";
        const placeholderName = `名前${i + 1}`;
        
        container.innerHTML += `
            <div class="counter-set">
                <div class="result-box" id="result-${i}">0</div>
                <div class="score-card">
                    <div class="name-area">
                        <span class="rank-display" id="rank-${i}">-位</span>
                        <input type="text" class="name-input" 
                               value="${currentName}" 
                               placeholder="${placeholderName}" 
                               onchange="saveName(${i}, this.value)">
                    </div>
                    <input type="number" class="number-display" id="count-${i}" value="${counts[i]}" 
                           oninput="updateCountValue(${i}, this.value)">
                    <div class="btn-group">
                        <button onmouseup="handleRelease(event, ${i}, 1)" 
                                ontouchend="handleRelease(event, ${i}, 1)"
                                oncontextmenu="return false;">＋</button>
                        <button onmouseup="handleRelease(event, ${i}, -1)"
                                ontouchend="handleRelease(event, ${i}, -1)"
                                oncontextmenu="return false;">－</button>
                    </div>
                </div>
            </div>
        `;
    }
    updateAllCalculations();
}

function resetIndividualCount(i) {
    if (confirm(`${names[i] || 'この人'} の得点をリセットしますか？`)) {
        counts[i] = 0;
        const input = document.getElementById(`count-${i}`);
        if (input) input.value = 0;
        saveData();
        updateAllCalculations();
    }
}

// クリアボタン：得点だけを0にする
function clearData() {
    if (confirm("現在の得点をすべてリセットしますか？（名前と人数は保持されます）")) {
        // 内部データをリセット
        counts = counts.map(() => 0); 
        
        // 画面上の表示をリセット
        counts.forEach((val, i) => {
            const input = document.getElementById(`count-${i}`);
            if (input) input.value = 0;
        });

        saveData(); // 保存
        updateAllCalculations(); // 再計算
    }
}

// --- 以下、既存の保存・操作用関数 ---

function handleRelease(event, i, delta) {
    if (event.cancelable) event.preventDefault();
    changeValue(i, delta);
}

function changeValue(i, delta) {
    const newValue = counts[i] + delta;
    if (newValue >= 0) { 
        counts[i] = newValue;
        document.getElementById(`count-${i}`).value = counts[i];
        saveData();
        updateAllCalculations();
    }
}

function updateCountValue(i, value) {
    let val = parseInt(value) || 0;
    if (val < 0) val = 0; 
    counts[i] = val;
    saveData();
    updateAllCalculations();
}

function saveName(index, value) { 
    names[index] = value; 
    saveData(); 
}

function saveData() {
    const data = {
        counts: counts,
        names: names,
        personCount: document.getElementById('input-num').value,
        baseScore: document.getElementById('base-input').value
    };
    localStorage.setItem('counterAppData', JSON.stringify(data));
}

function loadData() {
    const savedData = localStorage.getItem('counterAppData');
    if (savedData) {
        const data = JSON.parse(savedData);
        counts = data.counts || [];
        names = data.names || [];
        document.getElementById('input-num').value = data.personCount || 2;
        document.getElementById('base-input').value = data.baseScore || 100;
    }
}

function changePeople(val) {
    const input = document.getElementById('input-num');
    let newValue = parseInt(input.value) + val;
    if (newValue < 2) newValue = 2;
    if (newValue > 4) newValue = 4;
    input.value = newValue;
    saveData();
    createCounters(); 
}

// script.js の updateAllCalculations 関数を以下に書き換え
function updateAllCalculations() {
    saveData();
    
    // 1. 各プレイヤーの最終結果を計算して一時的に保存
    let results = [];
    const baseScore = parseInt(document.getElementById('base-input').value) || 0;
    const personCount = counts.length;

    for (let i = 0; i < personCount; i++) {
        let othersTotalScore = 0;
        for (let j = 0; j < personCount; j++) {
            if (i !== j) othersTotalScore += counts[j];
        }
        const finalResult = (counts[i] * (personCount - 1) * baseScore) - (othersTotalScore * baseScore);
        results.push(finalResult);

        // 結果を表示
        const resDiv = document.getElementById(`result-${i}`);
        resDiv.innerText = finalResult.toLocaleString();
        resDiv.style.color = finalResult >= 0 ? "black" : "red";
    }

    // 2. 順位を計算 (重複あり)
    // 降順（大きい順）に並べ替えた配列を作成
    const sorted = [...results].sort((a, b) => b - a);
    
    for (let i = 0; i < personCount; i++) {
        const rank = sorted.indexOf(results[i]) + 1;
        const rankSpan = document.getElementById(`rank-${i}`);
        
        if (rankSpan) {
            rankSpan.innerText = `${rank}位`;
            
            if (rank === 1) {
                // 1位：金色
                rankSpan.style.color = "#d4af37";
                rankSpan.style.fontWeight = "bold";
            } else if (rank === personCount) {
                // 最下位（現在の人数と同じ順位）：赤色
                rankSpan.style.color = "#d43737";
                rankSpan.style.fontWeight = "bold";
            } else {
                // それ以外：通常（グレー）
                rankSpan.style.color = "#666";
                rankSpan.style.fontWeight = "normal";
            }
        } 
    }
}

