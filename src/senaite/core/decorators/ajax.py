# -*- coding: utf-8 -*-

import json
import time
from functools import wraps
from six import string_types

from bika.lims import logger
from DateTime import DateTime
from bika.lims import api
from datetime import datetime


def returns_safe_json(func):
    """Returns a safe JSON string
    """
    @wraps(func)
    def wrapper(*args, **kw):
        def default(obj):
            """This function handles unhashable objects
            """
            # Convert `DateTime` objects to ISO8601 format
            if isinstance(obj, DateTime):
                obj = obj.ISO8601()
            # Convert Python `datetime` objects to ISO format
            elif isinstance(obj, datetime):
                obj = obj.iso()
            # Convert objects and brains to UIDs
            elif api.is_object(obj):
                obj = api.get_uid(obj)
            elif isinstance(obj, string_types):
                return obj
            return str(obj)

        data = func(*args, **kw)
        return json.dumps(data, default=default)
    return wrapper


def set_application_json_header(func):
    """Returns a safe JSON string
    """
    @wraps(func)
    def wrapper(*args, **kw):
        # set the content type header
        request = api.get_request()
        request.response.setHeader("Content-Type", "application/json")
        return func(*args, **kw)
    return wrapper


def inject_runtime(func):
    """Measure runtime of the decorated function and inject it into the
    returning dictionary
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        duration = end - start
        # inject the runtime into the returning dictionary
        result.update(dict(_runtime=duration))
        logger.info("Execution of '{}' took {:2f}s".format(
            func.__name__, duration))
        return result
    return wrapper
