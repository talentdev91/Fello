var React = require('react');
var AddButton = require('./AddButton.jsx');

class ControlWindow extends React.Component {

  constructor(props) {

    super(props);


  }

  render() {

    return (

      <div class="well">
        <AddButton/>
      </div>

    );


  }

}

module.exports = ControlWindow;
