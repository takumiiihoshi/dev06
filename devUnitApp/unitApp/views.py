from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .models import Todo
from .serializers import TodoSerializer


# Create your views here.

def index(request):
    return render(request, 'index.html')

class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer