let brushColor = "#ff0088"
let brushSize = 12
let brushType = "normal"

let strokes = []
let redoStack = []
let currentStroke = null

let bgImg = null

let brushes = {}

// ---------- setup ----------

function setup(){

let c = createCanvas(window.innerWidth, window.innerHeight)

c.parent("canvasContainer")

background(20)

}


// ---------- main loop ----------

function draw(){

background(20)

drawBackground()

for(let s of strokes){

brushes[s.brush].draw(s)

}

if(currentStroke){

brushes[currentStroke.brush].draw(currentStroke)

}

}


// ---------- draw background ----------

function drawBackground(){

if(!bgImg) return

let imgRatio = bgImg.width / bgImg.height
let canvasRatio = width / height

let drawW, drawH

if(imgRatio > canvasRatio){

drawW = width
drawH = width / imgRatio

}else{

drawH = height
drawW = height * imgRatio

}

image(
bgImg,
(width - drawW) / 2,
(height - drawH) / 2,
drawW,
drawH
)

}


// ---------- mouse events ----------

function mousePressed(){

currentStroke = {

points: [],
color: brushColor,
size: brushSize,
brush: brushType

}

currentStroke.points.push({

x: mouseX,
y: mouseY

})

redoStack = []

}


function mouseDragged(){

if(!currentStroke) return

currentStroke.points.push({

x: mouseX,
y: mouseY

})

}


function mouseReleased(){

if(currentStroke){

strokes.push(currentStroke)

currentStroke = null

}

}


// ---------- UI ----------

document.getElementById("colorPicker").oninput = e => {

brushColor = e.target.value

}


document.getElementById("sizePicker").oninput = e => {

brushSize = e.target.value

}


document.getElementById("brushPicker").onchange = e => {

brushType = e.target.value

}


// ---------- background upload ----------

document.getElementById("bgUpload").onchange = e => {

let file = e.target.files[0]

if(!file) return

let reader = new FileReader()

reader.onload = function(event){

loadImage(event.target.result, img => {

bgImg = img

})

}

reader.readAsDataURL(file)

}


// ---------- undo ----------

document.getElementById("undoBtn").onclick = () => {

if(strokes.length > 0){

redoStack.push(strokes.pop())

}

}


// ---------- redo ----------

document.getElementById("redoBtn").onclick = () => {

if(redoStack.length > 0){

strokes.push(redoStack.pop())

}

}


// ---------- export ----------

document.getElementById("exportPNG").onclick = () => {

saveCanvas("movetoon", "png")

}