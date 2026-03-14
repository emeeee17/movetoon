brushes.smoke={

draw(stroke){

noStroke()

for(let p of stroke.points){

fill(stroke.color+"33")

circle(p.x+random(-5,5),p.y+random(-5,5),stroke.size*2)

}

}

}