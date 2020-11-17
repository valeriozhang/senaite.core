import React from "react";
import ReactDOM from "react-dom";


class ReferenceField extends React.Component {

  constructor(props) {
    super(props);

    // React reference to the input field
    // https://reactjs.org/docs/react-api.html#reactcreateref
    this.input_field_ref = React.createRef();

    this.on_change = this.on_change.bind(this);
    this.on_keypress = this.on_keypress.bind(this);
  }

  get_search_value() {
    return this.input_field_ref.current.value
  }

  on_change(event) {
    event.preventDefault();
    let value = this.get_search_value();
    console.debug("on_change::value: ", value);
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

  render() {
    return (
      <input
        type="text"
        className={this.props.className}
        ref={this.input_field_ref}
        id={this.props.id}
        name={this.props.name}
        disabled={this.props.disabled}
        onChange={this.on_change}
        onKeyPress={this.on_keypress}
        placeholder={this.props.placeholder}
      />
    );
  }
}

export default ReferenceField;
