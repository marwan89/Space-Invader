(function(){
'use strict';
window.addEventListener('load',init,false);
var canvas=null,ctx=null;
var lastPress=null;
var pause=true;
var gameover=true;
var score=0;
var dir=0;

var KEY_SPACE=32;
var KEY_ENTER=13;
var KEY_LEFT=37;
var KEY_UP=38;
var KEY_RIGHT=39;
var KEY_DOWN=40;

///////////////////////////////////////////////

var pressing=[];

var player=new Rectangle(100,290,10,10,3);

var shots=[];
var enemies=[];



function random(max){
    return ~~(Math.random()*max);
}

function reset(){
      score=0;
        player.x=100;
        player.y=290;
        shots.length=0;
        enemies.length=0;
        enemies.push(new Rectangle(10,0,10,10,2));
        gameover=false;
        player.timer=0;
        player.health=3;
}

function init(){
    canvas=document.getElementById('canvas');
    ctx=canvas.getContext('2d');
    run();
    repaint();
}

function run(){
    setTimeout(run,50);
    act();
}

function repaint(){
    requestAnimationFrame(repaint);
    paint(ctx);
}

function act(){
    if(!pause){
       if(gameover){
        reset();
       }
        //if(pressing[KEY_UP])
          //  y-=10;
        if(pressing[KEY_RIGHT])
            player.x+=10;
        //if(pressing[KEY_DOWN])
          //  y+=10;
        if(pressing[KEY_LEFT])
            player.x-=10;

        // Queremos mantenerlo dentro de la pantalla
        if(player.x>canvas.width-player.width)
            player.x=canvas.width-player.width;        
        if(player.x<0)
            player.x=0;    

        //Disparos
        if(lastPress==KEY_SPACE){
            shots.push(new Rectangle(player.x+3,player.y,5,5));
            lastPress=null;
        }  

        //Mueve los disparos.
        for(var i=0,l=shots.length;i<l;i++){
            shots[i].y-=10;
            if(shots[i].y<0){
                shots.splice(i--,1);
                l--;
            }
        }
        //Movemos los enemigos
        for(var i=0;i<enemies.length;i++){
            if (enemies[i].timer>0) {//Quito el timer de los enemigos dañados
                enemies[i].timer--;
            }
            //Compruebo si los disparos coinciden con los enemigos
            for(var j=0,l=shots.length;j<l;j++){
                if(shots[j].intersects(enemies[i])){
                    score++;
                    enemies[i].health--;
                    if(enemies[i].health<1){
                        enemies[i].x=random(canvas.width/10)*10;
                        enemies[i].y=0;
                        enemies[i].health=2;
                        enemies.push(new Rectangle(random(canvas.width/10)*10,0,10,10));//Genero otra nave enemiga                    
                    }else{
                        enemies[i].timer=1;//Xa mostrar el efecto de dañado
                    }
                shots.splice(j--,1);//1 xq elimina un elemento del array
                l--;
                }

            }//Fin del for de los shots
            enemies[i].y+=10;//La velocidad a la que bajan las naves
            if(enemies[i].y>canvas.height){//Si llega hasta abajo lo vuelvo a colocar arriba(no lo elimino del array)
                enemies[i].x=random(canvas.width/10)*10;
                enemies[i].y=0;
                enemies[i].health=2;
            }
            if(player.intersects(enemies[i])&&player.timer<1){//Si una nave choca con nosotros
                player.health--;
                player.timer=20;
            }       
            /*
            si el disparo y la nave enemiga están uno enfrente del otro, al siguiente turno el disparo subirá a la posición de la nave,
            y la nave bajará su cuadro correspondiente,
            posteriormente se efectuará el análusis de colisión, pero para entonces, ninguno de los dos objetos estará colisionando:
            leo la colisión de ambos objetos dos veces: una justo antes de mover la nave enemiga, y la otra posterior a dicho movimiento
            */
              for(var j=0,l=shots.length;j<l;j++){
                if(shots[j].intersects(enemies[i])){
                    score++;
                    enemies[i].health--;
                    if(enemies[i].health<1){
                        enemies[i].x=random(canvas.width/10)*10;
                        enemies[i].y=0;
                        enemies[i].health=2;
                        enemies.push(new Rectangle(random(canvas.width/10)*10,0,10,10));//Genero otra nave enemiga                    
                    }else{
                        enemies[i].timer=1;//Xa mostrar el efecto de dañado
                    }
                    shots.splice(j--,1);//1 xq elimina un elemento del array
                    l--;
                }
            }    
        }//Fin del for de los enemigos
    if(player.health<1){
        gameover=true;
        pause=true;
    }
     if(player.timer>0){
        player.timer--;
    }
}
    // Pause/Unpause
    if(lastPress==KEY_ENTER){
        pause=!pause;
        lastPress=null;
    }
}

function paint(ctx){
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    //Pinto mi personaje
    ctx.fillStyle='#0f0';
    if(player.timer%2==0){
        player.fill(ctx); //Activo y desactivo el coolor   
    }        
    //Pinto los disparos
    ctx.fillStyle='#f00';
    for(var l=0;l<shots.length;l++){
        shots[l].fill(ctx);
    }
    //Pinto los enemigos
    for(var i=0;i<enemies.length;i++){
        if(enemies[i].timer%2==0)
            ctx.fillStyle='#00f';//lo pinto de azul
        else{
            ctx.fillStyle='#fff';
        }
        enemies[i].fill(ctx);
    }
    //Pinto la puntuación
    ctx.fillStyle='#fff';
    ctx.fillText('Score: '+score,0,20);
    //Pinto la vida
    ctx.fillText('health'+player.health,100,20);
    //ctx.fillText('Last Press: '+lastPress,0,20);
    if(pause){
        ctx.textAlign='center';
        if(gameover)
            ctx.fillText('GAME OVER',100,150);
        else
            ctx.fillText('PAUSE',100,75);
        ctx.textAlign='left';
    }
}

//Mientras tengamos pulsado la tecla de dirección se moverá
document.addEventListener('keydown',function(evt){
    lastPress=evt.keyCode;
    pressing[evt.keyCode]=true;
},false);
//Cuando dejemos de pulsar se parará
document.addEventListener('keyup',function(evt){
    pressing[evt.keyCode]=false;
},false);

function Rectangle(x,y,width,height,health){
        this.x=(x==null)?0:x;
        this.y=(y==null)?0:y;
        this.width=(width==null)?0:width;
        this.height=(height==null)?this.width:height;
        this.health=(health==null)?1:health;
        this.timer=0;
    }
//Con prototype añadimos la funcion intersects a la clase Rectangle
    Rectangle.prototype.intersects=function(rect){
        if(rect!=null){
            return(this.x<rect.x+rect.width&&
                this.x+this.width>rect.x&&
                this.y<rect.y+rect.height&&
                this.y+this.height>rect.y);
        }
    }
    //Con prototype añadimos la funcion fill a la clase Rectangle
    Rectangle.prototype.fill=function(ctx){
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }

window.requestAnimationFrame=(function(){
    return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        function(callback){window.setTimeout(callback,17);};
    })();
})();   