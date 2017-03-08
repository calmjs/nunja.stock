# -*- coding: utf-8 -*-
import unittest

from nunja.stock.testing import case


class ExamplesTestCaseTestCase(unittest.TestCase):

    def test_case_setup_fail(self):
        with self.assertRaises(ValueError):
            case.ExamplesTestCase.setUpClass()

    def test_case_setup_success(self):

        class CustomTestCase(case.ExamplesTestCase):
            test_examples = 'model_examples.js'

            def runTest(self):
                """
                Simply a dummy run method
                """

        CustomTestCase.setUpClass()
        # Ensure it doesn't stomp on parent class
        self.assertIsNone(case.ExamplesTestCase.data)
        self.assertTrue(isinstance(CustomTestCase.data, dict))

        test = CustomTestCase()
        test.assertDataEqual("model rendering null", {
            "nunja_model_id": "model",
            "nunja_model_config": {},
        })

        with self.assertRaises(AssertionError):
            test.assertDataEqual("model rendering null", {})

        with self.assertRaises(KeyError):
            test.assertDataEqual("nosuchkey", {})
