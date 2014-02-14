import unittest
import os
import testLib
import testSimple
        
class TestAdd(testSimple.testAddUser):
    """Test adding users"""
    def testAdd1(self):
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'password'} )
        self.assertResponse(respData, count = 1)

    def testAddMultipleUsers(self):
        respData1 = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'user1'} )
        respData2 = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user2', 'password' : 'user2'} )
        self.assertResponse(respData1, count = 1)
        self.assertResponse(respData2, count = 1)
        
    def testAddUserTwice(self):
        respData1 = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'user1'} )
        respData2 = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'user1'} )
        self.assertResponse(respData1, count = 1)
        self.assertResponse(respData2, None, testLib.RestTestCase.ERR_USER_EXISTS)
        
class TestLoginUser(testSimple.testAddUser):
    """Test users logging in"""
    def testLoginWithoutAdd(self):
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'baduser', 'password' : 'password'} )
        self.assertResponse(respData, None, testLib.RestTestCase.ERR_BAD_CREDENTIALS)  
            
    def testAddMultipleUsers(self):
        self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'user1'} )
        respData = self.makeRequest("/users/login", method="POST", data = { 'user' : 'user1', 'password' : 'user1'} )
        self.assertResponse(respData, count=2)
        
    def testAddThenLoginWithBadPassword(self):
        respData1 = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'user1'} )
        respData2 = self.makeRequest("/users/add", method="POST", data = { 'user' : 'user1', 'password' : 'wrong password'} )
        self.assertResponse(respData1, count=1)
        self.assertResponse(respData2, None, testLib.RestTestCase.ERR_BAD_PASSWORD)


class TestFailUser(testSimple.testAddUser):
    """Test users loggin in with blank name"""
    def testLoginNullName(self):
        respData = self.makeRequest("/users/add", method="POST", data = { 'user' : '', 'password' : 'noName'} )
        self.assertResponse(respData, None, testLib.RestTestCase.ERR_BAD_USERNAME)
