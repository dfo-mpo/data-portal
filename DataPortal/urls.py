"""
URL configuration for DataPortal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from restoration.views import my_view, restoration_path, getdata_path, map_path, chart_path, datatable_path, utils_path, css_path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', my_view, name='my_view'),
    # path('api/get-file-paths/', get_file_paths, name='get-file-paths'),
    path('restoration-path/', restoration_path, name='restoration-path'),
    path('getdata-path/', getdata_path, name='getdata-path'),
    path('map-path/', map_path, name='map-path'),
    path('chart-path/', chart_path, name='chart-path'),
    path('datatable-path/', datatable_path, name='datatable-path'),
    path('utils-path/', utils_path, name='utils-path'),
    path('css-path/', css_path, name='css-path'),
]
