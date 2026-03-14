let brushColor="#ff0088"
let brushSize=12
let brushType="normal"

let strokes=[]
let redoStack=[]
let currentStroke=null

let bgImg

let brushes={}


function setup(){

let c=createCanvas(window.innerWidth,window.innerHeight)
c.parent("canvasContainer")

}


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


function drawBackground(){

if(!bgImg) return

let imgRatio=bgImg.width/bgImg.height
let canvasRatio=width/height

let w,h

if(imgRatio>canvasRatio){

w=width
h=width/imgRatio

}else{

h=height
w=height*imgRatio

}

image(bgImg,(width-w)/2,(height-h)/2,w,h)

}


function mousePressed(){

currentStroke={

points:[],
color:brushColor,
size:brushSize,
brush:brushType

}

redoStack=[]

}


function mouseDragged(){

currentStroke.points.push({

x:mouseX,
y:mouseY,
t:millis()

})

}


function mouseReleased(){

strokes.push(currentStroke)
currentStroke=null

}


document.getElementById("colorPicker").oninput=e=>{
brushColor=e.target.value
}

document.getElementById("sizePicker").oninput=e=>{
brushSize=e.target.value
}

document.getElementById("brushPicker").onchange=e=>{
brushType=e.target.value
}

document.getElementById("bgUpload").onchange=e=>{

let file=e.target.files[0]

let reader=new FileReader()

reader.onload=function(event){

loadImage(event.target.result,img=>{

bgImg=img

})

}

reader.readAsDataURL(file)

}

document.getElementById("undoBtn").onclick=()=>{

if(strokes.length>0){

redoStack.push(strokes.pop())

}

}

document.getElementById("redoBtn").onclick=()=>{

if(redoStack.length>0){

strokes.push(redoStack.pop())

}

}

document.getElementById("exportPNG").onclick=()=>{

saveCanvas("movetoon","png")

}