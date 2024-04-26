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
    csvfile_path = request.build_absolute_uri('/static/dataset_sample_final.csv')

    geojson_path = {
        'ck': static('/CK_CU_Boundary_Simple.geojson'),
        'co': static('/CO_CU_Boundary_Simple.geojson'),
    }

    # Context contains paths which will be used in the HTML template to set data attributes
    context = {
        'csv_file': csvfile_path,
        'geojson_files': geojson_path,
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

def restoration_path(request):
    restoration_path = os.path.join(settings.BASE_DIR, 'restoration', 'static', 'restoration.js')
    with open(restoration_path, 'rb') as f:
        return HttpResponse(f.read(), content_type="text/javascript")

def getdata_path(request):
    getdata_path = os.path.join(settings.BASE_DIR, 'restoration', 'static', 'getdata.js')
    with open(getdata_path, 'rb') as f:
        return HttpResponse(f.read(), content_type="text/javascript")

def map_path(request):
    map_path = os.path.join(settings.BASE_DIR, 'restoration', 'static', 'map.js')
    with open(map_path, 'rb') as f:
        return HttpResponse(f.read(), content_type="text/javascript")
    
def chart_path(request):
    chart_path = os.path.join(settings.BASE_DIR, 'restoration', 'static', 'chart.js')
    with open(chart_path, 'rb') as f:
        return HttpResponse(f.read(), content_type="text/javascript")

def datatable_path(request):
    datatable_path = os.path.join(settings.BASE_DIR, 'restoration', 'static', 'datatable.js')
    with open(datatable_path, 'rb') as f:
        return HttpResponse(f.read(), content_type="text/javascript")
    
def utils_path(request):
    utils_path = os.path.join(settings.BASE_DIR, 'restoration', 'static', 'utils.js')
    with open(utils_path, 'rb') as f:
        return HttpResponse(f.read(), content_type="text/javascript")
    
def css_path(request):
    css_path = os.path.join(settings.BASE_DIR, 'restoration', 'static', 'styles.css')
    with open(css_path, 'rb') as f:
        return HttpResponse(f.read(), content_type="text/css")