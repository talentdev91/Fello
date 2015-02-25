var React = require('react');
var Panel = require('./Panel.jsx');
var Panels = require('../stores/Panels');

class PanelWindow extends React.Component {

  constructor(props) {

    super(props);
    this.state = {panels:[]};

  }

  componentWillMount() {

    Panels.on('new', function refreshPanels (panels) {
      this.setState({panels:panels});
    }.bind(this));

  }

  generatePanel(panel) {
    return(
        <Panel panel={panel}/>
    );
  }

  render() {
    return (
      <div className="row">
        {this.state.panels.map(this.generatePanel)}
      </div>
    );

  }

}

module.exports = PanelWindow;
