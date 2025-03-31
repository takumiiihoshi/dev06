from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status, viewsets
from .models import Todo
from .serializers import TodoSerializer
import plotly.express as px
import json
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
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='updateTask')
    def update_task(self, request):
        todo = Todo.objects.get(pk=request.data['id'])
        serializer = TodoSerializer(todo, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='updateOrder')
    def update_order(self, request):
        if request.method == "POST":
            order = request.data.get("order")
            for index, todo_id in enumerate(order):
                Todo.objects.filter(id=todo_id).update(order=index)
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='todoChart')
    def todo_chart(self, request):
        todos = Todo.objects.all()
        completed_count = Todo.objects.filter(completed=True).count()
        not_completed_count = Todo.objects.filter(completed=False).count()
        fig = px.pie(
            names=['完了', '未完了'],
            values=[completed_count, not_completed_count],
        )
        fig_json = fig.to_json() 
        fig_json_obj = json.loads(fig_json)
        for trace in fig_json_obj['data']:
            trace['values'] = [completed_count, not_completed_count]
        return Response({'chart': fig_json_obj}, status=status.HTTP_200_OK)
