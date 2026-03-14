brushes.liquid={

draw(stroke){

noStroke()
fill(stroke.color)

for(let p of stroke.points){

let r=stroke.size+sin(frameCount*0.1)*4

circle(p.x,p.y,r)

}

}

}