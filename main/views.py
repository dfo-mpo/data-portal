from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse

import os

# Create your views here.
def static_home(request):
    return render(request, 'static_home.html')


def images(request):
    image_path = os.path.join(settings.BASE_DIR, 'main', 'imgs', 'salmon.png')
    with open(image_path, 'rb') as f:
        return HttpResponse(f.read(), content_type="image/png")