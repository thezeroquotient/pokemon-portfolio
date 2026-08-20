import json
import os
import tempfile
import unittest

import serve


class StatePersistenceTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.old_directory, self.old_data = serve.DIRECTORY, serve.DATA
        serve.DIRECTORY = self.directory.name
        serve.DATA = os.path.join(self.directory.name, "pokedrops.json")

    def tearDown(self):
        serve.DIRECTORY, serve.DATA = self.old_directory, self.old_data
        self.directory.cleanup()

    def test_missing_state_starts_empty(self):
        self.assertEqual(serve.load_dropped(), [])

    def test_round_trip_uses_valid_json(self):
        serve.save_dropped([1, 25, 1025])
        self.assertEqual(serve.load_dropped(), [1, 25, 1025])
        with open(serve.DATA) as state_file:
            self.assertEqual(json.load(state_file), {"dropped": [1, 25, 1025]})

    def test_malformed_json_is_not_treated_as_empty(self):
        with open(serve.DATA, "w") as state_file:
            state_file.write('{"dropped":')
        with self.assertRaises(serve.StateError):
            serve.load_dropped()

    def test_invalid_ids_are_rejected(self):
        with open(serve.DATA, "w") as state_file:
            json.dump({"dropped": [0, "pikachu"]}, state_file)
        with self.assertRaises(serve.StateError):
            serve.load_dropped()


if __name__ == "__main__":
    unittest.main()
