let brushColor = "#ff0088"

let brushSize = 12

let effect = "normal"

let particles = []

let bgImg



function setup(){

let c = createCanvas(window.innerWidth, window.innerHeight)

c.parent("canvasContainer")



document.getElementById("colorPicker").oninput = e=>{

brushColor = e.target.value

}



document.getElementById("sizePicker").oninput = e=>{

brushSize = e.target.value

}



document.getElementById("effectPicker").onchange = e=>{

effect = e.target.value

}



document.getElementById("bgUpload").onchange = e=>{

let file = e.target.files[0]

let reader = new FileReader()

reader.onload = function(event){

loadImage(event.target.result, img=>{

bgImg = img

})

}

reader.readAsDataURL(file)

}



document.getElementById("exportPNG").onclick = ()=>{

saveCanvas("movetoon","png")

}



}



function draw(){

background(20)



if(bgImg){

image(bgImg,0,0,width,height)

}



for(let p of particles){

p.x += p.vx

p.y += p.vy

p.r *= 0.97



fill(p.color)

noStroke()

circle(p.x,p.y,p.r)

}



particles = particles.filter(p=>p.r>1)

}



function mouseDragged(){



if(effect==="normal"){

stroke(brushColor)

strokeWeight(brushSize)

line(pmouseX,pmouseY,mouseX,mouseY)

}



if(effect==="gooey"){



particles.push({

x:mouseX,

y:mouseY,

vx:random(-1,1),

vy:random(-1,1),

r:brushSize,

color:brushColor

})



}



}