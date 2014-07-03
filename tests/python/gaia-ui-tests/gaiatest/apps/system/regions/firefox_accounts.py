# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import time
from marionette.by import By
from gaiatest.apps.base import Base
from marionette import Wait
from marionette.errors import JavascriptException


class FirefoxAccounts(Base):

    name = 'Firefox Accounts'

    _fxa_iframe = (By.ID, 'fxa-iframe')
    _menu_item_fxa_locator = (By.ID, 'menuItem-fxa')
    _menu_item_findmydevice_locator = (By.ID, 'menuItem-findmydevice')
    _fxa_login_locator = (By.ID, 'fxa-login')
    _findmydevice_login_locator = (By.ID, 'findmydevice-login')
    _fxa_frame_locator = (By.ID, 'fxa-iframe')
    _fxa_email_input_locator = (By.ID, 'fxa-email-input')
    _fxa_module_next_locator = (By.ID, 'fxa-module-next')
    _fxa_module_next2_locator = (By.ID, 'fxa-next')
    _fxa_age_select_locator = (By.ID, 'fxa-age-select')
    _fxa_pw_input_locator = (By.ID, 'fxa-pw-input')
    _fxa_pw_input_post_coppy_locator = (By.ID, 'fxa-pw-input')
    _fxa_module_done_locator = (By.ID, 'fxa-module-done')


    def tap_firefox_accounts_login_button(self):
        self.wait_for_element_displayed(*self._fxa_login_locator, timeout=8)
        self.marionette.find_element(*self._fxa_login_locator).tap()

    def tap_findmydevice_login_button(self):
        self.wait_for_element_displayed(*self._findmydevice_login_locator, timeout=8)
        self.marionette.find_element(*self._findmydevice_login_locator).tap()

    def switch_to_firefox_accounts_frame(self):
        self.marionette.switch_to_frame()
        fxa_frame = self.wait_for_element_present(*self._fxa_iframe)
        self.marionette.switch_to_frame(fxa_frame)

    def switch_to_firefox_accounts_frame_FMD(self):
        self.marionette.switch_to_frame()
        fxa_frame = self.wait_for_element_present(*self._fxa_iframe)
        self.marionette.switch_to_frame(fxa_frame)

    def enter_email(self,email):
        time.sleep(4)
        self.wait_for_element_present(*self._fxa_email_input_locator, timeout=20)
        self.marionette.find_element(*self._fxa_email_input_locator).send_keys(email)

    def tap_button_next(self):
        time.sleep(4)
        self.wait_for_element_displayed(*self._fxa_module_next_locator, timeout=20)
        self.marionette.find_element(*self._fxa_module_next_locator).tap()

    def select_age_from_coppa_menu(self, option):
        time.sleep(4)
        self.marionette.find_element(*self._fxa_age_select_locator).tap()
        time.sleep(4)
        self.select(option)

    def enter_password(self,password,post_coppa=False):
        if(post_coppa):
            self.wait_for_element_displayed(*self._fxa_pw_post_coppa_input_locator, timeout=10)
            self.marionette.find_element(*self._fxa_pw_post_coppa_input_locator).send_keys(password)
        else:
            self.wait_for_element_displayed(*self._fxa_pw_input_locator, timeout=10)
            self.marionette.find_element(*self._fxa_pw_input_locator).send_keys(password)

    def tap_button_done(self):
        self.wait_for_element_displayed(*self._fxa_module_done_locator, timeout=8)
        self.marionette.find_element(*self._fxa_module_done_locator).tap()


