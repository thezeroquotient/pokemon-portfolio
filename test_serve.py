import unittest

from serve import MAX_REQUEST_BODY, parse_content_length


class ContentLengthTests(unittest.TestCase):
    def test_missing_length_is_empty(self):
        self.assertEqual(parse_content_length(None), 0)

    def test_valid_length_is_returned(self):
        self.assertEqual(parse_content_length("12"), 12)

    def test_malformed_length_is_rejected(self):
        with self.assertRaises(ValueError):
            parse_content_length("not-a-number")

    def test_negative_length_is_rejected(self):
        with self.assertRaises(ValueError):
            parse_content_length("-1")

    def test_oversized_length_is_rejected(self):
        with self.assertRaises(OverflowError):
            parse_content_length(str(MAX_REQUEST_BODY + 1))


if __name__ == "__main__":
    unittest.main()
