from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet

from . import views

app_name = 'unitApp'
router = DefaultRouter()
router.register(r'todos', TodoViewSet)

urlpatterns = [
    path('hello', views.index, name='index'),
    path('', include(router.urls)),  # APIルートの追加
]
