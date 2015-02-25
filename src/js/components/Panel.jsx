var React = require('react');
var Draggable = require('react-draggable');
var count = 0;

class Panel extends React.Component {

  constructor(props) {

    super(props);
    this.state = {};

  }

  getInitialState() {
    return {
      title: count++,
      body: ''
    };
  }

  updateText(e) {

    this.setState({body:e.target.value});

  }

  render() {

    return (
      <Draggable
        zIndex={100}>
        <div className="col-md-3">
          <div className="panel panel-default">
            <div className="panel-heading">{this.state.title}</div>
            <div className="panel-body">
              <textarea 
                value={this.state.body}
                onChange={this.updateText}
                rows="3" className="form-control"
                placeholder="Type here">    
              </textarea>
            </div>
          </div>
        </div>
      </Draggable>
    )

  }

}


module.exports =  Panel;

