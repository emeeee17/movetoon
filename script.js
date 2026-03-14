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
const btnClearLines = document.getElementById('btnClearLines');
const btnClearAll = document.getElementById('btnClearAll');
const btnExportSVG = document.getElementById('btnExportSVG');
const btnExportBg = document.getElementById('btnExportBg');

let isDrawing = false;
let currentPath = null;
let currentStrokeGroup = null; 
let currentGroup = null; 
let pathCounter = 0; // ตัวนับเพื่อสร้าง ID ที่ไม่ซ้ำกันให้แต่ละเส้น

let pathsHistory = [];
let redoStack = [];

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
    pathCounter++; // เพิ่มเลข ID
    const { x, y } = getCoordinates(e);

    currentStrokeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // ตั้ง ID ให้เส้นนี้ เพื่อให้หยดน้ำใช้อ้างอิงเส้นทาง
    currentPath.setAttribute('id', `drawnPath_${pathCounter}`); 
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
    
    // สร้างหยดน้ำ (แก้บั๊กโดยใช้ <mpath>)
    if (brushType.value === 'gooey') {
        const pathLength = currentPath.getTotalLength();
        
        if (pathLength > 20) {
            const dropCount = 5; 
            for (let i = 0; i < dropCount; i++) {
                const drop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                // ปรับให้หยดน้ำใหญ่ขึ้นนิดนึง จะได้ไม่โดนฟิลเตอร์กลืน
                const radius = (parseFloat(brushSize.value) * 0.7) * (0.8 + Math.random() * 0.5);
                drop.setAttribute('r', radius);
                drop.setAttribute('cx', 0); // จำเป็นต้องกำหนดจุดเริ่มต้นเป็น 0
                drop.setAttribute('cy', 0);
                drop.setAttribute('fill', brushColor.value);

                const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
                const duration = (2 + Math.random() * 3).toFixed(1) + 's';
                animate.setAttribute('dur', duration);
                animate.setAttribute('repeatCount', 'indefinite');

                // ใช้ <mpath> โยงไปหา ID ของเส้นที่วาด ชัวร์กว่า 100%
                const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
                mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#drawnPath_${pathCounter}`);
                
                animate.appendChild(mpath);
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

// ฟังก์ชันล้างแค่เส้น
btnClearLines.addEventListener('click', () => {
    normalLayer.innerHTML = '';
    gooeyLayer.innerHTML = '';
    pathsHistory = [];
    redoStack = [];
});

// ฟังก์ชันล้างทั้งหมด (รวมพื้นหลัง)
btnClearAll.addEventListener('click', () => {
    normalLayer.innerHTML = '';
    gooeyLayer.innerHTML = '';
    pathsHistory = [];
    redoStack = [];
    
    // เอาภาพพื้นหลังออก
    bgImage.src = '';
    bgImage.style.display = 'none';
    imageUpload.value = ''; // เคลียร์ช่อง input file
    
    initDefaultCanvas(); // รีเซ็ตหน้ากระดาษกลับเป็นขนาดหน้าจอ
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