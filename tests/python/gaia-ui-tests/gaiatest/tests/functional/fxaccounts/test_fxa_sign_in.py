# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
import json
import os
from marionette.by import By

from gaiatest import GaiaTestCase
from gaiatest.mocks.persona_test_user import PersonaTestUser
# from gaiatest.utils.persona.assertion_util import AssertionUtil

AUDIENCE = os.environ.get("AUDIENCE", "app://fxa-test-client.gaiamobile.org")
VERIFIER_URL = os.environ.get("VERIFIER_URL", "https://verifier.mozcloud.org")
TESTUSER_BROWSERID = os.environ.get("TESTUSER_BROWSERID", "login.persona.org")
TESTUSER_VERIFIER = os.environ.get("TESTUSER_VERIFIER", "login.persona.org")

class TestFxASignIn(GaiaTestCase):
    _app_openFlow_button_locator = (By.ID, 'openFlow')
    _app_getAccounts_button_locator = (By.ID, 'getAccounts')
    _app_logout_button_locator = (By.ID, 'logout')
    _app_result_text_locator = (By.ID, 'result-text')


    _fxa_email_field_locator = (By.ID, 'fxa-email-input')
    _fxa_password_field_locator = (By.ID, 'fxa-pw-set-input')

    _fxa_back_button_locator = (By.ID, 'fxa-module-back')
    _fxa_next_button_locator = (By.ID, 'fxa-module-next')
    _fxa_done_button_locator = (By.ID, 'fxa-module-done')

    _fxa_frame_locator = (By.CSS_SELECTOR, "iframe[src*='fxa_module.html#login']")

    def setUp(self):
        GaiaTestCase.setUp(self)
        self.connect_to_network()

        # Generate unverified PersonaTestUser account
        self.user = PersonaTestUser().create_user(
            verified=True, env={"browserid": TESTUSER_BROWSERID,
                                "verifier": TESTUSER_VERIFIER}
        )

    def test_fxa_sign_in(self):
        """
        Test standard sign in to UI tests app
        """
        self.app = self.apps.launch('Test FxA Client')

        self.marionette.switch_to_frame()
        self.marionette.switch_to_frame(self.app.frame)

        self.wait_for_element_displayed(*self._app_openFlow_button_locator)
        self.marionette.find_element(*self._app_openFlow_button_locator).tap()

        # swicth to fxa
        self.marionette.switch_to_frame()
        self.marionette.switch_to_frame(self.marionette.find_element(*self._fxa_frame_locator))

        # email
        self.wait_for_element_displayed(*self._fxa_email_field_locator)
        email_field = self.marionette.find_element(*self._fxa_email_field_locator)
        email_field.send_keys(self.user.email)

        self.marionette.find_element(*self._fxa_next_button_locator).tap()
        self.wait_for_element_displayed(*self._fxa_back_button_locator)
        # self.wait_for_element_not_displayed(*self._fxa_email_field_locator)

        # password
        self.wait_for_element_displayed(*self._fxa_password_field_locator)
        pw_field = self.marionette.find_element(*self._fxa_password_field_locator)
        pw_field.send_keys(self.user.password)

        self.marionette.find_element(*self._fxa_next_button_locator).tap()
        self.wait_for_element_not_displayed(*self._fxa_next_button_locator)

        self.marionette.find_element(*self._fxa_done_button_locator).tap()

        # back to app to logout
        self.marionette.switch_to_frame()
        self.marionette.switch_to_frame(self.app.frame)

        # validate result
        self.wait_for_element_displayed(*self._app_result_text_locator)
        result_text = self.marionette.find_element(*self._app_result_text_locator).text
        result = result_text.split(":",1)
        result_data = json.loads(result[1])
        #Success :{ "email": "blazquez149646@personatestuser.org", "verified": false }
        self.assertEqual(result[0].strip(), 'Success')
        self.assertEqual(result_data["verified"], False)

        # self.marionette.find_element(*self._app_logout_button_locator).tap()



