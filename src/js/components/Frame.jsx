var React = require('react');
var PanelWindow = require('./PanelWindow.jsx');
var ControlWindow = require('./ControlWindow.jsx');

class Frame extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-9">
          <PanelWindow/>
        </div>
        <div className="col-md-3">
          <ControlWindow/>
        </div>
      </div>
    );
  }
}

React.render(<Frame/>, document.getElementById('frame'));
