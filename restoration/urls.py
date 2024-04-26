from django.urls import path
from . import views

urlpatterns = [
    path('', views.restoration_view, name='restoration_view'),  
]