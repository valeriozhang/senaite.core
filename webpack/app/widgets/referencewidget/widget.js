import React from "react"
import ReactDOM from "react-dom"
import ReferenceField from "./components/ReferenceField.js"
import ReferenceResults from "./components/ReferenceResults.js"
import ReferenceWidgetAPI from "./api.js"


class ReferenceWidgetController extends React.Component {

  constructor(props) {
    super(props);

    let el = props.root_el;
    let id = el.dataset.id;
    let name = el.dataset.name;
    let value = el.dataset.value;
    let multi_valued = el.dataset.multi_valued;
    let api_url = el.dataset.api_url;
    let catalog_name = el.dataset.catalog_name;
    let search_index = el.dataset.search_index;
    let base_query = el.dataset.base_query;
    let search_query = el.dataset.search_query;
    let columns = el.dataset.columns;
    let display_field = el.dataset.display_field;
    let limit = el.dataset.limit || 10;

    // Internal state
    this.state = {
      id: id,
      name: name,
      value: value,
      // disabled flag for the field
      disabled: false,
      // query state
      catalog_name: catalog_name,
      search_index: search_index,
      base_query: this.parse_json(base_query),
      search_query: this.parse_json(search_query),
      search_term: "",
      columns: this.parse_json(columns),
      display_field: this.display_field,
      // the selected UIDs of the field
      selected_uids: [],
      // the search query results
      results: [],
      // UID -> record data for display values
      records: {},
      // loading state
      loading: false,
      // multi valued
      multi_valued: this.parse_json(multi_valued),
      // limit results
      limit: limit
    }

    // Prepare API
    this.api = new ReferenceWidgetAPI({
      api_url: api_url,
    });

    // bind methods
    this.search = this.search.bind(this);
    this.clear_results = this.clear_results.bind(this);
    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);
    this.on_esc = this.on_esc.bind(this);
    this.on_click = this.on_click.bind(this);

    // dev only
    window.widget = this;

    return this
  }

  componentDidMount() {
    document.addEventListener("keydown", this.on_esc, false);
    document.addEventListener("click", this.on_click, false)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.on_esc, false);
    document.removeEventListener("click", this.on_click, false);
  }

  results_by_uid(results) {
    /*
     * Group results by UID
     */
    let mapping = {};
    results.map(function(item, index) {
      let uid = item.uid || item.UID || index;
      mapping[uid] = item;
    });
    console.info("RESULTS BY UID: ", mapping);
    return mapping;
  }

  parse_json(value) {
    /*
     * JSON parse the given value
     */
    if (value == null) {
      return null;
    }
    return JSON.parse(value)
  }

  getRequestOptions() {
    /*
     * HTTP POST options for the search server request
     */
    let options = {
      catalog_name: this.state.catalog_name,
      base_query: this.state.base_query,
      search_query: this.state.search_query,
      search_index: this.state.search_index,
      search_term: this.state.search_term,
      columns: this.state.columns
    }
    return options
  }

  select(uid) {
    console.debug("ReferenceWidgetController::select:uid:", uid);
    // create a copy of the selected UIDs
    let selected_uids = [].concat(this.state.selected_uids);
    if (selected_uids.indexOf(uid) == -1) {
      selected_uids.push(uid);
    }
    this.setState({selected_uids: selected_uids});
    this.clear_results();
  }

  deselect(uid) {
    console.debug("ReferenceWidgetController::deselect:uid:", uid);
    let selected_uids = [].concat(this.state.selected_uids);
    let pos = selected_uids.indexOf(uid);
    if (pos > -1) {
      selected_uids.splice(pos, 1);
    }
    this.setState({selected_uids: selected_uids});
    this.clear_results();
  }

  search(value) {
    /*
     * Call server ajax endpoint with the filter
     * TODO: debounce method!
     */
    console.debug("ReferenceWidgetController::search:value:", value);

    // set the value on the state
    this.state.search_term = value;

    // prepare the server request
    let self = this;
    this.toggle_loading(true);
    let options = this.getRequestOptions();
    let promise = this.api.search(options);
    promise.then(function(data) {
      console.debug(">>> GOT REFWIDGET FILTER RESULTS: ", data);

      // keep track of all loaded records to render display values properly
      let by_uid = self.results_by_uid(data);
      let records = Object.assign(self.state.records, by_uid);
      self.setState({
        results: data,
        records: records
      });
      self.toggle_loading(false);
    });
  }

  clear_results() {
    /*
     * Clear all search results
     */
    this.setState({results: []})
  }

  toggle_loading(toggle) {
    /*
     * Toggle loading state
     */
    if (toggle == null) {
      toggle = false;
    }
    this.setState({
      loading: toggle
    });
    return toggle;
  }

  on_esc(event){
    // Clear results on ESC key
    if(event.keyCode === 27) {
      this.clear_results();
    }
  }

  on_click(event) {
    // clear results when clicked outside of the widget
    let widget = this.props.root_el;
    let target = event.target;
    if (!widget.contains(target)) {
      this.clear_results();
    }
  }

  render() {
    return (
        <div className="referencewidget">
          <ReferenceField
            className="form-control"
            name={this.state.name}
            value={this.state.value}
            disabled={this.state.disabled}
            selected_uids={this.state.selected_uids}
            records={this.state.records}
            display_field={this.state.display_field}
            multi_valued={this.state.multi_valued}
            on_search={this.search}
            on_focus={this.search}
            on_deselect={this.deselect}
          />
          <ReferenceResults
            className="position-absolute shadow border rounded bg-white mt-1"
            columns={this.state.columns}
            selected_uids={this.state.selected_uids}
            results={this.state.results}
            limit={this.state.limit}
            on_select={this.select}
          />
        </div>
    );
  }
}

export default ReferenceWidgetController;
