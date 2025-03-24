from django.db import models

class Todo(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    deadline = models.DateField(blank=True, null=True)
    priority = models.CharField(max_length=10, default='中')

    def __str__(self):
        return self.title