import unittest

import serve


class ApiDocumentationTests(unittest.TestCase):
    def test_documented_path_matches_handler_constant(self):
        self.assertEqual(serve.API_PATH, "/api/pokedrops")
        self.assertEqual(serve.__doc__.count(serve.API_PATH), 2)


if __name__ == "__main__":
    unittest.main()
