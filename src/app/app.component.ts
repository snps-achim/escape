import { Component, OnInit, Renderer2 } from '@angular/core';
import { HttpClient} from '@angular/common/http'
 
//import * as config from '../assets/config.json'
let config:any={}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  constructor(private renderer: Renderer2,private httpClient:HttpClient) { }
  title = 'escape';
  speechService = new SpeechService()
  Service = new SpeechService()
  audioPlaying: boolean = false;
  countdown;
  command: string = "> ";
  gameStarted = false;
  audioBackground = new Audio();
  coundownTimer;
  seconds = 0;
  superuserpassword = false;
  superusermode=false;
  team = []
  ready=false;

  async ngOnInit(){
       
  }
  async ngAfterViewInit() {

    config= JSON.parse(await this.httpClient.get('assets/config.json', {responseType: 'text'}).toPromise())
    console.log(config)
    this.countdown = config.minuten;
    this.team=config.team
    this.audioBackground.src = "assets/spooky.mp3";
    this.audioBackground.load();

    this.audioBackground.volume = config.volume.background;


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




      if (this.gameStarted) {
        return;
      }

      let countdownStored = localStorage.getItem("countdown")
      this.gameStarted = true;

      this.countdown = countdownStored ? Number(countdownStored) : config.minuten;
      console.log(countdownStored)


      const countdown = () => {
        if (this.countdown > 1) {
          this.speechService.start("Noch " + this.countdown + " minuten " + config.text.biszur)
          localStorage.setItem("countdown", String(this.countdown));
        }


        if (config.events[this.countdown]) {
          const audioEvent = new Audio();

          audioEvent.src = "assets/" + config.events[this.countdown].sound;
          audioEvent.load();
          audioEvent.volume = config.volume.event;
          audioEvent.play();
          this.speechService.start(config.events[this.countdown].text)
        }

        if (this.countdown == 0) {

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
          if (this.seconds == 0) {
            countdown();
            if(this.countdown>0){
              this.seconds = 59
              this.countdown--;
             }
          } else {
            this.seconds--;
          }
        }, 1000)
      }, 1500)

    });


    this.ready=true;
  }



  public processCommand() {
    console.log("Process Command " + this.command)
    this.command = "Processing command " + this.command;

    let commandArr = this.command.split('>')
    let command = commandArr.pop().toLocaleLowerCase().trim()
    let found = false;

    if (this.superuserpassword) {
      this.superuserpassword = false;
      if (config.superuserpassword.find(i=>i.includes(command ))) {
        this.speechService.start(config.text.passwordok)
        this.superusermode=true;
      } else {
        this.speechService.start(config.text.passwordbad)
      }
      found = true;
    } else {
      for (let knownCommand of config.commands) {
        if ((typeof knownCommand.name == "string" && knownCommand.name.includes(command)) ||
          (Array.isArray(knownCommand.name) && knownCommand.name.find(kc => kc.includes(command)))

        ) {
          if(this.superusermode ){
            if(knownCommand.superusermode==false){
              continue
            }else{
              if(knownCommand.stop){
                clearTimeout(this.coundownTimer);
              }
            }

          }

          if (knownCommand.superuserpassword) {
            this.superuserpassword = true;
          }

          if (knownCommand.gamereset) {
            localStorage.removeItem("countdown")
            clearTimeout(this.coundownTimer);
            this.gameStarted = false;
            this.countdown = config.minuten;
            this.seconds = 0;
            this.superuserpassword = false;
            this.superusermode =false;
          }
          this.speechService.start(knownCommand.echo)
          found = true;

          break;
        }
      }
    }
    if (!found) {
      this.speechService.start("Unbekanntes Kommando.")
    }
    setTimeout(() => {
      this.command = "> "
    }, 200)


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