from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, AddTaskView

from . import views

app_name = 'unitApp'
router = DefaultRouter()
router.register(r'todos', TodoViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('', include(router.urls)),
    path('addTask/', AddTaskView.as_view(), name='add_task'),
]
