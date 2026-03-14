brushes.normal={

draw(stroke){

strokeWeight(stroke.size)
stroke(stroke.color)
noFill()

beginShape()

for(let p of stroke.points){

vertex(p.x,p.y)

}

endShape()

}

}