from django.urls import path
from . import views

urlpatterns = [
    path('', views.static_home, name='static_home'),  
    path('images', views.images, name='images'),  
]