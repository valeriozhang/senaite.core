import React from "react";
import ReactDOM from "react-dom";

class ReferenceResults extends React.Component {

  constructor(props) {
    super(props);
  }

  get_columns() {
    return this.props.columns || [];
  }

  get_column_names() {
    let columns = this.get_columns();
    return columns.map((column) => { return column.columnName });
  }

  get_column_labels() {
    let columns = this.get_columns();
    return columns.map((column) => { return column.label });
  }

  get_results() {
    return this.props.results || [];
  }

  has_results() {
    return this.get_results().length > 0;
  }

  buildHeaderColumns() {
    let columns = []
    for (let label of this.get_column_labels()) {
      columns.push(
        <th>{label}</th>
      );
    }
    return columns;
  }

  buildColumns(result) {
    let columns = []
    for (let name of this.get_column_names()) {
      columns.push(
        <td>{result[name]}</td>
      );
    }
    return columns;
  }

  buildRows() {
    let rows = [];
    let results = this.get_results();
    for (let result of results) {
      rows.push(
        <tr>
          {this.buildColumns(result)}
        </tr>
      );
    }
    return rows
  }

  get_style() {
    return {
      width: this.props.width || "400px"
    }
  }

  render() {
    if (!this.has_results()) {
      return null;
    }
    return (
      <div className="position-absolute shadow border rounded bg-white mt-1"
           style={this.get_style()}>
        <table className="referenceresultstable table table-sm table-hover">
          <thead>
            <tr>
              {this.buildHeaderColumns()}
            </tr>
          </thead>
          <tbody>
            {this.buildRows()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ReferenceResults;
