from django.urls import path

from . import views

app_name = 'unitApp'

urlpatterns = [
    path('hello', views.index, name='index')
]
