from django.shortcuts import render
from django.templatetags.static import static
from django.http import JsonResponse
import os
from django.conf import settings
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse, StreamingHttpResponse


# def home(request):
#     return render(request, 'restoration.html')

def my_view(request):
    # Paths to your static files are generated using the 'static' template tag function
    css_path = static('/styles.css')
    csvfile_path = static('/data/dataset_sample_final.csv')

    geojson_path = {
        'ck': static('/data/CK_CU_Boundary_Simple.geojson'),
        'co': static('/data/CO_CU_Boundary_Simple.geojson'),
    }

    scripts_path = {
        'restoration': static('restoration.js'),
        'getdata': static('getdata.js'),
        'utils': static('utils.js'),
        'map': static('map.js'),
        'chart': static('chart.js'),
        'datatable': static('datatable.js'),
    }

    # Context contains paths which will be used in the HTML template to set data attributes
    context = {
        'css_file': css_path,
        'csv_file': csvfile_path,
        'geojson_files': geojson_path,
        'scripts_files': scripts_path,
    }

    # This view renders 'restoration.html' with the context containing paths to your data files
    return render(request, 'restoration.html', context)


# def get_file_paths(request):
#     data = {
#         # "csvFile": request.build_absolute_uri('/static/restoration_projects_dataportal.csv'),
#         "csvFile": request.build_absolute_uri('/static/dataset_sample_final.csv'),
#         # "ckCuBoundary": request.build_absolute_uri('/static/CK_CU_Boundary_Simple.geojson'),
#         # "coCuBoundary": request.build_absolute_uri('/static/CO_CU_Boundary_Simple.geojson'),

#         "geojsonFiles": {
#             'CK_CU': '/static/CK_CU_Boundary_Simple.geojson',
#             'CO_CU': '/static/CO_CU_Boundary_Simple.geojson'
#         }
#     }
#     return JsonResponse(data)