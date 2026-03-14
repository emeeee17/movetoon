brushes.energy={

draw(stroke){

stroke(stroke.color)
strokeWeight(stroke.size)

for(let i=1;i<stroke.points.length;i++){

let p1=stroke.points[i-1]
let p2=stroke.points[i]

let wave=sin(frameCount*0.2+i)*10

line(p1.x,p1.y+wave,p2.x,p2.y-wave)

}

}

}