import unittest

import serve


class RateLimitTests(unittest.TestCase):
    def setUp(self):
        serve.drop_requests.clear()

    def test_allows_requests_up_to_limit(self):
        for request in range(serve.RATE_LIMIT_MAX):
            allowed, retry_after = serve.allow_drop("visitor", now=request)
            self.assertTrue(allowed)
            self.assertEqual(retry_after, 0)

    def test_rejects_request_over_limit(self):
        for request in range(serve.RATE_LIMIT_MAX):
            serve.allow_drop("visitor", now=request)
        allowed, retry_after = serve.allow_drop("visitor", now=10)
        self.assertFalse(allowed)
        self.assertGreater(retry_after, 0)

    def test_clients_are_limited_independently(self):
        for request in range(serve.RATE_LIMIT_MAX):
            serve.allow_drop("first", now=request)
        allowed, _ = serve.allow_drop("second", now=10)
        self.assertTrue(allowed)

    def test_stale_entries_are_pruned(self):
        serve.allow_drop("old", now=0)
        serve.allow_drop("current", now=serve.RATE_LIMIT_WINDOW + 1)
        self.assertNotIn("old", serve.drop_requests)


if __name__ == "__main__":
    unittest.main()
