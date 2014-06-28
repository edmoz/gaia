#!/usr/bin/env python
# encoding: utf-8

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import time
import os
import sys
from optparse import OptionParser

import unittest
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

FMD_URL = "https://fmd.stage.mozaws.net"
OAUTH_SIGNIN = "https://accounts.stage.mozaws.net/oauth/"

signin_locator = "Sign in"
btn_signin_locator = "button.signin"
btn_signup_locator = "button.signup"
input_email = "input.email"
input_password = "input.password"
btn_submit = "submit-btn"
signed_in_locator = "p.signed-in-email-message"
signed_in_text = 'You are signed in as'

header_locator = 'h1'
loading_locator = 'h2'
map_locator = 'leaflet-map-pane'

TIMEOUT = os.getenv('FMD_TIMEOUT', 60)
fxa_exist_user = os.getenv('FXA_USER', 'ed111@restmail.net')
fxa_password = os.getenv('FXA_PASSWORD', '12345678')

print fxa_exist_user, fxa_password
user_name = fxa_exist_user.split('@')[0]


class FMDTest(unittest.TestCase):

    def setUp(self):
        des_caps = {'browserName':'firefox'}
        des_caps['loggingPrefs'] = { 'browser':'ALL' }
        self.driver = webdriver.Remote(desired_capabilities=des_caps)
        self.driver.implicitly_wait(TIMEOUT)

    def wait_leave_page(self, current_url):
        while(self.driver.current_url == current_url):
            # print 'wait', self.driver.current_url
            time.sleep(3)
        return True

    def test_fmd(self):
        # sign into FMD
        # click sign in link
        self.driver.get(FMD_URL)
        self.driver.find_element_by_link_text(signin_locator).click()
        self.wait_leave_page(FMD_URL)

        # enter user:pw
        # assert 'Find' in 
        time.sleep(5)
        print self.driver.title
        username = self.driver.find_element_by_css_selector(input_email)
        username.send_keys(fxa_exist_user)

        pw = self.driver.find_element_by_css_selector(input_password)
        pw.send_keys(fxa_password)
        self.driver.find_element_by_id(btn_submit).click()
        time.sleep(5)

        # should be on finding phone page
        header = self.driver.find_element_by_css_selector(header_locator)
        # print 'header', header.get_attribute("innerHTML")
        assert(user_name in header.get_attribute("innerHTML"))

        # implicit_waits to find element
        try:
            fmd_map = self.driver.find_element_by_class_name(map_locator)
            assert(fmd_map)
        except:
            print 'FAIL - unable to find device'
            sys.exit(1)

    def tearDown(self):
        # self.driver.quit()
        # leave the browser open for now
        pass

if __name__ == '__main__':
    unittest.main(verbosity=2)




