import unittest
from control import configure_commands, mill_units

class HostControlTests(unittest.TestCase):
    def test_decimal_exactness_and_command_order(self):
        self.assertEqual(mill_units("5.50"), 5500)
        self.assertEqual(configure_commands(mill_units("12"), mill_units("5.5")),
                         ["STOP", "SET 12000 5500", "SAVE", "STATUS"])
        self.assertEqual(configure_commands(15000, 4800, True)[-2:], ["RUN", "STATUS"])

    def test_invalid_profile_never_produces_commands(self):
        for mv, ma in ((2000, 500), (12001, 5500), (12000, 5510), (15000, 6000), (12000, 0)):
            with self.subTest(mv=mv, ma=ma), self.assertRaises(ValueError):
                configure_commands(mv, ma)
        for value in ("NaN", "Infinity", "1.0001", "bad"):
            with self.subTest(value=value), self.assertRaises(Exception):
                mill_units(value)

if __name__ == "__main__":
    unittest.main()
