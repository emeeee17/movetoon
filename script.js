const imageUpload = document.getElementById('imageUpload');
const bgImage = document.getElementById('bgImage');
const drawingCanvas = document.getElementById('drawingCanvas');
const normalLayer = document.getElementById('normalLayer');
const gooeyLayer = document.getElementById('gooeyLayer');

// Tools
const brushType = document.getElementById('brushType');
const brushColor = document.getElementById('brushColor');
const brushSize = document.getElementById('brushSize');

// Buttons
const btnUndo = document.getElementById('btnUndo');
const btnRedo = document.getElementById('btnRedo');
const btnClear = document.getElementById('btnClear');
const btnExportSVG = document.getElementById('btnExportSVG');
const btnExportBg = document.getElementById('btnExportBg');

let isDrawing = false;
let currentPath = null;
let currentGroup = null; // เพื่อจับว่าวาดลง Layer ไหน

// History สำหรับ Undo/Redo
let pathsHistory = [];
let redoStack = [];

// จัดการ Import ภาพ
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            bgImage.src = event.target.result;
            bgImage.style.display = 'block';
            
            // รอให้ภาพโหลดเสร็จเพื่อเอาขนาดจริง
            bgImage.onload = () => {
                const w = bgImage.naturalWidth;
                const h = bgImage.naturalHeight;
                // ตั้งค่า SVG ให้ขนาดเท่าภาพเป๊ะๆ (นี่คือหัวใจของ Part 2)
                drawingCanvas.setAttribute('width', w);
                drawingCanvas.setAttribute('height', h);
                drawingCanvas.setAttribute('viewBox', `0 0 ${w} ${h}`);
            };
        };
        reader.readAsDataURL(file);
    }
});

// ระบบวาด (รองรับทั้ง Mouse และ Touch)
function getCoordinates(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width.baseVal.value / rect.width;
    const scaleY = drawingCanvas.height.baseVal.value / rect.height;
    
    // จัดการ Event นิ้วและเมาส์
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (!bgImage.src) {
        alert("กรุณา Import รูปพื้นหลังก่อนครับ!");
        return;
    }
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoordinates(e);

    // สร้างเส้น SVG
    currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    currentPath.setAttribute('d', `M ${x} ${y}`);
    currentPath.setAttribute('stroke', brushColor.value);
    currentPath.setAttribute('stroke-width', brushSize.value);
    currentPath.setAttribute('fill', 'none');
    currentPath.setAttribute('stroke-linecap', 'round');
    currentPath.setAttribute('stroke-linejoin', 'round');

    // เลือกว่าจะใส่ Layer ไหน
    if (brushType.value === 'gooey') {
        currentGroup = gooeyLayer;
    } else {
        currentGroup = normalLayer;
    }
    
    currentGroup.appendChild(currentPath);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const d = currentPath.getAttribute('d');
    currentPath.setAttribute('d', `${d} L ${x} ${y}`);
}

function stopDrawing(e) {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawing = false;
    
    // บันทึกประวัติ
    pathsHistory.push({
        element: currentPath,
        parent: currentGroup
    });
    redoStack = []; // เคลียร์ Redo ถ้ามีการวาดใหม่
}

drawingCanvas.addEventListener('mousedown', startDrawing);
drawingCanvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);

drawingCanvas.addEventListener('touchstart', startDrawing, {passive: false});
drawingCanvas.addEventListener('touchmove', draw, {passive: false});
window.addEventListener('touchend', stopDrawing);

// Undo / Redo
btnUndo.addEventListener('click', () => {
    if (pathsHistory.length > 0) {
        const lastAction = pathsHistory.pop();
        lastAction.parent.removeChild(lastAction.element);
        redoStack.push(lastAction);
    }
});

btnRedo.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const actionToRestore = redoStack.pop();
        actionToRestore.parent.appendChild(actionToRestore.element);
        pathsHistory.push(actionToRestore);
    }
});

// Clear
btnClear.addEventListener('click', () => {
    normalLayer.innerHTML = '';
    gooeyLayer.innerHTML = '';
    pathsHistory = [];
    redoStack = [];
});

// Export SVG
btnExportSVG.addEventListener('click', () => {
    // เอา SVG มารวมกับ Filter เพื่อให้เอาไปใช้เดี่ยวๆได้
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(drawingCanvas);
    
    const blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "movetoon-layer.svg";
    link.click();
});

// Export BG
btnExportBg.addEventListener('click', () => {
    if (!bgImage.src) return;
    const link = document.createElement("a");
    link.href = bgImage.src;
    link.download = "movetoon-bg.png"; // หรือ jpg ขึ้นกับที่อัป
    link.click();
});