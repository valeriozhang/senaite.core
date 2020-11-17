import React from "react"
import ReactDOM from "react-dom"
import ReferenceField from "./components/ReferenceField.js"
import ReferenceResults from "./components/ReferenceResults.js"


class ReferenceWidgetController extends React.Component {

  constructor(props) {
    super(props);

    // needed to distinguish multiple reference widgets on one site
    this.root_el = props.root_el;

    // Internal state
    this.state = {
      id: this.root_el.dataset.id,
      name: this.root_el.dataset.name,
      placeholder: this.root_el.dataset.placeholder,
      uids: [],
      searchresults: [],
      disabled: false,
      showresults: false
    }

    // bind methods
    this.search = this.search.bind(this);

    return this
  }

  search(value) {
    console.log("ReferenceWidgetController::search:value:", value);
    if (value.length > 1) {
      this.setState({showresults: true})
    } else {
      this.setState({showresults: false})
    }
  }

  render() {
    return (
        <div className="referencewidget">
          <ReferenceField
            className="form-control"
            id={this.state.id}
            name={this.state.name}
            disabled={this.state.disabled}
            searchresults={this.state.searchresults}
            placeholder={this.state.placeholder}
            on_search={this.search}
          />
          <ReferenceResults
            showresults={this.state.showresults}
            results={[{mrn: "4711", name: 'Bar'}, {mrn: "0815", name: 'Foo'}]}/>
        </div>
    );
  }
}

export default ReferenceWidgetController;
