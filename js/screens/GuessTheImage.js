/**
*
*/

class GuessTheImage {
  constructor(data) {
      this._data = data;
      this._drawable = [];
      this._initialized = false;
      this._submitted = false;
  }

  init() {
    if(this._data.bg == undefined) this._data.bg = "img/idle.jpg";
    this._drawable.push(new BackgroundImage(this._data.bg));
    this._drawable.push(new DifficultyMeter(this._data.difficulty));

    this._hiddenImage = new HiddenImage(this._data.image, this._data.row, this._data.col, this._data.seed, this.playFirework.bind(this));
    this._drawable.push(this._hiddenImage);

    this._fireworkEffect = new FireworkEffect();
    this._drawable.push(this._fireworkEffect);

    switch(this._data.view) {
      case "student":
        this._drawable.push(new HeaderDisplay(`Score: ${this._data.score}`));
        this._timer = new TimeDisplay(this._data.time, this.end.bind(this));
        this._drawable.push(this._timer);
        this._drawable.push(new TextBox(this.sendAnswer.bind(this)));
        this._drawable.push(new SubmitButton("Next", this.submit.bind(this)));
        if(this._data.tooltip && this._data.tooltip != "") this._drawable.push(new TooltipInfo(this._data.tooltip));
        break;
      case "projector":
        this._drawable.push(new HeaderDisplay(this._data.screen));
        this._timer = new TimeDisplay(this._data.time, null);
        this._drawable.push(this._timer);
        break;
    }
    this._initialized = true;
  }

  draw(screen) {
    if(!this._initialized) this.init();
    this._drawable.forEach(function(component) {
      let container = new createjs.Container();
      container.width = screen.width;
      container.height = screen.height;
      component.addTo(container);
      this.setOrigin(container, screen);
      screen.addChild(container);
    }.bind(this));
  }

  setOrigin(container, screen) {
    let landscape = screen.width >= screen.height;
    switch(container.name) {
      case "BackgroundImage":
        container.x = 0;
        container.y = 0;
        break;
      case "HeaderDisplay":
        container.x = 0;
        container.y = 0;
        break;
      case "TimeDisplay":
        container.x = screen.width;
        container.y = 0;
        break;
      case "DifficultyMeter":
        container.x = screen.width / 2;
        container.y = screen.height / 20;
        break;
      case "HiddenImage":
        container.x = screen.width / 2;
        container.y = screen.height * 0.45;
        break;
      case "TextBox":
        container.x = screen.width * 0.5 / window.devicePixelRatio;
        container.y = screen.height * 0.8 / window.devicePixelRatio;
        break;
      case "SubmitButton":
        container.x = screen.width;
        container.y = screen.height;
        break;
    }
  }

  update(data) {
    switch(data.component) {
      case "timer":
        if(data.type === "absolute")
          this._timer.updateTime(data.value);
        if(data.type === "relative")
          this._timer.changeTime(data.value);
        if(data.type === "pause")
          this._timer.stopTimer();
        if(data.type === "resume")
          this._timer.startTimer();
        break;
      case "HiddenImage":
        if(data.value > 0) {
          this._hiddenImage.removeRandomTile(data.value);
        } else {
          this._hiddenImage.uncoverAll();
        }
        break;
      default: throw new Error();
    }
  }

  playFirework() {
    setTimeout(function() {
      this._fireworkEffect.explosionAnimation(50, screen.width * 0.2, screen.height * 0.2, 2);
      this._fireworkEffect.explosionAnimation(50, screen.width * 0.5, screen.height * 0.3, 2);
      this._fireworkEffect.explosionAnimation(50, screen.width * 0.8, screen.height * 0.2, 2);
    }.bind(this), 2000);
  }

  sendAnswer(answer) {
    if(this._submitted) return;
    let obj = JSON.parse('{'
       + '"cmd" : "submit",'
       + '"activity" : "' + this._data.screen + '",'
       + '"id" : ' + this._data.id + ','
       + '"answer" : ' + JSON.stringify(answer)
       + '}');
    ServerConnection.send(obj);
  }

  submit() {
    if(this._submitted) return;
    let obj = JSON.parse('{'
       + '"cmd" : "request",'
       + '"activity" : "' + this._data.screen + '",'
       + '"id" : ' + this._data.id
       + '}');
    ServerConnection.send(obj);
  }

  end() {
    if(this._submitted) return;
    this._submitted = true;
    StageManager.handleActivityEnd(this);
  }

}
