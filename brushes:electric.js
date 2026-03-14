brushes.electric={

draw(stroke){

stroke(stroke.color)
strokeWeight(2)

for(let i=1;i<stroke.points.length;i++){

let p1=stroke.points[i-1]
let p2=stroke.points[i]

let jitter=random(-5,5)

line(p1.x,p1.y,p2.x+jitter,p2.y+jitter)

}

}

}