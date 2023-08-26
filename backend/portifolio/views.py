from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Project
from .serializers import ProjectSerializer

class ProjectsList(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class ProjectDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class ImageURLsView(APIView):
    def get(self, request):
        projects = Project.objects.all()
        image_urls = [request.build_absolute_uri(project.image.url) for project in projects]
        return Response(image_urls)