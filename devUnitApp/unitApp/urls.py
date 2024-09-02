from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet

from . import views

app_name = 'unitApp'
router = DefaultRouter()
router.register(r'todos', TodoViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('', include(router.urls)),
    path('todos/addTask/', TodoViewSet.as_view({'post': 'add_task'}), name='add_task'),
    path('todos/updateTask/', TodoViewSet.as_view({'post': 'update_task'}), name='update_task')
]
