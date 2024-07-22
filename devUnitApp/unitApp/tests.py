from django.test import TestCase
from django.urls import reverse

class IndexViewTests(TestCase):
    def test_index_view(self):
        response = self.client.get(reverse('unitApp:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<h1>Hello</h1>')