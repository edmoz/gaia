import datetime
import os

class FxAUser(object):
    """Handler for Firefox Accounts test user data:  usernames (emails) and passwords"""

    def __init__(self):
        self._email_prefix = "kilroy"
        self._email_host = "restmail.net"
        #self._email_host = "gmail.com"

    def base36encode(self, number, alphabet='0123456789abcdefghijklmnopqrstuvwxyz'):
        """Converts an integer to a base36 string."""
        if not isinstance(number, (int, long)):
            raise TypeError('number must be an integer')

        base36 = ''
        sign = ''

        if number < 0:
            sign = '-'
            number = -number

        if 0 <= number < len(alphabet):
            return sign + alphabet[number]

        while number != 0:
            number, i = divmod(number, len(alphabet))
            base36 = alphabet[i] + base36

        return sign + base36

    def base36decode(self, number):
        """converts base 36 number back to base 10"""
        return int(number, 36)

    def _get_email(self, suffix):
        if os.getenv('FXA_USER'):
            return os.getenv('FXA_USER')
        return self._email_prefix + "_" + suffix +"@" + self._email_host


    def email_new(self):
        """generate a new email with a randomized string suffix"""
        datetime_stamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")

        # convert unique datetime stamp to base 36 to shrink it
        str_random = self.base36encode(int(datetime_stamp))
        return self._get_email(str_random)

    def email_existing(self):
        return self._get_email("exists")

    def password_new(self):
        if os.getenv('FXA_PASSWORD'):
            return os.getenv('FXA_PASSWORD')
        return "123456789"

if "__name__" == "__main__":

    fxa_user = FxAUser()
    print fxa_user.email_new()

