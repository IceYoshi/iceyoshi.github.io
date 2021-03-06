class FooterTextDisplay {
  constructor(value) {
    this._value = value;
  }

  addTo(container) {
    container.name = "FooterTextDisplay";
    this._label = this.createLabel(container.width, container.height);
    container.addChild(this._label);
  }

  createLabel(width, height) {
    let fontSize = Math.floor(Math.max(width / 40, height / 30));
    let label = new createjs.Text();
    label.text = this._value.toString();
    label.font = `${fontSize}px Dimbo`;
    label.color = "#f0261b";
    label.textAlign = "center";
    label.textBaseline = "bottom";
    return label;
  }

  update(value) {
    this._value = value;
    this._label.text = value.toString();
  }

}
