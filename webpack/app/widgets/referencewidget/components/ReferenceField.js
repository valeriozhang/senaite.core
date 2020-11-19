import React from "react";
import ReactDOM from "react-dom";


class ReferenceField extends React.Component {

  constructor(props) {
    super(props);

    // React reference to the input field
    // https://reactjs.org/docs/react-api.html#reactcreateref
    this.input_field_ref = React.createRef();

    // bind event handlers
    this.on_change = this.on_change.bind(this);
    this.on_keypress = this.on_keypress.bind(this);
    this.on_focus = this.on_focus.bind(this);
    this.on_blur = this.on_blur.bind(this);
  }

  get_search_value() {
    return this.input_field_ref.current.value
  }

  get_selected() {
    return this.props.selected || [];
  }

  buildSelectedItems() {
    let items = [];
    let selected = this.get_selected();

    for (let uid of selected) {
      items.push(
        <span className="badge badge-pill badge-primary">{uid}</span>
      );
    }
    return items
  }

  on_change(event) {
    event.preventDefault();
    let value = this.get_search_value();
    console.debug("ReferenceField::on_change:value: ", value);
    if (this.props.on_search) {
      this.props.on_search(value);
    }
  }

  on_keypress(event) {
    if (event.which == 13) {
      // prevent form submission
      event.preventDefault();
    }
  }

  on_focus(event) {
    console.debug("ReferenceField::on_focus");
    if (this.props.on_focus) {
      this.props.on_focus();
    }
  }

  on_blur(event) {
    console.debug("ReferenceField::on_blur");
    if (this.props.on_blur) {
      this.props.on_blur();
    }
  }

  render() {
    return (
      <div className="referencefield2">
        <div className="selected-items">
          {this.buildSelectedItems()}
        </div>
        <div className="input-group">
          <input
            type="text"
            className={this.props.className}
            ref={this.input_field_ref}
            id={this.props.id}
            name={this.props.name}
            disabled={this.props.disabled}
            onChange={this.on_change}
            onBlur={this.on_blur}
            onKeyPress={this.on_keypress}
            onFocus={this.on_focus}
            placeholder={this.props.placeholder}
          />
          <div className="input-group-append">
            <div className="input-group-text">
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ReferenceField;
