import React from "react";
import ReactDOM from "react-dom";

class ReferenceResults extends React.Component {

  constructor(props) {
    super(props);

    // bind event handlers
    this.on_select = this.on_select.bind(this);
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

  get_result_uid(result) {
    return result.UID || "NO UID FOUND!";
  }

  is_uid_selected(uid) {
    return this.props.selected.indexOf(uid) > -1;
  }

  get_result_label(result) {
    return result.label || result.Title || "NO LABEL";
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
      let uid = this.get_result_uid(result);
      // skip selected UIDs
      if (this.is_uid_selected(uid)) {
        continue;
      }
      let label = this.get_result_label(result);
      rows.push(
        <tr uid={uid}
            label={label}
            onClick={this.on_select}>
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

  on_select(event) {
    event.preventDefault();
    let target = event.currentTarget;
    let uid = target.getAttribute("uid")
    let label = target.getAttribute("label")
    console.debug("ReferenceResults::on_select:event=", event);
    if (this.props.on_select) {
      this.props.on_select(uid);
    }
  }

  render() {
    if (!this.has_results()) {
      return null;
    }
    return (
      <div className={this.props.className}
           style={this.get_style()}>
        <table className="table table-sm table-hover">
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
