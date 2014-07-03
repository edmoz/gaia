# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
import time
from gaiatest.apps.base import Base

from gaiatest import GaiaTestCase
from gaiatest.apps.settings.app import Settings
from gaiatest.utils.fxa.fxa_user import FxAUser


class TestFirefoxAccounts(GaiaTestCase):

    _test_counter = 0

    def setUp(self):
        GaiaTestCase.setUp(self)
        self.connect_to_network()
        self.user = FxAUser()
        self.settings = Settings(self.marionette)
        self.settings.launch()

    def _test_firefox_accounts_login_new_via_settings(self):

        # COPPA (legal min age requirement) menu page for USER_NEW only
        is_new_user = True

        fxa = self.settings.open_firefox_accounts_settings()

        password = self.user.password_new()

        fxa.tap_firefox_accounts_login_button()

        fxa.switch_to_firefox_accounts_frame()

        email = self.user.email_new()
        fxa.enter_email(email)

        fxa.tap_button_next()

        fxa.select_age_from_min_age_required_menu('1990 or earlier')

        fxa.switch_to_firefox_accounts_frame()

        fxa.tap_button_next()

        fxa.enter_password_user_new(password)

        fxa.tap_button_next()

        fxa.tap_button_done()


    def test_firefox_accounts_login_existing_via_settings_fmd(self):

        fxa = self.settings.open_findmydevice_settings()

        password = self.user.password_new()

        fxa.tap_findmydevice_login_button()

        fxa.switch_to_firefox_accounts_frame()

        email = self.user.email_existing()
        fxa.enter_email(email)

        fxa.tap_button_next()

        fxa.enter_password(password)

        fxa.tap_button_next()

        fxa.tap_button_done()


