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
// Novo botão
let downloadBtn = document.getElementById('download-btn');

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

gridButton.addEventListener('click', () => {
    container.innerHTML = '';
    let count = 0;

    // --- NOVA LÓGICA DE TAMANHO ---
    // Pegamos na largura total disponível do wrapper (menos padding)
    let wrapperWidth = document.querySelector('.wrapper').offsetWidth - 40; 
    
    // Calculamos o tamanho de cada quadrado (Largura Total / Numero de Colunas)
    // Usamos Math.floor para evitar números quebrados que causam desalinhamento
    let colSize = Math.floor(wrapperWidth / gridWidth.value);
    
    // Se o quadrado ficar muito pequeno (ex: grid 100x100), definimos um mínimo
    if(colSize < 10) colSize = 10; 
    // -----------------------------

    for (let i = 0; i < gridHeight.value; i++) {
        count++;
        let div = document.createElement('div');
        div.classList.add('gridRow');

        for (let j = 0; j < gridWidth.value; j++) {
            count++;
            let col = document.createElement('div');
            col.classList.add('gridCol');
            col.setAttribute('id', `gridCol${count}`);
            
            // Aplicamos o tamanho calculado dinamicamente
            col.style.width = `${colSize}px`;
            col.style.height = `${colSize}px`;

            col.addEventListener(events[deviceType].down, () => {
                draw = true;
                if (erase) {
                    col.style.backgroundColor = 'transparent';
                } else {
                    col.style.backgroundColor = colorButton.value;
                }
            });

            col.addEventListener(events[deviceType].move, (e) => {
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
});

// --- NOVA FUNÇÃO DE DOWNLOAD ---
downloadBtn.addEventListener('click', () => {
    // Verifica se a grid foi criada
    if(container.innerHTML === "") return;

    // Usa a biblioteca html2canvas para "tirar foto" do container
    html2canvas(container).then(canvas => {
        // Cria um link falso
        let link = document.createElement('a');
        link.download = 'minha-pixel-art.png'; // Nome do ficheiro
        link.href = canvas.toDataURL(); // Converte a imagem para dados
        link.click(); // Simula o clique para baixar
    });
});
// ------------------------------

clearGridButton.addEventListener('click', () => {
    // Em vez de apagar o HTML, pintamos tudo de transparente para manter a grid
    let columns = document.querySelectorAll('.gridCol');
    columns.forEach(col => col.style.backgroundColor = 'transparent');
});

eraseBtn.addEventListener('click', () => {
    erase = true;
    eraseBtn.style.border = "2px solid black";
    paintBtn.style.border = "none";
});

paintBtn.addEventListener('click', () => {
    erase = false;
    paintBtn.style.border = "2px solid black";
    eraseBtn.style.border = "none";
});

gridWidth.addEventListener('input', () => {
    widthValue.innerHTML = gridWidth.value < 10 ? `0${gridWidth.value}` : gridWidth.value;
});

gridHeight.addEventListener('input', () => {
    heightValue.innerHTML = gridHeight.value < 10 ? `0${gridHeight.value}` : gridHeight.value;
});

// --- LÓGICA DA PALETA DE CORES ---

// 1. Definimos as cores que queremos na paleta (Hex codes)
const colors = [
    "#000000", // Preto
    "#FFFFFF", // Branco
    "#FF0000", // Vermelho
    "#00FF00", // Verde
    "#0000FF", // Azul
    "#FFFF00", // Amarelo
    "#FFA500", // Laranja
    "#800080", // Roxo
    "#FFC0CB", // Rosa
    "#8B4513", // Castanho
];

// 2. Selecionamos o contentor que criámos no HTML
const paletteContainer = document.getElementById('palette');

// 3. Função para gerar os botões
const generatePalette = () => {
    colors.forEach(color => {
        // Cria um novo botão
        let button = document.createElement('button');
        button.classList.add('color-choice');
        button.style.backgroundColor = color;
        
        // Define o que acontece ao clicar na cor
        button.addEventListener('click', () => {
            // Atualiza a variável interna do seletor de cores
            colorButton.value = color;
            
            // (Opcional) Força o modo de pintura e desliga a borracha
            erase = false;
            paintBtn.style.border = "2px solid black";
            eraseBtn.style.border = "none";
        });

        // Adiciona o botão ao contentor
        paletteContainer.appendChild(button);
    });
};

// 4. Chama a função para criar a paleta
generatePalette();


window.onload = () => {
    gridHeight.value = 10;
    gridWidth.value = 10;
    widthValue.innerHTML = "10";
    heightValue.innerHTML = "10";

    // --- NOVO: Atualiza o ano automaticamente ---
    document.getElementById("year").innerHTML = new Date().getFullYear();
};