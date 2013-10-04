from Products.CMFCore.utils import _getAuthenticatedUser
from AccessControl.User import nobody


def getAuthenticatedMember(self):
    '''
    Returns the currently authenticated member object
    or the Anonymous User.  Never returns None.
    This caches the value in the rqeust...
    '''
    if not "_c_authenticatedUser" in self.REQUEST:
        u = _getAuthenticatedUser(self)
        if u is None:
            u = nobody
        self.REQUEST['_c_authenticatedUser'] = self.wrapUser(u)
        return self.wrapUser(u)
    else:
        return self.REQUEST['_c_authenticatedUser']
