let container = document.querySelector('.container');
let gridButton = document.getElementById('submit-grid');
let clearGridButton = document.getElementById('clear-grid');
let gridWidth = document.getElementById('width-range');
let gridHeight = document.getElementById('height-range');
let colorButton = document.getElementById('color-input');
let eraseBtn = document.getElementById('erase-btn');
let paintBtn = document.getElementById('paint-btn');
let widthValue = document.getElementById('width-value');
let heightValue = document.getElementById('height-value');
let downloadBtn = document.getElementById('download-btn');

// NOVAS VARIÁVEIS
let saveBtn = document.getElementById('save-btn');
let loadBtn = document.getElementById('load-btn');

let events = {
    mouse: { down: "mousedown", move: "mousemove", up: "mouseup" },
    touch: { down: "touchstart", move: "touchmove", up: "touchend" },
};

let deviceType = "";
let draw = false;
let erase = false;

const isTouchDevice = () => {
    try {
        document.createEvent("TouchEvent");
        deviceType = "touch";
        return true;
    } catch (e) {
        deviceType = "mouse";
        return false;
    }
};

isTouchDevice();

const updateActiveButton = (mode) => {
    if (mode === 'paint') {
        paintBtn.classList.add('active-tool');
        eraseBtn.classList.remove('active-tool');
    } else if (mode === 'erase') {
        eraseBtn.classList.add('active-tool');
        paintBtn.classList.remove('active-tool');
    }
};

// --- FUNÇÃO CENTRAL PARA CRIAR A GRID ---
// Agora aceita width e height como argumentos opcionais
const makeGrid = (wValue, hValue) => {
    container.innerHTML = '';
    let count = 0;
    
    // Se não passarmos valores (clique normal), usa os sliders
    let w = wValue || gridWidth.value;
    let h = hValue || gridHeight.value;

    let wrapperWidth = document.querySelector('.wrapper').offsetWidth;
    let availableWidth = wrapperWidth - 50;
    let colSize = Math.floor(availableWidth / w);
    
    if(colSize > 30) colSize = 30;
    if(colSize < 10) colSize = 10;

    for (let i = 0; i < h; i++) {
        count++;
        let div = document.createElement('div');
        div.classList.add('gridRow');

        for (let j = 0; j < w; j++) {
            count++;
            let col = document.createElement('div');
            col.classList.add('gridCol');
            // Removemos IDs numéricos fixos para evitar confusão, usamos classes ou ordem
            
            col.style.width = `${colSize}px`;
            col.style.height = `${colSize}px`;

            col.addEventListener(events[deviceType].down, (e) => {
                draw = true;
                if (erase) {
                    col.style.backgroundColor = 'transparent';
                } else {
                    col.style.backgroundColor = colorButton.value;
                }
            });

            col.addEventListener(events[deviceType].move, (e) => {
                if(deviceType === "touch") e.preventDefault(); 

                let elementId = document.elementFromPoint(
                    !isTouchDevice() ? e.clientX : e.touches[0].clientX,
                    !isTouchDevice() ? e.clientY : e.touches[0].clientY,
                );
                
                if (elementId && elementId.classList.contains('gridCol')) {
                    if (draw && !erase) {
                        elementId.style.backgroundColor = colorButton.value;
                    } else if (draw && erase) {
                        elementId.style.backgroundColor = 'transparent';
                    }
                }
            });

            col.addEventListener(events[deviceType].up, () => {
                draw = false;
            });

            div.appendChild(col);
        }
        container.appendChild(div);
    }
    
    erase = false;
    updateActiveButton('paint');
};

// O botão original agora apenas chama a função
gridButton.addEventListener('click', () => {
    makeGrid();
});

// --- FUNÇÃO SALVAR (SAVE) ---
saveBtn.addEventListener('click', () => {
    // 1. Array para guardar as cores
    let colorsArray = [];
    
    // 2. Passamos por todos os quadrados da grid
    let columns = document.querySelectorAll('.gridCol');
    columns.forEach(col => {
        // Se for transparente ou vazio, guardamos "transparent", senão guardamos a cor
        colorsArray.push(col.style.backgroundColor || 'transparent');
    });

    // 3. Criamos o objeto de dados
    let saveData = {
        width: gridWidth.value,
        height: gridHeight.value,
        colors: colorsArray
    };

    // 4. Guardamos no LocalStorage (convertendo para Texto/JSON)
    localStorage.setItem('pixelArtSave', JSON.stringify(saveData));
    
    alert('Desenho guardado com sucesso!');
});

// --- FUNÇÃO CARREGAR (LOAD) ---
loadBtn.addEventListener('click', () => {
    // 1. Tentamos ler os dados
    let savedData = localStorage.getItem('pixelArtSave');
    
    if (savedData) {
        // 2. Convertemos de texto para objeto
        let data = JSON.parse(savedData);
        
        // 3. Atualizamos os sliders visualmente para bater certo com o desenho
        gridWidth.value = data.width;
        gridHeight.value = data.height;
        widthValue.innerHTML = data.width < 10 ? `0${data.width}` : data.width;
        heightValue.innerHTML = data.height < 10 ? `0${data.height}` : data.height;

        // 4. Criamos a grid com os tamanhos salvos
        makeGrid(data.width, data.height);

        // 5. Pintamos quadrado a quadrado
        let columns = document.querySelectorAll('.gridCol');
        
        // O loop `forEach` tem um segundo parâmetro 'index' que é o número da volta (0, 1, 2...)
        columns.forEach((col, index) => {
            col.style.backgroundColor = data.colors[index];
        });

    } else {
        alert('Nenhum desenho salvo encontrado.');
    }
});

downloadBtn.addEventListener('click', () => {
    if(container.innerHTML === "") return;
    const originalBg = container.style.backgroundColor;
    container.style.backgroundColor = "#ffffff";
    html2canvas(container).then(canvas => {
        let link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = canvas.toDataURL();
        link.click();
        container.style.backgroundColor = originalBg;
    });
});

clearGridButton.addEventListener('click', () => {
    let columns = document.querySelectorAll('.gridCol');
    columns.forEach(col => col.style.backgroundColor = 'transparent');
});

eraseBtn.addEventListener('click', () => {
    erase = true;
    updateActiveButton('erase');
});

paintBtn.addEventListener('click', () => {
    erase = false;
    updateActiveButton('paint');
});

gridWidth.addEventListener('input', () => {
    widthValue.innerHTML = gridWidth.value < 10 ? `0${gridWidth.value}` : gridWidth.value;
});

gridHeight.addEventListener('input', () => {
    heightValue.innerHTML = gridHeight.value < 10 ? `0${gridHeight.value}` : gridHeight.value;
});

const colors = ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500", "#800080", "#FFC0CB", "#8B4513"];
const paletteContainer = document.getElementById('palette');

const generatePalette = () => {
    colors.forEach(color => {
        let button = document.createElement('button');
        button.classList.add('color-choice');
        button.style.backgroundColor = color;
        button.addEventListener('click', () => {
            colorButton.value = color;
            erase = false;
            updateActiveButton('paint');
        });
        paletteContainer.appendChild(button);
    });
};

generatePalette();

window.onload = () => {
    gridHeight.value = 10;
    gridWidth.value = 10;
    widthValue.innerHTML = "10";
    heightValue.innerHTML = "10";
    document.getElementById("year").innerHTML = new Date().getFullYear();
    updateActiveButton('paint');
};