import React from "react";
import ReactDOM from "react-dom";

class ReferenceResults extends React.Component {

  constructor(props) {
    super(props);
  }

  buildRows() {
    let rows = [];
    let results = this.props.results || [];
    for (let result of results) {
      rows.push(
          <tr>
            <td>{result.mrn}</td>
            <td>{result.name}</td>
          </tr>
      )
    }

    return rows
  }

  get_style() {
    return {
      width: this.props.width || "400px"
    }
  }

  render() {
    if (!this.props.showresults) {
      return null;
    }
    return (
      <div className="position-absolute shadow p-1 border rounded bg-white mt-1"
           style={this.get_style()}>
        <table className="referenceresults table table-borderless">
          {this.buildRows()}
        </table>
      </div>
    );
  }
}

export default ReferenceResults;
