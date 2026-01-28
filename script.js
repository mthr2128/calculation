let counts = []; 
let names = [];  

window.onload = () => {
    loadData();
    createCounters();
};

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
        const displayName = names[i] || `名前${i + 1}`;
        
        container.innerHTML += `
            <div class="counter-set">
                <div class="result-box" id="result-${i}">0</div>
                <div class="score-card">
                    <input type="text" class="name-input" value="${displayName}" onchange="saveName(${i}, this.value)">
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

function clearData() {
    if (confirm("データをすべてリセットしますか？")) {
        counts = counts.map(() => 0); 
        
        // 画面の入力欄の表示を0に更新する
        counts.forEach((val, i) => {
            const input = document.getElementById(`count-${i}`);
            if (input) input.value = 0;
        });

        // データの保存と再計算
        saveData(); 
        updateAllCalculations();
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

function updateAllCalculations() {
    saveData();
    for (let i = 0; i < counts.length; i++) {
        const baseScore = parseInt(document.getElementById('base-input').value) || 0;
        let othersTotalScore = 0;
        for (let j = 0; j < counts.length; j++) {
            if (i !== j) othersTotalScore += counts[j];
        }
        const finalResult = (counts[i] * (counts.length - 1) * baseScore) - (othersTotalScore * baseScore);
        const resDiv = document.getElementById(`result-${i}`);
        resDiv.innerText = finalResult.toLocaleString();
        resDiv.style.color = finalResult >= 0 ? "black" : "red";
    }
}
