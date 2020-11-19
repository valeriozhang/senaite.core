class ReferenceWidgetAPI {

  constructor(props) {
    console.debug("ReferenceWidgetAPI::constructor")
    this.api_url = props.api_url;
    this.on_api_error = props.on_api_error || function(response) {};
    return this;
  }

  get_api_url(endpoint) {
    return `${this.api_url}/${endpoint}#${location.search}`
  }

  get_json(endpoint, options) {
    /*
     * Fetch Ajax API resource from the server
     * @param {string} endpoint
     * @param {object} options
     * @returns {Promise}
     */
    var data, init, method, on_api_error, request, url;
    if (options == null) {
      options = {};
    }
    method = options.method || "POST";
    data = JSON.stringify(options.data) || "{}";
    on_api_error = this.on_api_error;
    url = this.get_api_url(endpoint);
    init = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": this.get_csrf_token()
      },
      body: method === "POST" ? data : null,
      credentials: "include"
    };
    console.info("ReferenceWidgetAPI::fetch:endpoint=" + endpoint + " init=", init);
    request = new Request(url, init);
    return fetch(request).then(function(response) {
      if (!response.ok) {
        return Promise.reject(response);
      }
      return response;
    }).then(function(response) {
      return response.json();
    }).catch(function(response) {
      on_api_error(response);
      return response;
    });
  }

  search(data) {
    /*
     * Search
     * @returns {Promise}
     */
    var options;
    options = {
      data: data || {},
      method: "POST"
    };
    return this.get_json("search", options);
  }

  get_csrf_token() {
    /*
     * Get the plone.protect CSRF token
     * Note: The fields won't save w/o that token set
     */
    return document.querySelector("#protect-script").dataset.token;
  };

}

export default ReferenceWidgetAPI;
