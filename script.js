const imageUpload = document.getElementById('imageUpload');
const bgImage = document.getElementById('bgImage');
const drawingCanvas = document.getElementById('drawingCanvas');
const normalLayer = document.getElementById('normalLayer');
const gooeyLayer = document.getElementById('gooeyLayer');

const brushType = document.getElementById('brushType');
const brushColor = document.getElementById('brushColor');
const brushSize = document.getElementById('brushSize');

const btnUndo = document.getElementById('btnUndo');
const btnRedo = document.getElementById('btnRedo');
const btnClear = document.getElementById('btnClear');
const btnExportSVG = document.getElementById('btnExportSVG');
const btnExportBg = document.getElementById('btnExportBg');

let isDrawing = false;
let currentPath = null;
let currentStrokeGroup = null; // สร้าง Group มัดรวมเส้นกับหยดน้ำไว้ด้วยกัน
let currentGroup = null; 

let pathsHistory = [];
let redoStack = [];

// [แก้ปัญหาที่ 1] ตั้งค่าหน้ากระดาษเริ่มต้นให้วาดได้เลยแม้ไม่มีรูป
function initDefaultCanvas() {
    if (!bgImage.src || bgImage.src === window.location.href) {
        const w = window.innerWidth || 800;
        const h = window.innerHeight || 600;
        drawingCanvas.setAttribute('width', w);
        drawingCanvas.setAttribute('height', h);
        drawingCanvas.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
}
initDefaultCanvas();
window.addEventListener('resize', initDefaultCanvas);

// จัดการ Import ภาพ
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            bgImage.src = event.target.result;
            bgImage.style.display = 'block';
            
            bgImage.onload = () => {
                const w = bgImage.naturalWidth;
                const h = bgImage.naturalHeight;
                drawingCanvas.setAttribute('width', w);
                drawingCanvas.setAttribute('height', h);
                drawingCanvas.setAttribute('viewBox', `0 0 ${w} ${h}`);
            };
        };
        reader.readAsDataURL(file);
    }
});

function getCoordinates(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width.baseVal.value / rect.width;
    const scaleY = drawingCanvas.height.baseVal.value / rect.height;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoordinates(e);

    // สร้าง Group สำหรับ Stroke นี้ (เผื่อรวมหยดน้ำ)
    currentStrokeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    currentPath.setAttribute('d', `M ${x} ${y}`);
    currentPath.setAttribute('stroke', brushColor.value);
    currentPath.setAttribute('stroke-width', brushSize.value);
    currentPath.setAttribute('fill', 'none');
    currentPath.setAttribute('stroke-linecap', 'round');
    currentPath.setAttribute('stroke-linejoin', 'round');

    currentStrokeGroup.appendChild(currentPath);

    if (brushType.value === 'gooey') {
        currentGroup = gooeyLayer;
    } else {
        currentGroup = normalLayer;
    }
    
    currentGroup.appendChild(currentStrokeGroup);
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
    
    // [แก้ปัญหาที่ 2] สร้างหยดน้ำวิ่งเป็น Loop ด้วย Native SVG Animation
    if (brushType.value === 'gooey') {
        const pathData = currentPath.getAttribute('d');
        const pathLength = currentPath.getTotalLength();
        
        // ถ้ายาวพอ ค่อยสร้างหยดน้ำ
        if (pathLength > 20) {
            const dropCount = 4; // จำนวนหยดน้ำต่อเส้น
            for (let i = 0; i < dropCount; i++) {
                const drop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                // สุ่มขนาดหยดน้ำนิดหน่อยให้ดูเป็นธรรมชาติ
                const radius = (parseFloat(brushSize.value) / 2) * (0.8 + Math.random() * 0.6);
                drop.setAttribute('r', radius);
                drop.setAttribute('fill', brushColor.value);

                // สร้าง Animation
                const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
                // สุ่มความเร็ว (2 - 4 วินาที)
                const duration = (2 + Math.random() * 2).toFixed(1) + 's';
                animate.setAttribute('dur', duration);
                animate.setAttribute('repeatCount', 'indefinite');
                animate.setAttribute('path', pathData);

                drop.appendChild(animate);
                currentStrokeGroup.appendChild(drop);
            }
        }
    }

    pathsHistory.push({
        element: currentStrokeGroup,
        parent: currentGroup
    });
    redoStack = []; 
}

drawingCanvas.addEventListener('mousedown', startDrawing);
drawingCanvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);

drawingCanvas.addEventListener('touchstart', startDrawing, {passive: false});
drawingCanvas.addEventListener('touchmove', draw, {passive: false});
window.addEventListener('touchend', stopDrawing);

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

btnClear.addEventListener('click', () => {
    normalLayer.innerHTML = '';
    gooeyLayer.innerHTML = '';
    pathsHistory = [];
    redoStack = [];
});

btnExportSVG.addEventListener('click', () => {
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(drawingCanvas);
    
    const blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "movetoon-layer.svg";
    link.click();
});

btnExportBg.addEventListener('click', () => {
    if (!bgImage.src || bgImage.src === window.location.href) {
        alert("ยังไม่ได้ Import พื้นหลังครับ");
        return;
    }
    const link = document.createElement("a");
    link.href = bgImage.src;
    link.download = "movetoon-bg.png";
    link.click();
});