import json
import os
import tempfile
import unittest

import serve


class BoundedStateTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.old_data = serve.DATA
        serve.DATA = os.path.join(self.directory.name, "pokedrops.json")

    def tearDown(self):
        serve.DATA = self.old_data
        self.directory.cleanup()

    def write(self, state):
        with open(serve.DATA, "w") as state_file:
            json.dump(state, state_file)

    def test_missing_state_starts_empty(self):
        self.assertEqual(serve.load_state(), {"count": 0, "recent": []})

    def test_legacy_state_is_migrated_without_losing_count(self):
        dropped = list(range(1, 101))
        self.write({"dropped": dropped})
        state = serve.load_state()
        self.assertEqual(state["count"], 100)
        self.assertEqual(state["recent"], dropped[-serve.MAX_RECENT:])

    def test_saved_state_is_bounded(self):
        recent = list(range(100))
        serve.save_state({"count": 5000, "recent": recent})
        with open(serve.DATA) as state_file:
            stored = json.load(state_file)
        self.assertEqual(stored["count"], 5000)
        self.assertEqual(stored["recent"], recent[-serve.MAX_RECENT:])
        self.assertNotIn("dropped", stored)


if __name__ == "__main__":
    unittest.main()
