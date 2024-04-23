import { Component, OnInit, Renderer2 } from '@angular/core';


import * as config from '../assets/config.json'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private renderer: Renderer2) { }
  title = 'escape';
  speechService = new SpeechService()
  Service = new SpeechService()
  audioPlaying: boolean = false;
  coundown = config.minuten;
  command: string = "> ";
  gameStarted=false;
  audioBackground = new Audio();
  coundownTimer;
  seconds=0;
  ngAfterViewInit() {
  
    this.audioBackground.src = "assets/spooky.mp3";
    this.audioBackground.load();
    
    


    const globalListenFunc = this.renderer.listen('document', 'mousedown', e => {

  
      if (!this.audioPlaying) {

        this.audioPlaying = true;
        console.log("Play audio...")

        this.audioBackground.addEventListener('ended', function () {
          this.currentTime = 0;
          this.play();
        }, false);
        this.audioBackground.play();
     
      }

  

    
      if( this.gameStarted){
        return;
      }
 
      let countdownStored = localStorage.getItem("countdown")
      this.gameStarted=true;

      this.coundown = countdownStored ? Number(countdownStored) : config.minuten;
      console.log(countdownStored)
  

      const countdown = () => {
        if(this.coundown>1){
          this.speechService.start("Noch " + this.coundown + " minuten " + config.text.biszur)
          localStorage.setItem("countdown", String(this.coundown));
        }

 
        if(config.events[this.coundown]){
          const audioEvent = new Audio();

          audioEvent.src = "assets/"+ config.events[this.coundown].sound;
          audioEvent.load();
      
          audioEvent.play();
          this.speechService.start(config.events[this.coundown].text)
        }

        if(this.coundown==0){

        }
      }



      setTimeout(() => {
        if (countdownStored) {
          this.speechService.start(config.text.fortgesetzt)
        } else {
          this.speechService.start(config.text.einleitung)
        }
        countdown()
        this.coundownTimer = setInterval(() => {
          if(this.seconds==0){
            countdown();
            this.seconds=59
            this.coundown--;
          }else{
            this.seconds--;
          }
        }, 1000)
      }, 1500)

    });


  }


  public processCommand() {
    console.log("Process Command " + this.command)
    this.command = "Processing command "+this.command;

    let commandArr=this.command.split('>')
    let command=commandArr.pop().toLocaleLowerCase().trim()
    let found=false;
    for (let knownCommand of config.commands){
      if(knownCommand.name.includes(command)){

        if(knownCommand.gamereset){
          localStorage.removeItem("countdown")
          clearTimeout(this.coundownTimer);
          this.gameStarted=false;    
          this.coundown = config.minuten;
          this.seconds=0;
        }
        this.speechService.start(knownCommand.echo)
        found=true;

        break;
      }
    }
    if(!found){
      this.speechService.start("Unbekanntes Kommando.")
    }
    setTimeout(()=>{
      this.command = "> "
    },200)

    
  }
}



export class SpeechService {
  synthesis = window.speechSynthesis;

  start(text: string, rate = 0.7) {
    const textToSpeech = new SpeechSynthesisUtterance(text);
    textToSpeech.lang = "de-DE";
    textToSpeech.text = text;
    textToSpeech.rate = rate;


    const voice = speechSynthesis.getVoices().filter((voice) => {
      return voice.name === "de-DE-Standard-C";
    })[0];
    textToSpeech.voice = voice;

    this.synthesis.speak(textToSpeech);
  }
}