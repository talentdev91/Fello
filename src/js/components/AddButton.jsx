var React = require('react');
var Panels = require('../stores/Panels');


class AddButton extends React.Component {

  constructor(props) {

    super(props);

  }

  addPanel() {

    Panels.add();

  }

  render() {

    return (
      <button onClick={this.addPanel} className="btn btn-success btn-block">Add</button>
    );
  }

}


module.exports = AddButton;
