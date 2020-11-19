# -*- coding: utf-8 -*-

import inspect
import json

from bika.lims import api
from Products.Five.browser import BrowserView
from senaite.core.decorators.ajax import returns_safe_json
from senaite.core.decorators.ajax import set_application_json_header
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse
from senaite.core import logger


@implementer(IPublishTraverse)
class ReferenceWidgetView(BrowserView):
    """Reference Widget Controller View
    """

    def __init__(self, context, request):
        super(ReferenceWidgetView, self).__init__(context, request)
        self.context = context
        self.request = request
        self.traverse_subpath = []

    def publishTraverse(self, request, name):
        """Called before __call__ for each path name and allows to dispatch
        subpaths to methods
        """
        self.traverse_subpath.append(name)
        return self

    @set_application_json_header
    @returns_safe_json
    def __call__(self):
        # handle subpath calls
        if len(self.traverse_subpath) > 0:
            try:
                return self.handle_subpath()
            except (NameError, ValueError) as ex:
                return {"error": ex.message}

        return {}

    def handle_subpath(self, prefix="ajax_"):
        """Handle AJAX subpath
        """
        if len(self.traverse_subpath) < 1:
            return {}

        # check if the method exists
        func_arg = self.traverse_subpath[0]
        func_name = "{}{}".format(prefix, func_arg)
        func = getattr(self, func_name, None)
        if func is None:
            raise NameError("Invalid function name")

        # Additional provided path segments after the function name are handled
        # as positional arguments
        args = self.traverse_subpath[1:]

        # check mandatory arguments
        func_sig = inspect.getargspec(func)
        # positional arguments after `self` argument
        required_args = func_sig.args[1:]

        if len(args) < len(required_args):
            raise ValueError("Wrong signature, please use '{}/{}'"
                             .format(func_arg, "/".join(required_args)))

        return func(*args)

    def get_json(self):
        """Returns the request data
        """
        data = self.request.get("BODY", "{}")
        return json.loads(data)

    def get_field_attributes(self, field):
        """Get field attributes
        """
        widget = field.widget

        # BBB for compatibility with old reference widget
        # TODO: Provide adapter to extract bootstrap parameters from field!
        catalog_name = getattr(widget, "catalog_name", "portal_catalog")
        base_query = getattr(widget, "base_query", {})
        search_query = getattr(widget, "search_query", {})
        columns = getattr(widget, "colModel", {})
        style = getattr(widget, "style", {"width": "550px"})

        field_name = "{}".format(field.__name__)
        field_id = "{}_{}".format(api.get_id(self.context), field_name)
        url = api.get_url(self.context)
        api_url = "{}/{}".format(url, self.__name__)

        return {
            "data-id": field_id,
            "data-name": field_name,
            "data-api_url": api_url,
            "data-catalog_name": catalog_name,
            "data-base_query": json.dumps(base_query),
            "data-search_query": json.dumps(search_query),
            "data-columns": json.dumps(columns),
            "data-style": json.dumps(style),
        }

    def get_brain_info(self, brain):
        """Returns all brain columns
        """
        if not api.is_brain(brain):
            raise TypeError("Not a catalog brain")
        schema = brain.schema()
        columns = map(lambda col: (col, brain[col]), schema)
        return dict(columns)

    def to_column_data(self, brain):
        """Returns the column data
        """
        data = self.get_json()
        columns = data.get("columns", [])
        info = self.get_brain_info(brain)
        for column in columns:
            name = column.get("columnName")
            if name is None:
                continue
            if name in info:
                continue
            # waking up the object
            obj = api.get_object(brain)
            logger.warn(
                "Wakeup object '{}' to retrieve column '{}', this is slow! "
                "Please consider adding '{}' as a brain column"
                .format(obj.id, name, name))
            attr = getattr(obj, name, None)
            if callable(attr):
                attr = attr()
            info[name] = attr
        return info

    def ajax_search(self):
        """Search endpoint
        """
        data = self.get_json()
        # extract search query parameters
        catalog_name = data.get("catalog_name", "portal_catalog")
        base_query = data.get("base_query", {})
        search_query = data.get("search_query", {})
        catalog = api.get_tool(catalog_name)
        query = base_query.copy()
        query.update(search_query)
        logger.info("ReferenceWidgetView::ajax_search:query=%r" % query)
        results = catalog.search(query, reverse=False)
        return map(self.to_column_data, results)
