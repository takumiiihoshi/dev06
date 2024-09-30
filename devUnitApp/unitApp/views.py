from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from rest_framework import viewsets
from .models import Todo
from .serializers import TodoSerializer
# Create your views here.
# ToDoアイテムのリストを取得
def index(request):
    return render(request, 'index.html')
class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer
    @action(detail=False, methods=['post'], url_path='addTask')
    def add_task(self, request):
        serializer = TodoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'], url_path='deleteTask')
    def delete_task(self, request):
        todo = Todo.objects.get(pk=request.data['id'])
        todo.delete()
        return Response(status=status.HTTP_200_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='updateTask')
    def update_task(self, request):
        print('################')
        print(request.data['id'])
        todo = Todo.objects.get(pk=request.data['id'])
        serializer = TodoSerializer(todo, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
